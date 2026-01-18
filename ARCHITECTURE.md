# Architecture: Product Management Toolkit

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| **Framework** | React | 19.x | Functional components with hooks |
| **Build Tool** | Vite | 7.x | Fast dev server, optimized builds |
| **Language** | TypeScript | 5.x | Strict mode enabled |
| **Styling** | Tailwind CSS | 3.x | Utility-first, consistent with other projects |
| **Routing** | React Router DOM | 7.x | Client-side routing for views |
| **Backend (Phase 2)** | Supabase | - | Auth + PostgreSQL database |
| **State Management** | React Context + useReducer | - | Simple, no external library needed for MVP |

## Project Structure

```
product-tools/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   ├── layout/                # Layout components
│   │   │   ├── Toolbar.tsx
│   │   │   ├── ViewSwitcher.tsx
│   │   │   └── index.ts
│   │   ├── edit/                  # Edit view components
│   │   │   ├── EditView.tsx
│   │   │   ├── ThemeList.tsx
│   │   │   ├── ThemeItem.tsx
│   │   │   ├── InitiativeItem.tsx
│   │   │   ├── FeatureItem.tsx
│   │   │   ├── ThemeForm.tsx
│   │   │   ├── InitiativeForm.tsx
│   │   │   ├── FeatureForm.tsx
│   │   │   └── index.ts
│   │   ├── gantt/                 # Gantt view components
│   │   │   ├── GanttView.tsx
│   │   │   ├── GanttHeader.tsx
│   │   │   ├── GanttRow.tsx
│   │   │   ├── FeatureBar.tsx
│   │   │   ├── UnscheduledRow.tsx
│   │   │   └── index.ts
│   │   ├── slide/                 # Slide view components
│   │   │   ├── SlideView.tsx
│   │   │   ├── ThemeColumn.tsx
│   │   │   ├── InitiativeCard.tsx
│   │   │   ├── FeatureListItem.tsx
│   │   │   └── index.ts
│   │   └── settings/              # Settings components
│   │       ├── SettingsModal.tsx
│   │       └── index.ts
│   ├── context/
│   │   ├── RoadmapContext.tsx     # Global state provider
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useRoadmap.ts          # Access roadmap context
│   │   ├── useLocalStorage.ts     # localStorage persistence
│   │   ├── useExport.ts           # Export functionality
│   │   └── index.ts
│   ├── types/
│   │   ├── roadmap.ts             # Core data types
│   │   ├── settings.ts            # Settings types
│   │   └── index.ts
│   ├── utils/
│   │   ├── dates.ts               # Date formatting, calculations
│   │   ├── export.ts              # SVG/PNG export logic
│   │   ├── storage.ts             # localStorage helpers
│   │   ├── ids.ts                 # ID generation
│   │   └── index.ts
│   ├── data/
│   │   └── sample.ts              # Sample data for development
│   ├── App.tsx                    # Root component with routing
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles + Tailwind
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example                   # Environment variables template
├── .gitignore
├── README.md
├── PROJECT_CONTEXT.md
├── PRD.md
├── ARCHITECTURE.md
├── DECISIONS.md
└── legacy/                        # Reference implementations
    ├── gantt.html
    └── executive-vision-diagram-standalone.html
```

## Data Model

### TypeScript Interfaces

```typescript
// src/types/roadmap.ts

export type FeatureStatus = 'shipped' | 'in-progress' | 'planned';

export interface Feature {
  id: string;
  initiativeId: string;
  name: string;
  description?: string;
  status: FeatureStatus;
  startDate?: string;      // ISO date string (YYYY-MM-DD)
  endDate?: string;        // ISO date string (YYYY-MM-DD)
  order: number;
}

export interface Initiative {
  id: string;
  themeId: string;
  name: string;
  idealOutcome: string;
  order: number;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  desiredOutcome: string;
  order: number;
}

export interface Roadmap {
  id: string;
  title: string;
  themes: Theme[];
  initiatives: Initiative[];
  features: Feature[];
  settings: RoadmapSettings;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapSettings {
  viewStartDate: string;   // ISO date string
  colorTheme: ColorTheme;
  fontFamily: string;
}

export type ColorTheme = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal' | 'slate';
```

