"""
LangGraph definition for the Travel Planner agent.
"""
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from .state import TravelPlannerState
from .nodes import (
    location_discovery_node,
    tool_executor_node,
    itinerary_generator_node,
    validation_node,
    should_continue_discovery,
    should_continue_itinerary,
    should_regenerate,
)


def create_travel_planner_graph() -> StateGraph:
    """
    Create and compile the travel planner graph.

    Graph Flow:
    1. START -> location_discovery
    2. location_discovery -> tool_executor (if tool calls) or END (when done)
    3. tool_executor -> location_discovery (loop back to process results)
    4. [INTERRUPT for HITL - user edits locations]
    5. itinerary_generator -> tool_executor (if tool calls) or validation
    6. tool_executor -> itinerary_generator (loop back)
    7. validation -> itinerary_generator (if failed) or END (if passed)

    Returns:
        Compiled StateGraph with MemorySaver checkpointer
    """
    # Create the graph with our state schema
    graph = StateGraph(TravelPlannerState)

    # Add nodes
    graph.add_node("location_discovery", location_discovery_node)
    graph.add_node("tool_executor", tool_executor_node)
    graph.add_node("itinerary_generator", itinerary_generator_node)
    graph.add_node("validation", validation_node)

    # Add edges from START
    graph.add_edge(START, "location_discovery")

    # Add conditional edges for location discovery
    graph.add_conditional_edges(
        "location_discovery",
        should_continue_discovery,
        {
            "tool_executor": "tool_executor",
            "end_discovery": END,  # Graph pauses here for HITL
        }
    )

    # Tool executor loops back to location_discovery during discovery phase
    # Note: We need a way to route tool_executor output to the right node
    # For simplicity, we'll use a dedicated routing based on state
    def route_tool_executor(state: TravelPlannerState) -> str:
        """Route tool executor output back to the appropriate node."""
        # Check if we're in itinerary phase by looking at final_locations
        if state.get("final_locations"):
            return "itinerary_generator"
        return "location_discovery"

    graph.add_conditional_edges(
        "tool_executor",
        route_tool_executor,
        {
            "location_discovery": "location_discovery",
            "itinerary_generator": "itinerary_generator",
        }
    )

    # Add conditional edges for itinerary generation
    graph.add_conditional_edges(
        "itinerary_generator",
        should_continue_itinerary,
        {
            "tool_executor": "tool_executor",
            "validation": "validation",
        }
    )

    # Add conditional edges for validation
    graph.add_conditional_edges(
        "validation",
        should_regenerate,
        {
            "itinerary_generator": "itinerary_generator",
            "end": END,
        }
    )

    # Compile the graph with checkpointing
    # interrupt_before allows HITL pause before itinerary generation
    compiled_graph = graph.compile(
        checkpointer=memory,
        interrupt_before=["itinerary_generator"],
    )

    return compiled_graph


# Create the MemorySaver instance for checkpointing
memory = MemorySaver()

# Export singleton graph instance
travel_planner_graph = create_travel_planner_graph()


def get_graph_visualization() -> str:
    """
    Get a text representation of the graph for debugging.

    Returns:
        ASCII representation of the graph structure
    """
    return """
    Travel Planner Graph Flow:

    ┌─────────────────────────────────────────────────────────────────┐
    │                         START                                    │
    └─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                   location_discovery                             │
    │  - Uses: search_places, get_place_details, tavily_search        │
    │  - Outputs: draft_locations                                      │
    └─────────────────────────────────────────────────────────────────┘
                       │                    │
                       │ tool_calls?        │ done
                       ▼                    ▼
    ┌──────────────────────────┐      ┌────────────────────────────────┐
    │     tool_executor        │      │  END (pause for HITL)          │
    │  - Executes tool calls   │      │  User edits draft_locations    │
    │  - Returns to discovery  │      │  -> final_locations            │
    └──────────────────────────┘      └────────────────────────────────┘
              │                                     │
              └─────────── loop ───────────────────┘
                                                    │
                                                    │ Resume with final_locations
                                                    ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                   itinerary_generator                            │
    │  - Uses: get_distance_matrix                                     │
    │  - Outputs: draft_itinerary                                      │
    └─────────────────────────────────────────────────────────────────┘
                       │                    │
                       │ tool_calls?        │ done
                       ▼                    ▼
    ┌──────────────────────────┐      ┌────────────────────────────────┐
    │     tool_executor        │      │       validation               │
    │  - Executes tool calls   │      │  - Checks all locations used   │
    │  - Returns to generator  │      │  - Validates pacing/days       │
    └──────────────────────────┘      └────────────────────────────────┘
              │                                │           │
              └─────────── loop ───────────────┘           │
                                                           │
                                         ┌─────────────────┴───────────────┐
                                         │ passed?                         │ failed?
                                         ▼                                 ▼
                    ┌─────────────────────────────┐    ┌──────────────────────────┐
                    │           END               │    │  Regenerate itinerary    │
                    │  final_itinerary ready      │    │  (loop back to generator)│
                    └─────────────────────────────┘    └──────────────────────────┘
    """
