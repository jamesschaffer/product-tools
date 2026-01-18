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
Create a unified hierarchical data model: **Theme → Initiative → Feature**

- **Theme**: High-level strategic category (was: Initiative in Gantt, Stage in vision)
- **Initiative**: Grouping of related work (was: not present in Gantt, Cluster in vision)
- **Feature**: Individual work item (was: Epic in Gantt, Capability in vision)

**Consequences:**
- Single data model powers both views
- Gantt view gains a second hierarchy level (Initiative)
- Both views stay in sync automatically
- Migration required from legacy tools

---

## ADR-002: Nomenclature Standardization

**Date:** 2025-01-16

**Context:**
Multiple naming conventions were considered: Initiative/Epic, Stage/Cluster/Capability, Theme/Cluster/Effort.

**Decision:**
Use **Theme / Initiative / Feature** terminology.

| Term | Definition |
|------|------------|
| Theme | Strategic area with a desired outcome |
| Initiative | Grouping of features with an ideal outcome |
| Feature | Discrete work item with status and dates |

**Rationale:**
- "Theme" conveys strategic level without implying time
- "Initiative" is familiar PM terminology
- "Feature" is universally understood

**Consequences:**
- Consistent vocabulary across all documentation and code
- Clear hierarchy: Theme contains Initiatives, Initiative contains Features

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

## ADR-004: Feature Dates Optional

**Date:** 2025-01-16

**Context:**
Some features may not have scheduled dates yet (early planning stage).

**Decision:**
Feature `startDate` and `endDate` are optional fields.

**Behavior by view:**
- **Slide View**: Features without dates display normally with status badge
- **Gantt View**: Features without dates appear in a dedicated "Unscheduled" row within their initiative

**Rationale:**
- Allows capturing planned work before scheduling
- Visual indicator in Gantt prompts users to add dates
- Doesn't block workflow when dates are unknown

**Consequences:**
- Gantt view must handle unscheduled features
- Data model allows null dates
- UI should make it clear when features lack dates

---

## ADR-005: Outcome Statements Required

**Date:** 2025-01-16

**Context:**
Outcomes provide context for why work matters.

**Decision:**
- **Theme**: `desiredOutcome` required (free text)
- **Initiative**: `idealOutcome` required (free text)

**Display:**
- Slide View: Theme outcome in column header, Initiative outcome at bottom of card
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
- Can be added as optional Theme-level metadata later

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
Slide view displays themes as horizontal columns. With many themes (8+), this exceeds viewport width.

**Options considered:**
1. Horizontal scroll
2. Wrap to rows
3. Limit theme count
4. Zoom/scale
5. Alternative vertical layout

**Decision:**
Use **horizontal scroll** with no artificial limits.

**Rationale:**
- Doesn't restrict users
- CSS is easy to adjust later if needed
- Presentation use case works best with 5-6 themes anyway
- Scroll is acceptable for editing/previewing; export captures full width

**Consequences:**
- Container allows horizontal overflow
- May revisit layout for very wide roadmaps
- Export must capture full width

---

## ADR-010: Gantt Two-Column Hierarchy

**Date:** 2025-01-16

**Context:**
Original Gantt had single-level swimlanes (Initiative only). Unified model adds Theme as parent level.

**Decision:**
Gantt view has two-column left panel: **Theme | Initiative**

```
Theme          | Initiative           | Timeline...
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
- Theme provides strategic context
- Initiative + outcome visible in row
- Features render in timeline area

**Consequences:**
- More complex row rendering
- Theme cell may span multiple initiative rows
- Clear visual grouping of initiatives under themes

---

## ADR-011: Gantt Layout with Fixed Label Columns

**Date:** 2025-01-17

**Context:**
The original Gantt implementation had feature bars that could extend into the theme/initiative label columns when features started before the view window or when dragging.

**Decision:**
Use a three-column flex layout with fixed-width columns for Theme (160px) and Initiative (192px), with the timeline area using `flex-1` to fill remaining space. Feature bars are positioned with `overflow-hidden` on the timeline container.

**Rationale:**
- Clean visual separation between labels and timeline
- Prevents UI confusion when features extend beyond view boundaries
- Consistent column widths make the layout predictable

**Consequences:**
- Feature bars are clipped at timeline boundaries
- Label columns maintain fixed width regardless of content
- Unscheduled features row mirrors the same column structure

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

## Future Decisions (Pending)

- **PNG export implementation**: Library choice (html2canvas vs dom-to-image)
- **Notion integration architecture**: Sync strategy, conflict resolution
- **Multi-roadmap support**: Single vs. multiple roadmaps per user
- **Sharing/collaboration model**: Read-only links vs. collaborative editing
