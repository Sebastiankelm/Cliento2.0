import { use } from 'react';

import { redirect } from 'next/navigation';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';

import { TeamAccountLayoutPageHeader } from '../../_components/team-account-layout-page-header';
import { ClientDetails } from '../_components/client-details';
import {
  loadClient,
  loadCustomFields,
  loadClientCustomFieldValues,
  loadClientInteractions,
} from '../_lib/server/clients-page.loader';

interface ClientDetailPageProps {
  params: Promise<{ account: string; id: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('clients:clientDetails', { defaultValue: 'Client Details' });

  return {
    title,
  };
};

async function ClientDetailPage(props: ClientDetailPageProps) {
  const client = getSupabaseServerClient();
  const params = await props.params;
  const accountSlug = params.account;
  const clientId = params.id;

  const { account } = use(loadTeamWorkspace(accountSlug));

  // Load client details
  const clientData = await loadClient(client, clientId);

  // Verify client belongs to the account (RLS should handle this, but double-check)
  if (clientData.account_id !== account.id) {
    redirect(`/home/${accountSlug}/clients`);
  }

  // Load custom fields and interactions
  const [customFields, fieldValues, interactions] = await Promise.all([
    loadCustomFields(client, account.id),
    loadClientCustomFieldValues(client, clientId),
    loadClientInteractions(client, clientId, { limit: 50 }),
  ]);

  const canUpdate = account.permissions.includes('clients.update');
  const canDelete = account.permissions.includes('clients.delete');

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={accountSlug}
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
          accountSlug={accountSlug}
          canUpdate={canUpdate}
          canDelete={canDelete}
          customFields={customFields}
          fieldValues={fieldValues}
          interactions={interactions}
        />
      </PageBody>
    </>
  );
}

export default withI18n(ClientDetailPage);
