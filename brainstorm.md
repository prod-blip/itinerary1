# Map-First Agentic Itinerary Generator — Brainstorm

## 1. Product Vision

Build a **map-first, agentic itinerary generator** for travellers who want to understand a trip spatially before committing to a schedule.

The product prioritizes:
- Geography before chronology
- Human-in-the-loop planning
- Agentic reasoning over single-shot LLM outputs

The map is the **source of truth**.  
The itinerary is a **derived artifact**.

---

## 2. Target User

- Travellers who think in terms of **distance, clusters, and neighborhoods**
- Users who ask:
  “Where are these places relative to each other?”
- Not power users who want spreadsheets
- Not passive users who accept a one-click plan

This is a **co-creation tool**, not a vending machine.

---

## 3. Core Differentiators

- Map-first UX (locations before days)
- Agentic backend with checkpoints
- Explicit human feedback before final itinerary
- Reasoned explanations (“why this fits you”)
- Geography-driven sequencing

---

## 4. User Flow

### Step 1 — Trip Intake
User provides:
- Destination(s)
- Dates / number of days
- Travel style (relaxed / packed / exploratory)
- Interests (culture, food, nature, nightlife, etc.)
- Constraints (budget-ish, kids, mobility, work-from-trip)
- Free-text notes (“anything else”)

Goal: capture **intent**, not over-specify.

---

### Step 2 — Location Discovery (Map-First)
- Backend generates a **candidate list of locations**
- Each location includes:
  - Name
  - Internal lat/lng (not shown)
  - “Why this fits you”

Displayed as:
- Pins on the map
- A simple editable list

No:
- Categories
- Time estimates
- Over-optimization

---

### Step 3 — Human-in-the-Loop Editing
User can:
- Remove locations
- Add custom locations (through places API search)
- Finalize the location set


This step **must happen before itinerary generation**.

---

### Step 4 — Itinerary Generation
Based on finalized locations:
- Day-wise plan
- Logical geographic sequencing
- Distance-aware routing
- Balanced pacing (based on travel style)

Displayed as:
- Day cards
- Day-wise map layers (Day 1, Day 2, etc.)

---

### Step 5 — Export
- Final itinerary can be exported as a **PDF**
- PDF is a representation, not a new source of truth

---

## 5. Map Experience

### Principles
- Map is not decorative
- Map reflects the current planning state
- Days are visual layers

### Features
- Pins for all locations
- Day-wise colored routes
- Toggle by day (Day 1, Day 2, …)
- Clicking a day highlights:
  - Relevant pins
  - Route for that day

---

## 6. Backend Architecture (LangGraph)

### Overall Graph Flow

1. **Location Generation Node**
2. **Human Interrupt**
3. **Itinerary Generation Node**
4. **Validation & Parsing Node**
5. END

---

### Node 1 — Location Generation
**Input**
- User trip parameters

**Tools**
- Google Maps (Places / Geocoding)
- Web search

**Output**
- Candidate locations
- “Why this fits you”

**Behavior**
- Tool usage allowed
- Stops execution for human feedback

---

### Human-in-the-Loop
- User edits locations on frontend
- Backend resumes graph with updated state

Implemented using:
- LangGraph checkpointer
- Interrupt + resume pattern

---

### Node 2 — Itinerary Generator
**Input**
- Finalized locations

**Tools**
- Distance / routing tools (allowed, constrained)

**Responsibilities**
- Assign locations to days
- Order locations logically
- Minimize travel friction

No new location discovery.

---

### Node 3 — Validation & Parsing
**Purpose**
- Sanity-check the itinerary
- Ensure realistic pacing
- Normalize output into frontend-ready structure

**Tools**
- Distance checks (read-only if needed)

No creative changes.

---

## 7. Data Model (Conceptual)

### Trip
- id
- user_inputs

### Location
- id
- name
- lat
- lng
- why_this_fits_you
- user_added (boolean)

### LocationState
- draft_locations
- final_locations

### Itinerary
- days
  - ordered location ids
  - route / distance metadata

### Export
- pdf_payload

Locations exist independently of days.  
Days reference locations.

---

## 8. Milestones & Sprints

### V0 — Foundational MVP
Goal: End-to-end flow works once.

Includes:
- Trip intake form
- Map with pins
- Location generation (agent)
- Human edit step
- Basic itinerary generation (text-first)

Excludes:
- Auth
- Distance optimization
- PDF export

---

### V0.1 — Map-First Feel
- Day-wise map layers
- Distance-aware sequencing
- Route visualization

---

### V1 — Human-in-the-Loop Done Right
- Explicit review screen
- Clear “why this fits you” explanations
- Validation node flags overloaded days

---

### V1.1 — Export & Share
- PDF export
- Static map snapshots per day
- Shareable itinerary artifact

---

### V2 — Smarter Planning
- Better clustering
- Opening hours awareness
- Partial regeneration (“regenerate this day”)

---

### V2.1 — Retention
- Saved trips
- Trip duplication
- Minor personalization memory

---

### V3 — Expansion (Post-Traction)
- Multi-city trips
- Weather-aware replanning
- Collaboration & sharing

---

## 9. Guiding Principles

- Geography before chronology
- User agency before optimization
- Agents reason, users decide
- Maps explain decisions
- Every output should be editable

---

## 10. One-Sentence Summary

A map-first, agentic travel planner where itineraries **emerge from geography and collaboration**, not from a single prompt.

