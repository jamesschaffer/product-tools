# Implementation Plan

This document provides a phased implementation plan for the Product Management Toolkit. Each phase builds on the previous and results in a shippable increment.

---

## Phase 1: Project Setup & Foundation [COMPLETE]

**Goal:** Scaffolded project with routing, state management, and persistence infrastructure.

### Tasks

#### 1.1 Project Initialization
- [x] Initialize Vite + React + TypeScript project
- [x] Configure TypeScript (strict mode)
- [x] Install and configure Tailwind CSS
- [x] Install React Router DOM
- [x] Set up project structure per ARCHITECTURE.md
- [x] Configure ESLint and Prettier
- [x] Create `.env.example`
- [x] Update `.gitignore`
- [x] Move legacy files to `/legacy` folder

#### 1.2 Type Definitions
- [x] Create `src/types/roadmap.ts` with all interfaces
- [x] Create `src/types/settings.ts` (merged into roadmap.ts)
- [x] Export types from `src/types/index.ts`

#### 1.3 State Management
- [x] Create `src/context/RoadmapContext.tsx`
- [x] Implement reducer with all action types
- [x] Create initial state factory
- [x] Create `useRoadmap` hook

#### 1.4 Persistence Layer
- [x] Create `src/utils/storage.ts` with localStorage helpers
- [x] Create `src/hooks/useLocalStorage.ts` (integrated into context)
- [x] Wire auto-save into context provider
- [x] Implement load on app start

#### 1.5 Routing & Layout
- [x] Set up React Router with three routes (`/edit`, `/gantt`, `/slide`)
- [x] Create `Toolbar` component with placeholder nav
- [x] Create `ViewSwitcher` component
- [x] Default route redirects to `/edit`

#### 1.6 Sample Data
- [x] Create `src/data/sample.ts` with realistic sample roadmap
- [x] Use sample data as default when localStorage is empty

**Deliverable:** App loads, persists empty state, routes between three placeholder views.

---

## Phase 2: Edit View [COMPLETE]

**Goal:** Full CRUD functionality for themes, initiatives, and features.

### Tasks

#### 2.1 UI Components
- [x] Create `Button` component (variants: primary, secondary, danger)
- [x] Create `Input` component
- [x] Create `Textarea` component
- [x] Create `Select` component (for status)
- [x] Create `DateInput` component (uses Input with type="date")
- [x] Create `Modal` component
- [x] Create `Badge` component (for status display)
- [x] Create `ExpandCollapseButton` component (integrated into items)

#### 2.2 Theme Management
- [x] Create `ThemeList` component (integrated into EditView)
- [x] Create `ThemeItem` component (expandable)
- [x] Create `ThemeForm` component (name, description, desiredOutcome)
- [x] Implement add theme
- [x] Implement edit theme (inline)
- [x] Implement delete theme (with confirmation, blocked if has initiatives)
- [x] Implement expand/collapse theme

#### 2.3 Initiative Management
- [x] Create `InitiativeItem` component (expandable)
- [x] Create `InitiativeForm` component (name, idealOutcome)
- [x] Implement add initiative to theme
- [x] Implement edit initiative (inline)
- [x] Implement delete initiative (with confirmation, blocked if has features)
- [x] Implement expand/collapse initiative

#### 2.4 Feature Management
- [x] Create `FeatureItem` component
- [x] Create `FeatureForm` component (name, description, status, startDate, endDate)
- [x] Implement add feature to initiative
- [x] Implement edit feature (inline or modal)
- [x] Implement delete feature (with confirmation)
- [x] Validate date range (end >= start)

#### 2.5 Edit View Assembly
- [x] Create `EditView` component
- [x] Wire up all CRUD operations to context
- [x] Add "Add Theme" button
- [x] Add expand/collapse all functionality
- [x] Style with Tailwind (clean, functional)

**Deliverable:** Users can create, edit, delete all data. Changes persist to localStorage.

---

## Phase 3: Slide View [COMPLETE]

