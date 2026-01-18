# Product Requirements Document: Roadmap Toolkit

## Problem Statement

Product managers maintain roadmap information in multiple formats:
- Gantt charts for timeline-based planning and stakeholder updates
- Presentation slides for executive summaries and strategy reviews

These artifacts are created and maintained separately, leading to:
1. **Drift**: Information gets out of sync as plans evolve
2. **Duplicate effort**: Same content entered in multiple places
3. **Versioning confusion**: Which document has the latest information?

Additionally, PMs change roles and companies. Roadmap tools tied to a specific organization's infrastructure become inaccessible, and historical context is lost.

## Solution

A lightweight, browser-based toolkit that:
1. Stores roadmap data in a single structured model
2. Renders that data as either a Gantt chart or presentation slide
3. Keeps both views automatically in sync
4. Is portable—works locally, can export data, and can connect to external systems

## Target User

Individual product managers who:
- Need to communicate roadmaps to different audiences (team vs. executives)
- Want a single source of truth for roadmap data
- May change roles/companies and need portable tools
- Prefer lightweight tools over heavy enterprise software

---

## Data Model

### Hierarchy

```
Theme → Initiative → Feature
```

### Theme
The highest level of organization. Represents a strategic area or workstream.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| name | string | Yes | Display name |
| description | string | No | Additional context |
| desiredOutcome | string | Yes | Directional goal (free text) |
| order | number | Yes | Display order |

### Initiative
A grouping of related work within a theme.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| themeId | string | Yes | Parent theme reference |
| name | string | Yes | Display name |
| idealOutcome | string | Yes | Success criteria (free text) |
| order | number | Yes | Display order within theme |

### Feature
A discrete piece of work with timeline and status.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| initiativeId | string | Yes | Parent initiative reference |
| name | string | Yes | Display name |
| description | string | No | Additional context |
| status | enum | Yes | shipped, in-progress, planned |
| startDate | date | No | Start date (for Gantt) |
| endDate | date | No | End date (for Gantt) |
| order | number | Yes | Display order within initiative |

### Global Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| title | string | "Product Roadmap" | Display title for both views |
| viewStartDate | date | Next quarter start | Gantt view start date |
| colorTheme | enum | "blue" | Color scheme for feature bars/badges |
| fontFamily | string | System default | Typography |

---

## Views & Features

### 1. Edit View

The primary interface for data management. All content creation and editing happens here.

#### Capabilities

**Theme Management**
- Create new theme with name and desired outcome
- Edit existing theme
- Delete theme (with confirmation; blocked if initiatives exist)
- Reorder themes via drag-and-drop

**Initiative Management**
- Create new initiative within a theme
- Edit existing initiative
- Delete initiative (with confirmation; blocked if features exist)
- Reorder initiatives within theme
- Move initiative to different theme

**Feature Management**
- Create new feature within an initiative
- Edit existing feature (name, description, status, dates)
- Delete feature (with confirmation)
- Reorder features within initiative
- Move feature to different initiative

**Bulk Operations**
- Expand/collapse all themes
- Expand/collapse all initiatives

#### UI Approach

Hierarchical list/tree view:
```
[+ Add Theme]

▼ Theme: Platform Modernization
  Desired outcome: "Reduce technical debt by 50%"
  [Edit] [Delete]

  ▼ Initiative: API Redesign
    Ideal outcome: "All endpoints on v2 API"
    [Edit] [Delete]

    • Feature: Authentication v2    [Shipped]     Jan-Mar 2025  [Edit] [Delete]
    • Feature: Rate limiting        [In Progress] Mar-May 2025  [Edit] [Delete]
    • Feature: GraphQL support      [Planned]     Q3 2025       [Edit] [Delete]

    [+ Add Feature]

  [+ Add Initiative]
```

---

### 2. Gantt View

Time-based visualization for planning and scheduling discussions.

#### Display

- **Header**: Quarters and months across the top
- **Left columns**: Theme (column 1) → Initiative with ideal outcome (column 2)
- **Chart area**: Feature bars positioned by date
- **Unscheduled row**: Features without dates appear in a dedicated "Unscheduled" row within their initiative, visually indicating missing date information

#### Capabilities

- Scroll/pan timeline horizontally
- Adjust view start date
- Drag feature bar edges to resize (updates start/end dates)
- Hover on feature bar shows tooltip with details
- Click feature bar opens quick-edit modal (dates and status only)
- Overlapping features within an initiative stack vertically

#### Visual Design

- Feature bar color indicates status:
  - Shipped: Solid dark
  - In Progress: Solid medium
  - Planned: Outlined/light
- Theme rows have subtle background differentiation
- Initiative rows are grouped under their theme

---

### 3. Slide View

Presentation-ready visualization for executive updates and strategy decks.

#### Display

- **Columns**: One per theme (left to right)
- **Cards**: One per initiative within each column
- **Line items**: Features with status badges

#### Capabilities

- Responsive layout (adjusts to screen width)
- Print-friendly styling
- Export as PNG or SVG for embedding in presentations

#### Visual Design

- Clean, minimal aesthetic suitable for exec presentations
- Status badges: Shipped (dark), In Progress (medium), Planned (outlined)
- Theme desired outcome displayed at column header
- Initiative ideal outcome displayed at bottom of each card

---

### 4. Global Navigation & Settings

#### Toolbar (persistent across views)

- Logo/title (editable in settings)
- View switcher: Edit | Gantt | Slide
- Settings button
- Export button (context-aware: exports current view)

#### Settings Panel