### Data Relationships

```
┌─────────────────────────────────────────────────────────┐
│                        Roadmap                          │
│  - id, title, settings, timestamps                      │
└─────────────────────────────────────────────────────────┘
                            │
                            │ contains
                            ▼
┌─────────────────────────────────────────────────────────┐
│                         Theme                           │
│  - id, name, description, desiredOutcome, order         │
└─────────────────────────────────────────────────────────┘
                            │
                            │ themeId (1:many)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      Initiative                         │
│  - id, themeId, name, idealOutcome, order               │
└─────────────────────────────────────────────────────────┘
                            │
                            │ initiativeId (1:many)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                        Feature                          │
│  - id, initiativeId, name, description,                 │
│    status, startDate, endDate, order                    │
└─────────────────────────────────────────────────────────┘
```

### Derived Data (Computed at Render)

For views, derive nested structures from flat arrays:

```typescript
// Derived type for Edit/Slide views
interface ThemeWithChildren extends Theme {
  initiatives: InitiativeWithChildren[];
}

interface InitiativeWithChildren extends Initiative {
  features: Feature[];
}

// Derived type for Gantt view
interface GanttRow {
  theme: Theme;
  initiative: Initiative;
  scheduledFeatures: Feature[];    // Features with dates
  unscheduledFeatures: Feature[];  // Features without dates
}
```

## Component Architecture

### View Components

```
App
├── Toolbar
│   ├── Title (editable)
│   ├── ViewSwitcher [Edit | Gantt | Slide]
│   ├── SettingsButton
│   └── ExportButton
│
├── Routes
│   ├── /edit → EditView
│   │   └── ThemeList
│   │       └── ThemeItem (expandable)
│   │           ├── ThemeForm (inline edit)
│   │           └── InitiativeItem (expandable)
│   │               ├── InitiativeForm (inline edit)
│   │               └── FeatureItem
│   │                   └── FeatureForm (inline edit)
│   │
│   ├── /gantt → GanttView
│   │   ├── GanttHeader (quarters/months)
│   │   └── GanttBody
│   │       └── GanttRow (per initiative)
│   │           ├── ThemeCell
│   │           ├── InitiativeCell
│   │           ├── FeatureBar[] (draggable edges)
│   │           └── UnscheduledRow (if applicable)
│   │
│   └── /slide → SlideView
│       ├── SlideHeader (title)
│       ├── ThemeColumns
│       │   └── ThemeColumn
│       │       └── InitiativeCard
│       │           ├── FeatureListItem[]
│       │           └── OutcomeStatement
│       └── Legend
│
└── SettingsModal (overlay)
```

### State Management

Use React Context with useReducer for predictable state updates:

