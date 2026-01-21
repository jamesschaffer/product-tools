# Architectural Decisions

This document logs key technical and product decisions made during the design of the Product Management Toolkit.

---

## ADR-001: Unified Data Model

**Date:** 2025-01-16

**Context:**
The project started with two separate standalone tools:
- A Gantt chart (`gantt.html`) using an Initiative/Epic model
- A vision diagram (`executive-vision-diagram-standalone.html`) using a Stage/Cluster/Capability model

These tools had different data structures, making it impossible to maintain a single source of truth.

**Decision:**
Create a unified hierarchical data model: **Goal → Initiative → Deliverable**

- **Goal**: High-level strategic category (was: Initiative in Gantt, Stage in vision)
- **Initiative**: Grouping of related work (was: not present in Gantt, Cluster in vision)
- **Deliverable**: Individual work item (was: Epic in Gantt, Capability in vision)

**Consequences:**
- Single data model powers both views
- Gantt view gains a second hierarchy level (Initiative)
- Both views stay in sync automatically
- Migration required from legacy tools

---

## ADR-002: Nomenclature Standardization

**Date:** 2025-01-16

**Context:**
Multiple naming conventions were considered: Initiative/Epic, Stage/Cluster/Capability, Goal/Cluster/Effort.

**Decision:**
Use **Goal / Initiative / Deliverable** terminology.

| Term | Definition |
|------|------------|
| Goal | Strategic area with a desired outcome |
| Initiative | Grouping of deliverables with an ideal outcome |
| Deliverable | Discrete work item with status and dates |

**Rationale:**
- "Goal" conveys strategic level without implying time
- "Initiative" is familiar PM terminology
- "Deliverable" is universally understood

**Consequences:**
- Consistent vocabulary across all documentation and code
- Clear hierarchy: Goal contains Initiatives, Initiative contains Deliverables

---

## ADR-003: Three-View Architecture

**Date:** 2025-01-16

**Context:**
Initially considered inline editing in both display views. The vision diagram was display-only while the Gantt had click-to-edit and drag-to-resize.

**Decision:**
Implement three distinct views:

1. **Edit View**: All content creation and management
2. **Gantt View**: Timeline display with drag-to-resize only
3. **Slide View**: Presentation display, read-only

**Rationale:**
- Separates concerns: editing vs. visualization
- Display views stay clean and presentation-ready
- Edit view can provide structured forms for all fields
- Exception: Gantt keeps drag-to-resize because adjusting dates visually is a core use case

**Consequences:**
- Users navigate to Edit view for most changes
- Gantt drag-to-resize updates dates directly
- Slide view is purely for display/export

---

## ADR-004: Deliverable Dates Optional

**Date:** 2025-01-16

**Context:**
Some deliverables may not have scheduled dates yet (early planning stage).

**Decision:**
Deliverable `startDate` and `endDate` are optional fields.

**Behavior by view:**
- **Slide View**: Deliverables without dates display normally with status badge
- **Gantt View**: Deliverables without dates appear in a dedicated "Unscheduled" row within their initiative

**Rationale:**
- Allows capturing planned work before scheduling
- Visual indicator in Gantt prompts users to add dates
- Doesn't block workflow when dates are unknown

**Consequences:**
- Gantt view must handle unscheduled deliverables
- Data model allows null dates
- UI should make it clear when deliverables lack dates

---

## ADR-005: Outcome Statements Required

**Date:** 2025-01-16

**Context:**
Outcomes provide context for why work matters.

**Decision:**
- **Goal**: `desiredOutcome` required (free text)
- **Initiative**: `idealOutcome` required (free text)

**Display:**
- Slide View: Goal outcome in column header, Initiative outcome at bottom of card
- Gantt View: Initiative outcome as small text below initiative name

**Rationale:**
- Forces articulation of "why" at each level
- Free text allows qualitative or quantitative statements
- Visible in both views for context

**Consequences:**
- Forms must require these fields
- Both views must render outcome text

---

## ADR-006: Remove Engineering/Product Focus Indicators

**Date:** 2025-01-16

**Context:**
The original vision diagram included engineering and product focus indicators (1-5 dots) per stage.

**Decision:**
Remove focus indicators from the unified model. Can be added later if needed.

**Rationale:**
- Adds complexity without clear value for MVP
- Focus allocation changes frequently
- Can be added as optional Goal-level metadata later

**Consequences:**
- Simpler data model
- Cleaner slide view
- Feature can be revisited post-MVP

---

## ADR-007: Tech Stack Selection

**Date:** 2025-01-16

**Context:**
Need to choose a tech stack for this personal project. User has existing projects using:
- Todoit: React + Vite + TypeScript + Tailwind + Supabase
- Querygram: SwiftUI + Supabase
- Koordi: React + Vite + TypeScript + Tailwind + Express + Prisma

Goal: Minimize number of services, enable cross-machine access and sharing.

**Decision:**
Use **React + Vite + TypeScript + Tailwind + Supabase** (aligned with Todoit).

**Phases:**
1. MVP: localStorage for persistence
2. Phase 2: Supabase for cloud sync, auth, sharing

