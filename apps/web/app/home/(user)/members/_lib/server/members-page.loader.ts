import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { Database } from '~/lib/database.types';

/**
 * Load data for the personal account members page
 * Personal account is the organization
 */
export async function loadPersonalAccountMembers(
  client: SupabaseClient<Database>,
  userId: string,
) {
  const workspace = await loadUserWorkspace();
  const accountId = workspace.workspace.id;

  return Promise.all([
    loadAccountMembers(client, accountId),
    loadInvitations(client, accountId),
    canAddMember(workspace),
    Promise.resolve({
      id: accountId,
      slug: null,
      primary_owner_user_id: userId,
      permissions: workspace.workspace.permissions || [],
      role_hierarchy_level: workspace.workspace.role_hierarchy_level || 0,
    }),
  ]);
}

/**
 * Check if the current user can add a member to the account
 * Only the primary owner (administrator) can add members
 */
async function canAddMember(workspace: Awaited<ReturnType<typeof loadUserWorkspace>>) {
  // Only the primary owner can add members
  return workspace.workspace.id === workspace.user.id;
}

/**
 * Load account members by account ID (for personal accounts)
 */
async function loadAccountMembers(
  client: SupabaseClient<Database>,
  accountId: string,
) {
  // Query memberships and join with accounts and roles manually
  const { data: memberships, error: membershipsError } = await client
    .from('accounts_memberships')
    .select('user_id, account_id, account_role, created_at, updated_at')
    .eq('account_id', accountId);

  if (membershipsError) {
    console.error(membershipsError);
    throw membershipsError;
  }

  if (!memberships || memberships.length === 0) {
    return [];
  }

  // Get account info
  const { data: account, error: accountError } = await client
    .from('accounts')
    .select('id, primary_owner_user_id')
    .eq('id', accountId)
    .single();

  if (accountError) {
    console.error(accountError);
    throw accountError;
  }

  // Get user accounts (for member details)
  const userIds = memberships.map((m) => m.user_id);
  const { data: userAccounts, error: userAccountsError } = await client
    .from('accounts')
    .select('id, name, email, picture_url')
    .in('id', userIds)
    .eq('is_personal_account', true);

  if (userAccountsError) {
    console.error(userAccountsError);
    throw userAccountsError;
  }

  // Get roles
  const roles = memberships.map((m) => m.account_role);
  const { data: rolesData, error: rolesError } = await client
    .from('roles')
    .select('name, hierarchy_level')
    .in('name', roles);

  if (rolesError) {
    console.error(rolesError);
    throw rolesError;
  }

  // Transform the data to match the expected format
  const rolesMap = new Map(rolesData?.map((r) => [r.name, r.hierarchy_level]) || []);
  const userAccountsMap = new Map(
    userAccounts?.map((ua) => [ua.id, ua]) || [],
  );

  return memberships.map((m) => {
    const userAccount = userAccountsMap.get(m.user_id);
    return {
      id: userAccount?.id || m.user_id,
      user_id: m.user_id,
      account_id: m.account_id,
      role: m.account_role,
      role_hierarchy_level: rolesMap.get(m.account_role) || 0,
      primary_owner_user_id: account?.primary_owner_user_id || null,
      name: userAccount?.name || '',
      email: userAccount?.email || '',
      picture_url: userAccount?.picture_url || null,
      created_at: m.created_at,
      updated_at: m.updated_at,
    };
  });
}

/**
 * Load account invitations by account ID (for personal accounts)
 */
async function loadInvitations(
  client: SupabaseClient<Database>,
  accountId: string,
) {
  const { data, error } = await client
    .from('accounts_invitations')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return data ?? [];
}
