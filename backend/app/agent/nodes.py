"""
Node functions for the Travel Planner LangGraph.
"""
import json
import uuid
from typing import Any

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage

from ..config import settings
from .state import TravelPlannerState
from .prompts import (
    LOCATION_DISCOVERY_PROMPT,
    ITINERARY_GENERATOR_PROMPT,
    VALIDATION_SYSTEM_PROMPT,
)
from .tools import LOCATION_DISCOVERY_TOOLS, ITINERARY_TOOLS


def _get_llm() -> ChatOpenAI:
    """Get the ChatOpenAI instance for agent operations."""
    return ChatOpenAI(
        model="gpt-4o",
        temperature=0.7,
        api_key=settings.OPENAI_API_KEY,
    )


def _parse_locations_from_response(content: str) -> list[dict]:
    """
    Parse location data from LLM response.

    Attempts to extract JSON from the response content.
    """
    # Try to find JSON array in the response
    try:
        # Look for JSON array pattern
        start_idx = content.find("[")
        end_idx = content.rfind("]") + 1
        if start_idx != -1 and end_idx > start_idx:
            json_str = content[start_idx:end_idx]
            locations = json.loads(json_str)

            # Add unique IDs to each location
            for loc in locations:
                if "id" not in loc:
                    loc["id"] = str(uuid.uuid4())
                loc["user_added"] = False

            return locations
    except json.JSONDecodeError:
        pass

    return []


def _parse_itinerary_from_response(content: str) -> dict | None:
    """
    Parse itinerary data from LLM response.

    Attempts to extract JSON from the response content.
    """
    try:
        # Look for JSON object pattern
        start_idx = content.find("{")
        end_idx = content.rfind("}") + 1
        if start_idx != -1 and end_idx > start_idx:
            json_str = content[start_idx:end_idx]
            return json.loads(json_str)
    except json.JSONDecodeError:
        pass

    return None


async def location_discovery_node(state: TravelPlannerState) -> dict[str, Any]:
    """
    Discovers locations using LLM with tools.

    This node uses the LLM to search for and gather information about
    locations that match the user's trip parameters.
    """
    llm = _get_llm()
    llm_with_tools = llm.bind_tools(LOCATION_DISCOVERY_TOOLS)

    trip_params = state.get("trip_params", {}) or {}

    # Calculate target number of locations based on days and travel style
    num_days = trip_params.get("num_days", 3)
    travel_style = trip_params.get("travel_style", "balanced")
    style_multiplier = {"relaxed": 2.5, "balanced": 3.5, "packed": 4.5}
    num_locations = min(20, max(8, int(num_days * style_multiplier.get(travel_style, 3.5))))

    # Format the system prompt with trip parameters
    system_prompt = LOCATION_DISCOVERY_PROMPT.format(
        destination=trip_params.get("destination", "Unknown"),
        num_days=num_days,
        travel_style=travel_style,
        interests=", ".join(trip_params.get("interests", [])),
        constraints=", ".join(trip_params.get("constraints", [])) or "None",
        notes=trip_params.get("additional_notes", "None provided"),
        num_locations=num_locations,
    )

    messages = list(state.get("messages", []))

    # If this is the first call, add the system message
    if not messages or not any(isinstance(m, SystemMessage) for m in messages):
        messages.insert(0, SystemMessage(content=system_prompt))

        # Add initial human message to start the conversation
        messages.append(HumanMessage(
            content=f"Please find {num_locations} great locations for my trip to {trip_params.get('destination', 'the destination')}."
        ))

    # Invoke the LLM
    response = await llm_with_tools.ainvoke(messages)

    # Check if the response contains tool calls
    if response.tool_calls:
        # Return with tool calls for the tool executor to handle
        return {
            "messages": [response],
            "draft_locations": state.get("draft_locations", []),
        }

    # No tool calls - the LLM has finished gathering information
    # Parse the locations from the response
    draft_locations = _parse_locations_from_response(response.content)

    # If no locations were parsed, keep existing draft locations
    if not draft_locations:
        draft_locations = state.get("draft_locations", [])

    return {
        "messages": [response],
        "draft_locations": draft_locations,
    }


