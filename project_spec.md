# Map-First Agentic Itinerary Generator — Project Specification

---

# Part 1: Product Requirements

## 1. Product Vision

**One-liner:** A map-first, agentic travel planner where itineraries emerge from geography and collaboration—not from a single prompt.

**Core Philosophy:** The map is the source of truth. The itinerary is a derived artifact.

This product prioritizes:
- **Geography before chronology** — Users understand *where* before they commit to *when*
- **Human-in-the-loop planning** — Users shape the output, not just consume it
- **Agentic reasoning over single-shot generation** — The system thinks in steps, with checkpoints for human input

This is a **co-creation tool**, not a travel recommendation vending machine.

---

## 2. Target Users

### 2.1 Primary User Profile

**The Spatial Thinker Traveler**

These are travelers who instinctively ask:
- "Where are these places relative to each other?"
- "Can I walk between these, or do I need transport?"
- "Which neighborhood should I base myself in to hit these spots?"

They currently cobble together plans using Google Maps, spreadsheets, and scattered notes—constantly context-switching between "where" and "when."

**Characteristics:**
- Plans trips themselves (not fully outsourced to agents or tour packages)
- Values understanding the geography of a destination
- Wants control over the final plan, but appreciates intelligent suggestions
- Typically plans 3-10 day leisure trips to unfamiliar cities

### 2.2 Who This Is NOT For

| User Type | Why Not |
|-----------|---------|
| **Passive planners** | Users who want a one-click, fully automated itinerary won't engage with the map-first editing flow |
| **Spreadsheet power users** | Users who want granular control over every hour, budget line, and booking link need a different tool |
| **Group trip coordinators** | V0 is single-user; collaborative planning is out of scope |
| **Business travelers** | Optimizing for meetings, not exploration |

### 2.3 User Personas

**Persona 1: Priya — The Weekend Explorer**
- 28, marketing manager, travels 3-4 times a year
- Plans solo or couples trips to destinations within 4-5 hours of home
- Frustrated by: Generic "top 10" lists that don't account for proximity; wasting half a day zigzagging across a city
- Needs: A visual way to see what's near what, with smart suggestions she can tweak

**Persona 2: Arjun — The First-Time Visitor**
- 35, software engineer, planning a 7-day trip to a new country
- Has a rough idea of interests (history, food, some nature) but doesn't know the destination well
- Frustrated by: Not knowing which areas to prioritize; ending up with an overloaded itinerary
- Needs: Curated suggestions that explain *why* something fits his style, with the ability to remove what doesn't resonate

**Persona 3: Meera — The Returning Traveler**
- 42, architect, revisiting a city she's been to before
- Wants to explore new neighborhoods, skip the obvious tourist spots
- Frustrated by: Every tool suggesting the same popular attractions
- Needs: A way to input "I've already done X, Y, Z" and get fresh, personalized recommendations

---

## 3. Problems Being Solved

### 3.1 The Core Problem

> **Travelers think spatially, but most planning tools think chronologically.**

Existing tools (TripAdvisor, Wanderlog, Google Travel, ChatGPT) produce day-wise itineraries as the primary output. Users must mentally reconstruct the geography—opening Google Maps separately to understand distances and clusters.

This creates:
- **Cognitive overhead**: Constant context-switching between "what's on day 2" and "where is that on the map"
- **Inefficient plans**: Itineraries that look good on paper but involve excessive travel time
- **Lack of ownership**: Users accept generated plans passively because editing feels like starting over

### 3.2 Secondary Problems

| Problem | Current Workaround | Why It Fails |
|---------|-------------------|--------------|
| **Generic recommendations** | Manually filtering "top 10" lists | Time-consuming; still no spatial context |
| **No explanation for suggestions** | Trusting the algorithm blindly | Users can't evaluate fit; low confidence in the plan |
| **All-or-nothing generation** | Regenerating entire itineraries repeatedly | Wastes good suggestions; frustrating loop |
| **Custom locations ignored** | Manually inserting personal spots into generated plans | Breaks the flow; sequencing doesn't account for them |

