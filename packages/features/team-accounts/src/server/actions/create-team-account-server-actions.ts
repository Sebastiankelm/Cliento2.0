'use server';

import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getLogger } from '@kit/shared/logger';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { CreateTeamSchema } from '../../schema/create-team.schema';
import { createAccountCreationPolicyEvaluator } from '../policies';
import { createCreateTeamAccountService } from '../services/create-team-account.service';

export const createTeamAccountAction = enhanceAction(
  async ({ name }, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();
    const service = createCreateTeamAccountService(client);

    const ctx = {
      name: 'team-accounts.create',
      userId: user.id,
      accountName: name,
    };

    logger.info(ctx, `Creating team account...`);

    // Check policies before creating
    const evaluator = createAccountCreationPolicyEvaluator();

    if (await evaluator.hasPoliciesForStage('submission')) {
      const policyContext = {
        timestamp: new Date().toISOString(),
        userId: user.id,
        accountName: name,
      };

      const result = await evaluator.canCreateAccount(
        policyContext,
        'submission',
      );

      if (!result.allowed) {
        logger.warn(
          { ...ctx, reasons: result.reasons },
          `Policy denied team account creation`,
        );

        return {
          error: true,
          message: result.reasons[0] ?? 'Policy denied account creation',
        };
      }
    }

    // Service throws on error, so no need to check for error
    const { data } = await service.createNewOrganizationAccount({
      name,
      userId: user.id,
    });

    logger.info(ctx, `Team account created`);

    const accountHomePath = '/home/' + data.slug;

    redirect(accountHomePath);
  },
  {
    schema: CreateTeamSchema,
  },
);
