import { z } from 'zod';

export const CreateInteractionSchema = z.object({
  client_id: z.string().uuid(),
  interaction_type: z.enum(['email', 'phone', 'meeting', 'note', 'task', 'other']),
  subject: z.string().max(500).optional().nullable(),
  content: z.string().optional().nullable(),
  interaction_date: z.string().datetime().optional(),
  duration_minutes: z.number().int().min(0).optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  participants: z.array(z.object({
    name: z.string(),
    email: z.string().email().optional(),
  })).optional().nullable(),
  outcome: z.string().max(500).optional().nullable(),
  metadata: z.record(z.any()).optional().default({}),
});

export const UpdateInteractionSchema = CreateInteractionSchema.extend({
  id: z.string().uuid(),
});

export const DeleteInteractionSchema = z.object({
  id: z.string().uuid(),
});

export type CreateInteractionInput = z.infer<typeof CreateInteractionSchema>;
export type UpdateInteractionInput = z.infer<typeof UpdateInteractionSchema>;
export type DeleteInteractionInput = z.infer<typeof DeleteInteractionSchema>;
