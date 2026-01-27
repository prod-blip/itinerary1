"""
Simple itinerary generator without complex graph logic.
"""
import json
import math
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from ..config import settings
from ..services.google_maps import GoogleMapsService


ITINERARY_PROMPT = """You are a travel itinerary optimizer. Create a day-by-day itinerary from the given locations.

Locations have been pre-grouped by geographic proximity:
{cluster_info}

Trip Details:
- Duration: {num_days} days
- Style: {travel_style}

Rules:
- Respect the geographic clusters when assigning locations to days
- Try to assign each cluster to a single day when possible
- For "relaxed" style: 2-3 locations per day
- For "balanced" style: 3-4 locations per day
- For "packed" style: 4-5 locations per day
- Each location must appear exactly once
- You may split large clusters across days if needed

Return a JSON object with this exact structure:
{{
  "days": [
    {{
      "day_number": 1,
      "locations": ["location_id_1", "location_id_2"],
      "travel_times": [
        {{"from_location_id": "location_id_1", "to_location_id": "location_id_2", "duration_minutes": 15, "distance_km": 2.5}}
      ],
      "area_label": "Downtown"
    }}
  ],
  "total_locations": 5,
  "validation_notes": []
}}

IMPORTANT: Return ONLY the JSON object, no other text."""


