import { use } from 'react';

import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { IntegrationsDashboard } from '~/home/[account]/integrations/_components/integrations-dashboard';

import { HomeLayoutPageHeader } from '../_components/home-page-header';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('integrations:integrations', {
    defaultValue: 'Integrations',
  });

  return {
    title,
  };
};

async function PersonalIntegrationsPage() {
  const workspace = use(loadUserWorkspace());

  if (!workspace.workspace) {
    throw new Error('Workspace not found');
  }

  const account = workspace.workspace;

  // For personal accounts, user is owner so has all permissions
  const canManage = true;

  return (
    <>
      <HomeLayoutPageHeader
        title={
          <Trans
            i18nKey={'integrations:integrations'}
            defaults={'Integrations'}
          />
        }
        description={<AppBreadcrumbs />}
      />
      <PageBody>
        <IntegrationsDashboard accountId={account.id} canManage={canManage} />
      </PageBody>
    </>
  );
}

export default withI18n(PersonalIntegrationsPage);
