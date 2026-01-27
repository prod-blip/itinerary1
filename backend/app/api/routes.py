"""API routes for the Travel Planner."""

import uuid
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.api.schemas import (
    StartTripRequest,
    StartTripResponse,
    GenerateItineraryRequest,
    GenerateItineraryResponse,
    TripStateResponse,
    PlaceAutocompleteResponse,
    Itinerary,
    DayPlan,
    Location,
    TravelSegment,
)
from app.agent.graph import travel_planner_graph, memory
from app.agent.itinerary import generate_itinerary_simple

router = APIRouter(prefix="/api", tags=["trip"])


def _convert_state_locations_to_schema(locations: list[dict]) -> list[Location]:
    """Convert raw location dicts from agent state to Location schema objects."""
    result = []
    for loc in locations:
        result.append(Location(
            id=loc.get("id", str(uuid.uuid4())),
            name=loc.get("name", "Unknown"),
            lat=loc.get("lat", 0.0),
            lng=loc.get("lng", 0.0),
            why_this_fits_you=loc.get("why_this_fits_you", ""),
            place_id=loc.get("place_id"),
            user_added=loc.get("user_added", False),
            user_note=loc.get("user_note"),
        ))
    return result


def _convert_state_itinerary_to_schema(
    itinerary: dict | None,
    locations: list[dict]
) -> Itinerary | None:
    """Convert raw itinerary dict from agent state to Itinerary schema object."""
    if not itinerary:
        return None

    # Build location lookup by ID
    location_lookup = {loc.get("id"): loc for loc in locations}

    days = []
    for day_data in itinerary.get("days", []):
        day_locations = []
        for loc_id in day_data.get("locations", []):
            if loc_id in location_lookup:
                loc = location_lookup[loc_id]
                day_locations.append(Location(
                    id=loc.get("id", ""),
                    name=loc.get("name", "Unknown"),
                    lat=loc.get("lat", 0.0),
                    lng=loc.get("lng", 0.0),
                    why_this_fits_you=loc.get("why_this_fits_you", ""),
                    place_id=loc.get("place_id"),
                    user_added=loc.get("user_added", False),
                    user_note=loc.get("user_note"),
                ))

        travel_times = []
        for segment in day_data.get("travel_times", []):
            travel_times.append(TravelSegment(
                from_location_id=segment.get("from_location_id", ""),
                to_location_id=segment.get("to_location_id", ""),
                duration_minutes=segment.get("duration_minutes", 0),
                distance_km=segment.get("distance_km", 0.0),
                polyline=segment.get("polyline"),
            ))

        days.append(DayPlan(
            day_number=day_data.get("day_number", len(days) + 1),
            locations=day_locations,
            travel_times=travel_times,
            route_optimized=day_data.get("route_optimized", False),
            area_label=day_data.get("area_label"),
        ))

    return Itinerary(
        days=days,
        total_locations=itinerary.get("total_locations", sum(len(d.locations) for d in days)),
        validation_notes=itinerary.get("validation_notes", []),
    )


@router.post("/trip/start", response_model=StartTripResponse)
async def start_trip(request: StartTripRequest) -> StartTripResponse:
    """
    Start a new trip planning session.

    Creates a new thread, runs the location discovery agent, and returns
    suggested locations for the destination.
    """
    thread_id = str(uuid.uuid4())

    # Convert trip params to dict for agent state
    trip_params = request.trip_params.model_dump()
    # Handle the 'notes' field mapping to 'additional_notes'
    if "notes" in trip_params:
        trip_params["additional_notes"] = trip_params.pop("notes")

    # Initial state for the agent
    initial_state = {
        "messages": [],
        "trip_params": trip_params,
        "draft_locations": [],
        "final_locations": [],
        "draft_itinerary": None,
        "final_itinerary": None,
        "validation_passed": False,
        "validation_errors": [],
    }

    # Config with thread_id for checkpointing
    config = {"configurable": {"thread_id": thread_id}}

    try:
        # Run the graph until it hits the interrupt (before itinerary_generator)
        # This will run location_discovery and its tool loops
        result = await travel_planner_graph.ainvoke(initial_state, config)

        # Extract draft locations from the result
        draft_locations = result.get("draft_locations", [])

        # Convert to schema objects
        locations = _convert_state_locations_to_schema(draft_locations)

        return StartTripResponse(
            thread_id=thread_id,
            locations=locations,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start trip planning: {str(e)}",
        )


