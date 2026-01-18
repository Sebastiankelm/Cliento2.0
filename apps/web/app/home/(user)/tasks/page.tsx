import { use } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';
import { TasksList } from '~/home/[account]/tasks/_components/tasks-list';
import { loadTasks } from '~/home/[account]/tasks/_lib/server/tasks-page.loader';

import { HomeLayoutPageHeader } from '../_components/home-page-header';

interface TasksPageProps {
  searchParams: Promise<{ status?: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('tasks:tasks', { defaultValue: 'Tasks' });

  return {
    title,
  };
};

async function PersonalTasksPage(props: TasksPageProps) {
  const client = getSupabaseServerClient();
  const searchParams = await props.searchParams;
  const workspace = use(loadUserWorkspace());

  if (!workspace.workspace) {
    throw new Error('Workspace not found');
  }

  const account = workspace.workspace;
  let tasks: Awaited<ReturnType<typeof loadTasks>>['tasks'] = [];

  try {
    const result = await loadTasks(client, account.id, {
      status: searchParams.status,
    }).catch((err) => {
      console.error('Error loading tasks:', err);
      return { tasks: [], totalCount: 0 };
    });
    tasks = result.tasks;
  } catch (error) {
    console.error('Error loading tasks:', error);
    // Continue with empty array
  }

  // For personal accounts, user is owner so has all permissions
  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;

  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'tasks:tasks'} defaults={'Tasks'} />}
        description={<AppBreadcrumbs />}
      />
      <PageBody>
        <TasksList
          tasks={tasks}
          accountId={account.id}
          accountSlug=""
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </PageBody>
    </>
  );
}

export default withI18n(PersonalTasksPage);