- Title customization
- Font family selection
- Color theme selection
- Gantt view start date
- Data management:
  - Export data as JSON
  - Import data from JSON
  - Reset all data (with confirmation)

---

## MVP Scope

### In Scope

1. **Data layer**
   - Unified data model (Theme → Initiative → Feature)
   - localStorage persistence
   - Auto-save on changes

2. **Edit View**
   - Full CRUD for themes, initiatives, features
   - Hierarchical tree UI
   - Basic reordering

3. **Gantt View**
   - Timeline rendering with quarters/months
   - Two-column hierarchy (Theme, Initiative)
   - Feature bars with drag-to-resize
   - Status-based coloring

4. **Slide View**
   - Column layout by theme
   - Card layout by initiative
   - Status badges on features
   - Outcome statements displayed

5. **Navigation**
   - Persistent toolbar
   - View switching
   - Basic settings (title, colors)

6. **Export**
   - PNG export for both views
   - JSON export/import for data portability

### Out of Scope (MVP)

- User accounts / authentication
- Cloud sync
- Notion integration (future)
- Collaboration features
- Version history
- Mobile-optimized views
- Keyboard shortcuts
- Undo/redo

---

## Future Roadmap

### Phase 2: Data Portability

**JSON Import/Export Enhancement**
- Structured export format with schema version
- Import validation with error reporting
- Merge vs. replace options on import

**Notion Integration**
- Connect to Notion database as data source
- Two-way sync: changes in toolkit reflect in Notion and vice versa
- Field mapping configuration

### Phase 3: Additional Integrations

- Linear integration
- Jira integration
- Airtable integration
- Generic REST API connector

### Phase 4: Enhanced Visualization

- Custom date ranges for Gantt
- Dependency lines between features
- Milestones
- Multiple color themes
- Custom status labels

### Phase 5: Collaboration (if needed)

- Shareable read-only links
- Cloud storage option
- Multi-user editing

---

## Success Criteria

### MVP Success

1. User can enter a complete roadmap (themes, initiatives, features) in Edit view
2. Gantt view accurately renders timeline based on feature dates
3. Slide view accurately renders status-based presentation
4. Both views stay in sync when data changes
5. Data persists across browser sessions
6. User can export either view as an image
7. User can export/import data as JSON

### Usability Goals

- New user can create their first roadmap within 5 minutes
- Switching between views is instantaneous
- Exported slide view is presentation-ready without further editing

---

## Design Decisions

1. **Feature dates**: Optional. Features without dates appear in both views:
   - **Slide view**: Displayed normally with status badge
   - **Gantt view**: Displayed in an "Unscheduled" row within their initiative (visual indicator that dates are missing)

2. **Slide view overflow**: Horizontal scroll when themes exceed viewport width. Layout can be revisited later if needed—CSS adjustments are straightforward.

3. **Theme desired outcome**: Available in the data model. Display in Gantt view TBD (will be accessible via API for future use).

---

## Appendix: View Mockups

### Gantt View Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo/Title]                    Edit | Gantt | Slide        [⚙] [Export]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                          │ Q1 2025      │ Q2 2025      │ Q3 2025           │
│  Theme      │ Initiative │ Jan Feb Mar  │ Apr May Jun  │ Jul Aug Sep       │
├─────────────┼────────────┼──────────────┼──────────────┼───────────────────┤
│  Platform   │ API        │ [████████]   │ [████████]   │                   │
│             │ Redesign   │              │    [░░░░░░░░░░░░░░]              │
│             │ → v2 API   │              │              │                   │
│             ├────────────┼──────────────┼──────────────┼───────────────────┤
│             │ Infra      │         [████████████]      │ [░░░░░░]          │
│             │ Upgrade    │              │              │                   │
│             │ → 99.9%    │              │              │                   │
├─────────────┼────────────┼──────────────┼──────────────┼───────────────────┤
│  Growth     │ Onboarding │    [████]    │ [░░░░░░░░░░░░░░░░░░░]            │
│             │ → 2x conv  │              │              │                   │
└─────────────┴────────────┴──────────────┴──────────────┴───────────────────┘
```

### Slide View Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo/Title]                    Edit | Gantt | Slide        [⚙] [Export]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Platform        │  │ Growth          │  │ Operations      │             │
│  │ "Reduce debt"   │  │ "2x revenue"    │  │ "Scale team"    │             │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤             │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │             │
│  │ │API Redesign │ │  │ │Onboarding   │ │  │ │Hiring       │ │             │
│  │ │             │ │  │ │             │ │  │ │             │ │             │
│  │ │• Auth    [S]│ │  │ │• Flow    [P]│ │  │ │• ATS     [S]│ │             │
│  │ │• Rates   [I]│ │  │ │• Email   [I]│ │  │ │• Portal  [I]│ │             │
│  │ │• GraphQL [P]│ │  │ │             │ │  │ │             │ │             │
│  │ │             │ │  │ │→ 2x convert │ │  │ │→ 10 hires   │ │             │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │             │
│  │ ┌─────────────┐ │  │                 │  │                 │             │
│  │ │Infra        │ │  │                 │  │                 │             │
│  │ │• Cloud   [I]│ │  │                 │  │                 │             │
│  │ │• Monitor [P]│ │  │                 │  │                 │             │
│  │ │→ 99.9% up   │ │  │                 │  │                 │             │
│  │ └─────────────┘ │  │                 │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  [S] Shipped   [I] In Progress   [P] Planned                               │
└─────────────────────────────────────────────────────────────────────────────┘
```
