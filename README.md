# Product Management Toolkit

A browser-based toolkit for visualizing product roadmaps. Provides multiple views of the same underlying data, allowing product managers to switch between time-based and status-based representations.

Data is stored in Notion databases, allowing ICs to update directly while this app provides specialized visualization.

## Views

- **Edit View**: Manage goals, initiatives, and deliverables with full CRUD operations
- **Gantt View**: Timeline visualization with drag-to-resize for date adjustments
- **Slide View**: Presentation-ready status view for executive updates

## Prerequisites

1. A Notion integration token ([create one here](https://www.notion.so/my-integrations))
2. Three Notion databases: Goals, Initiatives, Deliverables
3. Node.js 18+

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Notion credentials:
# NOTION_TOKEN=your_notion_integration_token
# GOALS_DB_ID=your_goals_database_id
# INITIATIVES_DB_ID=your_initiatives_database_id
# DELIVERABLES_DB_ID=your_deliverables_database_id
# API_KEY=your_shared_access_key

# Start development server (runs both frontend and API)
npm run dev
```

## Features

- **Notion Backend**: Data synced to Notion databases
- **Unified Data Model**: Single source of truth for all views
- **Optimistic Updates**: Instant UI feedback with server sync
- **Drag-to-Resize**: Adjust deliverable dates directly in Gantt view
- **Export**: Print/PDF export, JSON import/export
- **Settings**: Customize title, fonts, colors, and view start date
- **Authentication**: Shared API key with HTTP-only cookie sessions

## Data Model

```
Goal (Notion Database)
├── name, description, desiredOutcome
└── Initiatives[] (via Relation)
    ├── name, idealOutcome
    └── Deliverables[] (via Relation)
        ├── name, description
        ├── status (shipped | in-progress | planned)
        └── startDate, endDate
```

## Tech Stack

- React 19 + TypeScript
- Vite 7
- TanStack Query (data fetching)
- Zod (validation)
- Tailwind CSS
- React Router
- Notion API (backend)

## Development

```bash
# Start dev server (frontend + API)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## API Endpoints

All endpoints require authentication (API key cookie).

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/login` | POST | Authenticate with API key |
| `/api/auth/logout` | POST | Clear session |
| `/api/notion/goals` | GET, POST | List/create goals |
| `/api/notion/goals/[id]` | PATCH, DELETE | Update/delete goal |
| `/api/notion/initiatives` | GET, POST | List/create initiatives |
| `/api/notion/initiatives/[id]` | PATCH, DELETE | Update/delete initiative |
| `/api/notion/deliverables` | GET, POST | List/create deliverables |
| `/api/notion/deliverables/[id]` | PATCH, DELETE | Update/delete deliverable |

## Documentation

- `PROJECT_CONTEXT.md` - Overview and concepts
- `PRD.md` - Product requirements
- `ARCHITECTURE.md` - Technical architecture
- `DECISIONS.md` - Architectural decisions
- `IMPLEMENTATION_PLAN.md` - Development phases
