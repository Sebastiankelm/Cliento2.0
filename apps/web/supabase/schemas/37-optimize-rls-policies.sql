/*
 * -------------------------------------------------------
 * Section: Optimize RLS Policies
 * Fix "Auth RLS Initialization Plan" warnings by optimizing
 * RLS policies to avoid re-evaluating auth.uid() for each row.
 * 
 * Solution: Create optimized helper functions that evaluate
 * auth.uid() once per query instead of per row.
 * -------------------------------------------------------
 */

-- Create optimized version of has_permission that uses current user
-- This function evaluates auth.uid() once per query execution
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
  
  -- Check if user has permission through membership
  IF EXISTS(
    SELECT 1
    FROM public.accounts_memberships
    JOIN public.role_permissions ON accounts_memberships.account_role = role_permissions.role
    WHERE accounts_memberships.user_id = current_user_id
      AND accounts_memberships.account_id = has_permission_for_current_user.account_id
      AND role_permissions.permission = has_permission_for_current_user.permission_name
  ) THEN
    RETURN true;
  END IF;

  -- For personal accounts, check if user is the primary owner
  -- and if the owner role has the required permission
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

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_permission_for_current_user(uuid, public.app_permissions) TO authenticated, service_role;

-- Optimize has_role_on_account to evaluate auth.uid() once
-- Convert to plpgsql to allow variable storage
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
  
  -- Check membership
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

  -- For personal accounts, check if user is the primary owner
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

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_role_on_account(uuid, varchar) TO authenticated, service_role;

-- Create optimized version for email_integrations that checks user_id
CREATE OR REPLACE FUNCTION public.is_current_user (
  user_id uuid
) 
RETURNS boolean 
LANGUAGE sql
STABLE
SET search_path = '' 
AS $$
  SELECT auth.uid() = is_current_user.user_id;
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user(uuid) TO authenticated, service_role;

-- Now update all RLS policies to use the optimized functions

-- ============================================
-- CLIENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "clients_insert" ON public.clients;
CREATE POLICY "clients_insert" ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.create'::public.app_permissions)
  );

DROP POLICY IF EXISTS "clients_update" ON public.clients;
CREATE POLICY "clients_update" ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  )
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "clients_delete" ON public.clients;
CREATE POLICY "clients_delete" ON public.clients
  FOR DELETE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.delete'::public.app_permissions)
  );

-- ============================================
-- SALES_PIPELINES TABLE
-- ============================================

DROP POLICY IF EXISTS "sales_pipelines_insert" ON public.sales_pipelines;
CREATE POLICY "sales_pipelines_insert" ON public.sales_pipelines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "sales_pipelines_update" ON public.sales_pipelines;
CREATE POLICY "sales_pipelines_update" ON public.sales_pipelines
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  )
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "sales_pipelines_delete" ON public.sales_pipelines;
CREATE POLICY "sales_pipelines_delete" ON public.sales_pipelines
  FOR DELETE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

-- ============================================
-- PIPELINE_STAGES TABLE
-- ============================================

DROP POLICY IF EXISTS "pipeline_stages_insert" ON public.pipeline_stages;
CREATE POLICY "pipeline_stages_insert" ON public.pipeline_stages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales_pipelines
      WHERE sales_pipelines.id = pipeline_stages.pipeline_id
      AND public.has_role_on_account(sales_pipelines.account_id)
      AND public.has_permission_for_current_user(sales_pipelines.account_id, 'clients.update'::public.app_permissions)
    )
  );

DROP POLICY IF EXISTS "pipeline_stages_update" ON public.pipeline_stages;
CREATE POLICY "pipeline_stages_update" ON public.pipeline_stages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_pipelines
      WHERE sales_pipelines.id = pipeline_stages.pipeline_id
      AND public.has_role_on_account(sales_pipelines.account_id)
      AND public.has_permission_for_current_user(sales_pipelines.account_id, 'clients.update'::public.app_permissions)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales_pipelines
      WHERE sales_pipelines.id = pipeline_stages.pipeline_id
      AND public.has_role_on_account(sales_pipelines.account_id)
      AND public.has_permission_for_current_user(sales_pipelines.account_id, 'clients.update'::public.app_permissions)
    )
  );

DROP POLICY IF EXISTS "pipeline_stages_delete" ON public.pipeline_stages;
CREATE POLICY "pipeline_stages_delete" ON public.pipeline_stages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_pipelines
      WHERE sales_pipelines.id = pipeline_stages.pipeline_id
      AND public.has_role_on_account(sales_pipelines.account_id)
      AND public.has_permission_for_current_user(sales_pipelines.account_id, 'clients.update'::public.app_permissions)
    )
  );

-- ============================================
-- AUTOMATION_SEQUENCES TABLE
-- ============================================

DROP POLICY IF EXISTS "automation_sequences_insert" ON public.automation_sequences;
CREATE POLICY "automation_sequences_insert" ON public.automation_sequences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "automation_sequences_update" ON public.automation_sequences;
CREATE POLICY "automation_sequences_update" ON public.automation_sequences
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  )
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "automation_sequences_delete" ON public.automation_sequences;
CREATE POLICY "automation_sequences_delete" ON public.automation_sequences
  FOR DELETE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

