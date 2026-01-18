import { use } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { loadClients } from '../clients/_lib/server/clients-page.loader';
import { DealsPipelineView } from './_components/deals-pipeline-view';
import { loadPipelines, loadDeals, loadDefaultPipeline } from './_lib/server/deals-page.loader';

interface DealsPageProps {
  params: Promise<{ account: string }>;
  searchParams: Promise<{ pipeline?: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('deals:deals', { defaultValue: 'Deals' });

  return {
    title,
  };
};

async function DealsPage(props: DealsPageProps) {
  const client = getSupabaseServerClient();
  const params = await props.params;
  const searchParams = await props.searchParams;
  const accountSlug = params.account;

  const { account } = use(loadTeamWorkspace(accountSlug));

  // Load pipelines and default pipeline
  const [pipelines, defaultPipeline] = await Promise.all([
    loadPipelines(client, account.id),
    loadDefaultPipeline(client, account.id),
  ]);

  // Use selected pipeline or default
  const selectedPipelineId = searchParams.pipeline || defaultPipeline?.id || pipelines[0]?.id;

  if (!selectedPipelineId) {
    // No pipeline exists - show message to create one
    return (
      <>
        <TeamAccountLayoutPageHeader
          account={accountSlug}
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

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId) || defaultPipeline;

  // Load deals and clients for the selected pipeline
  const [{ deals }, { clients }] = await Promise.all([
    loadDeals(client, account.id, {
      pipelineId: selectedPipelineId,
    }),
    loadClients(client, account.id),
  ]);

  const canCreate = account.permissions.includes('clients.create');
  const canUpdate = account.permissions.includes('clients.update');
  const canDelete = account.permissions.includes('clients.delete');

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={accountSlug}
        title={<Trans i18nKey={'deals:deals'} defaults={'Deals'} />}
        description={<AppBreadcrumbs />}
      />
      <PageBody>
        <DealsPipelineView
          pipeline={selectedPipeline!}
          pipelines={pipelines}
          deals={deals}
          clients={clients}
          accountId={account.id}
          accountSlug={accountSlug}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </PageBody>
    </>
  );
}

export default withI18n(DealsPage);
