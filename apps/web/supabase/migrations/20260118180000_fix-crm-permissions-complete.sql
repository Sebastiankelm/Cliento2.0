/*
 * -------------------------------------------------------
 * Migration: Complete CRM Permissions Fix
 * 
 * This migration:
 * 1. Adds all missing enum values for CRM permissions
 * 2. Assigns permissions to owner and member roles
 * 3. Ensures RLS policies can work correctly
 * 
 * ⚠️ IMPORTANT: Run this migration in Supabase Dashboard SQL Editor
 * -------------------------------------------------------
 */

-- ============================================
-- PART 1: Add Enum Values (if not exists)
-- ============================================

-- Deals permissions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'deals.read' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'deals.read';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'deals.create' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'deals.create';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'deals.update' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'deals.update';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'deals.delete' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'deals.delete';
  END IF;
END $$;

-- Tasks permissions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'tasks.read' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'tasks.read';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'tasks.create' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'tasks.create';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'tasks.update' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'tasks.update';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'tasks.delete' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'tasks.delete';
  END IF;
END $$;

-- Automation permissions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'automation.read' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'automation.read';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'automation.create' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'automation.create';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'automation.update' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'automation.update';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'automation.delete' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'automation.delete';
  END IF;
END $$;

-- Integrations permissions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'integrations.read' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'integrations.read';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'integrations.manage' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'integrations.manage';
  END IF;
END $$;

-- Reports permissions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'reports.read' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'reports.read';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'reports.create' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'reports.create';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'reports.export' 
    AND enumtypid = 'public.app_permissions'::regtype
  ) THEN
    ALTER TYPE public.app_permissions ADD VALUE 'reports.export';
  END IF;
END $$;

-- ============================================
-- PART 2: Assign Permissions to Roles
-- ============================================

-- Owner gets all permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  ('owner', 'deals.read'::public.app_permissions),
  ('owner', 'deals.create'::public.app_permissions),
  ('owner', 'deals.update'::public.app_permissions),
  ('owner', 'deals.delete'::public.app_permissions),
  ('owner', 'tasks.read'::public.app_permissions),
  ('owner', 'tasks.create'::public.app_permissions),
  ('owner', 'tasks.update'::public.app_permissions),
  ('owner', 'tasks.delete'::public.app_permissions),
  ('owner', 'automation.read'::public.app_permissions),
  ('owner', 'automation.create'::public.app_permissions),
  ('owner', 'automation.update'::public.app_permissions),
  ('owner', 'automation.delete'::public.app_permissions),
  ('owner', 'integrations.read'::public.app_permissions),
  ('owner', 'integrations.manage'::public.app_permissions),
  ('owner', 'reports.read'::public.app_permissions),
  ('owner', 'reports.create'::public.app_permissions),
  ('owner', 'reports.export'::public.app_permissions)
ON CONFLICT (role, permission) DO NOTHING;

-- Member gets read and create permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  ('member', 'deals.read'::public.app_permissions),
  ('member', 'deals.create'::public.app_permissions),
  ('member', 'tasks.read'::public.app_permissions),
  ('member', 'tasks.create'::public.app_permissions),
  ('member', 'automation.read'::public.app_permissions),
  ('member', 'integrations.read'::public.app_permissions),
  ('member', 'reports.read'::public.app_permissions)
ON CONFLICT (role, permission) DO NOTHING;