### 3.3 The Opportunity

A tool that:
1. **Shows locations on a map first** — before any day assignment
2. **Explains why each location fits the user** — building trust and enabling informed editing
3. **Lets users curate the location set** — add, remove, finalize
4. **Generates itineraries from the finalized geography** — respecting user choices and optimizing for proximity

This inverts the typical flow: **Discover → Curate → Sequence** instead of **Prompt → Receive → Accept/Reject**.

---

## 4. Product Scope

### 4.1 What the Product Does (V0 — MVP)

**Input:**
- Destination (single city/region)
- Trip duration (dates or number of days)
- Travel style (relaxed / balanced / packed)
- Interests (multi-select: culture, food, nature, nightlife, history, architecture, shopping, local experiences)
- Constraints (traveling with kids, mobility considerations, work-from-trip)
- Free-text notes ("anything else we should know")

**Output:**
- A set of candidate locations displayed as pins on an interactive map
- Each location accompanied by a personalized "why this fits you" explanation
- A human-editable list of these locations
- After user finalization: a day-wise itinerary with geographic sequencing
- Day-wise map layers showing routes and stops per day

**Key Interactions:**
1. User fills trip intake form
2. Agent generates candidate locations → displayed on map with explanations
3. User reviews, removes unwanted pins, adds custom locations
4. User finalizes location set
5. Agent generates day-wise itinerary based on finalized locations
6. User views itinerary as day cards + map layers

### 4.2 What the Product Does NOT Do (V0)

| Excluded Feature | Rationale |
|------------------|-----------|
| Multi-city trips | Adds complexity; single-destination is sufficient for validation |
| Booking integration | Out of scope; focus is on planning, not transactions |
| Real-time collaboration | Single-user MVP |
| Opening hours / live data | Requires additional API complexity; defer to V2 |
| Budget tracking | Not core to the map-first thesis |
| User authentication / saved trips | Defer to V2; V0 is session-based |
| PDF/export | Defer to V1.1 |
| Mobile-optimized experience | V0 is desktop-first |

### 4.3 Feature Details

#### 4.3.1 Trip Intake

**Purpose:** Capture user intent without over-specifying.

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Destination | Text (with autocomplete) | Yes | Single city or region |
| Dates | Date range OR number of days | Yes | Flexible input |
| Travel Style | Single select | Yes | Relaxed / Balanced / Packed |
| Interests | Multi-select tags | Yes | Predefined list + optional free-text |
| Constraints | Multi-select checkboxes | No | Kids, mobility, work-from-trip, etc. |
| Additional Notes | Free text | No | Open-ended user input |

**Acceptance Criteria:**
- User can complete intake in under 2 minutes
- All fields validate before submission
- Free-text fields have reasonable character limits (500 chars)

#### 4.3.2 Location Discovery (Map-First View)

**Purpose:** Present agent-generated locations visually, with reasoning.

**Display Elements:**
- Interactive map with pins for all candidate locations
- Side panel with scrollable list of locations
- Each location card shows:
  - Name
  - "Why this fits you" explanation (2-3 sentences)
  - Remove button

**Map Behavior:**
- Clicking a pin highlights the corresponding list item (and vice versa)
- Map auto-fits to show all pins with reasonable padding
- No category-based filtering or layers at this stage

**Acceptance Criteria:**
- Locations appear on map within 15 seconds of intake submission
- Each location has a non-generic "why this fits you" explanation
- Minimum 8, maximum 20 candidate locations generated

#### 4.3.3 Human-in-the-Loop Editing

**Purpose:** Let users curate the location set before itinerary generation.

**Allowed Actions:**
- **Remove a location:** Pin disappears from map, item removed from list
- **Add a custom location:** Search for a place using Places API autocomplete; optionally add a short note ("my friend's cafe", "must-visit")
- **Finalize the location set:** Explicit button — "Generate Itinerary"

