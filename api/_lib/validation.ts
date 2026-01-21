import { z } from 'zod';
import type { VercelResponse } from '@vercel/node';

// Schemas for API validation

export const DeliverableStatusSchema = z.enum(['shipped', 'in-progress', 'planned']);

export const GoalCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  desiredOutcome: z.string().min(1, 'Desired outcome is required'),
  priority: z.number().int().positive('Priority must be a positive integer'),
  order: z.number().int().nonnegative('Order must be a non-negative integer'),
});

export const GoalUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  desiredOutcome: z.string().min(1).optional(),
  priority: z.number().int().positive().optional(),
  order: z.number().int().nonnegative().optional(),
});

export const InitiativeCreateSchema = z.object({
  goalId: z.string().min(1, 'Goal ID is required'),
  name: z.string().min(1, 'Name is required'),
  idealOutcome: z.string().min(1, 'Ideal outcome is required'),
  order: z.number().int().nonnegative('Order must be a non-negative integer'),
});

export const InitiativeUpdateSchema = z.object({
  goalId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  idealOutcome: z.string().min(1).optional(),
  order: z.number().int().nonnegative().optional(),
});

export const DeliverableCreateSchema = z.object({
  initiativeId: z.string().min(1, 'Initiative ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: DeliverableStatusSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  order: z.number().int().nonnegative('Order must be a non-negative integer'),
});

export const DeliverableUpdateSchema = z.object({
  initiativeId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: DeliverableStatusSchema.optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  order: z.number().int().nonnegative().optional(),
});

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  res: VercelResponse
): { success: true; data: T } | { success: false } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({ error: 'Validation failed', details: errors });
    return { success: false };
  }

  return { success: true, data: result.data };
}
