# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.1.0] - 2026-01-31

### Added

- **S-Tier design system:** Comprehensive design tokens inspired by Stripe, Airbnb, and Linear (colors, typography, spacing, shadows, animations)
- **Dark mode support:** Full dark mode implementation with system preference detection and manual toggle
- **ThemeProvider component:** React context-based theme management with localStorage persistence
- **Theme toggle button:** Cycles through light → dark → system modes with sun/moon icons
- **Design tokens in Tailwind config:** Primary indigo palette (50-950), neutral slate tones, semantic colors (success, warning, error, info), 14 day colors for itinerary visualization
- **CSS component classes:** Reusable `.btn-*`, `.input`, `.card`, `.badge-*` classes with consistent hover/focus states
- **CSS variables for theming:** Light and dark mode color variables in globals.css for seamless theme transitions
- **Custom animations:** fade-in, fade-up, scale-in, shimmer, and other micro-interactions
- **Design principles documentation:** Comprehensive design checklist in `docs/design-principles.md`

### Changed

- Updated all 9 components with new design system colors (IntakeForm, PlaceSearch, LocationList, LocationCard, ItineraryView, MapView, GenerationProgress, DaySelector, MapDaySelector)
- Migrated from `gray-*` to `neutral-*` color naming throughout codebase
- Enhanced CLAUDE.md with Visual Development & Testing section
- Updated day colors in types/index.ts to match Tailwind config
- Layout.tsx now uses ThemeProvider wrapper
- Home page and trip page include theme toggle in header

### Dependencies

- Added custom Tailwind animation utilities (fade-in, fade-up, scale-in, shimmer)
- Extended Tailwind with custom box shadows including primary-colored shadows

---

## [1.0.0] - 2026-01-27

### Added

- **Toast notification system:** User-facing error and warning notifications using Sonner library
- **Generation progress indicator:** Animated stepper showing itinerary generation phases (Organizing → Routing → Finishing)
- **Route warnings:** Backend collects and returns warnings when route calculation fails; frontend displays warning toast
- **Dashed lines for estimated routes:** Map shows dashed lines for routes without real polyline data
- **Location clustering:** Pre-groups locations by geographic proximity before itinerary generation
- **TSP route optimization:** Nearest neighbor algorithm optimizes location order within each day to minimize travel time
- **Route optimization badge:** "Route optimized" badge displayed on days where TSP was applied
- **Area labels:** Day headers can now show optional area labels for geographic grouping

### Changed

- `generate_itinerary_simple()` now returns tuple of (itinerary, warnings)
- `_enrich_itinerary_with_routes()` now returns tuple and implements TSP optimization
- DayPlan schema extended with `route_optimized` and `area_label` fields
- GenerateItineraryResponse schema extended with `route_warnings` field
- Map rendering split into solid routes (real polylines) and dashed routes (estimates)
- Travel time indicators in itinerary view show "~" prefix and "est." suffix for estimated times

### Dependencies

- Added `sonner` package to frontend for toast notifications

---

## [0.1.1] - 2026-01-27

### Added

- **Real road-following routes:** Routes now follow actual roads using Google Directions API instead of straight lines
- **Google Directions API integration:** Added `get_directions()` method to GoogleMapsService with waypoint batching support (1 API call per day)
- **Encoded polylines:** TravelSegment schema now includes encoded polyline field for efficient route storage and transmission
- **Route enrichment:** Itinerary generation now automatically enriches travel segments with real driving times, distances, and polylines
- **Floating day selector:** Interactive map overlay for filtering itinerary by day with "All" option and numbered day buttons
- **Mobile-responsive layout:** Map displayed at 50vh on mobile devices with scrollable content below, desktop retains split view
- **Polyline decoding:** Frontend decodes and renders actual route polylines using @mapbox/polyline library
- **Scrollbar-hide utility:** Added CSS utility for clean horizontal scrolling in day selector

### Changed

- Map routes now use decoded polylines from Directions API when available, fallback to straight lines
- Mobile layout switched to stacked view (map on top, content below) using `flex-col-reverse`
- Replaced static day color legend with interactive floating day selector
- Improved touch targets in MapDaySelector with minimum 44px size
- Updated dependencies: added `polyline==2.0.2` (backend), `@mapbox/polyline` + types (frontend)

### Fixed

- Itinerary generation now respects user edits (removed/added locations) instead of using original LLM suggestions (GitHub issue #1)

### Changed

- Enhanced .gitignore with comprehensive patterns for Python (bytecode, eggs, mypy, ruff), Node.js (cache, build outputs), testing/coverage, TypeScript, and various development tools
- Trip store now tracks `originalLocations` and `removedIds` to properly pass user edits to the backend

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