**Constraints:**
- User cannot proceed with 0 locations
- User cannot proceed with more than 25 locations (soft limit; warn but allow override)
- User-added locations are visually distinguished (different pin color or marker)

**Acceptance Criteria:**
- Remove action is instant (no confirmation modal for individual removes)
- Add custom location via search resolves to lat/lng within 3 seconds
- Finalize button is disabled until at least 1 location exists

#### 4.3.4 Itinerary Generation

**Purpose:** Produce a day-wise plan from finalized locations.

**Logic:**
- Assign locations to days based on:
  - Geographic clustering (nearby locations on the same day)
  - User's travel style (relaxed = fewer per day, packed = more per day)
  - Logical sequencing within a day (minimize backtracking)
- Balance days roughly evenly (avoid 6 locations on Day 1, 1 on Day 4)

**Output Structure:**
- Day cards (Day 1, Day 2, ...) each listing:
  - Ordered locations for that day
  - Approximate travel time between consecutive locations (if available)
- Map updates to show:
  - Day-wise colored routes
  - Toggle to view one day at a time or all days

**Acceptance Criteria:**
- Itinerary generated within 20 seconds of finalization
- No location from the finalized set is omitted
- No new locations are introduced by the agent
- Each day has at least 1 location

#### 4.3.5 Day-Wise Map Visualization

**Purpose:** Let users see their trip unfold geographically, day by day.

**Features:**
- Day selector (tabs or dropdown): Day 1, Day 2, ..., All Days
- Selected day shows:
  - Pins for that day's locations (numbered in sequence)
  - Route polyline connecting them in order
- "All Days" shows all pins with day-based color coding

**Acceptance Criteria:**
- Switching days updates map within 500ms
- Route lines are visually distinct per day (color-coded)
- Clicking a pin shows location name + position in day sequence

---

## 5. Milestones

| Version | Name | Goal |
|---------|------|------|
| **V0** | Foundational MVP | End-to-end flow works once (intake → map → edit → itinerary) |
| **V0.1** | Map-First Feel | Day-wise map layers, distance-aware sequencing, route visualization |
| **V1** | Human-in-the-Loop Done Right | Explicit review screen, polished "why this fits you", validation warnings in UI |
| **V1.1** | Export & Share | PDF export, static map snapshots, shareable itinerary link |
| **V2** | Smarter Planning | Better clustering, opening hours awareness, partial regeneration ("regenerate this day") |
| **V2.1** | Retention | User auth, saved trips, trip duplication, personalization memory |
| **V3** | Expansion | Multi-city trips, weather-aware replanning, collaboration & sharing |

---

## 6. User Journey (End-to-End)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │  INTAKE  │───▶│   DISCOVER   │───▶│   CURATE (HITL)      │  │
│  │   FORM   │    │   ON MAP     │    │   Edit locations     │  │
│  └──────────┘    └──────────────┘    └──────────────────────┘  │
│                                                 │               │
│                                                 ▼               │
│                                       ┌──────────────────────┐  │
│                                       │      FINALIZE        │  │
│                                       │  "Generate Itinerary"│  │
│                                       └──────────────────────┘  │
│                                                 │               │
│                                                 ▼               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ITINERARY VIEW                         │  │
│  │   Day cards + Day-wise map layers + Route visualization   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Part 2: Engineering Design

## 1. Tech Stack

### Frontend
| Component | Choice |
|-----------|--------|
| Framework | Next.js (React) |
| Map Library | MapLibre GL JS (OpenStreetMap tiles) |
| Styling | Tailwind CSS |
| State Management | Zustand |
| HTTP Client | React Query (TanStack Query) |

### Backend
| Component | Choice |
|-----------|--------|
| Framework | FastAPI |
| Agentic Framework | LangGraph |
| Checkpointer | MemorySaver (in-memory) |
| LLM Provider | OpenAI GPT-4o |
| Web Search | Tavily API |

