import { z } from 'zod';

// Base schemas for entities

export const DeliverableStatusSchema = z.enum(['shipped', 'in-progress', 'planned']);

export const DeliverableSchema = z.object({
  id: z.string(),
  initiativeId: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: DeliverableStatusSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  order: z.number().int().nonnegative(),
});

export const InitiativeSchema = z.object({
  id: z.string(),
  goalId: z.string(),
  name: z.string().min(1, 'Name is required'),
  idealOutcome: z.string().min(1, 'Ideal outcome is required'),
  order: z.number().int().nonnegative(),
});

export const GoalSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  desiredOutcome: z.string().min(1, 'Desired outcome is required'),
  order: z.number().int().nonnegative(),
  priority: z.number().int().positive(),
});

export const ColorThemeSchema = z.enum(['blue', 'green', 'orange', 'purple', 'red', 'teal', 'slate']);

export const RoadmapSettingsSchema = z.object({
  colorTheme: ColorThemeSchema,
  fontFamily: z.string(),
});

export const RoadmapSchema = z.object({
  id: z.string(),
  title: z.string(),
  goals: z.array(GoalSchema),
  initiatives: z.array(InitiativeSchema),
  deliverables: z.array(DeliverableSchema),
  settings: RoadmapSettingsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schemas for creating new entities (without id)

export const CreateGoalSchema = GoalSchema.omit({ id: true, order: true, priority: true });
export const CreateInitiativeSchema = InitiativeSchema.omit({ id: true, order: true });
export const CreateDeliverableSchema = DeliverableSchema.omit({ id: true, order: true });

// Schemas for updating entities (all fields optional except id)

export const UpdateGoalSchema = GoalSchema.partial().required({ id: true });
export const UpdateInitiativeSchema = InitiativeSchema.partial().required({ id: true });
export const UpdateDeliverableSchema = DeliverableSchema.partial().required({ id: true });

// API request schemas

export const GoalApiCreateSchema = GoalSchema.omit({ id: true });
export const GoalApiUpdateSchema = GoalSchema.partial().omit({ id: true });

export const InitiativeApiCreateSchema = InitiativeSchema.omit({ id: true });
export const InitiativeApiUpdateSchema = InitiativeSchema.partial().omit({ id: true });

export const DeliverableApiCreateSchema = DeliverableSchema.omit({ id: true });
export const DeliverableApiUpdateSchema = DeliverableSchema.partial().omit({ id: true });

// Infer types from schemas
export type DeliverableStatus = z.infer<typeof DeliverableStatusSchema>;
export type Deliverable = z.infer<typeof DeliverableSchema>;
export type Initiative = z.infer<typeof InitiativeSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type ColorTheme = z.infer<typeof ColorThemeSchema>;
export type RoadmapSettings = z.infer<typeof RoadmapSettingsSchema>;
export type Roadmap = z.infer<typeof RoadmapSchema>;

export type CreateGoal = z.infer<typeof CreateGoalSchema>;
export type CreateInitiative = z.infer<typeof CreateInitiativeSchema>;
export type CreateDeliverable = z.infer<typeof CreateDeliverableSchema>;

export type GoalApiCreate = z.infer<typeof GoalApiCreateSchema>;
export type GoalApiUpdate = z.infer<typeof GoalApiUpdateSchema>;
export type InitiativeApiCreate = z.infer<typeof InitiativeApiCreateSchema>;
export type InitiativeApiUpdate = z.infer<typeof InitiativeApiUpdateSchema>;
export type DeliverableApiCreate = z.infer<typeof DeliverableApiCreateSchema>;
export type DeliverableApiUpdate = z.infer<typeof DeliverableApiUpdateSchema>;
