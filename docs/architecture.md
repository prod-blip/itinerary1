# Architecture

This document describes the system design, application structure, and how major components interact.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                   │
│                         (Next.js + MapLibre)                            │
├─────────────────────────────────────────────────────────────────────────┤
│   IntakeForm → MapView + LocationList → ItineraryView                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP (REST API)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                    │
│                             (FastAPI)                                   │
├─────────────────────────────────────────────────────────────────────────┤
│   API Routes → LangGraph Agent → Google APIs                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

- `IntakeForm.tsx` — Trip parameter input with destination autocomplete and interest selection
- `MapView.tsx` — MapLibre map with location pins, day-wise route polylines, and interactive day filtering
- `MapDaySelector.tsx` — Floating day selector with "All" and numbered day buttons for filtering map routes
- `LocationList.tsx` — Scrollable list of locations with remove actions
- `LocationCard.tsx` — Individual location display with "why this fits you" explanation
- `PlaceSearch.tsx` — Google Places autocomplete for adding custom locations
- `ItineraryView.tsx` — Day-wise itinerary display container
- `DayCard.tsx` — Single day's locations with travel times

### State Management

- `tripStore.ts` — Zustand store managing:
  - `tripParams` — User input from intake form
  - `draftLocations` — Agent-generated candidate locations
  - `finalLocations` — User-edited location set
  - `itinerary` — Generated day-wise plan
  - `threadId` — Session identifier for API calls

### API Layer

- `POST /api/trip/start` — Initiates planning, returns candidate locations
- `POST /api/trip/{thread_id}/generate` — Accepts location edits, returns itinerary
- `GET /api/trip/{thread_id}` — Retrieves current trip state
- `GET /api/places/autocomplete` — Proxies Google Places for location search

### Backend Modules

#### API Layer (`app/api/`)
- `routes.py` — FastAPI endpoint definitions
- `schemas.py` — Pydantic request/response models

#### Agent Layer (`app/agent/`)
- `graph.py` — LangGraph definition and compilation with MemorySaver
- `nodes.py` — Node functions:
  - `location_discovery_node` — Generates candidate locations using Places API + Tavily
  - `itinerary_generator_node` — Creates day-wise plan using Distance API
  - `validation_node` — Sanity-checks the itinerary
- `state.py` — `TravelPlannerState` TypedDict definition
- `tools.py` — Tool definitions:
  - `search_places` — Google Places text search
  - `get_place_details` — Google Places detail lookup
  - `tavily_search` — Web search for local insights
  - `get_travel_time` — Point-to-point travel time
  - `get_distance_matrix` — All-pairs travel times
- `prompts.py` — Prompt templates for each node

#### Services Layer (`app/services/`)
- `google_maps.py` — Google Maps API client wrapper
  - `places_autocomplete()` — Place name autocomplete
  - `places_text_search()` — Location search
  - `place_details()` — Detailed place information
  - `distance_matrix()` — All-pairs travel times and distances
  - `get_directions()` — Route with waypoints, returns encoded polylines and per-leg metrics
  - `geocode()` — Address to coordinates conversion

#### Itinerary Layer (`app/agent/`)
- `itinerary.py` — Simplified itinerary generation
  - `generate_itinerary_simple()` — Main itinerary generation function
  - `_enrich_itinerary_with_routes()` — Fetches real routes from Google Directions API and updates travel segments with polylines

---

## Data Flow

```
1. User submits intake form
   │
   ▼
2. Frontend calls POST /api/trip/start with TripParameters
   │
   ▼
3. Backend runs Location Discovery node (loops with tools)
   │
   ▼
4. Backend returns { thread_id, draft_locations[] }
   │
   ▼
5. Frontend displays locations on map + list
   │
   ▼
6. User edits locations (remove/add)
   │
   ▼
7. Frontend calls POST /api/trip/{thread_id}/generate with LocationEditDiff
   │
   ▼
8. Backend applies diff, runs Itinerary Generator + Validation nodes
   │
   ▼
9. Backend enriches itinerary with Google Directions API (fetches polylines, real travel times)
   │
   ▼
10. Backend returns { final_locations[], itinerary, validation_passed }
   │
   ▼
11. Frontend decodes polylines and displays day-wise itinerary with road-following routes on map
```

---

## External Services

| Service | Purpose | Used By |
|---------|---------|---------|
| Google Places API | Location search, autocomplete, details | Location Discovery node, PlaceSearch component |
| Google Directions API | Route polylines, travel times, distances | Itinerary enrichment (`_enrich_itinerary_with_routes`) |
| Tavily API | Web search for local insights | Location Discovery node |
| OpenAI GPT-4o | LLM reasoning | All agent nodes |
| OpenStreetMap | Map tiles | MapView component |
| Phoenix (Arize) | Observability/tracing | Agent layer |

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| MapLibre over Google Maps JS | More styling control, no vendor lock-in for tiles |
| MemorySaver over SQLite | No persistence needed for V0; simpler setup |
| Diff-based location edits | Reduces payload size; agent can reason about user intent |
| Single ToolNode for all tools | Simpler graph; routing handles which node called tools |
| Validation as separate node | Clean separation; can add loopback later if needed |

---

## Route Visualization Architecture

Routes are enriched during itinerary generation using a batched API approach:

1. **Backend enrichment:** After LLM generates day structure, `_enrich_itinerary_with_routes()` calls Google Directions API once per day with waypoints (e.g., 3-day trip = 3 API calls)
2. **Polyline encoding:** Each leg's step polylines are decoded, concatenated, and re-encoded for efficient storage
3. **Data transfer:** Encoded polylines sent to frontend in `TravelSegment.polyline` field
4. **Frontend rendering:** MapView decodes polylines to `[lng, lat]` coordinates and renders as GeoJSON LineStrings
5. **Day filtering:** MapDaySelector component filters visible routes by day number

This approach minimizes API costs (1 call per day vs. N-1 calls per day for segments) while providing accurate road-following routes.

---

*Last updated: 2026-01-27 (V0.1 route visualization)*
