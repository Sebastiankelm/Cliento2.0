import { use } from 'react';

import { ServerDataLoader } from '@makerkit/data-loader-supabase-nextjs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';

import { HomeLayoutPageHeader } from '../_components/home-page-header';
import { ClientsTable } from './_components/clients-table';
import { NewClientDialog } from './_components/new-client-dialog';

interface SearchParams {
  page?: string;
  query?: string;
  status?: string;
}

interface PersonalClientsPageProps {
  searchParams: Promise<SearchParams>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('clients:pageTitle', { defaultValue: 'Clients' });

  return {
    title,
  };
};

async function PersonalClientsPage(props: PersonalClientsPageProps) {
  const client = getSupabaseServerClient();
  const searchParams = await props.searchParams;
  const workspace = use(loadUserWorkspace());

  const account = workspace.workspace;
  const page = parseInt(searchParams.page ?? '1', 10);
  const query = searchParams.query ?? '';
  const status = searchParams.status ?? '';

  const canCreateClients = account.permissions?.includes('clients.create') ?? false;
  const canManageClients = account.permissions?.includes('clients.manage') ?? false;

  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'clients:pageTitle'} defaults={'Clients'} />}
        description={<AppBreadcrumbs />}
      />

      <PageBody className={'space-y-4'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <Heading level={4}>
              <Trans i18nKey={'clients:clientsList'} defaults={'All Clients'} />
            </Heading>
          </div>

          <div className={'flex items-center gap-x-2'}>
            <form className={'w-full'}>
              <Input
                name={'query'}
                defaultValue={query}
                className={'w-full lg:w-[18rem]'}
                placeholder={'Search clients...'}
              />
            </form>

            <If condition={canCreateClients}>
              <NewClientDialog accountId={account.id} />
            </If>
          </div>
        </div>

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
          {(tableProps) => {
            return (
              <ClientsTable
                {...tableProps}
                account={{ id: account.id, slug: account.id }}
                canManageClients={canManageClients}
              />
            );
          }}
        </ServerDataLoader>
      </PageBody>
    </>
  );
}

export default withI18n(PersonalClientsPage);