async def tool_executor_node(state: TravelPlannerState) -> dict[str, Any]:
    """
    Executes tool calls from the LLM.

    Gets the last message, executes any tool calls, and returns the results.
    """
    messages = state.get("messages", [])
    if not messages:
        return {"messages": []}

    last_message = messages[-1]

    # Check if the last message has tool calls
    if not isinstance(last_message, AIMessage) or not last_message.tool_calls:
        return {"messages": []}

    # Build a tool lookup dictionary
    all_tools = LOCATION_DISCOVERY_TOOLS + ITINERARY_TOOLS
    tool_lookup = {tool.name: tool for tool in all_tools}

    # Execute each tool call
    tool_messages = []
    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        tool_id = tool_call["id"]

        if tool_name in tool_lookup:
            tool = tool_lookup[tool_name]
            try:
                # Execute the tool
                result = await tool.ainvoke(tool_args)
                # Convert result to string if needed
                if not isinstance(result, str):
                    result = json.dumps(result, indent=2)
            except Exception as e:
                result = f"Error executing tool {tool_name}: {str(e)}"
        else:
            result = f"Unknown tool: {tool_name}"

        tool_messages.append(
            ToolMessage(content=result, tool_call_id=tool_id)
        )

    return {"messages": tool_messages}


async def itinerary_generator_node(state: TravelPlannerState) -> dict[str, Any]:
    """
    Generates day-wise itinerary from approved locations.

    Uses final_locations (after user edits) to create a structured itinerary.
    """
    llm = _get_llm()
    llm_with_tools = llm.bind_tools(ITINERARY_TOOLS)

    trip_params = state.get("trip_params", {}) or {}
    final_locations = state.get("final_locations", [])

    if not final_locations:
        return {
            "messages": [AIMessage(content="No locations to create itinerary from.")],
            "draft_itinerary": None,
        }

    # Format locations for the prompt
    locations_text = json.dumps(final_locations, indent=2)

    system_prompt = ITINERARY_GENERATOR_PROMPT.format(
        locations=locations_text,
        num_days=trip_params.get("num_days", 3),
        travel_style=trip_params.get("travel_style", "balanced"),
    )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content="Please create an optimized day-by-day itinerary for these locations."),
    ]

    # Check if there are existing messages from previous tool calls
    existing_messages = state.get("messages", [])
    # Filter for itinerary-related messages (after HITL interrupt)
    for msg in existing_messages:
        if isinstance(msg, (AIMessage, ToolMessage)):
            # Check if this is from itinerary phase by looking at tool calls
            if isinstance(msg, AIMessage) and msg.tool_calls:
                for tc in msg.tool_calls:
                    if tc["name"] in ["get_distance_matrix"]:
                        messages.extend([msg])
                        break
            elif isinstance(msg, ToolMessage):
                messages.append(msg)

    # Invoke the LLM
    response = await llm_with_tools.ainvoke(messages)

    # Check if the response contains tool calls
    if response.tool_calls:
        return {
            "messages": [response],
            "draft_itinerary": state.get("draft_itinerary"),
        }

    # No tool calls - parse the itinerary from the response
    draft_itinerary = _parse_itinerary_from_response(response.content)

    if not draft_itinerary:
        # If parsing failed, create a basic structure
        draft_itinerary = {
            "days": [],
            "total_locations": len(final_locations),
            "raw_response": response.content,
        }

    return {
        "messages": [response],
        "draft_itinerary": draft_itinerary,
    }


