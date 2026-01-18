import { z } from 'zod';

export const CreateCustomFieldSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  field_key: z.string().min(1).regex(/^[a-z0-9_]+$/, 'Field key must be lowercase letters, numbers, and underscores only'),
  field_type: z.enum(['text', 'number', 'date', 'select', 'checkbox', 'textarea']),
  is_required: z.boolean().default(false),
  options: z.array(z.string()).optional().nullable(),
  default_value: z.string().optional().nullable(),
  display_order: z.number().int().default(0),
});

export const UpdateCustomFieldSchema = CreateCustomFieldSchema.extend({
  id: z.string().uuid(),
});

export const DeleteCustomFieldSchema = z.object({
  id: z.string().uuid(),
});

export const UpsertCustomFieldValueSchema = z.object({
  client_id: z.string().uuid(),
  custom_field_id: z.string().uuid(),
  value: z.string().optional().nullable(),
});

export type CreateCustomFieldInput = z.infer<typeof CreateCustomFieldSchema>;
export type UpdateCustomFieldInput = z.infer<typeof UpdateCustomFieldSchema>;
export type DeleteCustomFieldInput = z.infer<typeof DeleteCustomFieldSchema>;
export type UpsertCustomFieldValueInput = z.infer<typeof UpsertCustomFieldValueSchema>;
