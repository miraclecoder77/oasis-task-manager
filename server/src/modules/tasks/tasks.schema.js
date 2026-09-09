import { z } from 'zod';

export const TASK_STATUSES = ['pending', 'in-progress', 'done'];

const statusSchema = z.enum(TASK_STATUSES, {
  error: `Status must be one of: ${TASK_STATUSES.join(', ')}`,
});

const titleSchema = z
  .string({ error: 'Title is required' })
  .trim()
  .min(1, 'Title is required')
  .max(200, 'Title must be 200 characters or fewer');

const descriptionSchema = z
  .string()
  .trim()
  .max(2000, 'Description must be 2000 characters or fewer')
  .nullable();

/**
 * A cleared date input posts "", which is a clearing intent rather than a
 * malformed date — treat it as null instead of failing validation.
 */
const dueDateSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z
    .string()
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      'Due date must be a valid ISO date'
    )
    .transform((value) => new Date(value))
    .nullable()
);

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  status: statusSchema.default('pending'),
  dueDate: dueDateSchema.optional(),
});

export const updateTaskSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    status: statusSchema,
    dueDate: dueDateSchema,
  })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    'Provide at least one field to update'
  );

export const taskQuerySchema = z.object({
  status: statusSchema.optional(),
});
