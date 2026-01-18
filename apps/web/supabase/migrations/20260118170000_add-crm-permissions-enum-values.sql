/*
 * -------------------------------------------------------
 * Migration: Add CRM Permissions Enum Values
 * 
 * ⚠️ CRITICAL: PostgreSQL requires each ALTER TYPE ADD VALUE 
 * to be in a separate transaction. However, in a migration file,
 * we can use DO blocks to check and add values safely.
 * 
 * This migration adds all CRM-related permissions to the 
 * app_permissions enum type.
 * -------------------------------------------------------
 */

-- Note: PostgreSQL doesn't support IF NOT EXISTS for ALTER TYPE ADD VALUE
-- in older versions. We'll use a DO block to check first, but if that fails,
-- we'll need to run these commands manually one at a time.

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
