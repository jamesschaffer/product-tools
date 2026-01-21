// Re-export types and schemas from schemas.ts
export {
  // Schemas
  DeliverableStatusSchema,
  DeliverableSchema,
  InitiativeSchema,
  GoalSchema,
  ColorThemeSchema,
  RoadmapSettingsSchema,
  RoadmapSchema,
  CreateGoalSchema,
  CreateInitiativeSchema,
  CreateDeliverableSchema,
  UpdateGoalSchema,
  UpdateInitiativeSchema,
  UpdateDeliverableSchema,
  GoalApiCreateSchema,
  GoalApiUpdateSchema,
  InitiativeApiCreateSchema,
  InitiativeApiUpdateSchema,
  DeliverableApiCreateSchema,
  DeliverableApiUpdateSchema,
  // Types
  type DeliverableStatus,
  type Deliverable,
  type Initiative,
  type Goal,
  type ColorTheme,
  type RoadmapSettings,
  type Roadmap,
  type CreateGoal,
  type CreateInitiative,
  type CreateDeliverable,
  type GoalApiCreate,
  type GoalApiUpdate,
  type InitiativeApiCreate,
  type InitiativeApiUpdate,
  type DeliverableApiCreate,
  type DeliverableApiUpdate,
} from './schemas';

import type { Goal, Initiative, Deliverable } from './schemas';

// Composite types for UI rendering

export interface GoalWithChildren extends Goal {
  initiatives: InitiativeWithChildren[];
}

export interface InitiativeWithChildren extends Initiative {
  deliverables: Deliverable[];
}

export interface GanttRow {
  goal: Goal;
  initiative: Initiative;
  scheduledDeliverables: Deliverable[];
  unscheduledDeliverables: Deliverable[];
}
