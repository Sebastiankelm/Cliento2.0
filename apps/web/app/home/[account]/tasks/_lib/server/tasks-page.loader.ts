import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/lib/database.types';

/**
 * Load tasks for an account
 */
export async function loadTasks(
  client: SupabaseClient<Database>,
  accountId: string,
  options?: {
    status?: string;
    assignedTo?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    limit?: number;
    offset?: number;
  },
) {
  let query = client
    .from('tasks')
    .select(
      `
      *,
      client:clients(id, first_name, last_name),
      deal:deals(id, name)
    `,
      { count: 'exact' },
    )
    .eq('account_id', accountId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.assignedTo) {
    query = query.eq('assigned_to', options.assignedTo);
  }

  if (options?.dueDateFrom) {
    query = query.gte('due_date', options.dueDateFrom);
  }

  if (options?.dueDateTo) {
    query = query.lte('due_date', options.dueDateTo);
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
    tasks: data ?? [],
    totalCount: count ?? 0,
  };
}
