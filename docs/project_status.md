# Project Status

**Current Phase:** V0.1 Complete
**Active Milestone:** V1 — Polished human-in-the-loop experience
**Last Updated:** 2026-01-27

---

## Milestones

| Milestone | Goal | Status |
|-----------|------|--------|
| **V0** | End-to-end flow works once | ✅ Done |
| **V0.1** | Day-wise map layers + route visualization | ✅ Done |
| V1 | Polished human-in-the-loop experience | 🔲 Not Started |
| V1.1 | PDF export + shareable links | 🔲 Not Started |
| V2 | Smarter clustering + opening hours | 🔲 Not Started |
| V2.1 | Auth + saved trips | 🔲 Not Started |
| V3 | Multi-city + collaboration | 🔲 Not Started |

---

## V0 Checklist

- [x] Project structure setup (backend + frontend)
- [x] Trip intake form
- [x] Map with location pins (MapLibre + OSM)
- [x] Location Discovery agent node
- [x] Human-in-the-loop editing (remove/add locations)
- [x] Itinerary generation (text-first)
- [x] API endpoints working

---

## V0.1 Checklist

- [x] Google Directions API integration with waypoint batching
- [x] Polyline field added to TravelSegment schema
- [x] Route enrichment in itinerary generation
- [x] Polyline decoding and rendering in MapView
- [x] Floating day selector component
- [x] Mobile-responsive layout with stacked view
- [x] Real travel times and distances from Directions API

---

## Progress Log

| Date | Milestone | Update |
|------|-----------|--------|
| 2026-01-27 | V0.1 | ✅ Day-wise map layers + route visualization complete - Routes follow actual roads, floating day selector, mobile-responsive layout |
| 2026-01-27 | V0 | ✅ MVP implementation complete - Full end-to-end flow working (intake → location discovery → editing → itinerary generation) |
| — | V0 | Project specification completed |

---

## What's Next

1. Improve location discovery with better clustering
2. Add loading states for route fetching
3. Handle route API errors more gracefully
4. Add route optimization (TSP for multi-location days)
5. Polish HITL editing experience with drag-to-reorder

---

**Legend:** 🔲 Not Started · 🟡 In Progress · ✅ Done
