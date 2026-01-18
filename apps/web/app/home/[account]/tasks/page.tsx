import { use } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';

import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { TasksList } from './_components/tasks-list';
import { loadTasks } from './_lib/server/tasks-page.loader';

interface TasksPageProps {
  params: Promise<{ account: string }>;
  searchParams: Promise<{ status?: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('tasks:tasks', { defaultValue: 'Tasks' });

  return {
    title,
  };
};

async function TasksPage(props: TasksPageProps) {
  const client = getSupabaseServerClient();
  const params = await props.params;
  const searchParams = await props.searchParams;
  const accountSlug = params.account;

  const { account } = use(loadTeamWorkspace(accountSlug));

  const { tasks } = await loadTasks(client, account.id, {
    status: searchParams.status,
  });

  const canCreate = account.permissions.includes('clients.create');
  const canUpdate = account.permissions.includes('clients.update');
  const canDelete = account.permissions.includes('clients.delete');

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={accountSlug}
        title={<Trans i18nKey={'tasks:tasks'} defaults={'Tasks'} />}
        description={<AppBreadcrumbs />}
      />
      <PageBody>
        <TasksList
          tasks={tasks}
          accountId={account.id}
          accountSlug={accountSlug}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </PageBody>
    </>
  );
}

export default withI18n(TasksPage);
