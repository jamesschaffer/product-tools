# Product Management Toolkit

A browser-based toolkit for visualizing product roadmaps. Provides multiple views of the same underlying data, allowing product managers to switch between time-based and status-based representations.

Data is stored in Notion databases, allowing ICs to update directly while this app provides specialized visualization.

## Views

- **Edit View**: Manage goals, initiatives, and deliverables with full CRUD operations
- **Gantt View**: Timeline visualization with drag-to-resize for date adjustments
- **Slide View**: Presentation-ready status view for executive updates

## Prerequisites

1. Node.js 18+
2. A Notion account with integration access

## Quick Start (New Installation)

```bash
# Install dependencies
npm install

# Run the setup script (creates Notion databases automatically)
npm run setup
```

The setup script will:
1. Prompt for your Notion integration token
2. Prompt for a parent page ID (where databases will be created)
3. Automatically create Goals, Initiatives, and Deliverables databases
4. Generate your `.env` file with all required credentials

Then start the servers:
```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start API
npm run dev:api
```

Open http://localhost:5173

## Manual Setup (Alternative)

If you prefer to create databases manually:

```bash
cp .env.example .env
# Edit .env with your credentials
```

Required Notion databases:
- **Goals**: Name, Description, Desired Outcome, Priority, Order
- **Initiatives**: Name, Ideal Outcome, Goal (relation), Order
- **Deliverables**: Name, Description, Status (select), Start Date, End Date, Initiative (relation), Order

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

## Deployment (Vercel)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jamesschaffer/product-tools)

### Manual Deployment

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/your-org/product-tools.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables (see below)

3. **Set Environment Variables** in Vercel Dashboard:
   ```
   NOTION_TOKEN=secret_xxx
   GOALS_DB_ID=abc123...
   INITIATIVES_DB_ID=def456...
   DELIVERABLES_DB_ID=ghi789...
   API_KEY=your-team-access-key
   ```

4. **Add Custom Domain** (optional)
   - Settings → Domains → Add `roadmap.yourcompany.com`
   - Configure DNS: CNAME record pointing to `cname.vercel-dns.com`

### Multiple Deployments

Each deployment needs its own:
- Notion integration + databases
- Environment variables in Vercel
- (Optional) Custom subdomain

Run `npm run setup` for each new Notion workspace to generate the database IDs.

## Documentation

- `PROJECT_CONTEXT.md` - Overview and concepts
- `PRD.md` - Product requirements
- `ARCHITECTURE.md` - Technical architecture
- `DECISIONS.md` - Architectural decisions
- `IMPLEMENTATION_PLAN.md` - Development phases
