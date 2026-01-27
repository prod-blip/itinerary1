# Claude Reference — Travel Planner

## Project Goal

Build a **map-first, agentic itinerary generator** where users discover locations on a map before generating day-wise itineraries. Geography before chronology.

**Current Milestone:** V0 — Foundational MVP (end-to-end flow works once)

---

## Documentation

- [Project Spec](project_spec.md) — Full requirements, API specs, tech details
- [Architecture](docs/architecture.md) — System design and data flow
- [Changelog](docs/changelog.md) — Version history
- [Project Status](docs/project_status.md) — Current progress

Update docs after major milestones and additions.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, MapLibre (OSM tiles), Tailwind CSS, Zustand, React Query |
| Backend | FastAPI, LangGraph, MemorySaver |
| LLM | OpenAI GPT-4o |
| APIs | Google Places, Google Directions, Tavily |
| Observability | Phoenix (Arize) |

---

## Project Structure

```
travel-planner/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry
│   │   ├── config.py            # Environment settings
│   │   ├── api/
│   │   │   ├── routes.py        # Endpoints
│   │   │   └── schemas.py       # Pydantic models
│   │   ├── agent/
│   │   │   ├── graph.py         # LangGraph definition
│   │   │   ├── nodes.py         # Node functions
│   │   │   ├── state.py         # State schema
│   │   │   ├── tools.py         # Tool definitions
│   │   │   └── prompts.py       # Prompt templates
│   │   └── services/
│   │       └── google_maps.py   # Google API wrapper
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   ├── components/          # React components
│   │   ├── stores/              # Zustand stores
│   │   ├── services/            # API client
│   │   └── types/               # TypeScript types
│   ├── package.json
│   └── .env.local
│
├── docs/                        # Project documentation
├── project_spec.md
└── claude.md                    # This file
```

---

## Design Style Guide

**Tech stack:** Next.js (App Router), Tailwind CSS, MapLibre GL JS

**Visual style:**
- Clean, minimal interface — the map is the star
- Muted color palette; bright accents only for CTAs and day-wise routes
- No dark mode for MVP

**Responsive design:**
- Desktop-first for V0 (map takes 60%+ of viewport)
- Mobile: stack layout — map on top, location list below
- Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`
- Touch-friendly tap targets (min 44px) on mobile

**Component patterns:**
- Tailwind for all styling — no separate CSS files
- Keep components focused and small
- Location cards: name + "why this fits you" + action
- Day cards: sequential, expandable, color-coded

## Product & UX Guidelines

**Core UX principles:**
- Geography before chronology — show map first, days second
- Explain every suggestion — "why this fits you" builds trust
- User edits before generation — no surprise itineraries
- Minimal friction — remove is one click, no confirmation modals

**Copy tone:**
- Friendly, helpful, travel-excited
- Brief labels and instructions
- Actionable CTAs: "Generate Itinerary", "Add a Place"
- Helpful error messages that suggest next steps

---

## Constraints & Policies

**Security:**
- NEVER expose API keys in code
- Use environment variables for all secrets
- Validate and sanitize all user inputs
- Google API key stays server-side (proxy autocomplete)

**Code Quality:**
- Type hints on all Python functions
- TypeScript strict mode in frontend
- No `any` types unless absolutely necessary

**Dependencies:**
- Pin versions in requirements.txt and package.json
- No unnecessary dependencies — keep bundle light

---

## Repository Etiquette

**Branching:**
- ALWAYS create a feature branch before starting major changes
- NEVER commit directly to `main`
- Branch naming: `feature/description` or `fix/description`

**Git Workflow:**
1. Create branch: `git checkout -b feature/your-feature-name`
2. Develop and commit on the feature branch
3. Test locally before pushing
4. Push: `git push -u origin feature/your-feature-name`
5. Create PR to merge into `main`

**Commits:**
- Write clear commit messages describing the change
- Keep commits focused on single changes

**Pull Requests:**
- Create PRs for all changes to `main`
- NEVER force push to `main`
- Include description of what changed and why

---

## Frequently Used Commands

**Frontend:**
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run lint         # Check for linting errors
npm run build        # Production build
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt              # Install dependencies
uvicorn app.main:app --reload                # Start dev server (localhost:8000)
```

**Environment:**
```bash
cp backend/.env.example backend/.env         # Setup backend env
cp frontend/.env.example frontend/.env.local # Setup frontend env
```
