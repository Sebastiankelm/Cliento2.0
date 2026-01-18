/*
 * -------------------------------------------------------
 * Section: CRM Permissions - Add All Enum Values
 * 
 * This file contains all ALTER TYPE commands to add CRM permissions.
 * 
 * ⚠️ IMPORTANT: In Supabase Dashboard SQL Editor, you can run
 * all these commands at once - Supabase will execute them
 * in separate transactions automatically.
 * 
 * If you get an error that a value already exists, that's OK -
 * it means that permission was already added. Just continue.
 * 
 * After running this file, verify all permissions exist by running:
 * 36-crm-permissions-check-and-add.sql
 * 
 * Then run: 36-crm-permissions-part2-role-assignments.sql
 * -------------------------------------------------------
 */

-- Deals permissions
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'deals.read';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'deals.create';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'deals.update';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'deals.delete';

-- Tasks permissions
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'tasks.read';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'tasks.create';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'tasks.update';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'tasks.delete';

-- Automation permissions
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'automation.read';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'automation.create';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'automation.update';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'automation.delete';

-- Integrations permissions
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'integrations.read';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'integrations.manage';

-- Reports permissions
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'reports.read';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'reports.create';
ALTER TYPE public.app_permissions ADD VALUE IF NOT EXISTS 'reports.export';
