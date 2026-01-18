/*
 * -------------------------------------------------------
 * Section: Fix user_account_workspace to include permissions and role_hierarchy_level
 * Update the view to return permissions and role_hierarchy_level for personal accounts
 * -------------------------------------------------------
 */

-- Drop and recreate the view to include permissions and role_hierarchy_level
DROP VIEW IF EXISTS public.user_account_workspace;

CREATE OR REPLACE VIEW public.user_account_workspace
WITH (security_invoker = true) AS
SELECT
    accounts.id AS id,
    accounts.name AS name,
    accounts.picture_url AS picture_url,
    (
        SELECT status
        FROM public.subscriptions
        WHERE account_id = accounts.id
        LIMIT 1
    ) AS subscription_status,
    -- Get the user's role in the account
    COALESCE(
        (SELECT account_role FROM public.accounts_memberships 
         WHERE account_id = accounts.id 
         AND user_id = (SELECT auth.uid())
         LIMIT 1),
        'owner' -- Default to owner if no membership found (for personal accounts)
    ) AS role,
    -- Get the role hierarchy level
    COALESCE(
        (SELECT hierarchy_level FROM public.roles 
         WHERE name = (
             SELECT account_role FROM public.accounts_memberships 
             WHERE account_id = accounts.id 
             AND user_id = (SELECT auth.uid())
             LIMIT 1
         )),
         (SELECT hierarchy_level FROM public.roles WHERE name = 'owner')
    ) AS role_hierarchy_level,
    -- Get permissions as an array
    -- Use COALESCE to ensure we always return an array, never NULL
    COALESCE(
        (
            SELECT array_agg(role_permissions.permission)
            FROM public.role_permissions
            WHERE role_permissions.role = COALESCE(
                (SELECT account_role FROM public.accounts_memberships 
                 WHERE account_id = accounts.id 
                 AND user_id = (SELECT auth.uid())
                 LIMIT 1),
                'owner'
            )
        ),
        ARRAY[]::public.app_permissions[]
    ) AS permissions,
    accounts.primary_owner_user_id AS primary_owner_user_id
FROM
    public.accounts
WHERE
    primary_owner_user_id = (SELECT auth.uid())
    AND accounts.is_personal_account = true
LIMIT 1;

GRANT SELECT ON public.user_account_workspace TO authenticated, service_role;
