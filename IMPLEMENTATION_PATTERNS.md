# Wzorce implementacji - Makerkit

## 📖 Kompletny przewodnik implementacji funkcji

Ten dokument zawiera praktyczne wzorce i przykłady implementacji zgodne z dokumentacją Makerkit.

## 🗂️ Spis treści

1. [Ładowanie danych (Data Fetching)](#ładowanie-danych)
2. [Zapisywanie danych (Data Mutations)](#zapisywanie-danych)
3. [RBAC - Roles and Permissions](#rbac)
4. [Database Webhooks](#database-webhooks)
5. [SEO i Marketing Pages](#seo-i-marketing-pages)
6. [E2E Testing](#e2e-testing)

---

## 📊 Ładowanie danych

### Wzorzec: Server Components z Loader Functions

**Struktura plików:**
```
app/home/(user)/tasks/
├── page.tsx                    # Server Component (strona)
├── _lib/server/
│   └── tasks-page.loader.ts   # Loader function
└── _components/
    └── tasks-table.tsx         # Client Component (jeśli potrzebne)
```

**Przykład implementacji:**

```typescript
// app/home/(user)/tasks/_lib/server/tasks-page.loader.ts
import 'server-only';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Database } from '~/lib/database.types';

export async function loadTasksPageData(
  client: SupabaseClient<Database>,
  userId: string,
) {
  const { data: tasks, error } = await client
    .from('tasks')
    .select('*')
    .eq('account_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return { tasks: tasks ?? [] };
}

// app/home/(user)/tasks/page.tsx
import { use } from 'react';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { loadUserWorkspace } from '../_lib/server/load-user-workspace';
import { loadTasksPageData } from './_lib/server/tasks-page.loader';
import { TasksTable } from './_components/tasks-table';

export default async function TasksPage() {
  const client = getSupabaseServerClient();
  const { user } = use(loadUserWorkspace());
  
  const { tasks } = await loadTasksPageData(client, user.id);

  return <TasksTable tasks={tasks} />;
}
```

### Wzorzec: ServerDataLoader dla paginacji i filtrowania

**Użycie z ServerDataLoader:**

```typescript
// page.tsx
'use client'; // Jeśli potrzebujesz interaktywności (search params)

import { ServerDataLoader } from '@makerkit/data-loader-supabase-nextjs';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Input } from '@kit/ui/input';
import { DataTable } from '@kit/ui/enhanced-data-table';

interface SearchParams {
  page?: string;
  query?: string;
}

export default function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  const client = getSupabaseServerClient();
  const page = parseInt(searchParams.page ?? '1', 10);
  const query = searchParams.query ?? '';

  return (
    <div>
      <form>
        <Input
          name="query"
          defaultValue={query}
          placeholder="Search tasks"
        />
      </form>
      
      <ServerDataLoader
        client={client}
        table="tasks"
        page={page}
        where={{
          account_id: { eq: user.id },
          title: { textSearch: query ? `%${query}%` : undefined },
        }}
      >
        {({ data, count, page, pageSize, pageCount }) => (
          <DataTable
            data={data}
            columns={columns}
            page={page}
            pageSize={pageSize}
            pageCount={pageCount}
          />
        )}
      </ServerDataLoader>
    </div>
  );
}
```

### Wzorzec: Parallel Data Fetching

**Optymalizacja dla wielu źródeł danych:**

```typescript
// loader.ts
import 'server-only';

export async function loadDashboardData(client: SupabaseClient, userId: string) {
  return Promise.all([
    loadTasks(client, userId),
    loadNotifications(client, userId),
    loadStats(client, userId),
  ]);
}

// page.tsx
async function DashboardPage() {
  const client = getSupabaseServerClient();
  const user = use(loadUserWorkspace());
  
  const [tasks, notifications, stats] = await loadDashboardData(client, user.id);
  
  return (
    <Dashboard 
      tasks={tasks}
      notifications={notifications}
      stats={stats}
    />
  );
}
```

---

## ✍️ Zapisywanie danych

### Wzorzec: Server Actions z enhanceAction

**Struktura:**
```
app/home/(user)/tasks/
├── _lib/
│   ├── schema/
│   │   └── task.schema.ts      # Zod schemas
│   └── server/
│       └── tasks-server-actions.ts  # Server Actions
└── _components/
    └── task-form.tsx            # Form component
```

**Implementacja:**

```typescript
// _lib/schema/task.schema.ts
import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().nullable().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.extend({
  id: z.string().uuid(),
});

export const DeleteTaskSchema = z.object({
  id: z.string().uuid(),
});

// _lib/server/tasks-server-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getLogger } from '@kit/shared/logger';
import { CreateTaskSchema, UpdateTaskSchema, DeleteTaskSchema } from '../schema/task.schema';

export const createTaskAction = enhanceAction(
  async (data, user) => {
    const logger = await getLogger();
    const client = getSupabaseServerClient();

    logger.info({ userId: user.id }, 'Creating task...');

    const { data: task, error } = await client
      .from('tasks')
      .insert({
        account_id: user.id,
        title: data.title,
        description: data.description,
      })
      .select()
      .single();

    if (error) {
      logger.error(error, 'Failed to create task');
      throw new Error('Failed to create task');
    }

    revalidatePath('/home/tasks');
    return { success: true, data: task };
  },
  {
    schema: CreateTaskSchema,
    auth: true,
  }
);

export const updateTaskAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    const logger = await getLogger();

    const { error } = await client
      .from('tasks')
      .update({
        title: data.title,
        description: data.description,
      })
      .eq('id', data.id)
      .eq('account_id', user.id); // RLS dodatkowo chroni

    if (error) {
      logger.error(error, 'Failed to update task');
      throw error;
    }

    revalidatePath('/home/tasks');
    return { success: true };
  },
  {
    schema: UpdateTaskSchema,
    auth: true,
  }
);

export const deleteTaskAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('tasks')
      .delete()
      .eq('id', data.id)
      .eq('account_id', user.id);

    if (error) throw error;

    revalidatePath('/home/tasks');
    return { success: true };
  },
  {
    schema: DeleteTaskSchema,
    auth: true,
  }
);
```

### Wzorzec: Form Component z react-hook-form

```typescript
// _components/task-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Button } from '@kit/ui/button';
import { CreateTaskSchema } from '../_lib/schema/task.schema';
import type { z } from 'zod';

interface TaskFormProps {
  onSubmit: (data: z.infer<typeof CreateTaskSchema>) => Promise<void>;
  SubmitButton: React.ComponentType<{ pending?: boolean }>;
}

export function TaskForm({ onSubmit, SubmitButton }: TaskFormProps) {
  const form = useForm({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <SubmitButton />
      </form>
    </Form>
  );
}
```

### Wzorzec: Dialog z Form

```typescript
// _components/new-task-dialog.tsx
'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@kit/ui/dialog';
import { Button } from '@kit/ui/button';
import { TaskForm } from './task-form';
import { createTaskAction } from '../_lib/server/tasks-server-actions';

export function NewTaskDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New Task</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          onSubmit={(data) => {
            startTransition(async () => {
              await createTaskAction(data);
              setIsOpen(false);
            });
          }}
          SubmitButton={({ pending }) => (
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating...' : 'Create Task'}
            </Button>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🔐 RBAC - Roles and Permissions

### Dodawanie nowych uprawnień

**1. Dodaj do enum (RĘCZNIE - diff nie obsługuje!):**

```sql
-- apps/web/supabase/schemas/18-tasks-permissions.sql
ALTER TYPE public.app_permissions ADD VALUE 'tasks.create';
ALTER TYPE public.app_permissions ADD VALUE 'tasks.read';
ALTER TYPE public.app_permissions ADD VALUE 'tasks.update';
ALTER TYPE public.app_permissions ADD VALUE 'tasks.delete';
COMMIT;
```

**2. Przypisz uprawnienia do ról:**

```sql
INSERT INTO public.role_permissions (role, permission) VALUES
  ('owner', 'tasks.create'),
  ('owner', 'tasks.read'),
  ('owner', 'tasks.update'),
  ('owner', 'tasks.delete'),
  ('member', 'tasks.create'),
  ('member', 'tasks.read');
```

### Użycie w RLS Policies

```sql
-- SELECT: Czytanie zależne od uprawnień
CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    account_id = (SELECT auth.uid())  -- Personal account
    OR 
    public.has_permission(auth.uid(), account_id, 'tasks.read'::app_permissions)
  );

-- INSERT: Tworzenie zależne od uprawnień
CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    account_id = (SELECT auth.uid())
    OR 
    public.has_permission(auth.uid(), account_id, 'tasks.create'::app_permissions)
  );

-- UPDATE: Edycja zależna od uprawnień
CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE TO authenticated
  USING (
    public.has_permission(auth.uid(), account_id, 'tasks.update'::app_permissions)
  );

-- DELETE: Usuwanie zależne od uprawnień
CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE TO authenticated
  USING (
    public.has_permission(auth.uid(), account_id, 'tasks.delete'::app_permissions)
  );
```

### Użycie w Server Actions

```typescript
import { getSupabaseServerClient } from '@kit/supabase/server-client';

async function checkTaskPermission(userId: string, accountId: string, permission: string) {
  const client = getSupabaseServerClient();
  
  const { data: hasPermission, error } = await client.rpc('has_permission', {
    user_id: userId,
    account_id: accountId,
    permission: permission,
  });

  if (error || !hasPermission) {
    throw new Error(`User lacks permission: ${permission}`);
  }
}

export const createTaskAction = enhanceAction(
  async (data, user) => {
    // Sprawdź uprawnienia (opcjonalne - RLS też to robi)
    await checkTaskPermission(user.id, data.account_id, 'tasks.create');
    
    // ... reszta logiki
  },
  { schema: CreateTaskSchema, auth: true }
);
```

### Użycie po stronie klienta (UI)

```typescript
// page.tsx - Server Component
import { loadTeamWorkspace } from '../_lib/server/team-account-workspace.loader';

export default async function TasksPage({ params }: { params: { account: string } }) {
  const workspace = await loadTeamWorkspace(params.account);
  const permissions = workspace.account.permissions; // string[]
  
  const canCreate = permissions.includes('tasks.create');
  const canDelete = permissions.includes('tasks.delete');

  return (
    <div>
      {canCreate && <NewTaskDialog />}
      <TasksTable 
        permissions={permissions}
        canDelete={canDelete}
      />
    </div>
  );
}

// tasks-table.tsx - Client Component
'use client';

interface TasksTableProps {
  tasks: Task[];
  permissions: string[];
  canDelete: boolean;
}

export function TasksTable({ tasks, permissions, canDelete }: TasksTableProps) {
  return (
    <table>
      {tasks.map(task => (
        <tr key={task.id}>
          <td>{task.title}</td>
          {canDelete && (
            <td>
              <DeleteButton taskId={task.id} />
            </td>
          )}
        </tr>
      ))}
    </table>
  );
}
```

---

## 🔔 Database Webhooks

### Konfiguracja Webhook Handler

```typescript
// app/api/db/webhook/route.ts
import { getDatabaseWebhookHandlerService } from '@kit/database-webhooks';

export async function POST(request: Request) {
  const service = getDatabaseWebhookHandlerService();
  
  try {
    await service.handleWebhook(request, {
      handleEvent(change) {
        // INSERT na tabeli tasks
        if (change.type === 'INSERT' && change.table === 'tasks') {
          // Wyślij powiadomienie
          console.log('New task created:', change.record);
        }

        // UPDATE na tabeli subscriptions
        if (change.type === 'UPDATE' && change.table === 'subscriptions') {
          // Synchronizuj z zewnętrznym systemem
          console.log('Subscription updated:', change.record);
        }

        // DELETE na tabeli accounts
        if (change.type === 'DELETE' && change.table === 'accounts') {
          // Wyczyść dane w zewnętrznych systemach
          console.log('Account deleted:', change.record);
        }
      },
    });
    
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(null, { status: 500 });
  }
}
```

### Typowanie Webhook Changes

```typescript
import type { Database } from '@kit/supabase/database';
import type { RecordChange } from '@kit/database-webhooks';

type TaskChange = RecordChange<'tasks'>;
type AccountChange = RecordChange<'accounts'>;

service.handleWebhook(request, {
  handleEvent(change: TaskChange | AccountChange) {
    if (change.table === 'tasks') {
      // TypeScript wie, że change.record to Tasks['Row']
      const task = change.record;
    }
  },
});
```

---

## 📄 SEO i Marketing Pages

### Dodawanie nowych stron do sitemap

```typescript
// app/sitemap.xml/route.ts
function getPaths() {
  const paths = [
    '/',
    '/faq',
    '/blog',
    '/docs',
    '/pricing',
    '/contact',
    '/about', // ← Dodaj nową stronę tutaj
    '/cookie-policy',
    '/terms-of-service',
    '/privacy-policy',
  ];

  return paths.map((path) => ({
    loc: new URL(path, appConfig.url).href,
    lastmod: new Date().toISOString(),
  }));
}
```

### Tworzenie nowej strony marketingowej

```typescript
// app/(marketing)/about/page.tsx
import { Metadata } from 'next';
import appConfig from '~/config/app.config';

export const metadata: Metadata = {
  title: `About Us - ${appConfig.name}`,
  description: 'Learn more about our company and mission',
};

export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      {/* Zawartość strony */}
    </div>
  );
}
```

### Konfiguracja Contact Form

```bash
# apps/web/.env.local
CONTACT_EMAIL=contact@yourapp.com
```

---

## 🧪 E2E Testing

### Wzorzec: Page Object Model

**Struktura:**
```
apps/e2e/tests/
├── tasks/
│   ├── tasks.spec.ts          # Testy
│   └── tasks.po.ts            # Page Object
└── utils/
    └── mailbox.ts             # Pomocnicze narzędzia
```

**Przykład Page Object:**

```typescript
// tasks/tasks.po.ts
import { Page, expect } from '@playwright/test';

export class TasksPageObject {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/home/tasks');
  }

  async createTask(title: string, description?: string) {
    await this.page.click('[data-test="new-task-button"]');
    await this.page.fill('[data-test="task-title-input"]', title);
    if (description) {
      await this.page.fill('[data-test="task-description-input"]', description);
    }
    await this.page.click('[data-test="submit-task-button"]');
    
    // Czekaj na zniknięcie dialogu
    await expect(
      this.page.locator('[data-test="new-task-dialog"]')
    ).not.toBeVisible();
  }

  async deleteTask(taskId: string) {
    await this.page.click(`[data-test="delete-task-button-${taskId}"]`);
    await this.page.click('[data-test="confirm-delete-button"]');
  }

  async searchTasks(query: string) {
    await this.page.fill('[data-test="task-search-input"]', query);
    await this.page.press('[data-test="task-search-input"]', 'Enter');
  }

  async expectTaskVisible(title: string) {
    await expect(
      this.page.locator(`[data-test="task-row"]:has-text("${title}")`)
    ).toBeVisible();
  }
}
```

**Przykład testu:**

```typescript
// tasks/tasks.spec.ts
import { test, expect } from '@playwright/test';
import { TasksPageObject } from './tasks.po';
import { AuthPageObject } from '../auth/auth.po';

test.describe('Tasks Management', () => {
  let tasksPage: TasksPageObject;
  let auth: AuthPageObject;

  test.beforeEach(async ({ page }) => {
    auth = new AuthPageObject(page);
    tasksPage = new TasksPageObject(page);
    
    // Zaloguj się przed każdym testem
    await auth.signIn({
      email: 'test@makerkit.dev',
      password: 'testingpassword',
    });
  });

  test('should create a new task', async ({ page }) => {
    await tasksPage.goto();
    await tasksPage.createTask('Test Task', 'Task description');
    await tasksPage.expectTaskVisible('Test Task');
  });

  test('should search tasks', async ({ page }) => {
    await tasksPage.goto();
    await tasksPage.createTask('Unique Task Name');
    await tasksPage.searchTasks('Unique');
    await tasksPage.expectTaskVisible('Unique Task Name');
  });

  test('should delete a task', async ({ page }) => {
    await tasksPage.goto();
    await tasksPage.createTask('Task to Delete');
    
    // Pobierz ID zadania (jeśli potrzebne)
    const taskRow = page.locator('[data-test="task-row"]:has-text("Task to Delete")');
    const taskId = await taskRow.getAttribute('data-task-id');
    
    await tasksPage.deleteTask(taskId!);
    
    // Sprawdź, że zadanie zniknęło
    await expect(taskRow).not.toBeVisible();
  });
});
```

### Data-Test Attributes - Best Practices

**W komponentach React:**

```tsx
// _components/task-form.tsx
<form data-test="task-form">
  <Input
    data-test="task-title-input"
    name="title"
  />
  <Textarea
    data-test="task-description-input"
    name="description"
  />
  <Button
    data-test="submit-task-button"
    type="submit"
  >
    Create
  </Button>
</form>

// _components/tasks-table.tsx
{table.map((task) => (
  <tr key={task.id} data-test="task-row" data-task-id={task.id}>
    <td>{task.title}</td>
    <td>
      <Button
        data-test={`delete-task-button-${task.id}`}
        onClick={() => deleteTask(task.id)}
      >
        Delete
      </Button>
    </td>
  </tr>
))}
```

### Retry-ability z expect().toPass()

```typescript
// utils/mailbox.po.ts
import { expect } from '@playwright/test';

export class Mailbox {
  async visitConfirmEmailLink(email: string) {
    return expect(async () => {
      const emailData = await this.getEmail(email);
      if (!emailData) {
        throw new Error('Email not found');
      }
      const link = this.extractLink(emailData);
      return this.page.goto(link);
    }).toPass({ timeout: 10000 });
  }
}
```

---

## 📝 Checklist implementacji funkcji

### ✅ Podstawowa implementacja

- [ ] Utworzono schemat SQL z RLS
- [ ] Wygenerowano migrację
- [ ] Utworzono typy TypeScript (`pnpm supabase:web:typegen`)
- [ ] Utworzono loader function dla Server Component
- [ ] Utworzono Server Actions z `enhanceAction`
- [ ] Utworzono Zod schemas dla walidacji
- [ ] Utworzono Form component z `react-hook-form`
- [ ] Dodano `data-test` attributes dla E2E

### ✅ Bezpieczeństwo

- [ ] Włączono RLS na nowych tabelach
- [ ] Utworzono RLS policies używając helper functions
- [ ] Sprawdzono uprawnienia w Server Actions (jeśli potrzebne)
- [ ] Dodano walidację danych z Zod
- [ ] Przetestowano dostęp dla różnych ról

### ✅ UX i UI

- [ ] Dodano loading states
- [ ] Dodano error handling
- [ ] Dodano success messages/notifications
- [ ] Zaimplementowano optymistyczne aktualizacje (jeśli potrzebne)
- [ ] Dodano accessibility attributes

### ✅ SEO i Performance

- [ ] Dodano metadata dla strony
- [ ] Zaktualizowano sitemap (jeśli strona publiczna)
- [ ] Zoptymalizowano zapytania (indeksy, parallel fetching)
- [ ] Przetestowano performance

### ✅ Testing

- [ ] Utworzono Page Object (jeśli E2E)
- [ ] Napisano testy E2E dla happy path
- [ ] Napisano testy dla error scenarios
- [ ] Przetestowano różne role/permissions

---

## 🔗 Przydatne linki

- [Makerkit Documentation](https://makerkit.dev/docs)
- [Data Fetching Patterns](https://makerkit.dev/docs/next-supabase-turbo/loading-data)
- [Server Actions Guide](https://makerkit.dev/docs/next-supabase-turbo/writing-data)
- [RBAC Documentation](https://makerkit.dev/docs/next-supabase-turbo/rbac)
- [Playwright Documentation](https://playwright.dev)