def _haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great circle distance between two points in kilometers.
    """
    R = 6371  # Earth's radius in km

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)

    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))

    return R * c


def _cluster_locations_by_proximity(
    locations: list[dict],
    num_clusters: int
) -> list[list[dict]]:
    """
    Group locations into clusters by geographic proximity.
    Uses a simple k-means-like approach based on distance from center.

    Args:
        locations: List of location dictionaries with lat, lng
        num_clusters: Target number of clusters (typically num_days)

    Returns:
        List of clusters, each containing a list of locations
    """
    if len(locations) <= num_clusters:
        return [[loc] for loc in locations]

    if num_clusters <= 0:
        return [locations]

    # Calculate center point
    avg_lat = sum(loc['lat'] for loc in locations) / len(locations)
    avg_lng = sum(loc['lng'] for loc in locations) / len(locations)

    # Calculate distance and angle from center for each location
    location_data = []
    for loc in locations:
        dist = _haversine_distance(avg_lat, avg_lng, loc['lat'], loc['lng'])
        angle = math.atan2(loc['lng'] - avg_lng, loc['lat'] - avg_lat)
        location_data.append({
            'location': loc,
            'distance': dist,
            'angle': angle,
        })

    # Sort by angle to group geographically close locations
    location_data.sort(key=lambda x: x['angle'])

    # Divide into clusters
    clusters: list[list[dict]] = [[] for _ in range(num_clusters)]
    for i, data in enumerate(location_data):
        cluster_idx = i * num_clusters // len(location_data)
        clusters[cluster_idx].append(data['location'])

    # Remove empty clusters
    clusters = [c for c in clusters if c]

    return clusters


def _get_cluster_area_label(cluster: list[dict]) -> str:
    """
    Generate a simple area label based on cluster centroid position.
    In a production system, this could use reverse geocoding.
    """
    if not cluster:
        return "Area"

    # For now, just return a generic label based on cluster index
    # A more sophisticated version would use reverse geocoding
    return ""


def _format_cluster_info(clusters: list[list[dict]]) -> str:
    """Format cluster information for the LLM prompt."""
    lines = []
    for i, cluster in enumerate(clusters):
        location_names = [f"  - {loc['name']} (id: {loc['id']})" for loc in cluster]
        lines.append(f"Cluster {i + 1} ({len(cluster)} locations):")
        lines.extend(location_names)
        lines.append("")
    return "\n".join(lines)


async def generate_itinerary_simple(
    locations: list[dict],
    num_days: int,
    travel_style: str,
) -> tuple[dict, list[str]]:
    """
    Generate an itinerary from locations using a single LLM call.

    This is a simplified version that doesn't use the complex graph.

    Returns:
        Tuple of (itinerary dict, list of route warnings)
    """
    route_warnings: list[str] = []

    if not locations:
        return {
            "days": [],
            "total_locations": 0,
            "validation_notes": ["No locations provided"],
        }, route_warnings

    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.3,
        api_key=settings.OPENAI_API_KEY,
    )

    # Pre-cluster locations by geographic proximity
    clusters = _cluster_locations_by_proximity(locations, num_days)
    cluster_info = _format_cluster_info(clusters)

    prompt = ITINERARY_PROMPT.format(
        cluster_info=cluster_info,
        num_days=num_days,
        travel_style=travel_style,
    )

    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content="Generate the itinerary now."),
    ]

    try:
        response = await llm.ainvoke(messages)
        content = response.content

        # Parse JSON from response
        start_idx = content.find("{")
        end_idx = content.rfind("}") + 1
        if start_idx != -1 and end_idx > start_idx:
            json_str = content[start_idx:end_idx]
            itinerary = json.loads(json_str)

            # Validate and fix the itinerary structure
            itinerary = _validate_itinerary(itinerary, locations, num_days)

            # Enrich with real route data (polylines, actual travel times)
            itinerary, route_warnings = await _enrich_itinerary_with_routes(itinerary, locations)

            return itinerary, route_warnings
    except Exception as e:
        print(f"Error generating itinerary: {e}")

    # Fallback: create a simple itinerary using clusters
    fallback = _create_fallback_itinerary(locations, num_days, clusters)
    # Still try to enrich fallback with routes
    fallback, route_warnings = await _enrich_itinerary_with_routes(fallback, locations)
    return fallback, route_warnings


def _validate_itinerary(itinerary: dict, locations: list[dict], num_days: int) -> dict:
    """Validate and fix itinerary structure."""
    location_ids = {loc["id"] for loc in locations}
    validation_notes = []

    days = itinerary.get("days", [])

    # Check all locations are included
    used_ids = set()
    for day in days:
        day_locs = day.get("locations", [])
        used_ids.update(day_locs)

    missing = location_ids - used_ids
    if missing:
        validation_notes.append(f"Note: {len(missing)} locations not assigned to days")

    itinerary["validation_notes"] = validation_notes
    itinerary["total_locations"] = len(locations)

    return itinerary


def _create_fallback_itinerary(
    locations: list[dict],
    num_days: int,
    clusters: list[list[dict]] | None = None
) -> dict:
    """Create a simple fallback itinerary distributing locations across days."""
    days = []

    if clusters and len(clusters) > 0:
        # Use pre-computed clusters
        day_num = 0
        for cluster in clusters:
            day_num += 1
            if day_num > num_days:
                # Add remaining locations to last day
                days[-1]["locations"].extend([loc["id"] for loc in cluster])
            else:
                travel_times = []
                for i in range(len(cluster) - 1):
                    travel_times.append({
                        "from_location_id": cluster[i]["id"],
                        "to_location_id": cluster[i + 1]["id"],
                        "duration_minutes": 20,
                        "distance_km": 3.0,
                    })

                days.append({
                    "day_number": day_num,
                    "locations": [loc["id"] for loc in cluster],
                    "travel_times": travel_times,
                    "route_optimized": False,
                })

        # Fill remaining days if fewer clusters than days
        while len(days) < num_days:
            days.append({
                "day_number": len(days) + 1,
                "locations": [],
                "travel_times": [],
                "route_optimized": False,
            })
    else:
        # Original simple distribution
        locations_per_day = max(1, len(locations) // num_days)

        for day_num in range(1, num_days + 1):
            start_idx = (day_num - 1) * locations_per_day
            end_idx = start_idx + locations_per_day if day_num < num_days else len(locations)
            day_locations = locations[start_idx:end_idx]

            travel_times = []
            for i in range(len(day_locations) - 1):
                travel_times.append({
                    "from_location_id": day_locations[i]["id"],
                    "to_location_id": day_locations[i + 1]["id"],
                    "duration_minutes": 20,
                    "distance_km": 3.0,
                })

            days.append({
                "day_number": day_num,
                "locations": [loc["id"] for loc in day_locations],
                "travel_times": travel_times,
                "route_optimized": False,
            })

    return {
        "days": days,
        "total_locations": len(locations),
        "validation_notes": ["Generated using simple distribution"],
    }


def _optimize_day_order_tsp(
    location_ids: list[str],
    locations_lookup: dict[str, dict],
    travel_times: list[dict]
) -> list[str]:
    """
    Reorder locations within a day to minimize total travel time.
    Uses nearest neighbor heuristic for O(n^2) performance.

    Args:
        location_ids: List of location IDs in current order
        locations_lookup: Dict mapping location ID to location data
        travel_times: List of travel time segments with duration info

    Returns:
        Optimized order of location IDs
    """
    if len(location_ids) <= 2:
        return location_ids

    # Build a distance matrix from travel times (or use haversine if not available)
    n = len(location_ids)
    distances: dict[tuple[str, str], float] = {}

    # First populate from travel_times if available
    for segment in travel_times:
        from_id = segment.get("from_location_id")
        to_id = segment.get("to_location_id")
        duration = segment.get("duration_minutes", 0)
        if from_id and to_id:
            distances[(from_id, to_id)] = duration
            distances[(to_id, from_id)] = duration  # Assume bidirectional

    # Fill in missing distances using haversine
    for i, id1 in enumerate(location_ids):
        for j, id2 in enumerate(location_ids):
            if i != j and (id1, id2) not in distances:
                loc1 = locations_lookup.get(id1, {})
                loc2 = locations_lookup.get(id2, {})
                if loc1 and loc2:
                    # Estimate travel time from distance (assume 30 km/h average in city)
                    dist_km = _haversine_distance(
                        loc1.get('lat', 0), loc1.get('lng', 0),
                        loc2.get('lat', 0), loc2.get('lng', 0)
                    )
                    estimated_minutes = dist_km * 2  # Rough estimate
                    distances[(id1, id2)] = estimated_minutes
                    distances[(id2, id1)] = estimated_minutes

    # Nearest neighbor algorithm starting from first location
    visited = {location_ids[0]}
    optimized_order = [location_ids[0]]

    while len(optimized_order) < n:
        current = optimized_order[-1]
        best_next = None
        best_distance = float('inf')

        for loc_id in location_ids:
            if loc_id not in visited:
                dist = distances.get((current, loc_id), float('inf'))
                if dist < best_distance:
                    best_distance = dist
                    best_next = loc_id

        if best_next:
            optimized_order.append(best_next)
            visited.add(best_next)
        else:
            # Shouldn't happen, but add remaining in original order
            for loc_id in location_ids:
                if loc_id not in visited:
                    optimized_order.append(loc_id)
                    visited.add(loc_id)
            break

    return optimized_order


async def _enrich_itinerary_with_routes(
    itinerary: dict,
    locations: list[dict]
) -> tuple[dict, list[str]]:
    """
    Enrich itinerary with real route data from Google Directions API.

    For each day:
    1. Fetches initial directions between locations
    2. Applies TSP optimization to minimize travel time
    3. Re-fetches routes if order changed

    Args:
        itinerary: The generated itinerary with day structure
        locations: List of location dictionaries with id, lat, lng

    Returns:
        Tuple of (enriched itinerary, list of warnings)
    """
    warnings: list[str] = []

    if not settings.GOOGLE_MAPS_API_KEY:
        warnings.append("Google Maps API key not configured - using estimated travel times")
        return itinerary, warnings

    maps_service = GoogleMapsService(settings.GOOGLE_MAPS_API_KEY)

    # Build location lookup by ID
    location_lookup = {loc["id"]: loc for loc in locations}

    for day in itinerary.get("days", []):
        day_location_ids = day.get("locations", [])
        if len(day_location_ids) < 2:
            day["route_optimized"] = False
            continue

        # Get coordinates for all locations in order
        day_coords = []
        valid_location_ids = []
        for loc_id in day_location_ids:
            loc = location_lookup.get(loc_id)
            if loc:
                day_coords.append(f"{loc['lat']},{loc['lng']}")
                valid_location_ids.append(loc_id)

        if len(day_coords) < 2:
            day["route_optimized"] = False
            continue

        try:
            # First pass: get initial routes
            origin = day_coords[0]
            destination = day_coords[-1]
            waypoints = day_coords[1:-1] if len(day_coords) > 2 else None

            directions = await maps_service.get_directions(
                origin=origin,
                destination=destination,
                waypoints=waypoints,
                mode="driving"
            )

            legs = directions.get("legs", [])

            # Build initial travel_times
            initial_travel_times = []
            for i, leg in enumerate(legs):
                if i >= len(valid_location_ids) - 1:
                    break

                from_id = valid_location_ids[i]
                to_id = valid_location_ids[i + 1]

                duration_seconds = leg.get("duration_seconds") or 0
                distance_meters = leg.get("distance_meters") or 0

                initial_travel_times.append({
                    "from_location_id": from_id,
                    "to_location_id": to_id,
                    "duration_minutes": round(duration_seconds / 60),
                    "distance_km": round(distance_meters / 1000, 1),
                    "polyline": leg.get("polyline"),
                })

            # Apply TSP optimization if we have enough locations
            if len(valid_location_ids) >= 3:
                optimized_order = _optimize_day_order_tsp(
                    valid_location_ids,
                    location_lookup,
                    initial_travel_times
                )

                # Check if order changed
                if optimized_order != valid_location_ids:
                    # Re-fetch routes with optimized order
                    optimized_coords = [
                        f"{location_lookup[loc_id]['lat']},{location_lookup[loc_id]['lng']}"
                        for loc_id in optimized_order
                    ]

                    origin = optimized_coords[0]
                    destination = optimized_coords[-1]
                    waypoints = optimized_coords[1:-1] if len(optimized_coords) > 2 else None

                    try:
                        optimized_directions = await maps_service.get_directions(
                            origin=origin,
                            destination=destination,
                            waypoints=waypoints,
                            mode="driving"
                        )

                        optimized_legs = optimized_directions.get("legs", [])

                        # Update day with optimized order
                        day["locations"] = optimized_order
                        day["route_optimized"] = True

                        # Build new travel_times
                        new_travel_times = []
                        for i, leg in enumerate(optimized_legs):
                            if i >= len(optimized_order) - 1:
                                break

                            from_id = optimized_order[i]
                            to_id = optimized_order[i + 1]

                            duration_seconds = leg.get("duration_seconds") or 0
                            distance_meters = leg.get("distance_meters") or 0

                            new_travel_times.append({
                                "from_location_id": from_id,
                                "to_location_id": to_id,
                                "duration_minutes": round(duration_seconds / 60),
                                "distance_km": round(distance_meters / 1000, 1),
                                "polyline": leg.get("polyline"),
                            })

                        day["travel_times"] = new_travel_times
                    except Exception as e:
                        # Failed to get optimized routes, use initial
                        day["travel_times"] = initial_travel_times
                        day["route_optimized"] = False
                        warnings.append(f"Could not optimize routes for Day {day.get('day_number')}: {str(e)}")
                else:
                    # Order didn't change
                    day["travel_times"] = initial_travel_times
                    day["route_optimized"] = False
            else:
                # Not enough locations to optimize
                day["travel_times"] = initial_travel_times
                day["route_optimized"] = False

        except Exception as e:
            warnings.append(f"Could not fetch routes for Day {day.get('day_number')}: {str(e)}")
            day["route_optimized"] = False
            # Keep placeholder travel_times with estimates
            estimated_travel_times = []
            for i in range(len(valid_location_ids) - 1):
                from_id = valid_location_ids[i]
                to_id = valid_location_ids[i + 1]

                loc1 = location_lookup.get(from_id, {})
                loc2 = location_lookup.get(to_id, {})

                if loc1 and loc2:
                    dist_km = _haversine_distance(
                        loc1.get('lat', 0), loc1.get('lng', 0),
                        loc2.get('lat', 0), loc2.get('lng', 0)
                    )
                    estimated_minutes = round(dist_km * 2)  # Rough estimate
                else:
                    dist_km = 3.0
                    estimated_minutes = 20

                estimated_travel_times.append({
                    "from_location_id": from_id,
                    "to_location_id": to_id,
                    "duration_minutes": estimated_minutes,
                    "distance_km": round(dist_km, 1),
                    "polyline": None,  # No polyline for estimates
                })

            day["travel_times"] = estimated_travel_times

    return itinerary, warnings
