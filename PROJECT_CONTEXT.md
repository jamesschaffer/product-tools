# Project Context: Gantt Chart Roadmap Tool

## Overview

A single-page HTML application for creating and managing product roadmaps using a Gantt chart interface. The tool enables product managers and teams to visualize project timelines by organizing work into **Initiatives** (swimlanes) and **Epics** (timeline bars).

## Purpose

This tool provides a lightweight, browser-based solution for roadmap visualization without requiring external dependencies or backend services. All data persists locally in the browser's localStorage.

## Core Concepts

### Data Model

- **Initiatives**: High-level strategic categories that serve as swimlanes in the chart. Each initiative has a name and description.
- **Epics**: Time-bound work items displayed as horizontal bars on the timeline. Each epic belongs to one initiative and has:
  - Name
  - Description
  - Start date
  - End date

### Views

- **Timeline Header**: Displays quarters (Q1, Q2, etc.) and months
- **Initiative List**: Left sidebar showing all initiatives as clickable rows
- **Chart Grid**: Main area displaying epic bars positioned by date within their initiative's swimlane

## Features

### Initiative Management
- Create, edit, and delete initiatives
- Initiatives cannot be deleted if they contain epics

### Epic Management
- Create, edit, and delete epics via popover forms
- Drag-to-resize epic bars using left/right grippers
- Click epic bars to open edit popover
- Automatic stacking of overlapping epics within the same initiative

### Settings
- Customizable chart title
- Font family selection
- Epic color theme (blue, green, orange, purple, red, teal, slate)
- Adjustable view start month
- Reset all data option

### Export
- Export as SVG
- Export as PNG

### Data Persistence
- Automatic save to localStorage on any change
- Data loads automatically on page refresh
- LocalStorage key: `gantt-chart-data`

## Technical Details

### Architecture
- Single HTML file with embedded CSS and JavaScript
- No external dependencies or build process required
- Vanilla JavaScript (no frameworks)

### Key Functions
- `render()`: Main rendering function that updates initiative list and chart
- `renderChart()`: Renders swimlanes and epic bars
- `calculateEpicStacking()`: Handles overlapping epic placement
- `dateToPercent()` / `percentToDate()`: Date-to-position conversion utilities
- `saveState()` / `loadState()`: LocalStorage persistence

### Default Behavior
- View starts at the beginning of the next quarter from current date
- 12-month view window by default
- Blue color theme by default

## File Structure

```
product-tools/
├── gantt.html          # Main application file
└── PROJECT_CONTEXT.md  # This documentation file
```

## Usage

1. Open `gantt.html` in a web browser
2. Click "+ Initiative" to create a new initiative (swimlane)
3. Click "+ Epic" to add work items to initiatives
4. Drag epic bar edges to adjust dates
5. Click on initiatives or epics to edit them
6. Use Settings to customize appearance
7. Export completed roadmap as SVG or PNG
