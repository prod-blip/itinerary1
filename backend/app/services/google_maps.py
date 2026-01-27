"""
Google Maps API wrapper for Places, Geocoding, and Distance Matrix APIs.
"""
import httpx
from typing import Any


class GoogleMapsService:
    """
    Client for Google Maps APIs including Places, Geocoding, and Distance Matrix.

    All methods are async and use httpx for HTTP requests.
    """

    def __init__(self, api_key: str) -> None:
        """
        Initialize the Google Maps service.

        Args:
            api_key: Google Maps API key
        """
        self.api_key = api_key
        self.base_url = "https://maps.googleapis.com/maps/api"

    async def places_autocomplete(
        self,
        input_text: str,
        types: str = "(cities)"
    ) -> list[dict[str, Any]]:
        """
        Autocomplete for place search.

        Args:
            input_text: The text to autocomplete
            types: The types of places to return (default: cities)

        Returns:
            List of place predictions with name, place_id, and description
        """
        url = f"{self.base_url}/place/autocomplete/json"
        params = {
            "input": input_text,
            "types": types,
            "key": self.api_key,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            if data.get("status") != "OK":
                if data.get("status") == "ZERO_RESULTS":
                    return []
                raise ValueError(f"Google Places API error: {data.get('status')}")

            predictions = []
            for prediction in data.get("predictions", []):
                predictions.append({
                    "name": prediction.get("structured_formatting", {}).get(
                        "main_text", prediction.get("description", "")
                    ),
                    "place_id": prediction.get("place_id"),
                    "description": prediction.get("description"),
                })

            return predictions

    async def places_text_search(
        self,
        query: str,
        location: str | None = None
    ) -> list[dict[str, Any]]:
        """
        Text search for places.

        Args:
            query: The search query
            location: Optional location bias (e.g., "lat,lng" or city name)

        Returns:
            List of places with name, place_id, address, coordinates, and types
        """
        url = f"{self.base_url}/place/textsearch/json"
        params: dict[str, Any] = {
            "query": query,
            "key": self.api_key,
        }

        if location:
            # If location looks like coordinates, use it directly
            if "," in location and location.replace(",", "").replace(".", "").replace("-", "").isdigit():
                params["location"] = location
                params["radius"] = 50000  # 50km radius
            else:
                # Otherwise, append to query for better results
                params["query"] = f"{query} in {location}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            if data.get("status") not in ["OK", "ZERO_RESULTS"]:
                raise ValueError(f"Google Places API error: {data.get('status')}")

            places = []
            for result in data.get("results", []):
                location_data = result.get("geometry", {}).get("location", {})
                places.append({
                    "name": result.get("name"),
                    "place_id": result.get("place_id"),
                    "formatted_address": result.get("formatted_address"),
                    "lat": location_data.get("lat"),
                    "lng": location_data.get("lng"),
                    "types": result.get("types", []),
                    "rating": result.get("rating"),
                    "user_ratings_total": result.get("user_ratings_total"),
                })

            return places

    async def place_details(self, place_id: str) -> dict[str, Any]:
        """
        Get detailed place information.

        Args:
            place_id: Google Place ID

        Returns:
            Dictionary with detailed place information
        """
        url = f"{self.base_url}/place/details/json"
        params = {
            "place_id": place_id,
            "fields": "name,formatted_address,geometry,rating,reviews,opening_hours,website,formatted_phone_number,types,photos,editorial_summary",
            "key": self.api_key,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            if data.get("status") != "OK":
                raise ValueError(f"Google Places API error: {data.get('status')}")

            result = data.get("result", {})
            location_data = result.get("geometry", {}).get("location", {})

            # Extract reviews summary
            reviews = result.get("reviews", [])
            review_summaries = [
                {
                    "rating": r.get("rating"),
                    "text": r.get("text", "")[:200],  # Truncate long reviews
                    "relative_time": r.get("relative_time_description"),
                }
                for r in reviews[:3]  # Only include top 3 reviews
            ]

            return {
                "name": result.get("name"),
                "formatted_address": result.get("formatted_address"),
                "lat": location_data.get("lat"),
                "lng": location_data.get("lng"),
                "rating": result.get("rating"),
                "reviews": review_summaries,
                "opening_hours": result.get("opening_hours", {}).get("weekday_text", []),
                "website": result.get("website"),
                "phone": result.get("formatted_phone_number"),
                "types": result.get("types", []),
                "editorial_summary": result.get("editorial_summary", {}).get("overview"),
            }

    async def distance_matrix(
        self,
        origins: list[str],
        destinations: list[str],
        mode: str = "driving"
    ) -> dict[str, Any]:
        """
        Get travel times and distances between multiple origins and destinations.

        Args:
            origins: List of origin coordinates as "lat,lng" strings
            destinations: List of destination coordinates as "lat,lng" strings
            mode: Travel mode (driving, walking, bicycling, transit)

        Returns:
            Matrix of durations and distances between all origin-destination pairs
        """
        url = f"{self.base_url}/distancematrix/json"
        params = {
            "origins": "|".join(origins),
            "destinations": "|".join(destinations),
            "mode": mode,
            "key": self.api_key,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=15.0)
            response.raise_for_status()
            data = response.json()

            if data.get("status") != "OK":
                raise ValueError(f"Google Distance Matrix API error: {data.get('status')}")

            # Parse the response into a more usable format
            matrix = {
                "origin_addresses": data.get("origin_addresses", []),
                "destination_addresses": data.get("destination_addresses", []),
                "rows": [],
            }

            for row in data.get("rows", []):
                row_data = []
                for element in row.get("elements", []):
                    if element.get("status") == "OK":
                        row_data.append({
                            "duration_seconds": element.get("duration", {}).get("value"),
                            "duration_text": element.get("duration", {}).get("text"),
                            "distance_meters": element.get("distance", {}).get("value"),
                            "distance_text": element.get("distance", {}).get("text"),
                        })
                    else:
                        row_data.append({
                            "status": element.get("status"),
                            "duration_seconds": None,
                            "duration_text": None,
                            "distance_meters": None,
                            "distance_text": None,
                        })
                matrix["rows"].append(row_data)

            return matrix

    async def geocode(self, address: str) -> dict[str, Any] | None:
        """
        Geocode an address to get coordinates.

        Args:
            address: The address to geocode

        Returns:
            Dictionary with lat, lng, and formatted_address, or None if not found
        """
        url = f"{self.base_url}/geocode/json"
        params = {
            "address": address,
            "key": self.api_key,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            if data.get("status") == "ZERO_RESULTS":
                return None

            if data.get("status") != "OK":
                raise ValueError(f"Google Geocoding API error: {data.get('status')}")

            result = data.get("results", [{}])[0]
            location = result.get("geometry", {}).get("location", {})

            return {
                "lat": location.get("lat"),
                "lng": location.get("lng"),
                "formatted_address": result.get("formatted_address"),
            }