```typescript
// src/context/RoadmapContext.tsx

interface RoadmapState {
  roadmap: Roadmap;
  isLoading: boolean;
  error: string | null;
}

type RoadmapAction =
  // Theme actions
  | { type: 'ADD_THEME'; payload: Omit<Theme, 'id' | 'order'> }
  | { type: 'UPDATE_THEME'; payload: Theme }
  | { type: 'DELETE_THEME'; payload: string }
  | { type: 'REORDER_THEMES'; payload: string[] }
  // Initiative actions
  | { type: 'ADD_INITIATIVE'; payload: Omit<Initiative, 'id' | 'order'> }
  | { type: 'UPDATE_INITIATIVE'; payload: Initiative }
  | { type: 'DELETE_INITIATIVE'; payload: string }
  | { type: 'MOVE_INITIATIVE'; payload: { id: string; newThemeId: string } }
  | { type: 'REORDER_INITIATIVES'; payload: { themeId: string; initiativeIds: string[] } }
  // Feature actions
  | { type: 'ADD_FEATURE'; payload: Omit<Feature, 'id' | 'order'> }
  | { type: 'UPDATE_FEATURE'; payload: Feature }
  | { type: 'DELETE_FEATURE'; payload: string }
  | { type: 'MOVE_FEATURE'; payload: { id: string; newInitiativeId: string } }
  | { type: 'REORDER_FEATURES'; payload: { initiativeId: string; featureIds: string[] } }
  // Settings actions
  | { type: 'UPDATE_SETTINGS'; payload: Partial<RoadmapSettings> }
  | { type: 'UPDATE_TITLE'; payload: string }
  // Bulk actions
  | { type: 'LOAD_ROADMAP'; payload: Roadmap }
  | { type: 'RESET_ROADMAP' }
  | { type: 'IMPORT_ROADMAP'; payload: Roadmap };

const RoadmapContext = createContext<{
  state: RoadmapState;
  dispatch: React.Dispatch<RoadmapAction>;
} | null>(null);
```

### Persistence Layer

Auto-save to localStorage on every state change:

```typescript
// src/hooks/useLocalStorage.ts

const STORAGE_KEY = 'product-toolkit-data';

export function useLocalStorage() {
  const save = (roadmap: Roadmap) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmap));
  };

  const load = (): Roadmap | null => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { save, load, clear };
}
```

Persistence hook in context provider:

```typescript
// In RoadmapContext.tsx
useEffect(() => {
  if (state.roadmap) {
    storage.save({
      ...state.roadmap,
      updatedAt: new Date().toISOString()
    });
  }
}, [state.roadmap]);
```

## Routing

```typescript
// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <RoadmapProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Toolbar />
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/edit" replace />} />
              <Route path="/edit" element={<EditView />} />
              <Route path="/gantt" element={<GanttView />} />
              <Route path="/slide" element={<SlideView />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </RoadmapProvider>
  );
}
```

## Gantt View Specifics

### Timeline Calculations

```typescript
// src/utils/dates.ts

export function getQuarterStart(date: Date): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
}

export function getNextQuarterStart(date: Date): Date {
  const current = getQuarterStart(date);
  current.setMonth(current.getMonth() + 3);
  return current;
}

export function dateToPercent(
  date: Date,
  viewStart: Date,
  viewMonths: number = 12
): number {
  const viewEnd = new Date(viewStart);
  viewEnd.setMonth(viewEnd.getMonth() + viewMonths);

  const totalMs = viewEnd.getTime() - viewStart.getTime();
  const dateMs = date.getTime() - viewStart.getTime();

  return (dateMs / totalMs) * 100;
}

export function percentToDate(
  percent: number,
  viewStart: Date,
  viewMonths: number = 12
): Date {
  const viewEnd = new Date(viewStart);
  viewEnd.setMonth(viewEnd.getMonth() + viewMonths);

  const totalMs = viewEnd.getTime() - viewStart.getTime();
  const dateMs = (percent / 100) * totalMs;

  return new Date(viewStart.getTime() + dateMs);
}
```

### Feature Bar Drag-to-Resize

```typescript
// src/components/gantt/FeatureBar.tsx

interface FeatureBarProps {
  feature: Feature;
  viewStart: Date;
  viewMonths: number;
  onUpdateDates: (startDate: string, endDate: string) => void;
}

// Implementation uses:
// - onMouseDown on left/right grippers
// - onMouseMove to calculate new dates
// - onMouseUp to commit changes via dispatch
// - CSS cursor: ew-resize on grippers
```

### Stacking Overlapping Features

