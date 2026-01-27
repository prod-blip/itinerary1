"""
State schema for the Travel Planner LangGraph agent.
"""
from typing import TypedDict, Annotated
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages


class TravelPlannerState(TypedDict):
    """
    State schema for the travel planner graph.

    Fields:
        messages: LangChain message history for LLM context
        trip_params: User input from intake form (destination, days, interests, etc.)
        draft_locations: Agent-generated candidate locations before user editing
        final_locations: Locations after user has edited (removed/added)
        draft_itinerary: Generated day-wise plan before validation
        final_itinerary: Post-validation itinerary ready for display
        validation_passed: Whether validation checks passed
        validation_errors: List of validation issues if any
    """
    # Messages use the add_messages reducer for proper message handling
    messages: Annotated[list[AnyMessage], add_messages]

    # Trip parameters from user intake
    trip_params: dict | None

    # Location discovery phase
    draft_locations: list[dict]

    # After human-in-the-loop editing
    final_locations: list[dict]

    # Itinerary generation phase
    draft_itinerary: dict | None

    # After validation
    final_itinerary: dict | None

    # Validation results
    validation_passed: bool
    validation_errors: list[str]
