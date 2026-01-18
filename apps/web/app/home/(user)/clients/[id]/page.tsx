import { use } from 'react';

import { redirect } from 'next/navigation';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';

import { HomeLayoutPageHeader } from '../../_components/home-page-header';
import { ClientDetails } from './_components/client-details';
import { loadClient } from './_lib/server/clients-page.loader';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('clients:clientDetails', { defaultValue: 'Client Details' });

  return {
    title,
  };
};

async function PersonalClientDetailPage(props: ClientDetailPageProps) {
  const client = getSupabaseServerClient();
  const params = await props.params;
  const clientId = params.id;
  const workspace = use(loadUserWorkspace());

  const account = workspace.workspace;

  // Load client details
  const clientData = await loadClient(client, clientId);

  // Verify client belongs to the account (RLS should handle this, but double-check)
  if (clientData.account_id !== account.id) {
    redirect('/home/clients');
  }

  const canUpdate = account.permissions?.includes('clients.update') ?? false;
  const canDelete = account.permissions?.includes('clients.delete') ?? false;

  return (
    <>
      <HomeLayoutPageHeader
        title={
          <Trans
            i18nKey={'clients:clientDetails'}
            defaults={'Client Details'}
          />
        }
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <ClientDetails
          client={clientData}
          accountId={account.id}
          accountSlug={account.id}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </PageBody>
    </>
  );
}

export default withI18n(PersonalClientDetailPage);
