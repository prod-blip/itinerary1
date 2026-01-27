"""Pydantic models for API request/response validation."""

from pydantic import BaseModel, Field
from typing import Any


# ============================================================
# Core Domain Models
# ============================================================


class TripParameters(BaseModel):
    """Parameters defining a trip request."""

    destination: str = Field(..., description="The destination city or region")
    num_days: int = Field(..., ge=1, le=14, description="Number of days for the trip")
    travel_style: str = Field(
        ..., description="Travel style (e.g., 'relaxed', 'adventurous', 'cultural')"
    )
    interests: list[str] = Field(
        default_factory=list, description="List of interests (e.g., 'food', 'history', 'nature')"
    )
    constraints: list[str] = Field(
        default_factory=list,
        description="Constraints (e.g., 'wheelchair accessible', 'budget-friendly')",
    )
    notes: str | None = Field(default=None, description="Additional notes or preferences")


class Location(BaseModel):
    """A location/place in the itinerary."""

    id: str = Field(..., description="Unique identifier for the location")
    name: str = Field(..., description="Name of the location")
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")
    why_this_fits_you: str = Field(
        ..., description="Explanation of why this location fits the user's preferences"
    )
    place_id: str | None = Field(default=None, description="Google Places ID if available")
    user_added: bool = Field(default=False, description="Whether the user manually added this location")
    user_note: str | None = Field(default=None, description="User's personal note about this location")


class TravelSegment(BaseModel):
    """Travel time/distance between two locations."""

    from_location_id: str = Field(..., description="ID of the starting location")
    to_location_id: str = Field(..., description="ID of the destination location")
    duration_minutes: int = Field(..., ge=0, description="Travel duration in minutes")
    distance_km: float = Field(..., ge=0, description="Travel distance in kilometers")
    polyline: str | None = Field(default=None, description="Encoded polyline for the route")


class DayPlan(BaseModel):
    """A single day's plan in the itinerary."""

    day_number: int = Field(..., ge=1, description="Day number (1-indexed)")
    locations: list[Location] = Field(
        default_factory=list, description="Ordered list of locations for this day"
    )
    travel_times: list[TravelSegment] = Field(
        default_factory=list, description="Travel segments between locations"
    )


class Itinerary(BaseModel):
    """Complete generated itinerary."""

    days: list[DayPlan] = Field(default_factory=list, description="List of day plans")
    total_locations: int = Field(..., ge=0, description="Total number of locations in the itinerary")
    validation_notes: list[str] = Field(
        default_factory=list, description="Notes about itinerary validation or warnings"
    )


class LocationEditDiff(BaseModel):
    """User edits to the suggested locations."""

    removed_ids: list[str] = Field(
        default_factory=list, description="IDs of locations removed by the user"
    )
    added_locations: list[Location] = Field(
        default_factory=list, description="Locations added by the user"
    )


# ============================================================
# API Request Models
# ============================================================


class StartTripRequest(BaseModel):
    """Request to start a new trip planning session."""

    trip_params: TripParameters = Field(..., description="Trip parameters")


class GenerateItineraryRequest(BaseModel):
    """Request to generate an itinerary from the current locations."""

    edits: LocationEditDiff | None = Field(
        default=None, description="Optional user edits to apply before generation"
    )


# ============================================================
# API Response Models
# ============================================================


class StartTripResponse(BaseModel):
    """Response after starting a new trip planning session."""

    thread_id: str = Field(..., description="Unique identifier for this planning session")
    locations: list[Location] = Field(
        default_factory=list, description="Suggested locations for the trip"
    )


class GenerateItineraryResponse(BaseModel):
    """Response with the generated itinerary."""

    itinerary: Itinerary = Field(..., description="The generated itinerary")


class TripStateResponse(BaseModel):
    """Current state of a trip planning session."""

    thread_id: str = Field(..., description="Unique identifier for this planning session")
    phase: str = Field(
        ..., description="Current phase (e.g., 'locations', 'itinerary', 'completed')"
    )
    trip_params: TripParameters | None = Field(
        default=None, description="Trip parameters if set"
    )
    locations: list[Location] = Field(
        default_factory=list, description="Current list of locations"
    )
    itinerary: Itinerary | None = Field(
        default=None, description="Generated itinerary if available"
    )


class PlaceAutocompleteResponse(BaseModel):
    """Response from places autocomplete."""

    predictions: list[dict[str, Any]] = Field(
        default_factory=list, description="Autocomplete predictions from Google Places"
    )