**Goal:** Presentation-ready visualization matching the vision diagram design.

### Tasks

#### 3.1 Slide Components
- [x] Create `SlideView` container component
- [x] Create `ThemeColumn` component
- [x] Create `InitiativeCard` component
- [x] Create `FeatureListItem` component (with status badge)
- [x] Create `Legend` component

#### 3.2 Data Transformation
- [x] Create utility to build nested structure (Theme -> Initiative -> Feature) in `utils/transform.ts`
- [x] Sort by order fields

#### 3.3 Styling
- [x] Match visual design from `executive-vision-diagram-standalone.html`
- [x] Implement color themes for status badges
- [x] Style outcome statements
- [x] Implement horizontal scroll for overflow
- [x] Print-friendly styles

#### 3.4 Slide View Assembly
- [x] Render theme columns
- [x] Render initiative cards within columns
- [x] Render features with status badges
- [x] Display theme desired outcome in column header
- [x] Display initiative ideal outcome at card bottom
- [x] Add legend

**Deliverable:** Slide view renders roadmap data in presentation format.

---

## Phase 4: Gantt View [COMPLETE]

**Goal:** Timeline visualization with drag-to-resize functionality.

### Tasks

#### 4.1 Date Utilities
- [x] Create `src/utils/dates.ts`
- [x] Implement `getQuarterStart`, `getNextQuarterStart`
- [x] Implement `dateToPercent`, `percentToDate`
- [x] Implement month/quarter label generators

#### 4.2 Gantt Components
- [x] Create `GanttView` container component
- [x] Create `GanttHeader` (quarters and months)
- [x] Create `GanttBody` (scrollable area) - integrated into GanttView
- [x] Create `GanttRow` (theme cell + initiative cell + timeline)
- [x] Create `FeatureBar` component
- [x] Create `UnscheduledRow` component

#### 4.3 Feature Stacking
- [x] Implement `calculateFeatureStacking` utility in `utils/gantt.ts`
- [x] Apply stacking to overlapping features

#### 4.4 Drag-to-Resize
- [x] Add left gripper to FeatureBar
- [x] Add right gripper to FeatureBar
- [x] Implement mouse event handlers
- [x] Calculate new dates on drag
- [x] Dispatch UPDATE_FEATURE on drag end
- [x] Add visual feedback during drag

#### 4.5 Gantt View Assembly
- [x] Build row data from roadmap state via `buildGanttRows` utility
- [x] Handle themes spanning multiple initiative rows
- [x] Render scheduled features as bars (constrained to timeline area)
- [x] Render unscheduled features in dedicated row
- [x] Show initiative outcome below name
- [x] Implement horizontal scroll for timeline

#### 4.6 View Settings
- [x] Add view start date control (in Settings modal)
- [x] Default to next quarter start
- [x] 12-month view window

**Deliverable:** Gantt view renders timeline, drag-to-resize updates feature dates.

---

## Phase 5: Settings & Export [COMPLETE]

**Goal:** Global settings and export functionality for both views.

### Tasks

#### 5.1 Settings Modal
- [x] Create `SettingsModal` component
- [x] Title customization
- [x] Font family selection (System Default, Serif, Monospace)
- [x] Color theme selection (Teal, Blue, Green, Purple, Orange, Slate)
- [x] View start date (for Gantt)
- [x] Wire settings to context
- [x] Sync form values with current data when modal opens

#### 5.2 Export Utilities
- [x] Create `src/utils/export.ts` - deferred, using browser print instead
- [ ] Implement `inlineStyles` helper - deferred
- [ ] Implement `exportToSvg` - deferred
- [ ] Implement `exportToPng` - deferred (UI shows "Coming soon")
- [x] Implement `downloadFile` helper (for JSON export)

#### 5.3 Export Integration
- [x] Add export button to Toolbar
- [x] Context-aware: exports current view (via print dialog)
- [x] Create `ExportModal` component with Print/PDF option
- [ ] Format selection (SVG / PNG) - deferred, PNG marked as "Coming soon"

