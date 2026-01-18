/*
 * -------------------------------------------------------
 * Section: Fix has_role_on_account for Personal Accounts
 * Update has_role_on_account to support personal accounts where the user
 * is the primary_owner_user_id but may not have an accounts_memberships entry
 * -------------------------------------------------------
 */

-- Update the function to support personal accounts
-- Using CREATE OR REPLACE to avoid dropping dependent policies
CREATE OR REPLACE FUNCTION public.has_role_on_account (
  account_id uuid,
  account_role varchar(50) default null
) 
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = '' 
AS $$
  SELECT
    EXISTS(
      SELECT 1
      FROM public.accounts_memberships membership
      WHERE membership.user_id = (SELECT auth.uid())
        AND membership.account_id = has_role_on_account.account_id
        AND (
          membership.account_role = has_role_on_account.account_role
          OR has_role_on_account.account_role IS NULL
        )
    )
    OR EXISTS(
      -- For personal accounts, check if user is the primary owner
      SELECT 1
      FROM public.accounts
      WHERE accounts.id = has_role_on_account.account_id
        AND accounts.primary_owner_user_id = (SELECT auth.uid())
        AND accounts.is_personal_account = true
        AND (
          -- If account_role is specified, check if it's 'owner'
          has_role_on_account.account_role IS NULL
          OR has_role_on_account.account_role = 'owner'
        )
    );
$$;

GRANT EXECUTE ON FUNCTION public.has_role_on_account(uuid, varchar) TO authenticated, service_role;
