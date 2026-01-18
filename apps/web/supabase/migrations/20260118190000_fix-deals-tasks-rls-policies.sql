/*
 * -------------------------------------------------------
 * Migration: Fix RLS Policies for Deals and Tasks
 * 
 * This migration fixes RLS policies for deals and tasks tables:
 * 1. Adds missing SELECT policies
 * 2. Fixes incorrect permission checks (uses deals.* and tasks.* instead of clients.*)
 * 3. Adds SELECT policies for sales_pipelines and pipeline_stages
 * 
 * ⚠️ IMPORTANT: Run this migration in Supabase Dashboard SQL Editor
 * -------------------------------------------------------
 */

-- ============================================
-- DEALS TABLE - Fix RLS Policies
-- ============================================

-- Add missing SELECT policy
DROP POLICY IF EXISTS "deals_select" ON public.deals;
CREATE POLICY "deals_select" ON public.deals
  FOR SELECT
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'deals.read'::public.app_permissions)
  );

-- Fix INSERT policy
DROP POLICY IF EXISTS "deals_insert" ON public.deals;
CREATE POLICY "deals_insert" ON public.deals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'deals.create'::public.app_permissions)
  );

-- Fix UPDATE policy
DROP POLICY IF EXISTS "deals_update" ON public.deals;
CREATE POLICY "deals_update" ON public.deals
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'deals.update'::public.app_permissions)
  )
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'deals.update'::public.app_permissions)
  );

-- Fix DELETE policy
DROP POLICY IF EXISTS "deals_delete" ON public.deals;
CREATE POLICY "deals_delete" ON public.deals
  FOR DELETE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'deals.delete'::public.app_permissions)
  );

-- ============================================
-- TASKS TABLE - Fix RLS Policies
-- ============================================

-- Add missing SELECT policy
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'tasks.read'::public.app_permissions)
  );

-- Fix INSERT policy
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'tasks.create'::public.app_permissions)
  );

-- Fix UPDATE policy
DROP POLICY IF EXISTS "tasks_update" ON public.tasks;
CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'tasks.update'::public.app_permissions)
  )
  WITH CHECK (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'tasks.update'::public.app_permissions)
  );

-- Fix DELETE policy
DROP POLICY IF EXISTS "tasks_delete" ON public.tasks;
CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'tasks.delete'::public.app_permissions)
  );

-- ============================================
-- SALES_PIPELINES TABLE - Add SELECT Policy
-- ============================================

DROP POLICY IF EXISTS "sales_pipelines_select" ON public.sales_pipelines;
CREATE POLICY "sales_pipelines_select" ON public.sales_pipelines
  FOR SELECT
  TO authenticated
  USING (
    public.has_role_on_account(account_id)
    AND public.has_permission_for_current_user(account_id, 'deals.read'::public.app_permissions)
  );

-- ============================================
-- PIPELINE_STAGES TABLE - Add SELECT Policy
-- ============================================

DROP POLICY IF EXISTS "pipeline_stages_select" ON public.pipeline_stages;
CREATE POLICY "pipeline_stages_select" ON public.pipeline_stages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_pipelines
      WHERE sales_pipelines.id = pipeline_stages.pipeline_id
      AND public.has_role_on_account(sales_pipelines.account_id)
      AND public.has_permission_for_current_user(sales_pipelines.account_id, 'deals.read'::public.app_permissions)
    )
  );
