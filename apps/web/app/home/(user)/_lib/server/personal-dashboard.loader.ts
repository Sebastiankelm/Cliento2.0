import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '~/lib/database.types';

import { loadUserWorkspace } from './load-user-workspace';

/**
 * Load dashboard data for personal account (organization)
 * Personal account is the organization - shows statistics for the user's organization
 */
export const loadPersonalDashboard = cache(async () => {
  const client = getSupabaseServerClient();
  const workspace = await loadUserWorkspace();

  // Personal account is the organization
  const organizationAccountId = workspace.workspace.id;

  // Get client statistics for the organization (personal account)
  // Handle case where clients table might not exist yet (migrations not applied)
  const { data: clients, error: clientsError } = await client
    .from('clients')
    .select('status, account_id')
    .eq('account_id', organizationAccountId);

  // If clients table doesn't exist or there's an error, return empty stats
  // This allows the dashboard to render even if migrations haven't been applied
  if (clientsError) {
    // Check if error is due to missing table (42P01) or permission (42501)
    // In production, we'll just return empty data to allow graceful degradation
    console.warn('Error loading clients data:', clientsError.message);
    return {
      totalClients: 0,
      statusCounts: {},
    };
  }

  // Calculate status counts
  const statusCounts = (clients ?? []).reduce(
    (acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalClients: (clients ?? []).length,
    statusCounts,
  };
});
