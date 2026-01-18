import { cache } from 'react';

import { createAccountsApi } from '@kit/accounts/api';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { createAccountCreationPolicyEvaluator } from '@kit/team-accounts/policies';

import featureFlagsConfig from '~/config/feature-flags.config';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

const shouldLoadAccounts = featureFlagsConfig.enableTeamAccounts;

export type UserWorkspace = Awaited<ReturnType<typeof loadUserWorkspace>>;

/**
 * @name loadUserWorkspace
 * @description
 * Load the user workspace data. It's a cached per-request function that fetches the user workspace data.
 * It can be used across the server components to load the user workspace data.
 */
export const loadUserWorkspace = cache(workspaceLoader);

async function workspaceLoader() {
  const client = getSupabaseServerClient();
  const api = createAccountsApi(client);

  const accountsPromise = shouldLoadAccounts
    ? () => api.loadUserAccounts()
    : () => Promise.resolve([]);

  // Use Promise.allSettled to handle errors gracefully
  const [accountsResult, workspaceResult, userResult] = await Promise.allSettled([
    accountsPromise(),
    api.getAccountWorkspace(),
    requireUserInServerComponent(),
  ]);

  // Handle accounts
  let accounts: Awaited<ReturnType<typeof api.loadUserAccounts>> = [];
  if (accountsResult.status === 'fulfilled') {
    accounts = accountsResult.value;
  } else {
    console.error('Error loading accounts:', accountsResult.reason);
  }

  // Handle workspace - this is critical, so if it fails, we need to handle it
  let workspace: Awaited<ReturnType<typeof api.getAccountWorkspace>> | null = null;
  if (workspaceResult.status === 'fulfilled') {
    workspace = workspaceResult.value;
  } else {
    console.error('Error loading workspace:', {
      error: workspaceResult.reason,
      message: workspaceResult.reason?.message,
      code: workspaceResult.reason?.code,
      details: workspaceResult.reason?.details,
      hint: workspaceResult.reason?.hint,
    });
    // If workspace fails, we can't continue - throw error
    throw new Error(`Failed to load workspace: ${workspaceResult.reason?.message || 'Unknown error'}`);
  }

  // Handle user
  let user: Awaited<ReturnType<typeof requireUserInServerComponent>>;
  if (userResult.status === 'fulfilled') {
    user = userResult.value;
  } else {
    console.error('Error loading user:', userResult.reason);
    throw new Error(`Failed to load user: ${userResult.reason?.message || 'Unknown error'}`);
  }

  // Check if user can create team accounts (policy check)
  const canCreateTeamAccount = shouldLoadAccounts
    ? await checkCanCreateTeamAccount(user.id)
    : { allowed: false, reason: undefined };

  return {
    accounts,
    workspace,
    user,
    canCreateTeamAccount,
  };
}

/**
 * Check if the user can create a team account based on policies.
 * Preliminary checks run without account name - name validation happens during submission.
 */
async function checkCanCreateTeamAccount(userId: string) {
  const evaluator = createAccountCreationPolicyEvaluator();
  const hasPolicies = await evaluator.hasPoliciesForStage('preliminary');

  if (!hasPolicies) {
    return { allowed: true, reason: undefined };
  }

  const context = {
    timestamp: new Date().toISOString(),
    userId,
    accountName: '',
  };

  const result = await evaluator.canCreateAccount(context, 'preliminary');

  return {
    allowed: result.allowed,
    reason: result.reasons[0],
  };
}
