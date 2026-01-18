import { use } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { loadClients } from '~/home/[account]/clients/_lib/server/clients-page.loader';
import { DealsPipelineView } from '~/home/[account]/deals/_components/deals-pipeline-view';
import {
  loadPipelines,
  loadDeals,
  loadDefaultPipeline,
} from '~/home/[account]/deals/_lib/server/deals-page.loader';

import { HomeLayoutPageHeader } from '../_components/home-page-header';

interface DealsPageProps {
  searchParams: Promise<{ pipeline?: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('deals:deals', { defaultValue: 'Deals' });

  return {
    title,
  };
};

async function PersonalDealsPage(props: DealsPageProps) {
  const client = getSupabaseServerClient();
  const searchParams = await props.searchParams;
  const workspace = use(loadUserWorkspace());

  if (!workspace.workspace) {
    throw new Error('Workspace not found');
  }

  const account = workspace.workspace;

  // Load pipelines and default pipeline
  let pipelines: Awaited<ReturnType<typeof loadPipelines>> = [];
  let defaultPipeline: Awaited<ReturnType<typeof loadDefaultPipeline>> = null;

  try {
    [pipelines, defaultPipeline] = await Promise.all([
      loadPipelines(client, account.id).catch((err) => {
        // Log full error for debugging
        console.error('Error loading pipelines:', {
          error: err,
          message: err?.message,
          code: err?.code,
          details: err?.details,
          hint: err?.hint,
        });
        return [];
      }),
      loadDefaultPipeline(client, account.id).catch((err) => {
        // PGRST116 is "not found" - that's ok
        if (err?.code === 'PGRST116') {
          return null;
        }
        console.error('Error loading default pipeline:', {
          error: err,
          message: err?.message,
          code: err?.code,
        });
        return null;
      }),
    ]);
  } catch (error) {
    console.error('Unexpected error loading pipelines:', error);
    // Continue with empty pipelines
  }

  // Use selected pipeline or default
  const selectedPipelineId =
    searchParams.pipeline || defaultPipeline?.id || pipelines[0]?.id;

  if (!selectedPipelineId) {
    // No pipeline exists - show message to create one
    return (
      <>
        <HomeLayoutPageHeader
          title={<Trans i18nKey={'deals:deals'} defaults={'Deals'} />}
          description={<AppBreadcrumbs />}
        />
        <PageBody>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No sales pipeline configured. Please create a pipeline first.
            </p>
          </div>
        </PageBody>
      </>
    );
  }

  const selectedPipeline =
    pipelines.find((p) => p.id === selectedPipelineId) || defaultPipeline;

  if (!selectedPipeline) {
    return (
      <>
        <HomeLayoutPageHeader
          title={<Trans i18nKey={'deals:deals'} defaults={'Deals'} />}
          description={<AppBreadcrumbs />}
        />
        <PageBody>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No sales pipeline configured. Please create a pipeline first.
            </p>
          </div>
        </PageBody>
      </>
    );
  }

  // Load deals and clients for the selected pipeline
  let deals: Awaited<ReturnType<typeof loadDeals>>['deals'] = [];
  let clients: Awaited<ReturnType<typeof loadClients>>['clients'] = [];

  try {
    const [dealsResult, clientsResult] = await Promise.all([
      loadDeals(client, account.id, {
        pipelineId: selectedPipelineId,
      }).catch((err) => {
        console.error('Error loading deals:', {
          error: err,
          message: err?.message,
          code: err?.code,
          details: err?.details,
          hint: err?.hint,
        });
        return { deals: [], totalCount: 0 };
      }),
      loadClients(client, account.id).catch((err) => {
        console.error('Error loading clients:', {
          error: err,
          message: err?.message,
          code: err?.code,
        });
        return { clients: [], totalCount: 0 };
      }),
    ]);
    deals = dealsResult.deals;
    clients = clientsResult.clients;
  } catch (error) {
    console.error('Unexpected error loading deals or clients:', error);
    // Continue with empty arrays
  }

  // Ensure pipeline has stages array
  const pipelineWithStages = {
    ...selectedPipeline,
    stages: selectedPipeline.stages || [],
  };

  // For personal accounts, user is owner so has all permissions
  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;

  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'deals:deals'} defaults={'Deals'} />}
        description={<AppBreadcrumbs />}
      />
      <PageBody>
        <DealsPipelineView
          pipeline={pipelineWithStages}
          pipelines={pipelines}
          deals={deals}
          clients={clients}
          accountId={account.id}
          accountSlug=""
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </PageBody>
    </>
  );
}

export default withI18n(PersonalDealsPage);
