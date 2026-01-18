import { NextResponse } from 'next/server';

import { enhanceRouteHandler } from '@kit/next/routes';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import {
  createInvitationContextBuilder,
  createInvitationsPolicyEvaluator,
} from '@kit/team-accounts/policies';

import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';

export const GET = enhanceRouteHandler(
  async function ({ user }) {
    const client = getSupabaseServerClient();
    const workspace = await loadUserWorkspace();
    const accountId = workspace.workspace.id;

    try {
      // Evaluate with standard evaluator
      const evaluator = createInvitationsPolicyEvaluator();
      const hasPolicies = await evaluator.hasPoliciesForStage('preliminary');

      if (!hasPolicies) {
        return NextResponse.json({
          allowed: true,
          reasons: [],
          metadata: {
            policiesEvaluated: 0,
            timestamp: new Date().toISOString(),
            noPoliciesConfigured: true,
          },
        });
      }

      // Build context for policy evaluation (empty invitations for testing)
      // For personal accounts, we use account ID as slug (temporary workaround)
      const contextBuilder = createInvitationContextBuilder(client);

      const context = await contextBuilder.buildContextWithAccountId(
        {
          invitations: [],
          accountSlug: accountId, // Use account ID as slug for personal accounts
        },
        user,
        accountId,
      );

      // validate against policies
      const result = await evaluator.canInvite(context, 'preliminary');

      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json(
        {
          allowed: false,
          reasons: [
            error instanceof Error ? error.message : 'Unknown error occurred',
          ],
          metadata: {
            error: true,
            originalError:
              error instanceof Error ? error.message : String(error),
          },
        },
        { status: 500 },
      );
    }
  },
  {
    auth: true,
  },
);
