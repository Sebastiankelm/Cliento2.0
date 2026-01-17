import { z } from 'zod';

export const CreateClientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  status: z.enum(['lead', 'active', 'inactive', 'customer']),
  source: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const UpdateClientSchema = CreateClientSchema.extend({
  id: z.string().uuid(),
});

export const DeleteClientSchema = z.object({
  id: z.string().uuid(),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;
export type DeleteClientInput = z.infer<typeof DeleteClientSchema>;
