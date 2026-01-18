import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

/**
 * Load deals for an account with optional filtering
 */
export async function loadDeals(
  client: SupabaseClient<Database>,
  accountId: string,
  options?: {
    pipelineId?: string;
    stageId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  },
) {
  let query = client
    .from('deals')
    .select(
      `
      *,
      client:clients(id, first_name, last_name, email, company),
      stage:pipeline_stages(id, name, position, color, is_closed, is_lost),
      pipeline:sales_pipelines(id, name)
    `,
      { count: 'exact' },
    )
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

  if (options?.pipelineId) {
    query = query.eq('pipeline_id', options.pipelineId);
  }

  if (options?.stageId) {
    query = query.eq('stage_id', options.stageId);
  }

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 10) - 1,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    deals: data ?? [],
    totalCount: count ?? 0,
  };
}

/**
 * Load a single deal by ID
 */
export async function loadDeal(
  client: SupabaseClient<Database>,
  dealId: string,
) {
  const { data, error } = await client
    .from('deals')
    .select(
      `
      *,
      client:clients(*),
      stage:pipeline_stages(*),
      pipeline:sales_pipelines(*)
    `,
    )
    .eq('id', dealId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Load pipelines for an account
 */
export async function loadPipelines(
  client: SupabaseClient<Database>,
  accountId: string,
) {
  const { data, error } = await client
    .from('sales_pipelines')
    .select(
      `
      *,
      stages:pipeline_stages(*)
    `,
    )
    .eq('account_id', accountId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Load default pipeline for an account
 */
export async function loadDefaultPipeline(
  client: SupabaseClient<Database>,
  accountId: string,
) {
  const { data, error } = await client
    .from('sales_pipelines')
    .select(
      `
      *,
      stages:pipeline_stages(*)
    `,
    )
    .eq('account_id', accountId)
    .eq('is_active', true)
    .eq('is_default', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" - that's ok, we'll create a default
    throw error;
  }

  return data;
}