#### 5.4 Data Import/Export
- [x] Implement JSON export (download roadmap data)
- [x] Implement JSON import (upload and validate)
- [x] Add to settings modal
- [x] Add reset all data option (with confirmation via ConfirmDialog)

**Deliverable:** Users can customize settings, export views as images, import/export data as JSON.

---

## Phase 6: Polish & Refinement [COMPLETE]

**Goal:** Production-ready quality, edge cases handled.

### Tasks

#### 6.1 Empty States
- [x] Edit view: "No themes yet" state with CTA
- [x] Gantt view: "No data" state
- [x] Slide view: "No data" state

#### 6.2 Validation & Error Handling
- [x] Required field validation in forms
- [x] Date validation (end >= start)
- [x] Prevent delete of theme with initiatives
- [x] Prevent delete of initiative with features
- [ ] Error boundaries for view components - deferred

#### 6.3 Keyboard & Accessibility
- [x] Focus management in forms (via native browser behavior)
- [x] Escape to close modals
- [ ] Enter to submit forms - deferred
- [x] ARIA labels where needed (close buttons)

#### 6.4 Performance
- [ ] Debounce localStorage writes - deferred (current implementation acceptable)
- [x] Memoize expensive computations (useMemo in Gantt view)
- [ ] Lazy load export utilities - deferred (not needed for current size)

#### 6.5 Responsive Design
- [x] Mobile-friendly Edit view (max-width container)
- [x] Gantt/Slide views: horizontal scroll on smaller screens

#### 6.6 Documentation
- [x] Update README with setup instructions
- [x] Document all keyboard shortcuts
- [x] Update PROJECT_CONTEXT.md

**Deliverable:** App is polished, handles edge cases, ready for daily use.

---

## Phase 7: Supabase Integration (Future)

**Goal:** Cloud persistence, authentication, cross-machine access.

### Tasks

#### 7.1 Supabase Setup
- [ ] Create Supabase project
- [ ] Run database migrations (see ARCHITECTURE.md)
- [ ] Configure Row Level Security
- [ ] Get API keys

#### 7.2 Auth Integration
- [ ] Install `@supabase/supabase-js`
- [ ] Create Supabase client
- [ ] Implement login (email/password or magic link)
- [ ] Implement logout
- [ ] Protected routes

#### 7.3 Data Layer Swap
- [ ] Create `supabaseAdapter` implementing `StorageAdapter`
- [ ] Swap localStorage adapter for Supabase adapter when authenticated
- [ ] Handle offline fallback (localStorage)

#### 7.4 Sync Logic
- [ ] Load roadmap from Supabase on login
- [ ] Save changes to Supabase
- [ ] Handle conflicts (last-write-wins for MVP)

**Deliverable:** Users can log in, data syncs to cloud, accessible from any machine.

---

## Phase 8: Sharing & Collaboration (Future)

**Goal:** Share roadmaps with others.

### Tasks

- [ ] Generate shareable read-only links
- [ ] Viewer mode (no auth required, read-only)
- [ ] Consider multi-user editing (future)

---

## Definition of Done (Per Phase)

- [ ] All tasks completed
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Manual testing of happy path
- [ ] Edge cases handled (empty states, validation)
- [ ] Code follows project patterns
- [ ] Changes committed with clear messages

---

## Dependencies Between Phases

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Edit View) ──────────────────┐
    │                                 │
    ▼                                 ▼
Phase 3 (Slide View)          Phase 4 (Gantt View)
    │                                 │
    └────────────┬────────────────────┘
                 │
                 ▼
         Phase 5 (Settings & Export)
                 │
                 ▼
         Phase 6 (Polish)
                 │
                 ▼
         Phase 7 (Supabase) [Future]
                 │
                 ▼
         Phase 8 (Sharing) [Future]
```

Phases 3 and 4 can be worked in parallel after Phase 2 is complete.
