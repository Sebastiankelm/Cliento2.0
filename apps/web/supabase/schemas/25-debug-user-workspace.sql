/*
 * -------------------------------------------------------
 * Section: Debug user_account_workspace
 * Diagnostic queries to check if the view returns data
 * -------------------------------------------------------
 */

-- Check if the view exists and has the correct columns
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_account_workspace'
ORDER BY ordinal_position;

-- Test query to see what the view returns for the current user
-- (This will only work when executed by an authenticated user)
-- Run this in Supabase Dashboard SQL Editor while logged in
SELECT * FROM public.user_account_workspace;

-- Check if there are any personal accounts for the current user
-- (This will only work when executed by an authenticated user)
SELECT 
  id,
  name,
  is_personal_account,
  primary_owner_user_id,
  (SELECT auth.uid()) as current_user_id
FROM public.accounts
WHERE primary_owner_user_id = (SELECT auth.uid())
  AND is_personal_account = true;

-- Check if the user has any memberships
SELECT 
  account_id,
  user_id,
  account_role,
  (SELECT auth.uid()) as current_user_id
FROM public.accounts_memberships
WHERE user_id = (SELECT auth.uid());

-- Check if owner role has the required permissions
SELECT 
  rp.role,
  rp.permission::text as permission
FROM public.role_permissions rp
WHERE rp.role = 'owner'
  AND rp.permission::text LIKE 'clients.%'
ORDER BY rp.permission;
