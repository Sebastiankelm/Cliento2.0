import { use } from 'react';

import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { ReportsDashboard } from '~/home/[account]/reports/_components/reports-dashboard';

import { HomeLayoutPageHeader } from '../_components/home-page-header';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('reports:reports', { defaultValue: 'Reports' });

  return {
    title,
  };
};

async function PersonalReportsPage() {
  const workspace = use(loadUserWorkspace());

  if (!workspace.workspace) {
    throw new Error('Workspace not found');
  }

  const account = workspace.workspace;

  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'reports:reports'} defaults={'Reports'} />}
        description={<AppBreadcrumbs />}
      />
      <PageBody>
        <ReportsDashboard accountId={account.id} />
      </PageBody>
    </>
  );
}

export default withI18n(PersonalReportsPage);
