/*
 * -------------------------------------------------------
 * Section: Verify Migrations
 * This script helps verify that all migrations have been applied correctly
 * -------------------------------------------------------
 */

-- Check if has_role_on_account function supports personal accounts
-- This should return true for personal account owners
SELECT 
  'has_role_on_account function check' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
        AND p.proname = 'has_role_on_account'
        AND pg_get_functiondef(p.oid) LIKE '%is_personal_account%'
    ) THEN 'PASS: Function includes personal account support'
    ELSE 'FAIL: Function does not include personal account support'
  END AS result;

-- Check if user_account_workspace view includes permissions
SELECT 
  'user_account_workspace permissions check' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'user_account_workspace' 
        AND column_name = 'permissions'
    ) THEN 'PASS: View includes permissions column'
    ELSE 'FAIL: View does not include permissions column'
  END AS result;

-- Check if user_account_workspace view includes role
SELECT 
  'user_account_workspace role check' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'user_account_workspace' 
        AND column_name = 'role'
    ) THEN 'PASS: View includes role column'
    ELSE 'FAIL: View does not include role column'
  END AS result;

-- Check if clients table RLS is enabled
SELECT 
  'clients RLS check' AS check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' 
        AND c.relname = 'clients'
        AND c.relrowsecurity = true
    ) THEN 'PASS: RLS is enabled on clients table'
    ELSE 'FAIL: RLS is not enabled on clients table'
  END AS result;