### External APIs
| Purpose | Service |
|---------|---------|
| Places Autocomplete | Google Places API |
| Geocoding | Google Geocoding API |
| Directions/Distance | Google Directions API |

### Local Development
| Component | Approach |
|-----------|----------|
| Frontend | `npm run dev` |
| Backend | `uvicorn app.main:app --reload` |
| No Docker | Simple local servers |

---

## 2. LangGraph Architecture

### Graph Flow

```
START
  │
  ▼
┌─────────────────────┐
│ LOCATION DISCOVERY  │◄──────┐
│                     │       │
│ Tools: Places API,  │       │
│        Tavily       │       │
└─────────────────────┘       │
  │                           │
  ├── has tool calls? ────────┘
  │         YES (loop)
  ▼ NO
════════════════════════
║  INTERRUPT (HITL)    ║  ← User edits locations on frontend
════════════════════════
  │
  │ Resume with final_locations (diff from user)
  ▼
┌─────────────────────┐
│ ITINERARY GENERATOR │◄──────┐
│                     │       │
│ Tools: Distance API │       │
└─────────────────────┘       │
  │                           │
  ├── has tool calls? ────────┘
  │         YES (loop)
  ▼ NO
┌─────────────────────┐
│    VALIDATION       │
│                     │
│ No tools (pure      │
│ validation logic)   │
└─────────────────────┘
  │
  ▼
 END
```

---

### State Schema

| Field | Type | Description |
|-------|------|-------------|
| `messages` | `list[AnyMessage]` | LangChain message history for LLM context |
| `trip_params` | `TripParameters` | User input from intake form |
| `draft_locations` | `list[Location]` | Agent-generated candidate locations |
| `final_locations` | `list[Location]` | After human editing (diff applied) |
| `draft_itinerary` | `Itinerary` | Generated day-wise plan |
| `final_itinerary` | `Itinerary` | Post-validation itinerary |
| `validation_passed` | `bool` | Whether validation checks passed |
| `validation_errors` | `list[str]` | Validation issues (if any) |
| `calling_node` | `str` | Tracks which node invoked tools (for routing back) |

---

### Node Specifications

#### Node 1: Location Discovery

| Attribute | Value |
|-----------|-------|
| **Purpose** | Generate candidate locations based on trip parameters |
| **Inputs** | `trip_params`, `messages` |
| **Outputs** | `draft_locations`, `messages` |
| **Tools** | `search_places`, `get_place_details`, `tavily_search` |
| **Behavior** | Loops with tools until sufficient locations gathered; then pauses for HITL |

#### Node 2: Itinerary Generator

| Attribute | Value |
|-----------|-------|
| **Purpose** | Create day-wise itinerary from finalized locations |
| **Inputs** | `final_locations`, `trip_params`, `messages` |
| **Outputs** | `draft_itinerary`, `messages` |
| **Tools** | `get_travel_time`, `get_distance_matrix` |
| **Behavior** | Loops with tools for distance calculations; outputs structured itinerary |

#### Node 3: Validation

| Attribute | Value |
|-----------|-------|
| **Purpose** | Sanity-check the itinerary |
| **Inputs** | `draft_itinerary`, `final_locations`, `trip_params` |
| **Outputs** | `final_itinerary`, `validation_passed`, `validation_errors` |
| **Tools** | None |
| **Behavior** | Flags errors and proceeds to END (no loopback) |

**Validation Rules:**
- All finalized locations must be included
- No new locations added by agent
- Correct number of days
- Each day has at least 1 location
- Pacing matches travel style (relaxed ≤4/day, balanced ≤5/day, packed ≤7/day)

---

### Tools Summary

| Tool | Used By | Purpose |
|------|---------|---------|
| `search_places` | Location Discovery | Find places via Google Places API |
| `get_place_details` | Location Discovery | Get detailed info for a place |
| `tavily_search` | Location Discovery | Web search for local insights, hidden gems |
| `get_travel_time` | Itinerary Generator | Travel time between two points |
| `get_distance_matrix` | Itinerary Generator | Travel times between all location pairs |

