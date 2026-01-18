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
  // Query memberships directly since personal accounts don't have slugs
  const { data: memberships, error: membershipsError } = await client
    .from('accounts_memberships')
    .select(
      `
      user_id,
      account_id,
      account_role,
      created_at,
      updated_at,
      accounts!accounts_memberships_account_id_fkey (
        id,
        primary_owner_user_id
      ),
      accounts!accounts_memberships_user_id_fkey (
        id,
        name,
        email,
        picture_url
      ),
      roles!accounts_memberships_account_role_fkey (
        name,
        hierarchy_level
      )
    `,
    )
    .eq('account_id', accountId);

  if (membershipsError) {
    console.error(membershipsError);
    throw membershipsError;
  }

  // Transform the data to match the expected format
  return (
    memberships?.map((m: any) => ({
      id: m.accounts?.id || m.user_id,
      user_id: m.user_id,
      account_id: m.account_id,
      role: m.account_role,
      role_hierarchy_level: m.roles?.hierarchy_level || 0,
      primary_owner_user_id: m.accounts?.primary_owner_user_id,
      name: m.accounts?.name || '',
      email: m.accounts?.email || '',
      picture_url: m.accounts?.picture_url || null,
      created_at: m.created_at,
      updated_at: m.updated_at,
    })) || []
  );
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
