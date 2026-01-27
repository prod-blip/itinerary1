"""
LangChain tools for the Travel Planner agent.
"""
import httpx
from langchain_core.tools import tool

from ..config import settings
from ..services.google_maps import GoogleMapsService


# Initialize Google Maps service
_google_maps: GoogleMapsService | None = None


def _get_google_maps_service() -> GoogleMapsService:
    """Get or create the Google Maps service instance."""
    global _google_maps
    if _google_maps is None:
        _google_maps = GoogleMapsService(settings.GOOGLE_MAPS_API_KEY)
    return _google_maps


@tool
async def search_places(query: str, location: str) -> list[dict]:
    """
    Search for places using Google Places Text Search API.

    Use this tool to find places matching a search query in a specific location.
    Examples: "museums in Paris", "best restaurants in Tokyo", "hiking trails near Seattle"

    Args:
        query: Search query describing the type of place (e.g., "historical monuments", "coffee shops")
        location: The city or area to search in (e.g., "Paris, France", "Tokyo, Japan")

    Returns:
        List of places with name, place_id, formatted_address, lat, lng, and types
    """
    google_maps = _get_google_maps_service()

    try:
        results = await google_maps.places_text_search(query, location)
        # Return top 10 results to avoid overwhelming the LLM
        return results[:10]
    except Exception as e:
        return [{"error": str(e)}]


@tool
async def get_place_details(place_id: str) -> dict:
    """
    Get detailed information about a specific place from Google Places Details API.

    Use this tool to get more details about a place you found through search_places,
    including reviews, opening hours, website, and phone number.

    Args:
        place_id: The Google Place ID of the place to get details for

    Returns:
        Dictionary with name, formatted_address, lat, lng, rating, reviews,
        opening_hours, website, and phone
    """
    google_maps = _get_google_maps_service()

    try:
        return await google_maps.place_details(place_id)
    except Exception as e:
        return {"error": str(e)}


@tool
async def tavily_search(query: str) -> str:
    """
    Search the web for travel information using Tavily API.

    Use this tool to find local insights, hidden gems, best times to visit,
    local tips, and current information that might not be in Google Places.
    Great for finding blog posts, travel guides, and local recommendations.

    Args:
        query: Search query for travel information (e.g., "hidden gems in Barcelona",
               "best time to visit Kyoto temples", "local food spots in Mexico City")

    Returns:
        Summarized content from web search results
    """
    if not settings.TAVILY_API_KEY:
        return "Tavily API key not configured. Unable to perform web search."

    url = "https://api.tavily.com/search"
    payload = {
        "api_key": settings.TAVILY_API_KEY,
        "query": query,
        "search_depth": "advanced",
        "include_answer": True,
        "include_raw_content": False,
        "max_results": 5,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=30.0)
            response.raise_for_status()
            data = response.json()

            # Build a summary from the results
            answer = data.get("answer", "")
            results = data.get("results", [])

            summary_parts = []
            if answer:
                summary_parts.append(f"Summary: {answer}")

            for result in results[:3]:
                title = result.get("title", "")
                content = result.get("content", "")[:500]  # Truncate long content
                summary_parts.append(f"\n- {title}: {content}")

            return "\n".join(summary_parts) if summary_parts else "No relevant results found."

    except Exception as e:
        return f"Error performing web search: {str(e)}"


@tool
async def get_distance_matrix(origins: list[str], destinations: list[str]) -> dict:
    """
    Get travel times and distances between multiple locations using Google Distance Matrix API.

    Use this tool when planning the itinerary to understand how long it takes
    to travel between different locations. This helps optimize the day-by-day
    sequence to minimize travel time.

    Args:
        origins: List of origin coordinates as "lat,lng" strings
                (e.g., ["48.8584,2.2945", "48.8606,2.3376"])
        destinations: List of destination coordinates as "lat,lng" strings

    Returns:
        Matrix of durations and distances between all origin-destination pairs.
        Each cell contains duration_seconds, duration_text, distance_meters, distance_text.
    """
    google_maps = _get_google_maps_service()

    try:
        return await google_maps.distance_matrix(origins, destinations)
    except Exception as e:
        return {"error": str(e)}


# Export all tools as a list for easy binding to LLM
LOCATION_DISCOVERY_TOOLS = [search_places, get_place_details, tavily_search]
ITINERARY_TOOLS = [get_distance_matrix]
ALL_TOOLS = LOCATION_DISCOVERY_TOOLS + ITINERARY_TOOLS