```typescript
// src/utils/gantt.ts

interface StackedFeature extends Feature {
  stackIndex: number;
}

export function calculateFeatureStacking(features: Feature[]): StackedFeature[] {
  // Sort by start date
  const sorted = [...features].sort((a, b) =>
    new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
  );

  const stacked: StackedFeature[] = [];
  const rows: { endDate: Date }[] = [];

  for (const feature of sorted) {
    const start = new Date(feature.startDate!);

    // Find first row where feature fits
    let rowIndex = rows.findIndex(row => row.endDate <= start);

    if (rowIndex === -1) {
      rowIndex = rows.length;
      rows.push({ endDate: new Date(feature.endDate!) });
    } else {
      rows[rowIndex].endDate = new Date(feature.endDate!);
    }

    stacked.push({ ...feature, stackIndex: rowIndex });
  }

  return stacked;
}
```

## Export Functionality

### SVG Export

```typescript
// src/utils/export.ts

export async function exportToSvg(elementId: string): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  // Clone element and inline styles
  const clone = element.cloneNode(true) as HTMLElement;
  inlineStyles(clone);

  // Create SVG wrapper
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(element.offsetWidth));
  svg.setAttribute('height', String(element.offsetHeight));

  const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  foreignObject.setAttribute('width', '100%');
  foreignObject.setAttribute('height', '100%');
  foreignObject.appendChild(clone);
  svg.appendChild(foreignObject);

  return new XMLSerializer().serializeToString(svg);
}
```

### PNG Export

```typescript
export async function exportToPng(elementId: string): Promise<Blob> {
  const svgString = await exportToSvg(elementId);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width * 2;  // 2x for retina
      canvas.height = img.height * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(), 'image/png');
    };
    img.onerror = reject;
    img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
  });
}
```

## Phase 2: Supabase Integration

### Database Schema

```sql
-- Users (handled by Supabase Auth)

-- Roadmaps
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Product Roadmap',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Themes
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  desired_outcome TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initiatives
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ideal_outcome TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Features
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID REFERENCES initiatives(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('shipped', 'in-progress', 'planned')),
  start_date DATE,
  end_date DATE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- Policies (user can only access their own data)
CREATE POLICY "Users can manage their own roadmaps"
  ON roadmaps FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage themes in their roadmaps"
  ON themes FOR ALL
  USING (roadmap_id IN (SELECT id FROM roadmaps WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage initiatives in their themes"
  ON initiatives FOR ALL
  USING (theme_id IN (
    SELECT t.id FROM themes t
    JOIN roadmaps r ON t.roadmap_id = r.id
    WHERE r.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage features in their initiatives"
  ON features FOR ALL
  USING (initiative_id IN (
    SELECT i.id FROM initiatives i
    JOIN themes t ON i.theme_id = t.id
    JOIN roadmaps r ON t.roadmap_id = r.id
    WHERE r.user_id = auth.uid()
  ));
```

### Data Layer Abstraction

```typescript
// src/data/storage.ts

interface StorageAdapter {
  load(): Promise<Roadmap | null>;
  save(roadmap: Roadmap): Promise<void>;
  clear(): Promise<void>;
}

// MVP: localStorage adapter
export const localStorageAdapter: StorageAdapter = {
  async load() { /* ... */ },
  async save(roadmap) { /* ... */ },
  async clear() { /* ... */ }
};

// Phase 2: Supabase adapter
export const supabaseAdapter: StorageAdapter = {
  async load() { /* ... */ },
  async save(roadmap) { /* ... */ },
  async clear() { /* ... */ }
};
```

## Environment Variables

```bash
# .env.example

# Phase 2: Supabase (not needed for MVP)
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

## Testing Strategy

### Unit Tests (Vitest)

- Data transformation utilities (date calculations, stacking algorithm)
- Reducer logic (state transitions)
- Component rendering (React Testing Library)

### E2E Tests (Playwright) - Phase 2

- Create theme → initiative → feature flow
- View switching
- Drag-to-resize in Gantt
- Export functionality

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

No IE11 support required.

## Performance Considerations

- Virtualize long lists if themes/initiatives exceed ~50 items
- Debounce localStorage writes (100ms)
- Memoize derived data calculations
- Lazy load export utilities
