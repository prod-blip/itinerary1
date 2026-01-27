# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] - 2026-01-27

### Added

- Complete MVP implementation for map-first travel itinerary planner
- **Backend (FastAPI + LangGraph):**
  - Location discovery agent using GPT-4o with tool calling
  - Google Places API integration for place search and autocomplete
  - Tavily API integration for local insights
  - Simple itinerary generator with day-wise planning
  - RESTful API endpoints (`/api/trip/start`, `/api/trip/{id}/generate`, `/api/trip/{id}`, `/api/places/autocomplete`, `/api/places/details`)
  - LangGraph state management with MemorySaver checkpointer
  - Human-in-the-loop (HITL) pattern support
- **Frontend (Next.js + MapLibre):**
  - Trip intake form with destination autocomplete, travel style selection, and interests
  - Interactive map with location markers using MapLibre GL JS and OSM tiles
  - Location list with add/remove functionality
  - Place search component with Google Places autocomplete
  - Itinerary view with day-wise planning and travel times
  - Zustand state management for trip data
  - React Query for API calls and caching
  - Tailwind CSS styling
- **Configuration:**
  - Environment configuration for API keys (OpenAI, Google Maps, Tavily)
  - .gitignore for secrets and build artifacts
  - CLAUDE.md project reference guide
- Initial project specification document (`project_spec.md`)
- Documentation structure (`docs/` folder)
  - `architecture.md` — System design and component interaction
  - `changelog.md` — Version history (this file)
  - `project_status.md` — Milestone tracking

### Fixed

- PlaceSearch component now updates destination field on text input (not just on selection)
- API response format compatibility between frontend and backend
- Phase naming consistency across frontend and backend ("editing"/"generating"/"complete")
- Location type handling in LocationList component

### Changed

- Simplified itinerary generation from complex graph resumption to single LLM call approach
- Environment variables configuration for Next.js (.env.local instead of .env)

---

## Version History

<!--
Future releases will be documented below in reverse chronological order.

Example format:

## [0.1.0] - YYYY-MM-DD

### Added
- Feature A
- Feature B

### Changed
- Modified X to improve Y

### Fixed
- Bug in Z

### Removed
- Deprecated feature W
-->

---

## Release Links

<!--
[unreleased]: https://github.com/username/travel-planner/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/username/travel-planner/releases/tag/v0.1.0
-->
