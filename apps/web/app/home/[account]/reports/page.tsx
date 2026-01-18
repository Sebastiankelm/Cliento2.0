import { use } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { ReportsDashboard } from './_components/reports-dashboard';

interface ReportsPageProps {
  params: Promise<{ account: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('reports:reports', { defaultValue: 'Reports' });

  return {
    title,
  };
};

async function ReportsPage(props: ReportsPageProps) {
  const client = getSupabaseServerClient();
  const params = await props.params;
  const accountSlug = params.account;

  const { account } = use(loadTeamWorkspace(accountSlug));

  const canView = account.permissions.includes('reports.read');

  if (!canView) {
    return (
      <>
        <TeamAccountLayoutPageHeader
          account={accountSlug}
          title={<Trans i18nKey={'reports:reports'} defaults={'Reports'} />}
          description={<AppBreadcrumbs />}
        />
        <PageBody>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              You do not have permission to view reports.
            </p>
          </div>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={accountSlug}
        title={<Trans i18nKey={'reports:reports'} defaults={'Reports'} />}
        description={<AppBreadcrumbs />}
      />
      <PageBody>
        <ReportsDashboard accountId={account.id} />
      </PageBody>
    </>
  );
}

export default withI18n(ReportsPage);
