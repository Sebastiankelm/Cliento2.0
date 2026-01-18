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
  const workspace = await loadUserWorkspace();

  if (!workspace.workspace || !workspace.workspace.id) {
    throw new Error('Workspace not found or account ID is missing');
  }

  const account = workspace.workspace;
  const accountId = account.id;

  // Load pipelines and default pipeline
  let pipelines: Awaited<ReturnType<typeof loadPipelines>> = [];
  let defaultPipeline: Awaited<ReturnType<typeof loadDefaultPipeline>> = null;

  // Use Promise.allSettled to handle errors gracefully
  const [pipelinesResult, defaultPipelineResult] = await Promise.allSettled([
    loadPipelines(client, accountId),
    loadDefaultPipeline(client, accountId),
  ]);

  if (pipelinesResult.status === 'fulfilled') {
    pipelines = pipelinesResult.value;
  } else {
    console.error('Error loading pipelines:', {
      error: pipelinesResult.reason,
      message: pipelinesResult.reason?.message,
      code: pipelinesResult.reason?.code,
      details: pipelinesResult.reason?.details,
      hint: pipelinesResult.reason?.hint,
    });
  }

  if (defaultPipelineResult.status === 'fulfilled') {
    defaultPipeline = defaultPipelineResult.value;
  } else {
    // PGRST116 is "not found" - that's ok
    if (defaultPipelineResult.reason?.code === 'PGRST116') {
      defaultPipeline = null;
    } else {
      console.error('Error loading default pipeline:', {
        error: defaultPipelineResult.reason,
        message: defaultPipelineResult.reason?.message,
        code: defaultPipelineResult.reason?.code,
      });
    }
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
  // Use Promise.allSettled to handle errors gracefully without breaking the page
  let deals: Awaited<ReturnType<typeof loadDeals>>['deals'] = [];
  let clients: Awaited<ReturnType<typeof loadClients>>['clients'] = [];

  const [dealsResult, clientsResult] = await Promise.allSettled([
    loadDeals(client, accountId, {
      pipelineId: selectedPipelineId,
    }),
    loadClients(client, accountId),
  ]);

  if (dealsResult.status === 'fulfilled') {
    deals = dealsResult.value.deals;
  } else {
    console.error('Error loading deals:', {
      error: dealsResult.reason,
      message: dealsResult.reason?.message,
      code: dealsResult.reason?.code,
      details: dealsResult.reason?.details,
      hint: dealsResult.reason?.hint,
    });
  }

  if (clientsResult.status === 'fulfilled') {
    clients = clientsResult.value.clients;
  } else {
    console.error('Error loading clients:', {
      error: clientsResult.reason,
      message: clientsResult.reason?.message,
      code: clientsResult.reason?.code,
    });
  }

  // Ensure pipeline has stages array and is serializable
  // Create a clean, serializable object for the client component
  const pipelineWithStages = {
    id: selectedPipeline.id,
    name: selectedPipeline.name || '',
    description: selectedPipeline.description || null,
    is_default: selectedPipeline.is_default ?? false,
    is_active: selectedPipeline.is_active ?? true,
    account_id: selectedPipeline.account_id,
    created_at: selectedPipeline.created_at,
    updated_at: selectedPipeline.updated_at,
    created_by: selectedPipeline.created_by || null,
    updated_by: selectedPipeline.updated_by || null,
    stages: Array.isArray(selectedPipeline.stages) 
      ? selectedPipeline.stages.map(stage => ({
          id: stage.id,
          pipeline_id: stage.pipeline_id,
          name: stage.name || '',
          description: stage.description || null,
          position: stage.position ?? 0,
          color: stage.color || null,
          probability_percent: stage.probability_percent || null,
          is_closed: stage.is_closed ?? false,
          is_lost: stage.is_lost ?? false,
          created_at: stage.created_at,
          updated_at: stage.updated_at,
          created_by: stage.created_by || null,
          updated_by: stage.updated_by || null,
        }))
      : [],
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
          accountId={accountId}
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