**Rationale:**
- Consistent with existing personal projects
- Supabase already in use for Todoit and Querygram
- Enables cross-machine access and sharing in Phase 2
- TypeScript provides type safety
- Vite provides fast development experience

**Consequences:**
- Familiar stack for maintenance
- Single backend service across personal projects
- Data layer abstraction allows swapping localStorage ↔ Supabase

---

## ADR-008: State Management Approach

**Date:** 2025-01-16

**Context:**
Need state management for roadmap data across three views.

**Decision:**
Use **React Context + useReducer** (no external library).

**Rationale:**
- Sufficient for single-user, single-roadmap app
- Avoids adding dependencies (Redux, Zustand, etc.)
- Reducer pattern provides predictable state transitions
- Easy to test

**Consequences:**
- All state changes go through dispatch
- Actions are typed and explicit
- Can migrate to external library later if complexity grows

---

## ADR-009: Slide View Horizontal Overflow

**Date:** 2025-01-16

**Context:**
Slide view displays goals as horizontal columns. With many goals (8+), this exceeds viewport width.

**Options considered:**
1. Horizontal scroll
2. Wrap to rows
3. Limit goal count
4. Zoom/scale
5. Alternative vertical layout

**Decision:**
Use **horizontal scroll** with no artificial limits.

**Rationale:**
- Doesn't restrict users
- CSS is easy to adjust later if needed
- Presentation use case works best with 5-6 goals anyway
- Scroll is acceptable for editing/previewing; export captures full width

**Consequences:**
- Container allows horizontal overflow
- May revisit layout for very wide roadmaps
- Export must capture full width

---

## ADR-010: Gantt Two-Column Hierarchy

**Date:** 2025-01-16

**Context:**
Original Gantt had single-level swimlanes (Initiative only). Unified model adds Goal as parent level.

**Decision:**
Gantt view has two-column left panel: **Goal | Initiative**

```
Goal           | Initiative           | Timeline...
───────────────┼──────────────────────┼─────────────
Platform       | API Redesign         | [███] [░░░]
               │ → outcome text       │
               ├──────────────────────┼─────────────
               | Infrastructure       | [████████]
               │ → outcome text       │
───────────────┼──────────────────────┼─────────────
Growth         | Onboarding           | [░░░░░░░░░]
```

**Rationale:**
- Matches slide view hierarchy
- Goal provides strategic context
- Initiative + outcome visible in row
- Deliverables render in timeline area

**Consequences:**
- More complex row rendering
- Goal cell may span multiple initiative rows
- Clear visual grouping of initiatives under goals

---

## ADR-011: Gantt Layout with Fixed Label Columns

**Date:** 2025-01-17

**Context:**
The original Gantt implementation had deliverable bars that could extend into the goal/initiative label columns when deliverables started before the view window or when dragging.

**Decision:**
Use a three-column flex layout with fixed-width columns for Goal (160px) and Initiative (192px), with the timeline area using `flex-1` to fill remaining space. Deliverable bars are positioned with `overflow-hidden` on the timeline container.

**Rationale:**
- Clean visual separation between labels and timeline
- Prevents UI confusion when deliverables extend beyond view boundaries
- Consistent column widths make the layout predictable

**Consequences:**
- Deliverable bars are clipped at timeline boundaries
- Label columns maintain fixed width regardless of content
- Unscheduled deliverables row mirrors the same column structure

---

## ADR-012: Settings Modal State Sync

**Date:** 2025-01-17

**Context:**
When opening the Settings modal, form fields should reflect the current roadmap state, not stale values from the previous modal session.

**Decision:**
Use `useEffect` to sync local form state with roadmap state whenever `isOpen` becomes true.

```tsx
useEffect(() => {
  if (isOpen) {
    setTitle(roadmap.title);
    setViewStartDate(roadmap.settings.viewStartDate);
    // ... other fields
  }
}, [isOpen, roadmap]);
```

**Rationale:**
- Users expect modal to show current values, not cached state
- Prevents confusion when settings are changed via other means (like JSON import)
- Standard UX pattern for edit modals

**Consequences:**
- Modal always shows fresh data
- Slight performance cost on modal open (negligible)
- Cancel button behavior is clear: discards unsaved changes in form

---

## ADR-013: Browser Print for PDF Export

**Date:** 2025-01-17

**Context:**
Need to support PDF export of Gantt and Slide views. Options considered:
1. Client-side PDF generation (jspdf, html2canvas)
2. Server-side PDF generation
3. Browser print dialog with "Save as PDF"

**Decision:**
Use browser print dialog via `window.print()` with print-specific CSS.

**Rationale:**
- No additional dependencies
- Works across all browsers
- Users can also print directly if preferred
- Print styling is simpler than PDF library configuration
- PNG export can be added later as a separate feature

**Consequences:**
- Users must use "Save as PDF" in print dialog (minor friction)
- Print styling must be maintained (`print:hidden` for toolbar, etc.)
- PNG export deferred to future phase

---

## ADR-014: Notion Integration as Backend

