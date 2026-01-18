/*
 * -------------------------------------------------------
 * Migration: Verify Personal Account Access
 * 
 * This migration verifies that:
 * 1. RLS policies allow access to personal accounts
 * 2. The user_account_workspace view can return data
 * 3. has_role_on_account works for personal accounts
 * 
 * ⚠️ IMPORTANT: Run this migration in Supabase Dashboard SQL Editor
 * This is a diagnostic migration - it doesn't change anything,
 * but helps verify that everything is set up correctly.
 * -------------------------------------------------------
 */

-- Check if accounts_read policy exists and works for personal accounts
-- This query should return at least one row for the current user
SELECT 
  'accounts_read policy check' as check_name,
  COUNT(*) as matching_accounts
FROM public.accounts
WHERE primary_owner_user_id = auth.uid()
  AND is_personal_account = true;

-- Check if user_account_workspace view returns data
-- This query should return exactly one row for the current user
SELECT 
  'user_account_workspace view check' as check_name,
  COUNT(*) as matching_rows
FROM public.user_account_workspace;

-- Check if has_role_on_account works for personal accounts
-- This should return true for the user's personal account
SELECT 
  'has_role_on_account check' as check_name,
  public.has_role_on_account(accounts.id) as has_access,
  accounts.id as account_id,
  accounts.name as account_name
FROM public.accounts
WHERE primary_owner_user_id = auth.uid()
  AND is_personal_account = true
LIMIT 1;

-- Check if permissions are assigned to owner role
SELECT 
  'owner permissions check' as check_name,
  COUNT(*) as permission_count
FROM public.role_permissions
WHERE role = 'owner'
  AND (permission::text LIKE 'deals.%' 
       OR permission::text LIKE 'tasks.%'
       OR permission::text LIKE 'automation.%'
       OR permission::text LIKE 'integrations.%'
       OR permission::text LIKE 'reports.%');

-- Check if enum values exist
SELECT 
  'enum values check' as check_name,
  COUNT(*) as enum_count
FROM pg_enum
WHERE enumtypid = 'public.app_permissions'::regtype
  AND (enumlabel LIKE 'deals.%' 
       OR enumlabel LIKE 'tasks.%'
       OR enumlabel LIKE 'automation.%'
       OR enumlabel LIKE 'integrations.%'
       OR enumlabel LIKE 'reports.%');
