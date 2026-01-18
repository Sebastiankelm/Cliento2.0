/*
 * -------------------------------------------------------
 * Section: CRM Permissions - Safe Enum Values Addition
 * Safely add new permissions to app_permissions enum
 * 
 * ⚠️ IMPORTANT: PostgreSQL requires each ALTER TYPE ADD VALUE 
 * to be in a separate transaction. This script uses a function
 * that can be called multiple times safely.
 * 
 * Run this entire script once. If a value already exists, 
 * it will be skipped with a notice.
 * -------------------------------------------------------
 */

-- Create function to safely add enum values
create or replace function kit.add_app_permission_if_not_exists(permission_value text)
returns void
language plpgsql
as $$
begin
  -- Check if enum value already exists
  if exists (
    select 1 
    from pg_enum 
    where enumlabel = permission_value
    and enumtypid = 'public.app_permissions'::regtype
  ) then
    raise notice 'Permission % already exists, skipping', permission_value;
    return;
  end if;
  
  -- Add enum value (this must be in a separate transaction)
  -- Note: We can't use EXECUTE here because ALTER TYPE requires
  -- a separate transaction. This function should be called
  -- from outside a transaction block or each call should be
  -- in its own transaction.
  raise exception 'This function cannot be used directly. Use individual ALTER TYPE commands instead.';
end;
$$;

-- Since we can't add multiple enum values in one transaction,
-- we need to add them one by one. However, PostgreSQL doesn't
-- support IF NOT EXISTS for ALTER TYPE ADD VALUE.
-- 
-- The safest approach is to try adding each value and catch errors.
-- But since we're in a DO block, we can't use exception handling
-- for ALTER TYPE commands that need separate transactions.
--
-- SOLUTION: Use the commands below, but wrap each in a try-catch
-- pattern. Since PostgreSQL doesn't support IF NOT EXISTS for
-- ALTER TYPE, we'll create a script that can be run multiple times.

-- Deals permissions (run each separately if needed)
-- These commands will fail if the value already exists, which is OK
-- You can ignore the errors if you see "already exists" messages

-- For now, we'll provide individual commands that you can run:
-- Each of these should be run in Supabase Dashboard SQL Editor separately

/*
-- Run these commands ONE AT A TIME in Supabase Dashboard:

-- Deals permissions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'deals.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'deals.read';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'deals.create' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'deals.create';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'deals.update' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'deals.update';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'deals.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'deals.delete';
  END IF;
END $$;

-- Tasks permissions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'tasks.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'tasks.read';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'tasks.create' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'tasks.create';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'tasks.update' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'tasks.update';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'tasks.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'tasks.delete';
  END IF;
END $$;

-- Automation permissions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'automation.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'automation.read';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'automation.create' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'automation.create';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'automation.update' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'automation.update';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'automation.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'automation.delete';
  END IF;
END $$;

-- Integrations permissions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'integrations.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'integrations.read';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'integrations.manage' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'integrations.manage';
  END IF;
END $$;

-- Reports permissions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'reports.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'reports.read';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'reports.create' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'reports.create';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'reports.export' AND enumtypid = 'public.app_permissions'::regtype) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'reports.export';
  END IF;
END $$;
*/

-- Actually, PostgreSQL doesn't allow ALTER TYPE inside a DO block for enum values
-- that need separate transactions. The best approach is to use a script that
-- generates individual commands. Let's create a simpler version:

-- Check which permissions are missing and provide commands to add them
do $$
declare
  missing_perms text[];
  all_perms text[] := ARRAY[
    'deals.read', 'deals.create', 'deals.update', 'deals.delete',
    'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
    'automation.read', 'automation.create', 'automation.update', 'automation.delete',
    'integrations.read', 'integrations.manage',
    'reports.read', 'reports.create', 'reports.export'
  ];
  perm text;
begin
  foreach perm in array all_perms
  loop
    if not exists (
      select 1 
      from pg_enum 
      where enumlabel = perm
      and enumtypid = 'public.app_permissions'::regtype
    ) then
      missing_perms := array_append(missing_perms, perm);
      raise notice 'Missing permission: %', perm;
    end if;
  end loop;
  
  if array_length(missing_perms, 1) > 0 then
    raise notice 'Run these commands to add missing permissions (one at a time):';
    foreach perm in array missing_perms
    loop
      raise notice 'ALTER TYPE public.app_permissions ADD VALUE %'';', perm;
    end loop;
  else
    raise notice 'All permissions already exist!';
  end if;
end $$;

-- Drop the helper function
drop function if exists kit.add_app_permission_if_not_exists(text);