**Date:** 2025-01-21

**Context:**
The original localStorage approach limited the app to single-device use. Team members (ICs) needed to update roadmap data from their own workflows.

**Decision:**
Replace localStorage with Notion as the backend. Three Notion databases (Goals, Initiatives, Deliverables) serve as the source of truth.

**Architecture:**
```
React App → Serverless API (/api/*) → Notion API
```

**Rationale:**
- ICs can update directly in Notion using familiar tools
- This app becomes a specialized visualization layer
- No custom database infrastructure needed
- Data is portable and accessible outside the app

**Consequences:**
- Requires Notion integration token and database IDs
- API layer handles Notion ↔ app data transformation
- Relational data (Goal→Initiative→Deliverable) via Notion relations

---

## ADR-015: Server-Side Token Storage

**Date:** 2025-01-21

**Context:**
Initially, Notion tokens were stored in localStorage and passed via request headers. This exposed sensitive credentials to client-side code and browser storage.

**Decision:**
Store Notion token and database IDs as server-side environment variables only.

**Implementation:**
- `.env` file with `NOTION_TOKEN`, `GOALS_DB_ID`, `INITIATIVES_DB_ID`, `DELIVERABLES_DB_ID`
- API endpoints read from `process.env`, never from request headers
- Client never sees or stores the Notion token

**Rationale:**
- Follows security best practices
- Tokens never exposed in browser DevTools or localStorage
- Enables deployment to Vercel with secret management

**Consequences:**
- Setup requires server-side configuration (env vars)
- Client-side setup wizard replaced with env var instructions
- More secure but less self-service

---

## ADR-016: API Key Authentication

**Date:** 2025-01-21

**Context:**
With server-side tokens, the API still needed access control. Options considered:
1. Session-based auth with user accounts
2. Simple API key
3. OAuth integration

**Decision:**
Use simple API key authentication with HTTP-only cookie storage.

**Implementation:**
- `API_KEY` environment variable
- Login endpoint validates key and sets HTTP-only cookie
- All protected endpoints check for valid cookie
- No user accounts needed for team use

**Rationale:**
- Appropriate for small management team use case
- Minimal complexity vs. full auth system
- HTTP-only cookie prevents XSS token theft
- Can upgrade to proper auth later if needed

**Consequences:**
- Single shared API key for team
- No per-user permissions
- Session expires after 24 hours

---

## ADR-017: TanStack Query for Data Fetching

**Date:** 2025-01-21

**Context:**
Moving to API-based data fetching required handling loading states, caching, background refetches, and optimistic updates.

**Decision:**
Adopt TanStack Query (React Query) for data fetching and cache management.

**Implementation:**
- Query hooks for each entity type (useGoalsQuery, useInitiativesQuery, useDeliverablesQuery)
- Mutation hooks with optimistic updates for create/update/delete
- Automatic background refetching and cache invalidation
- Context syncs query data to existing reducer for compatibility

**Rationale:**
- Industry-standard solution for React data fetching
- Built-in optimistic updates with rollback on error
- Automatic cache management reduces complexity
- Maintains compatibility with existing context-based components

**Consequences:**
- Additional dependency (~12KB gzipped)
- Components still use existing hooks (useRoadmap)
- Queries refetch on window focus for freshness

---

## ADR-018: Zod Schema Validation

**Date:** 2025-01-21

**Context:**
With API endpoints accepting user input, runtime validation was needed to prevent malformed data from reaching Notion.

**Decision:**
Use Zod for both frontend type definitions and API request validation.

**Implementation:**
- Shared schemas in `src/types/schemas.ts` for frontend
- Duplicate schemas in `api/_lib/validation.ts` for API
- `validateRequest()` helper returns typed data or sends 400 response
- Validation error responses include field-level details

**Rationale:**
- Single source of truth for data shapes
- Runtime validation catches invalid API requests
- TypeScript types derived from schemas stay in sync
- Clear error messages for debugging

**Consequences:**
- ~50KB additional bundle size (frontend Zod)
- All POST/PATCH requests validated before Notion calls
- Validation errors return structured error details

---

## ADR-019: React Error Boundaries

**Date:** 2025-01-21

**Context:**
Unhandled errors in components could crash the entire app, leaving users with a blank screen.

**Decision:**
Wrap main content in React Error Boundary that catches errors and provides recovery options.

**Implementation:**
- ErrorBoundary component catches render errors
- Displays error message with "Try Again" and "Reload Page" options
- Wraps Routes inside RoadmapProvider

**Rationale:**
- Graceful degradation instead of white screen
- Users can attempt recovery without manual refresh
- Error details visible for debugging

**Consequences:**
- Errors are contained to the error boundary scope
- User experience maintained even when errors occur

---

## Future Decisions (Pending)

- **PNG export implementation**: Library choice (html2canvas vs dom-to-image)
- **Multi-roadmap support**: Single vs. multiple roadmaps per user
- **Sharing/collaboration model**: Read-only links vs. collaborative editing
- **Per-user authentication**: Move from shared API key to user accounts
