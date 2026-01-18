import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Database } from '~/lib/database.types';

import { loadUserWorkspace } from '../../../_lib/server/load-user-workspace';
import { loadClientsStats } from '~/home/[account]/clients/_lib/server/clients-page.loader';

/**
 * Load CRM statistics for personal account (organization)
 */
export async function loadPersonalAccountCRMStats() {
  const client = getSupabaseServerClient();
  
  let workspace;
  try {
    workspace = await loadUserWorkspace();
  } catch (error) {
    console.error('Failed to load user workspace:', error);
    throw error;
  }

  if (!workspace || !workspace.workspace) {
    console.error('Workspace not found:', { workspace });
    throw new Error('Workspace not found');
  }

  const accountId = workspace.workspace.id;

  try {
    // Use the existing loadClientsStats function
    const stats = await loadClientsStats(client, accountId);
    return stats;
  } catch (error) {
    // Log detailed error information
    console.error('Failed to load CRM stats:', {
      error: error instanceof Error ? error.message : String(error),
      accountId,
    });
    
    // Return empty stats instead of crashing
    // This allows the page to render even if there's an RLS or database issue
    return {
      totalCount: 0,
      statusCounts: {},
      sourceCounts: {},
      recentClients: [],
    };
  }
}
