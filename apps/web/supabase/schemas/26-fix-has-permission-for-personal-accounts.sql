/*
 * -------------------------------------------------------
 * Section: Fix has_permission for Personal Accounts
 * Update has_permission to support personal accounts where the user
 * is the primary_owner_user_id but may not have an accounts_memberships entry
 * -------------------------------------------------------
 */

-- Update the function to support personal accounts
CREATE OR REPLACE FUNCTION public.has_permission (
  user_id uuid,
  account_id uuid,
  permission_name public.app_permissions
) 
RETURNS boolean 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' 
AS $$
BEGIN
  -- First, check if user has permission through membership
  IF EXISTS(
    SELECT 1
    FROM public.accounts_memberships
    JOIN public.role_permissions ON accounts_memberships.account_role = role_permissions.role
    WHERE accounts_memberships.user_id = has_permission.user_id
      AND accounts_memberships.account_id = has_permission.account_id
      AND role_permissions.permission = has_permission.permission_name
  ) THEN
    RETURN true;
  END IF;

  -- For personal accounts, check if user is the primary owner
  -- and if the owner role has the required permission
  IF EXISTS(
    SELECT 1
    FROM public.accounts
    WHERE accounts.id = has_permission.account_id
      AND accounts.primary_owner_user_id = has_permission.user_id
      AND accounts.is_personal_account = true
      AND EXISTS(
        SELECT 1
        FROM public.role_permissions
        WHERE role_permissions.role = 'owner'
          AND role_permissions.permission = has_permission.permission_name
      )
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_permission(uuid, uuid, public.app_permissions) TO authenticated, service_role;