async def validation_node(state: TravelPlannerState) -> dict[str, Any]:
    """
    Validates the generated itinerary.

    Checks that all final_locations are in the itinerary, pacing matches
    travel_style, and other validation rules.
    """
    trip_params = state.get("trip_params", {}) or {}
    final_locations = state.get("final_locations", [])
    draft_itinerary = state.get("draft_itinerary")

    validation_errors: list[str] = []
    validation_passed = True

    if not draft_itinerary:
        validation_errors.append("No itinerary was generated")
        return {
            "validation_passed": False,
            "validation_errors": validation_errors,
            "final_itinerary": None,
        }

    days = draft_itinerary.get("days", [])
    num_days = trip_params.get("num_days", 3)
    travel_style = trip_params.get("travel_style", "balanced")

    # Check 1: Correct number of days
    if len(days) != num_days:
        validation_errors.append(
            f"Itinerary has {len(days)} days but trip is {num_days} days"
        )

    # Check 2: All locations are included
    location_ids = {loc.get("id") for loc in final_locations}
    itinerary_location_ids = set()
    for day in days:
        for loc_id in day.get("locations", []):
            itinerary_location_ids.add(loc_id)

    missing_locations = location_ids - itinerary_location_ids
    if missing_locations:
        validation_errors.append(
            f"Missing {len(missing_locations)} locations from itinerary"
        )

    # Check 3: No extra locations added
    extra_locations = itinerary_location_ids - location_ids
    if extra_locations:
        validation_errors.append(
            f"Itinerary contains {len(extra_locations)} locations not in final list"
        )

    # Check 4: Each day has at least 1 location
    empty_days = [i + 1 for i, day in enumerate(days) if not day.get("locations")]
    if empty_days:
        validation_errors.append(f"Days {empty_days} have no locations assigned")

    # Check 5: Pacing matches travel style
    max_per_day = {"relaxed": 4, "balanced": 5, "packed": 7}
    style_max = max_per_day.get(travel_style, 5)
    over_packed_days = []
    for i, day in enumerate(days):
        if len(day.get("locations", [])) > style_max:
            over_packed_days.append(i + 1)

    if over_packed_days:
        validation_errors.append(
            f"Days {over_packed_days} exceed max locations for '{travel_style}' style (max {style_max})"
        )

    # Determine if validation passed (allow warnings but catch critical errors)
    critical_errors = [e for e in validation_errors if "Missing" in e or "No itinerary" in e]
    validation_passed = len(critical_errors) == 0

    # Create final itinerary (even if there are warnings)
    final_itinerary = draft_itinerary.copy() if draft_itinerary else {}
    final_itinerary["validation_notes"] = validation_errors

    return {
        "validation_passed": validation_passed,
        "validation_errors": validation_errors,
        "final_itinerary": final_itinerary if validation_passed else None,
    }


def should_continue_discovery(state: TravelPlannerState) -> str:
    """
    Routing function to check if location discovery should continue.

    Returns:
        "tool_executor" if there are tool calls to execute
        "end_discovery" if the LLM is done discovering
    """
    messages = state.get("messages", [])
    if not messages:
        return "end_discovery"

    last_message = messages[-1]

    # Check if the last message has tool calls
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "tool_executor"

    return "end_discovery"


def should_continue_itinerary(state: TravelPlannerState) -> str:
    """
    Routing function to check if itinerary generation should continue with tools.

    Returns:
        "tool_executor" if there are tool calls to execute
        "validation" if the LLM is done generating
    """
    messages = state.get("messages", [])
    if not messages:
        return "validation"

    last_message = messages[-1]

    # Check if the last message has tool calls
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "tool_executor"

    return "validation"


def should_regenerate(state: TravelPlannerState) -> str:
    """
    Routing function to check if itinerary should be regenerated.

    Returns:
        "itinerary_generator" if validation failed and needs regeneration
        "end" if validation passed
    """
    if state.get("validation_passed", False):
        return "end"

    # Check error count - don't loop forever
    validation_errors = state.get("validation_errors", [])
    if len(validation_errors) > 5:
        return "end"  # Too many errors, exit

    return "itinerary_generator"
