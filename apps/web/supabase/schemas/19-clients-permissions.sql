/*
 * -------------------------------------------------------
 * Section: Clients Permissions
 * We add permissions for the clients CRM feature to the app_permissions enum
 * and assign them to roles.
 * 
 * Note: ALTER TYPE ADD VALUE must be done carefully in PostgreSQL.
 * These commands should be executed separately if needed.
 * -------------------------------------------------------
 */

-- Add clients permissions to app_permissions enum
-- Note: ALTER TYPE ADD VALUE cannot be easily rolled back in a transaction
-- These should be executed sequentially

alter type public.app_permissions add value if not exists 'clients.read';
alter type public.app_permissions add value if not exists 'clients.create';
alter type public.app_permissions add value if not exists 'clients.update';
alter type public.app_permissions add value if not exists 'clients.delete';
alter type public.app_permissions add value if not exists 'clients.manage';

-- Assign permissions to roles
-- Owner gets all permissions
insert into public.role_permissions (role, permission) values
  ('owner', 'clients.read'),
  ('owner', 'clients.create'),
  ('owner', 'clients.update'),
  ('owner', 'clients.delete'),
  ('owner', 'clients.manage')
on conflict (role, permission) do nothing;

-- Member gets read and create permissions (can be customized per organization needs)
insert into public.role_permissions (role, permission) values
  ('member', 'clients.read'),
  ('member', 'clients.create')
on conflict (role, permission) do nothing;