---

### Human-in-the-Loop

- **Trigger:** Graph interrupts after Location Discovery completes (before Itinerary Generator)
- **Frontend action:** User removes/adds locations, then clicks "Generate Itinerary"
- **Resume payload:** Diff containing `removed_location_ids` and `added_locations`
- **Backend applies diff** to `draft_locations` → produces `final_locations` → resumes graph

---

### Checkpointing

- **Checkpointer:** MemorySaver (in-memory, no disk persistence)
- **Thread ID:** Unique per session, passed from frontend
- **Interrupt point:** `interrupt_before=["itinerary_generator"]`

---

### Observability

- **Provider:** Phoenix (Arize)
- **Instrumentation:** `LangChainInstrumentor` for automatic tracing
- **Project name:** `travel-planner-agent`

---

## 3. Data Models

### Core Models

#### TripParameters
User input from the intake form.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `destination` | `str` | Yes | City or region name |
| `num_days` | `int` | Yes | Trip duration |
| `start_date` | `str` (ISO date) | No | Trip start date |
| `travel_style` | `enum` | Yes | `relaxed` / `balanced` / `packed` |
| `interests` | `list[str]` | Yes | e.g., `["culture", "food", "nature"]` |
| `constraints` | `list[str]` | No | e.g., `["kids", "mobility", "work-from-trip"]` |
| `additional_notes` | `str` | No | Free-text user input |

---

#### Location
Single location with metadata.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `str` | Yes | Unique identifier (generated) |
| `name` | `str` | Yes | Place name |
| `lat` | `float` | Yes | Latitude |
| `lng` | `float` | Yes | Longitude |
| `why_this_fits_you` | `str` | Yes | Personalized explanation (agent-generated) |
| `place_id` | `str` | No | Google Place ID |
| `user_added` | `bool` | Yes | `True` if added by user, `False` if agent-generated |
| `user_note` | `str` | No | Optional note for user-added locations |

---

#### DayPlan
Single day's itinerary.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `day_number` | `int` | Yes | Day sequence (1, 2, 3...) |
| `locations` | `list[str]` | Yes | Ordered list of location IDs |
| `travel_times` | `list[TravelSegment]` | No | Travel time between consecutive locations |

---

#### TravelSegment
Travel time between two locations.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `from_location_id` | `str` | Yes | Origin location ID |
| `to_location_id` | `str` | Yes | Destination location ID |
| `duration_minutes` | `int` | Yes | Travel time in minutes |
| `distance_km` | `float` | No | Distance in kilometers |

---

#### Itinerary
Complete trip itinerary.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `days` | `list[DayPlan]` | Yes | Day-wise plans |
| `total_locations` | `int` | Yes | Count of locations included |
| `validation_notes` | `list[str]` | No | Validation warnings/errors |

---

### Request/Response Models

#### LocationEditDiff
Sent by frontend when user finalizes locations.

| Field | Type | Description |
|-------|------|-------------|
| `removed_ids` | `list[str]` | IDs of locations removed by user |
| `added_locations` | `list[NewLocation]` | Locations added by user |

#### NewLocation
User-added location (from Places autocomplete).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `str` | Yes | Place name |
| `lat` | `float` | Yes | Latitude |
| `lng` | `float` | Yes | Longitude |
| `place_id` | `str` | Yes | Google Place ID |
| `user_note` | `str` | No | Optional note |

---

### Model Relationships

```
TripParameters
      │
      ▼
┌─────────────────────────────────────────┐
│            Location[]                   │
│  (draft_locations → final_locations)    │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│             Itinerary                   │
│  └── DayPlan[]                          │
│       └── location IDs (references)     │
│       └── TravelSegment[]               │
└─────────────────────────────────────────┘
```

**Key principle:** Locations exist independently. Days reference locations by ID.

---

