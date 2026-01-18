import { Suspense, use } from 'react';

import { ServerDataLoader } from '@makerkit/data-loader-supabase-nextjs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { ClientsTable } from './_components/clients-table';
import { NewClientDialog } from './_components/new-client-dialog';
import { ClientsFilters } from './_components/clients-filters';

interface SearchParams {
  page?: string;
  query?: string;
  status?: string;
}

interface ClientsPageProps {
  params: Promise<{ account: string }>;
  searchParams: Promise<SearchParams>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('clients:pageTitle', { defaultValue: 'Clients' });

  return {
    title,
  };
};

async function ClientsPage(props: ClientsPageProps) {
  const client = getSupabaseServerClient();
  const accountSlug = (await props.params).account;
  const searchParams = await props.searchParams;

  const { account, user } = use(loadTeamWorkspace(accountSlug));

  const page = parseInt(searchParams.page ?? '1', 10);
  const query = searchParams.query ?? '';
  const status = searchParams.status ?? '';

  const canCreateClients = account.permissions.includes('clients.create');
  const canManageClients = account.permissions.includes('clients.manage');

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={accountSlug}
        title={<Trans i18nKey={'clients:pageTitle'} defaults={'Clients'} />}
        description={<AppBreadcrumbs />}
      />

      <PageBody className={'space-y-4'}>
        <div className={'flex flex-col gap-4 md:flex-row md:items-center md:justify-between'}>
          <Heading level={4}>
            <Trans i18nKey={'clients:clientsList'} defaults={'All Clients'} />
          </Heading>

          <div className={'flex items-center gap-x-2'}>
            <If condition={canCreateClients}>
              <NewClientDialog accountId={account.id} />
            </If>
          </div>
        </div>

        <Suspense fallback={<div className="h-10" />}>
          <ClientsFilters />
        </Suspense>

        <ServerDataLoader
          client={client}
          table={'clients'}
          page={page}
          where={(queryBuilder) => {
            queryBuilder.eq('account_id', account.id);

            if (status) {
              queryBuilder.eq('status', status);
            }

            if (query) {
              queryBuilder.or(
                `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`,
              );
            }

            return queryBuilder;
          }}
        >
          {(props) => {
            return (
              <ClientsTable
                {...props}
                account={account}
                canManageClients={canManageClients}
              />
            );
          }}
        </ServerDataLoader>
      </PageBody>
    </>
  );
}

export default withI18n(ClientsPage);
