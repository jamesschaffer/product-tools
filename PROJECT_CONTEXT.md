# Project Context: Product Management Toolkit

## Overview

A browser-based product management toolkit for visualizing roadmaps and strategic plans. The toolkit provides multiple views of the same underlying data, allowing product managers to switch between time-based and status-based representations without maintaining separate documents.

## Purpose

Product managers need to communicate roadmaps in different contexts:
- **Gantt view**: Time-based timeline showing when work happens (for planning, scheduling, stakeholder updates)
- **Slide view**: Status-based presentation showing what's shipped, in progress, and planned (for executive updates, strategy decks)

Currently, these are separate artifacts that drift out of sync. This toolkit solves that by generating both views from a single data model.

## Core Concepts

### Data Model

The toolkit uses a hierarchical data model:

```
Goal
├── name
├── description
├── desiredOutcome (free text)
└── Initiatives[]
    ├── name
    ├── idealOutcome (free text)
    └── Deliverables[]
        ├── name
        ├── description
        ├── status (shipped | in-progress | planned)
        ├── startDate
        └── endDate
```

**Goal**: A high-level strategic category. Has a desired outcome describing the directional goal. Renders as a swimlane in Gantt view, a column in slide view.

**Initiative**: A grouping of related deliverables within a goal. Has an ideal outcome describing what success looks like. Renders as a card/section in slide view (outcome shown at bottom of card), and as a second-level row grouping in Gantt view (outcome shown as small text below initiative name).

**Deliverable**: A discrete piece of work. Renders as a timeline bar in Gantt view (using dates), a line item with status badge in slide view (using status).

### Views

**Gantt View** (display + limited editing)
- Horizontal timeline with quarters/months
- Two-level row hierarchy: Goal (left column) → Initiative (second column)
- Initiative outcome displayed as small text below initiative name
- Deliverables as horizontal bars positioned by start/end date within their initiative row
- Drag-to-resize for date adjustments (only editing allowed in this view)
- Overlapping deliverables stack within their initiative row

**Slide View** (display only)
- Goals as columns (left to right)
- Initiatives as grouped cards within each column
- Deliverables listed with status badges (Shipped, In Progress, Planned)
- Outcome statements per initiative
- Designed for embedding in presentations

**Edit View** (data management)
- Dedicated page for all content entry and management
- Full CRUD operations for goals, initiatives, and deliverables
- Form-based interface for structured data entry

### Navigation

- Persistent toolbar at top across all views
- Nav items to switch between Gantt, Slide, and Edit views

## Current State

The toolkit is fully functional with all six development phases complete. All three views work from a unified data model with localStorage persistence.

| Component | Description | Status |
|-----------|-------------|--------|
| Edit View | Full CRUD for goals, initiatives, deliverables with validation | Complete |
| Gantt View | Timeline visualization with drag-to-resize | Complete |
| Slide View | Presentation-ready status view | Complete |
| Settings | Title, font, color theme, view start date | Complete |
| Export | Print/PDF export, JSON import/export | Complete |
| Persistence | localStorage auto-save | Complete |
| Empty States | Helpful prompts when no data exists | Complete |
| Validation | Required fields, date range validation | Complete |
| Keyboard Shortcuts | Escape to close modals | Complete |

### Recent Updates
- Gantt chart layout fix: Deliverable bars now properly constrain to the timeline area (no bleeding into label columns)
- Settings modal: Now syncs form values with current data when opened
- UI polish: Default title changed to "Planning Hub", slide view padding adjusted, cleaner presentation

### Legacy Files (Reference Only)

The original standalone files are preserved in the `legacy/` folder for reference:
- `gantt.html` - Original Gantt implementation
- `executive-vision-diagram-standalone.html` - Original slide view

## Technical Details

### Architecture
- React 19.2 + Vite 7.2 + TypeScript 5.9 (strict mode)
- React Router 7.12 for view navigation
- React Context + useReducer for state management
- Tailwind CSS 4.1 for styling
- LocalStorage for data persistence (MVP)
- Future: Supabase integration for cloud persistence

### Data Persistence
- Automatic save on any change
- Data loads automatically on page refresh
- LocalStorage key: `product-toolkit-data`

## Features

### Data Management (Edit View)
- Create, edit, delete goals
- Create, edit, delete initiatives within goals
- Create, edit, delete deliverables within initiatives
- Set goal desired outcomes
- Set initiative ideal outcomes
- Set deliverable dates (for Gantt) and status (for Slide)

### Gantt View Features
- Customizable view start month
- 12-month rolling view
- Drag-to-resize deliverable bars (adjusts dates)
- Automatic stacking of overlapping deliverables

### Slide View Features
- Status badges (Shipped, In Progress, Planned)
- Outcome statements per initiative
- Goal desired outcomes displayed
- Clean presentation-ready layout

### Export
- Print/Save as PDF (via browser print dialog)
- JSON export (download roadmap data)
- JSON import (restore from backup)
- PNG export (planned for future, UI shows "Coming soon")

### Settings
- Customizable roadmap title
- Font family selection (System Default, Serif, Monospace)
- Color theme selection (Teal, Blue, Green, Purple, Orange, Slate)
- Gantt view start date configuration
- Reset all data option (with confirmation)
- Settings modal syncs with current data when opened

### Keyboard Shortcuts
- Escape to close modals
- Click outside modal to close

## Long-term Vision

### Portability & Integrations
The tool is designed to be portable across roles and organizations. While MVP uses local storage, the architecture should support:
- **Notion integration**: Sync with Notion databases
- **Other backends**: Flexibility to connect to different systems as needs change
- **Export/Import**: Data portability via JSON export/import

## Documentation

| Document | Purpose |
|----------|---------|
| `PROJECT_CONTEXT.md` | High-level overview and concepts (this file) |
| `PRD.md` | Product requirements, features, and user stories |
| `ARCHITECTURE.md` | Technical architecture, data model, component design |
| `DECISIONS.md` | Log of architectural and product decisions |
| `IMPLEMENTATION_PLAN.md` | Phased development plan with tasks |

## File Structure

```
product-tools/
├── src/
│   ├── components/
│   │   ├── edit/           # Edit view components (GoalItem, InitiativeItem, DeliverableItem, forms)
│   │   ├── gantt/          # Gantt view components (GanttView, GanttRow, DeliverableBar, etc.)
│   │   ├── slide/          # Slide view components (SlideView, GoalColumn, InitiativeCard, etc.)
│   │   ├── settings/       # Settings modal
│   │   ├── export/         # Export modal
│   │   ├── layout/         # Toolbar, ViewSwitcher
│   │   └── ui/             # Shared UI components (Button, Input, Modal, etc.)
│   ├── context/            # RoadmapContext with useReducer state management
│   ├── types/              # TypeScript interfaces (Roadmap, Goal, Initiative, Deliverable)
│   ├── utils/              # Utilities (dates, storage, gantt calculations, transforms)
│   ├── data/               # Sample roadmap data
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # Entry point
├── legacy/                 # Reference implementations (preserved)
│   ├── gantt.html
│   └── executive-vision-diagram-standalone.html
├── PROJECT_CONTEXT.md
├── PRD.md
├── ARCHITECTURE.md
├── DECISIONS.md
└── IMPLEMENTATION_PLAN.md
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. Navigate to Edit view to manage content
2. Add goals with desired outcomes
3. Add initiatives within goals with ideal outcomes
4. Add deliverables with dates and status
5. Switch to Gantt view for timeline visualization
6. Switch to Slide view for presentation-ready output
7. Export either view for use in documents or presentations
