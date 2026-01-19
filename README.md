# Product Management Toolkit

A browser-based toolkit for visualizing product roadmaps. Provides multiple views of the same underlying data, allowing product managers to switch between time-based and status-based representations.

## Views

- **Edit View**: Manage goals, initiatives, and deliverables with full CRUD operations
- **Gantt View**: Timeline visualization with drag-to-resize for date adjustments
- **Slide View**: Presentation-ready status view for executive updates

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Features

- **Unified Data Model**: Single source of truth for all views
- **Auto-Save**: Changes persist automatically to localStorage
- **Drag-to-Resize**: Adjust deliverable dates directly in Gantt view
- **Export**: Print/PDF export, JSON import/export
- **Settings**: Customize title, fonts, colors, and view start date

## Data Model

```
Goal
├── name, description, desiredOutcome
└── Initiatives[]
    ├── name, idealOutcome
    └── Deliverables[]
        ├── name, description
        ├── status (shipped | in-progress | planned)
        └── startDate, endDate
```

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS
- React Router

## Documentation

- `PROJECT_CONTEXT.md` - Overview and concepts
- `PRD.md` - Product requirements
- `ARCHITECTURE.md` - Technical architecture
- `DECISIONS.md` - Architectural decisions
- `IMPLEMENTATION_PLAN.md` - Development phases
