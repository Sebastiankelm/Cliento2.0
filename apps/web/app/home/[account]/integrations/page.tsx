import { use } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { IntegrationsDashboard } from './_components/integrations-dashboard';

interface IntegrationsPageProps {
  params: Promise<{ account: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('integrations:integrations', { defaultValue: 'Integrations' });

  return {
    title,
  };
};

async function IntegrationsPage(props: IntegrationsPageProps) {
  const params = await props.params;
  const accountSlug = params.account;

  const { account } = use(loadTeamWorkspace(accountSlug));

  const canManage = account.permissions.includes('integrations.manage');

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={accountSlug}
        title={<Trans i18nKey={'integrations:integrations'} defaults={'Integrations'} />}
        description={<AppBreadcrumbs />}
      />
      <PageBody>
        <IntegrationsDashboard accountId={account.id} canManage={canManage} />
      </PageBody>
    </>
  );
}

export default withI18n(IntegrationsPage);
