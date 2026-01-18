import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '~/lib/database.types';

import { loadUserWorkspace } from '../load-user-workspace';

/**
 * Load dashboard data for personal account
 * Aggregates statistics from all team accounts the user has access to
 */
export const loadPersonalDashboard = cache(async () => {
  const client = getSupabaseServerClient();
  const workspace = await loadUserWorkspace();

  // Get all team accounts the user is a member of
  const { data: memberships, error: membershipsError } = await client
    .from('accounts_memberships')
    .select('account_id')
    .eq('user_id', workspace.user.id);

  if (membershipsError) {
    throw membershipsError;
  }

  const accountIds = memberships?.map((m) => m.account_id) ?? [];

  if (accountIds.length === 0) {
    return {
      totalClients: 0,
      totalTeamAccounts: 0,
      teamAccounts: [],
      statusCounts: {},
    };
  }

  // Get team account details
  const { data: accounts, error: accountsError } = await client
    .from('accounts')
    .select('id, name, slug, picture_url')
    .in('id', accountIds)
    .eq('is_personal_account', false);

  if (accountsError) {
    throw accountsError;
  }

  // Get aggregated client statistics from all team accounts
  const { data: clients, error: clientsError } = await client
    .from('clients')
    .select('status, account_id')
    .in('account_id', accountIds);

  if (clientsError) {
    throw clientsError;
  }

  // Calculate statistics per account
  const accountStats = (accounts ?? []).map((account) => {
    const accountClients = (clients ?? []).filter(
      (c) => c.account_id === account.id,
    );
    const statusCounts = accountClients.reduce(
      (acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      ...account,
      totalClients: accountClients.length,
      statusCounts,
    };
  });

  // Aggregate total statistics
  const totalClients = (clients ?? []).length;
  const statusCounts = (clients ?? []).reduce(
    (acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    totalClients,
    totalTeamAccounts: accounts?.length ?? 0,
    teamAccounts: accountStats,
    statusCounts,
  };
});
