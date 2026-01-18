import { use } from 'react';

import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

// local imports
import { HomeLayoutPageHeader } from './_components/home-page-header';
import { PersonalDashboard } from './_components/personal-dashboard';
import { loadPersonalDashboard } from './_lib/server/personal-dashboard.loader';
import { loadUserWorkspace } from './_lib/server/load-user-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('common:routes.dashboard', { defaultValue: 'Dashboard' });

  return {
    title,
  };
};

function UserHomePage() {
  const dashboardData = use(loadPersonalDashboard());
  const workspace = use(loadUserWorkspace());

  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'common:routes.dashboard'} defaults={'Dashboard'} />}
        description={
          <Trans
            i18nKey={'dashboard:overview'}
            defaults={'Overview of your organization and clients'}
          />
        }
      />

      <PageBody>
        <PersonalDashboard data={dashboardData} />
      </PageBody>
    </>
  );
}

export default withI18n(UserHomePage);
