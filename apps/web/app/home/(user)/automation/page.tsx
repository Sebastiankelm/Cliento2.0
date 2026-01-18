import { use } from 'react';

import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { AutomationDashboard } from '~/home/[account]/automation/_components/automation-dashboard';

import { HomeLayoutPageHeader } from '../_components/home-page-header';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('automation:automation', { defaultValue: 'Automation' });

  return {
    title,
  };
};

async function PersonalAutomationPage() {
  const workspace = use(loadUserWorkspace());

  if (!workspace.workspace || !workspace.workspace.id) {
    throw new Error('Workspace not found or account ID is missing');
  }

  const account = workspace.workspace;
  const accountId = account.id;

  // For personal accounts, user is owner so has all permissions
  const canManage = true;

  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'automation:automation'} defaults={'Automation'} />}
        description={<AppBreadcrumbs />}
      />
      <PageBody>
        <AutomationDashboard accountId={accountId} canManage={canManage} />
      </PageBody>
    </>
  );
}

export default withI18n(PersonalAutomationPage);
