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
  
  let workspace;
  try {
    workspace = await loadUserWorkspace();
  } catch (error) {
    console.error('Failed to load user workspace:', error);
    // In production, we should show a proper error page
    throw error;
  }

  // Check if workspace exists
  if (!workspace || !workspace.workspace) {
    console.error('Workspace not found:', { workspace });
    throw new Error('Workspace not found');
  }

  const account = workspace.workspace;
  const page = parseInt(searchParams.page ?? '1', 10);
  const query = searchParams.query ?? '';
  const status = searchParams.status ?? '';

  // Safely check permissions with fallback to empty array
  // TypeScript may not know about permissions field yet, so we use type assertion
  const accountWithPermissions = account as typeof account & {
    permissions?: string[];
    role?: string;
    role_hierarchy_level?: number;
  };
  const permissions = Array.isArray(accountWithPermissions.permissions) 
    ? accountWithPermissions.permissions 
    : [];
  const canCreateClients = permissions.includes('clients.create');
  const canManageClients = permissions.includes('clients.manage');

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

        <ClientsListContent
          client={client}
          accountId={account.id}
          account={{ id: account.id, slug: account.id }}
          canManageClients={canManageClients}
          page={page}
          query={query}
          status={status}
        />
      </PageBody>
    </>
  );
}

async function ClientsListContent({
  client,
  accountId,
  account,
  canManageClients,
  page,
  query,
  status,
}: {
  client: ReturnType<typeof getSupabaseServerClient>;
  accountId: string;
  account: { id: string; slug: string };
  canManageClients: boolean;
  page: number;
  query: string;
  status: string;
}) {
  const ITEMS_PER_PAGE = 10;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  try {
    // Load clients with filtering
    let clientsQuery = client
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (status) {
      clientsQuery = clientsQuery.eq('status', status);
    }

    if (query) {
      clientsQuery = clientsQuery.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`,
      );
    }

    const { data: clients, error, count } = await clientsQuery;

    if (error) {
      // Log detailed error information
      console.error('Failed to load clients:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        accountId,
      });
      
      // Return empty state on error instead of crashing
      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load clients: {error.message}
          </p>
          <ClientsTable
            data={[]}
            account={account}
            canManageClients={canManageClients}
          />
        </div>
      );
    }

    return (
      <ClientsTable
        data={clients ?? []}
        account={account}
        canManageClients={canManageClients}
      />
    );
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in ClientsListContent:', error);
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          An unexpected error occurred while loading clients.
        </p>
        <ClientsTable
          data={[]}
          account={account}
          canManageClients={canManageClients}
        />
      </div>
    );
  }
}

export default withI18n(PersonalClientsPage);
