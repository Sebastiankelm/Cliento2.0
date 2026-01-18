import { z } from 'zod';

export const CreateTaskSchema = z.object({
  client_id: z.string().uuid().optional().nullable(),
  deal_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().datetime().optional().nullable(),
  reminder_date: z.string().datetime().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
}).refine((data) => data.client_id || data.deal_id, {
  message: 'Either client_id or deal_id must be provided',
  path: ['client_id'],
});

export const UpdateTaskSchema = CreateTaskSchema.extend({
  id: z.string().uuid(),
});

export const DeleteTaskSchema = z.object({
  id: z.string().uuid(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type DeleteTaskInput = z.infer<typeof DeleteTaskSchema>;
