import { use } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { AutomationDashboard } from './_components/automation-dashboard';

interface AutomationPageProps {
  params: Promise<{ account: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('automation:automation', { defaultValue: 'Automation' });

  return {
    title,
  };
};

async function AutomationPage(props: AutomationPageProps) {
  const params = await props.params;
  const accountSlug = params.account;

  const { account } = use(loadTeamWorkspace(accountSlug));

  const canManage = account.permissions.includes('automation.create');

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={accountSlug}
        title={<Trans i18nKey={'automation:automation'} defaults={'Automation'} />}
        description={<AppBreadcrumbs />}
      />
      <PageBody>
        <AutomationDashboard accountId={account.id} canManage={canManage} />
      </PageBody>
    </>
  );
}

export default withI18n(AutomationPage);
