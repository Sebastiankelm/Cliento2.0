/*
 * -------------------------------------------------------
 * Section: CRM Permissions - PART 2: Role Assignments
 * Assign new permissions to roles
 * 
 * ⚠️ CRITICAL: Run this ONLY AFTER completing 36-crm-permissions-part1-enum-values.sql!
 * 
 * Verify all enum values exist before running:
 * SELECT unnest(enum_range(NULL::public.app_permissions))::text 
 * WHERE unnest::text LIKE 'deals.%' 
 *    OR unnest::text LIKE 'tasks.%' 
 *    OR unnest::text LIKE 'automation.%' 
 *    OR unnest::text LIKE 'integrations.%' 
 *    OR unnest::text LIKE 'reports.%';
 * 
 * You should see all 17 permissions listed.
 * -------------------------------------------------------
 */

-- Owner gets all permissions
insert into public.role_permissions (role, permission) values
  -- Deals
  ('owner', 'deals.read'::public.app_permissions),
  ('owner', 'deals.create'::public.app_permissions),
  ('owner', 'deals.update'::public.app_permissions),
  ('owner', 'deals.delete'::public.app_permissions),
  -- Tasks
  ('owner', 'tasks.read'::public.app_permissions),
  ('owner', 'tasks.create'::public.app_permissions),
  ('owner', 'tasks.update'::public.app_permissions),
  ('owner', 'tasks.delete'::public.app_permissions),
  -- Automation
  ('owner', 'automation.read'::public.app_permissions),
  ('owner', 'automation.create'::public.app_permissions),
  ('owner', 'automation.update'::public.app_permissions),
  ('owner', 'automation.delete'::public.app_permissions),
  -- Integrations
  ('owner', 'integrations.read'::public.app_permissions),
  ('owner', 'integrations.manage'::public.app_permissions),
  -- Reports
  ('owner', 'reports.read'::public.app_permissions),
  ('owner', 'reports.create'::public.app_permissions),
  ('owner', 'reports.export'::public.app_permissions)
on conflict (role, permission) do nothing;

-- Member gets read and create permissions (can be customized per organization needs)
insert into public.role_permissions (role, permission) values
  -- Deals
  ('member', 'deals.read'::public.app_permissions),
  ('member', 'deals.create'::public.app_permissions),
  -- Tasks
  ('member', 'tasks.read'::public.app_permissions),
  ('member', 'tasks.create'::public.app_permissions),
  -- Automation (read only for members)
  ('member', 'automation.read'::public.app_permissions),
  -- Integrations (read only for members)
  ('member', 'integrations.read'::public.app_permissions),
  -- Reports (read only for members)
  ('member', 'reports.read'::public.app_permissions)
on conflict (role, permission) do nothing;
