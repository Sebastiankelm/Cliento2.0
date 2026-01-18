import { z } from 'zod';

export const CreateDealSchema = z.object({
  client_id: z.string().uuid(),
  pipeline_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  value: z.number().min(0, 'Value must be non-negative'),
  currency: z.string().length(3).default('USD'),
  expected_close_date: z.string().date().optional().nullable(),
  probability_percent: z.number().int().min(0).max(100).optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdateDealSchema = CreateDealSchema.extend({
  id: z.string().uuid(),
});

export const UpdateDealStageSchema = z.object({
  id: z.string().uuid(),
  stage_id: z.string().uuid(),
});

export const DeleteDealSchema = z.object({
  id: z.string().uuid(),
});

export type CreateDealInput = z.infer<typeof CreateDealSchema>;
export type UpdateDealInput = z.infer<typeof UpdateDealSchema>;
export type UpdateDealStageInput = z.infer<typeof UpdateDealStageSchema>;
export type DeleteDealInput = z.infer<typeof DeleteDealSchema>;
