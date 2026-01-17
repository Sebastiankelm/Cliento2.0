/*
 * -------------------------------------------------------
 * Section: Clients Permissions
 * We add permissions for the clients CRM feature to the app_permissions enum
 * and assign them to roles.
 * 
 * Note: ALTER TYPE ADD VALUE must be done carefully in PostgreSQL.
 * Each ALTER TYPE ADD VALUE requires a separate transaction (COMMIT).
 * In Supabase Dashboard SQL Editor, execute each ALTER TYPE separately,
 * then execute the INSERT statements.
 * -------------------------------------------------------
 */

-- ============================================================
-- PART 1: Add clients permissions to app_permissions enum
-- ============================================================
-- IMPORTANT: Execute each ALTER TYPE command separately in Supabase Dashboard!
-- After each command, click "Run" (it auto-commits), then run the next one.
-- 
-- Alternatively, if using psql or Supabase CLI, add COMMIT; after each:
-- 
-- alter type public.app_permissions add value if not exists 'clients.read';
-- COMMIT;
-- alter type public.app_permissions add value if not exists 'clients.create';
-- COMMIT;
-- ... etc
-- ============================================================

-- Execute these ONE AT A TIME in Supabase Dashboard SQL Editor:
-- (Each must be committed before the next can use the new enum value)

-- Step 1:
alter type public.app_permissions add value if not exists 'clients.read';

-- Step 2: (After Step 1 completes, run this)
alter type public.app_permissions add value if not exists 'clients.create';

-- Step 3: (After Step 2 completes, run this)
alter type public.app_permissions add value if not exists 'clients.update';

-- Step 4: (After Step 3 completes, run this)
alter type public.app_permissions add value if not exists 'clients.delete';

-- Step 5: (After Step 4 completes, run this)
alter type public.app_permissions add value if not exists 'clients.manage';

-- ============================================================
-- PART 2: Assign permissions to roles
-- ============================================================
-- Execute this AFTER all ALTER TYPE commands above have completed:

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
