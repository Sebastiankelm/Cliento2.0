/*
 * -------------------------------------------------------
 * Section: CRM Permissions - PART 1: Enum Values
 * Add new permissions to app_permissions enum
 * 
 * ⚠️ CRITICAL: Each ALTER TYPE command MUST be executed separately!
 * In Supabase Dashboard, run each command one at a time, clicking "Run" after each.
 * 
 * DO NOT run PART 2 (36-crm-permissions-part2-role-assignments.sql) 
 * until ALL commands in this file are completed.
 * -------------------------------------------------------
 */

-- Deals permissions
alter type public.app_permissions add value if not exists 'deals.read';

alter type public.app_permissions add value if not exists 'deals.create';

alter type public.app_permissions add value if not exists 'deals.update';

alter type public.app_permissions add value if not exists 'deals.delete';

-- Tasks permissions
alter type public.app_permissions add value if not exists 'tasks.read';

alter type public.app_permissions add value if not exists 'tasks.create';

alter type public.app_permissions add value if not exists 'tasks.update';

alter type public.app_permissions add value if not exists 'tasks.delete';

-- Automation permissions
alter type public.app_permissions add value if not exists 'automation.read';

alter type public.app_permissions add value if not exists 'automation.create';

alter type public.app_permissions add value if not exists 'automation.update';

alter type public.app_permissions add value if not exists 'automation.delete';

-- Integrations permissions
alter type public.app_permissions add value if not exists 'integrations.read';

alter type public.app_permissions add value if not exists 'integrations.manage';

-- Reports permissions
alter type public.app_permissions add value if not exists 'reports.read';

alter type public.app_permissions add value if not exists 'reports.create';

alter type public.app_permissions add value if not exists 'reports.export';
