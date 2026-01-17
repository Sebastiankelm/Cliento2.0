import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

/**
 * Load clients for an account with optional filtering
 */
export async function loadClients(
  client: SupabaseClient<Database>,
  accountId: string,
  options?: {
    status?: string;
    limit?: number;
    offset?: number;
  },
) {
  let query = client
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

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
    clients: data ?? [],
    totalCount: count ?? 0,
  };
}

/**
 * Load client statistics for dashboard
 */
export async function loadClientsStats(
  client: SupabaseClient<Database>,
  accountId: string,
) {
  // Get total count
  const { count: totalCount, error: totalError } = await client
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('account_id', accountId);

  if (totalError) throw totalError;

  // Get count by status
  const { data: statusData, error: statusError } = await client
    .from('clients')
    .select('status')
    .eq('account_id', accountId);

  if (statusError) throw statusError;

  const statusCounts = (statusData ?? []).reduce(
    (acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get count by source
  const { data: sourceData, error: sourceError } = await client
    .from('clients')
    .select('source')
    .eq('account_id', accountId);

  if (sourceError) throw sourceError;

  const sourceCounts = (sourceData ?? [])
    .filter((c) => c.source)
    .reduce(
      (acc, client) => {
        acc[client.source!] = (acc[client.source!] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

  // Get recent clients (last 5)
  const { data: recentClients, error: recentError } = await client
    .from('clients')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentError) throw recentError;

  return {
    totalCount: totalCount ?? 0,
    statusCounts,
    sourceCounts,
    recentClients: recentClients ?? [],
  };
}

/**
 * Load a single client by ID
 */
export async function loadClient(
  client: SupabaseClient<Database>,
  clientId: string,
) {
  const { data, error } = await client
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