-- ============================================
-- AUTOMATION_RULES TABLE
-- ============================================

DROP POLICY IF EXISTS "automation_rules_insert" ON public.automation_rules;
CREATE POLICY "automation_rules_insert" ON public.automation_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "automation_rules_update" ON public.automation_rules;
CREATE POLICY "automation_rules_update" ON public.automation_rules
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  )
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "automation_rules_delete" ON public.automation_rules;
CREATE POLICY "automation_rules_delete" ON public.automation_rules
  FOR DELETE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

-- ============================================
-- EMAIL_INTEGRATIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "email_integrations_select" ON public.email_integrations;
CREATE POLICY "email_integrations_select" ON public.email_integrations
  FOR SELECT
  TO authenticated
  USING (
    public.is_current_user(user_id) OR public.has_role_on_account(account_id)
  );

DROP POLICY IF EXISTS "email_integrations_insert" ON public.email_integrations;
CREATE POLICY "email_integrations_insert" ON public.email_integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_current_user(user_id)
    AND public.has_role_on_account(account_id)
  );

DROP POLICY IF EXISTS "email_integrations_update" ON public.email_integrations;
CREATE POLICY "email_integrations_update" ON public.email_integrations
  FOR UPDATE
  TO authenticated
  USING (
    public.is_current_user(user_id)
    AND public.has_role_on_account(account_id)
  )
  WITH CHECK (
    public.is_current_user(user_id)
    AND public.has_role_on_account(account_id)
  );

DROP POLICY IF EXISTS "email_integrations_delete" ON public.email_integrations;
CREATE POLICY "email_integrations_delete" ON public.email_integrations
  FOR DELETE
  TO authenticated
  USING (
    public.is_current_user(user_id)
    AND public.has_role_on_account(account_id)
  );

-- ============================================
-- EMAIL_THREADS TABLE
-- ============================================

DROP POLICY IF EXISTS "email_threads_insert" ON public.email_threads;
CREATE POLICY "email_threads_insert" ON public.email_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "email_threads_update" ON public.email_threads;
CREATE POLICY "email_threads_update" ON public.email_threads
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  )
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "email_threads_delete" ON public.email_threads;
CREATE POLICY "email_threads_delete" ON public.email_threads
  FOR DELETE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.delete'::public.app_permissions)
  );

-- ============================================
-- EMAIL_MESSAGES TABLE
-- ============================================

DROP POLICY IF EXISTS "email_messages_update" ON public.email_messages;
CREATE POLICY "email_messages_update" ON public.email_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.email_threads
      WHERE email_threads.id = email_messages.thread_id
      AND public.has_role_on_account(email_threads.account_id)
      AND public.has_permission_for_current_user(email_threads.account_id, 'clients.update'::public.app_permissions)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.email_threads
      WHERE email_threads.id = email_messages.thread_id
      AND public.has_role_on_account(email_threads.account_id)
      AND public.has_permission_for_current_user(email_threads.account_id, 'clients.update'::public.app_permissions)
    )
  );

-- ============================================
-- DEALS TABLE
-- ============================================

DROP POLICY IF EXISTS "deals_insert" ON public.deals;
CREATE POLICY "deals_insert" ON public.deals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.create'::public.app_permissions)
  );

DROP POLICY IF EXISTS "deals_update" ON public.deals;
CREATE POLICY "deals_update" ON public.deals
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  )
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "deals_delete" ON public.deals;
CREATE POLICY "deals_delete" ON public.deals
  FOR DELETE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.delete'::public.app_permissions)
  );

-- ============================================
-- TASKS TABLE
-- ============================================

DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.create'::public.app_permissions)
  );

DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  )
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "tasks_delete" ON public.tasks;
CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.delete'::public.app_permissions)
  );

-- ============================================
-- CALENDAR_EVENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "calendar_events_insert" ON public.calendar_events;
CREATE POLICY "calendar_events_insert" ON public.calendar_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "calendar_events_update" ON public.calendar_events;
CREATE POLICY "calendar_events_update" ON public.calendar_events
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  )
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "calendar_events_delete" ON public.calendar_events;
CREATE POLICY "calendar_events_delete" ON public.calendar_events
  FOR DELETE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.delete'::public.app_permissions)
  );

-- ============================================
-- CLIENT_INTERACTIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "client_interactions_insert" ON public.client_interactions;
CREATE POLICY "client_interactions_insert" ON public.client_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "client_interactions_update" ON public.client_interactions;
CREATE POLICY "client_interactions_update" ON public.client_interactions
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  )
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

DROP POLICY IF EXISTS "client_interactions_delete" ON public.client_interactions;
CREATE POLICY "client_interactions_delete" ON public.client_interactions
  FOR DELETE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'clients.update'::public.app_permissions)
  );

-- ============================================
-- ACCOUNTS TABLE
-- ============================================

-- Optimize accounts_self_update policy
DROP POLICY IF EXISTS "accounts_self_update" ON public.accounts;
CREATE POLICY "accounts_self_update" ON public.accounts
  FOR UPDATE
  TO authenticated
  USING (
    public.is_current_user(primary_owner_user_id)
  )
  WITH CHECK (
    public.is_current_user(primary_owner_user_id)
  );