@router.post("/trip/{thread_id}/generate", response_model=GenerateItineraryResponse)
async def generate_itinerary(
    thread_id: str,
    request: GenerateItineraryRequest,
) -> GenerateItineraryResponse:
    """
    Generate an itinerary from the current locations.

    Applies user edits (removed/added locations) and generates a day-wise itinerary.
    """
    config = {"configurable": {"thread_id": thread_id}}

    try:
        # Get current state from checkpointer
        state_snapshot = travel_planner_graph.get_state(config)
        if not state_snapshot or not state_snapshot.values:
            raise HTTPException(status_code=404, detail="Trip session not found")

        current_state = state_snapshot.values
        trip_params = current_state.get("trip_params", {})

        # Get draft locations and apply edits to create final locations
        draft_locations = current_state.get("draft_locations", [])
        final_locations = list(draft_locations)

        if request.edits:
            # Remove locations by ID
            removed_ids = set(request.edits.removed_ids)
            final_locations = [
                loc for loc in final_locations
                if loc.get("id") not in removed_ids
            ]

            # Add new locations from user
            for added_loc in request.edits.added_locations:
                loc_dict = added_loc.model_dump()
                loc_dict["user_added"] = True
                if "id" not in loc_dict or not loc_dict["id"]:
                    loc_dict["id"] = str(uuid.uuid4())
                final_locations.append(loc_dict)

        # Use the simple itinerary generator
        raw_itinerary, route_warnings = await generate_itinerary_simple(
            locations=final_locations,
            num_days=trip_params.get("num_days", 3),
            travel_style=trip_params.get("travel_style", "balanced"),
        )

        # Convert to schema
        itinerary = _convert_state_itinerary_to_schema(
            raw_itinerary,
            final_locations,
        )

        if not itinerary:
            itinerary = Itinerary(
                days=[],
                total_locations=len(final_locations),
                validation_notes=["Failed to generate itinerary"],
            )

        return GenerateItineraryResponse(
            itinerary=itinerary,
            route_warnings=route_warnings,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate itinerary: {str(e)}",
        )


@router.get("/trip/{thread_id}", response_model=TripStateResponse)
async def get_trip_state(thread_id: str) -> TripStateResponse:
    """
    Get the current state of a trip planning session.

    Returns the trip parameters, current locations, and itinerary (if generated).
    """
    config = {"configurable": {"thread_id": thread_id}}

    try:
        # Get current state from checkpointer
        state_snapshot = travel_planner_graph.get_state(config)
        if not state_snapshot or not state_snapshot.values:
            raise HTTPException(status_code=404, detail="Trip session not found")

        current_state = state_snapshot.values

        # Determine current phase based on state
        if current_state.get("final_itinerary"):
            phase = "complete"
        elif current_state.get("final_locations"):
            phase = "generating"
        else:
            phase = "editing"

        # Get locations (prefer final if available, otherwise draft)
        locations_data = current_state.get("final_locations") or current_state.get("draft_locations", [])
        locations = _convert_state_locations_to_schema(locations_data)

        # Get itinerary if available
        itinerary = _convert_state_itinerary_to_schema(
            current_state.get("final_itinerary"),
            locations_data,
        )

        return TripStateResponse(
            thread_id=thread_id,
            phase=phase,
            trip_params=current_state.get("trip_params"),
            locations=locations,
            itinerary=itinerary,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get trip state: {str(e)}",
        )


@router.get("/places/autocomplete", response_model=PlaceAutocompleteResponse)
async def places_autocomplete(
    input: str = Query(..., min_length=1, description="Search input for autocomplete"),
) -> PlaceAutocompleteResponse:
    """
    Proxy for Google Places Autocomplete API.

    This endpoint keeps the Google API key server-side for security.
    """
    if not settings.GOOGLE_MAPS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Google Maps API key not configured",
        )

    google_autocomplete_url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"

    params = {
        "input": input,
        "key": settings.GOOGLE_MAPS_API_KEY,
        "types": "(regions)",  # Allow cities, regions, countries, etc.
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(google_autocomplete_url, params=params)
            response.raise_for_status()
            data = response.json()

            if data.get("status") not in ("OK", "ZERO_RESULTS"):
                raise HTTPException(
                    status_code=502,
                    detail=f"Google Places API error: {data.get('status')}",
                )

            return PlaceAutocompleteResponse(
                predictions=data.get("predictions", []),
            )

        except httpx.RequestError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to reach Google Places API: {str(e)}",
            )


@router.get("/places/details")
async def place_details(
    place_id: str = Query(..., description="Google Place ID"),
) -> dict:
    """
    Get place details from Google Places API.

    Returns lat/lng and other details for a place.
    """
    if not settings.GOOGLE_MAPS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Google Maps API key not configured",
        )

    google_details_url = "https://maps.googleapis.com/maps/api/place/details/json"

    params = {
        "place_id": place_id,
        "key": settings.GOOGLE_MAPS_API_KEY,
        "fields": "name,geometry,formatted_address",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(google_details_url, params=params)
            response.raise_for_status()
            data = response.json()

            if data.get("status") != "OK":
                raise HTTPException(
                    status_code=502,
                    detail=f"Google Places API error: {data.get('status')}",
                )

            result = data.get("result", {})
            location = result.get("geometry", {}).get("location", {})

            return {
                "name": result.get("name", ""),
                "lat": location.get("lat", 0),
                "lng": location.get("lng", 0),
                "place_id": place_id,
                "formatted_address": result.get("formatted_address", ""),
            }

        except httpx.RequestError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to reach Google Places API: {str(e)}",
            )
