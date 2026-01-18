/*
 * -------------------------------------------------------
 * Migration: Ensure has_permission_for_current_user works for personal accounts
 * 
 * This migration ensures that has_permission_for_current_user function
 * correctly handles personal accounts by checking if the user is the
 * primary owner and has the permission through the 'owner' role.
 * 
 * ⚠️ IMPORTANT: Run this migration in Supabase Dashboard SQL Editor
 * -------------------------------------------------------
 */

-- Ensure has_permission_for_current_user works for personal accounts
-- This function should check personal accounts FIRST (faster path)
CREATE OR REPLACE FUNCTION public.has_permission_for_current_user (
  account_id uuid,
  permission_name public.app_permissions
) 
RETURNS boolean 
LANGUAGE plpgsql
STABLE
SET search_path = '' 
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Evaluate auth.uid() once and store it
  current_user_id := auth.uid();
  
  -- Return false if no user is authenticated
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- For personal accounts, check if user is the primary owner FIRST (faster path)
  -- This is checked first because it's typically faster than membership lookup
  IF EXISTS(
    SELECT 1
    FROM public.accounts
    WHERE accounts.id = has_permission_for_current_user.account_id
      AND accounts.primary_owner_user_id = current_user_id
      AND accounts.is_personal_account = true
      AND EXISTS(
        SELECT 1
        FROM public.role_permissions
        WHERE role_permissions.role = 'owner'
          AND role_permissions.permission = has_permission_for_current_user.permission_name
      )
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user has permission through membership (for team accounts)
  -- The composite index on (user_id, account_id, account_role) makes this fast
  IF EXISTS(
    SELECT 1
    FROM public.accounts_memberships
    INNER JOIN public.role_permissions ON 
      accounts_memberships.account_role = role_permissions.role
      AND role_permissions.permission = has_permission_for_current_user.permission_name
    WHERE accounts_memberships.user_id = current_user_id
      AND accounts_memberships.account_id = has_permission_for_current_user.account_id
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_permission_for_current_user(uuid, public.app_permissions) TO authenticated, service_role;
