/*
 * -------------------------------------------------------
 * Migration: Optimize has_role_on_account for Personal Accounts
 * 
 * This migration optimizes the has_role_on_account function
 * to check personal accounts FIRST (faster path) before checking
 * memberships. This should improve performance and fix potential
 * issues with personal account access.
 * 
 * ⚠️ IMPORTANT: Run this migration in Supabase Dashboard SQL Editor
 * -------------------------------------------------------
 */

-- Optimize has_role_on_account to check personal accounts first
-- This is faster because personal accounts don't require membership lookup
CREATE OR REPLACE FUNCTION public.has_role_on_account (
  account_id uuid,
  account_role varchar(50) default null
) 
RETURNS boolean 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = '' 
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Evaluate auth.uid() once and store it
  current_user_id := auth.uid();
  
  -- For personal accounts, check if user is the primary owner FIRST
  -- This is faster because it doesn't require membership lookup
  IF EXISTS(
    SELECT 1
    FROM public.accounts
    WHERE accounts.id = has_role_on_account.account_id
      AND accounts.primary_owner_user_id = current_user_id
      AND accounts.is_personal_account = true
      AND (
        has_role_on_account.account_role IS NULL
        OR has_role_on_account.account_role = 'owner'
      )
  ) THEN
    RETURN true;
  END IF;
  
  -- Check membership (for team accounts)
  IF EXISTS(
    SELECT 1
    FROM public.accounts_memberships membership
    WHERE membership.user_id = current_user_id
      AND membership.account_id = has_role_on_account.account_id
      AND (
        membership.account_role = has_role_on_account.account_role
        OR has_role_on_account.account_role IS NULL
      )
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_role_on_account(uuid, varchar) TO authenticated, service_role;
