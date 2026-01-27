"""
Simple itinerary generator without complex graph logic.
"""
import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from ..config import settings


ITINERARY_PROMPT = """You are a travel itinerary optimizer. Create a day-by-day itinerary from the given locations.

Locations:
{locations}

Trip Details:
- Duration: {num_days} days
- Style: {travel_style}

Rules:
- Group nearby locations together on the same day
- For "relaxed" style: 2-3 locations per day
- For "balanced" style: 3-4 locations per day
- For "packed" style: 4-5 locations per day
- Each location must appear exactly once

Return a JSON object with this exact structure:
{{
  "days": [
    {{
      "day_number": 1,
      "locations": ["location_id_1", "location_id_2"],
      "travel_times": [
        {{"from_location_id": "location_id_1", "to_location_id": "location_id_2", "duration_minutes": 15, "distance_km": 2.5}}
      ]
    }}
  ],
  "total_locations": 5,
  "validation_notes": []
}}

IMPORTANT: Return ONLY the JSON object, no other text."""


async def generate_itinerary_simple(
    locations: list[dict],
    num_days: int,
    travel_style: str,
) -> dict:
    """
    Generate an itinerary from locations using a single LLM call.

    This is a simplified version that doesn't use the complex graph.
    """
    if not locations:
        return {
            "days": [],
            "total_locations": 0,
            "validation_notes": ["No locations provided"],
        }

    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.3,
        api_key=settings.OPENAI_API_KEY,
    )

    # Format locations for the prompt
    locations_text = json.dumps([
        {"id": loc["id"], "name": loc["name"], "lat": loc["lat"], "lng": loc["lng"]}
        for loc in locations
    ], indent=2)

    prompt = ITINERARY_PROMPT.format(
        locations=locations_text,
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
            return itinerary
    except Exception as e:
        print(f"Error generating itinerary: {e}")

    # Fallback: create a simple itinerary
    return _create_fallback_itinerary(locations, num_days)


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


def _create_fallback_itinerary(locations: list[dict], num_days: int) -> dict:
    """Create a simple fallback itinerary distributing locations across days."""
    days = []
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
        })

    return {
        "days": days,
        "total_locations": len(locations),
        "validation_notes": ["Generated using simple distribution"],
    }
