import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { HomeLayoutPageHeader } from '../_components/home-page-header';
import { CRMDashboard } from '~/home/[account]/_components/crm-dashboard';
import { loadPersonalAccountCRMStats } from './_lib/server/crm-page.loader';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('common:routes.crm', { defaultValue: 'CRM Dashboard' });

  return {
    title,
  };
};

async function PersonalAccountCRMPage() {
  let stats;
  try {
    stats = await loadPersonalAccountCRMStats();
  } catch (error) {
    console.error('Failed to load CRM stats in page:', error);
    // Return empty stats to allow graceful degradation
    stats = {
      totalCount: 0,
      statusCounts: {},
      sourceCounts: {},
      recentClients: [],
    };
  }

  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'common:routes.crm'} defaults={'CRM Dashboard'} />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <CRMDashboard stats={stats} />
      </PageBody>
    </>
  );
}

export default withI18n(PersonalAccountCRMPage);
