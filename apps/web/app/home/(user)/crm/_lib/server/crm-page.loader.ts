import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '~/lib/database.types';

import { loadUserWorkspace } from '../../_lib/server/load-user-workspace';
import { loadClientsStats } from '~/home/[account]/clients/_lib/server/clients-page.loader';

/**
 * Load CRM statistics for personal account (organization)
 */
export async function loadPersonalAccountCRMStats() {
  const client = getSupabaseServerClient();
  const workspace = await loadUserWorkspace();

  if (!workspace || !workspace.workspace) {
    throw new Error('Workspace not found');
  }

  const accountId = workspace.workspace.id;

  // Use the existing loadClientsStats function
  const stats = await loadClientsStats(client, accountId);

  return stats;
}