## 4. API Design

### Base URL
```
http://localhost:8000/api
```

---

### Endpoints

#### 1. Start Trip Planning
Initiates the graph with trip parameters.

| | |
|---|---|
| **Endpoint** | `POST /trip/start` |
| **Request Body** | `TripParameters` |
| **Response** | `{ thread_id, draft_locations[] }` |
| **Behavior** | Runs Location Discovery node, returns candidate locations, graph pauses for HITL |

---

#### 2. Finalize Locations & Generate Itinerary
Resumes graph with user's location edits.

| | |
|---|---|
| **Endpoint** | `POST /trip/{thread_id}/generate` |
| **Request Body** | `LocationEditDiff` (removed_ids, added_locations) |
| **Response** | `{ final_locations[], itinerary, validation_passed, validation_errors[] }` |
| **Behavior** | Applies diff, resumes graph through Itinerary Generator and Validation, returns final itinerary |

---

#### 3. Get Trip State
Retrieve current state of a trip session.

| | |
|---|---|
| **Endpoint** | `GET /trip/{thread_id}` |
| **Response** | `{ trip_params, draft_locations[], final_locations[], itinerary, status }` |
| **Behavior** | Returns current graph state for the thread |

---

#### 4. Places Autocomplete (Proxy)
Proxies Google Places Autocomplete for frontend search.

| | |
|---|---|
| **Endpoint** | `GET /places/autocomplete?query={query}` |
| **Response** | `{ predictions[] }` — each with `name`, `place_id`, `lat`, `lng` |
| **Behavior** | Thin wrapper over Google Places API; keeps API key server-side |

---

### Endpoint Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/trip/start` | Start planning, get candidate locations |
| `POST` | `/trip/{thread_id}/generate` | Finalize locations, get itinerary |
| `GET` | `/trip/{thread_id}` | Get current trip state |
| `GET` | `/places/autocomplete` | Search places for user-added locations |

---

### Response Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Invalid request (bad parameters) |
| `404` | Thread not found |
| `500` | Server/agent error |

---

## 5. Project Structure

```
travel-planner/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── config.py               # Environment variables, settings
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py           # API endpoint definitions
│   │   │   └── schemas.py          # Pydantic request/response models
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   ├── graph.py            # LangGraph definition & compilation
│   │   │   ├── nodes.py            # Node functions (location_discovery, itinerary_generator, validation)
│   │   │   ├── state.py            # TravelPlannerState definition
│   │   │   ├── tools.py            # Tool definitions (Places, Tavily, Distance)
│   │   │   └── prompts.py          # Prompt templates for each node
│   │   └── services/
│   │       ├── __init__.py
│   │       └── google_maps.py      # Google Maps API client wrapper
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Home / Intake form
│   │   │   └── trip/
│   │   │       └── [threadId]/
│   │   │           └── page.tsx    # Map + Locations + Itinerary view
│   │   ├── components/
│   │   │   ├── IntakeForm.tsx
│   │   │   ├── MapView.tsx         # MapLibre map component
│   │   │   ├── LocationList.tsx    # Editable location list
│   │   │   ├── LocationCard.tsx
│   │   │   ├── ItineraryView.tsx   # Day cards
│   │   │   ├── DayCard.tsx
│   │   │   └── PlaceSearch.tsx     # Autocomplete for adding locations
│   │   ├── stores/
│   │   │   └── tripStore.ts        # Zustand store
│   │   ├── services/
│   │   │   └── api.ts              # API client (React Query)
│   │   └── types/
│   │       └── index.ts            # TypeScript types (mirrors backend schemas)
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

### Key Conventions

| Aspect | Convention |
|--------|------------|
| **Backend entry** | `uvicorn app.main:app --reload` |
| **Frontend entry** | `npm run dev` |
| **Shared types** | Frontend `types/index.ts` mirrors backend `api/schemas.py` |
| **Environment** | `.env` files at `backend/.env` and `frontend/.env.local` |
