# Przewodnik po API - Makerkit

## 📚 Kompleksowy przewodnik po wszystkich API dostępnych w Makerkit

Ten dokument zawiera praktyczne przykłady użycia wszystkich głównych API w projekcie.

---

## 🔐 Authentication API

### Wzorzec: requireUser w Server Components

```typescript
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { redirect } from 'next/navigation';

async function ProtectedPage() {
  const client = getSupabaseServerClient();
  const auth = await requireUser(client);

  if (auth.error) {
    redirect(auth.redirectTo);
  }

  const user = auth.data;
  return <div>Welcome, {user.email}</div>;
}
```

### Wzorzec: requireUser w Server Actions

```typescript
'use server';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { redirect } from 'next/navigation';

export async function myServerAction() {
  const client = getSupabaseServerClient();
  const auth = await requireUser(client);

  if (auth.error) {
    redirect(auth.redirectTo);
  }

  const user = auth.data;
  // ... użyj user
}
```

### Wzorzec: useUser w Client Components

```typescript
'use client';

import { useUser } from '@kit/supabase/hooks/use-user';

function MyComponent() {
  const user = useUser();
  
  if (!user) {
    return <div>Not authenticated</div>;
  }

  return <div>Hello, {user.email}</div>;
}
```

### Wzorzec: requireUserInServerComponent (cached)

```typescript
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

async function Page() {
  // Cached per-request - można wywołać wiele razy bez wydajnościowych kosztów
  const user = await requireUserInServerComponent();
  
  return <div>User ID: {user.id}</div>;
}
```

---

## 👤 Account API (Personal Accounts)

### Podstawowe użycie

```typescript
import { createAccountsApi } from '@kit/accounts/api';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

const client = getSupabaseServerClient();
const api = createAccountsApi(client);
```

### Metody API

#### 1. getAccountWorkspace()

Pobiera dane workspace użytkownika (używane w layout).

```typescript
const workspace = await api.getAccountWorkspace();
// Returns: { id, name, picture_url, public_data, subscription_status }
```

**Uwaga**: To jest już wywoływane w `loadUserWorkspace()`, więc rzadko potrzebne bezpośrednio.

#### 2. loadUserAccounts()

Pobiera wszystkie konta użytkownika (personal + team accounts).

```typescript
const accounts = await api.loadUserAccounts();
// Returns: Array<{ label: string, value: string (slug), image: string | null }>
```

**Przykład użycia:**

```typescript
const accounts = await api.loadUserAccounts();
// accounts = [
//   { label: "My Personal Account", value: "user-id", image: null },
//   { label: "Acme Corp", value: "acme-corp", image: "https://..." },
// ]
```

#### 3. getSubscription(accountId)

Pobiera dane subskrypcji dla konta osobistego.

```typescript
const subscription = await api.getSubscription(userId);
// Returns: { subscription: {...}, items: [...] } | null
```

#### 4. getCustomerId(accountId)

Pobiera billing customer ID dla konta.

```typescript
const customerId = await api.getCustomerId(accountId);
// Returns: string | null
```

---

## 👥 Team Account API

### Podstawowe użycie

```typescript
import { createTeamAccountsApi } from '@kit/team-accounts/api';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

const client = getSupabaseServerClient();
const api = createTeamAccountsApi(client);
```

### Metody API

#### 1. getTeamAccountById(accountId)

Pobiera dane team account po ID.

```typescript
const account = await api.getTeamAccountById('account-uuid');
// Returns: Account object | null
```

**Użycie do sprawdzenia członkostwa:**

```typescript
const account = await api.getTeamAccountById(accountId);
if (!account) {
  // User is not a member of this account
  redirect('/home');
}
```

#### 2. getAccountWorkspace(slug)

Pobiera pełne dane workspace dla team account (używane w layout).

```typescript
const workspace = await api.getAccountWorkspace('account-slug');
// Returns: { data: { account: {...}, accounts: [...] }, error: null | Error }
```

**Przykład z loadTeamWorkspace:**

```typescript
// apps/web/app/home/[account]/_lib/server/team-account-workspace.loader.ts
async function loadTeamWorkspace(accountSlug: string) {
  const client = getSupabaseServerClient();
  const api = createTeamAccountsApi(client);

  const workspace = await api.getAccountWorkspace(accountSlug);
  
  if (!workspace.data?.account) {
    redirect('/home');
  }

  return workspace.data;
}
```

#### 3. hasPermission(params)

Sprawdza uprawnienia użytkownika w zespole.

```typescript
const hasPermission = await api.hasPermission({
  accountId: 'account-uuid',
  userId: 'user-uuid',
  permission: 'billing.manage',
});
// Returns: boolean
```

**Przykład użycia:**

```typescript
// Sprawdź czy użytkownik może zarządzać billingiem
const canManageBilling = await api.hasPermission({
  accountId: teamAccount.id,
  userId: user.id,
  permission: 'billing.manage',
});

if (!canManageBilling) {
  throw new Error('Insufficient permissions');
}
```

#### 4. getMembersCount(accountId)

Pobiera liczbę członków w zespole.

```typescript
const count = await api.getMembersCount('account-uuid');
// Returns: number
```

#### 5. getSubscription(accountId)

Pobiera subskrypcję team account.

```typescript
const subscription = await api.getSubscription('account-uuid');
// Returns: Subscription data | null
```

#### 6. getOrder(accountId)

Pobiera zamówienia dla team account.

```typescript
const order = await api.getOrder('account-uuid');
// Returns: Order data | null
```

#### 7. getCustomerId(accountId)

Pobiera billing customer ID.

```typescript
const customerId = await api.getCustomerId('account-uuid');
// Returns: string | null
```

#### 8. getInvitation(token)

Pobiera dane zaproszenia z tokena (dla użytkowników niebędących jeszcze członkami).

```typescript
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

const adminClient = getSupabaseServerAdminClient();
const invitation = await api.getInvitation(adminClient, 'invite-token');
// Returns: Invitation data | null
```

---

## 🏠 User Workspace API

### Dostęp w Server Components

```typescript
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';

export default async function UserPage() {
  const { user, workspace, accounts, canCreateTeamAccount } = await loadUserWorkspace();

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <p>Account: {workspace.name}</p>
      <p>Subscription: {workspace.subscription_status}</p>
      {canCreateTeamAccount.allowed && <CreateTeamButton />}
    </div>
  );
}
```

### Struktura danych

```typescript
type UserWorkspace = {
  user: User; // Supabase Auth user
  workspace: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    public_data: Json | null;
    subscription_status: 'active' | 'trialing' | 'past_due' | ... | null;
  };
  accounts: Array<{
    id: string | null;
    name: string | null;
    picture_url: string | null;
    role: string | null;
    slug: string | null;
  }>;
  canCreateTeamAccount: {
    allowed: boolean;
    reason?: string;
  };
};
```

### Dostęp w Client Components

```typescript
'use client';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

function MyComponent() {
  const { user, workspace, accounts, canCreateTeamAccount } = useUserWorkspace();

  return (
    <div>
      <h1>Your Accounts</h1>
      {accounts.map(account => (
        <div key={account.id}>{account.name}</div>
      ))}
    </div>
  );
}
```

**Uwaga**: Hook `useUserWorkspace` jest dostępny tylko w komponentach pod layoutem `/home/(user)`.

---

## 🏢 Team Workspace API

### Dostęp w Server Components

```typescript
import { loadTeamWorkspace } from '~/home/[account]/_lib/server/team-account-workspace.loader';

export default async function TeamPage({ params }: { params: { account: string } }) {
  const { account, user, accounts } = await loadTeamWorkspace((await params).account);

  return (
    <div>
      <h1>Team: {account.name}</h1>
      <p>Your role: {account.role}</p>
      <p>Permissions: {account.permissions.join(', ')}</p>
    </div>
  );
}
```

### Struktura danych

```typescript
type TeamWorkspace = {
  account: {
    id: string;
    name: string;
    picture_url: string | null;
    slug: string;
    role: string; // 'owner' | 'member'
    role_hierarchy_level: number;
    primary_owner_user_id: string;
    subscription_status: string | null;
    permissions: string[]; // ['billing.manage', 'members.manage', ...]
  };
  user: User;
  accounts: Array<{
    id: string | null;
    name: string | null;
    picture_url: string | null;
    role: string | null;
    slug: string | null;
  }>;
};
```

### Dostęp w Client Components

```typescript
'use client';

import { useTeamAccountWorkspace } from '@kit/team-accounts/hooks/use-team-account-workspace';

function TeamComponent() {
  const { account, user, accounts } = useTeamAccountWorkspace();

  const canManageBilling = account.permissions.includes('billing.manage');
  const canManageMembers = account.permissions.includes('members.manage');

  return (
    <div>
      {canManageBilling && <BillingButton />}
      {canManageMembers && <MembersButton />}
    </div>
  );
}
```

**Uwaga**: Hook `useTeamAccountWorkspace` jest dostępny tylko w komponentach pod layoutem `/home/[account]`.

---

## 🔑 OTP API (One-Time Passwords)

### Podstawowe użycie

```typescript
import { createOtpApi } from '@kit/otp/api';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

const client = getSupabaseServerClient();
const api = createOtpApi(client);
```

### Tworzenie i wysyłanie OTP

```typescript
// 1. Utwórz token
const tokenResult = await api.createToken({
  userId: user.id,
  purpose: 'account-deletion',
  expiresInSeconds: 3600, // 1 godzina
  metadata: { accountId: 'account-uuid' },
  revokePrevious: true, // Odwołaj poprzednie tokeny tego typu
});

// 2. Wyślij email z OTP
await api.sendOtpEmail({
  email: user.email,
  otp: tokenResult.token,
});
```

### Weryfikacja OTP

```typescript
const result = await api.verifyToken({
  token: submittedToken,
  purpose: 'account-deletion',
  userId: user.id, // Opcjonalne - dodatkowa weryfikacja
});

if (result.valid) {
  // Token poprawny - wykonaj akcję
  const { userId, metadata } = result;
  // metadata.accountId zawiera ID konta do usunięcia
} else {
  // Token nieważny lub wygasły
  throw new Error(result.message || 'Invalid token');
}
```

### Server Action do wysyłania OTP

```typescript
import { sendOtpEmailAction } from '@kit/otp/server/server-actions';

// W form handler
const result = await sendOtpEmailAction({
  email: userEmail,
  purpose: 'password-reset',
  expiresInSeconds: 1800, // 30 minut
});

if (!result.success) {
  throw new Error('Failed to send OTP');
}
```

### Komponent UI do weryfikacji

```typescript
'use client';

import { VerifyOtpForm } from '@kit/otp/components';

function DeleteAccountPage() {
  return (
    <VerifyOtpForm
      purpose="account-deletion"
      email={userEmail}
      onSuccess={(otp) => {
        // Wywołaj Server Action z OTP
        deleteAccountAction({ otp });
      }}
      CancelButton={
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      }
    />
  );
}
```

### Sprawdzanie statusu tokena

```typescript
const status = await api.getTokenStatus({
  id: 'token-id',
});

// status = {
//   exists: boolean;
//   purpose?: string;
//   isValid?: boolean;
//   expiresAt?: string;
//   usedAt?: string;
//   revoked?: boolean;
// }
```

### Odwoływanie tokena

```typescript
await api.revokeToken({
  id: 'token-id',
  reason: 'User cancelled operation',
});
```

### Przykładowe przypadki użycia

```typescript
// 1. Usuwanie konta
const token = await api.createToken({
  userId: user.id,
  purpose: 'account-deletion',
  metadata: { accountId },
});

// 2. Reset hasła
const token = await api.createToken({
  userId: user.id,
  purpose: 'password-reset',
  expiresInSeconds: 1800,
});

// 3. Weryfikacja email
const token = await api.createToken({
  userId: user.id,
  purpose: 'email-verification',
  metadata: { newEmail: 'new@example.com' },
});

// 4. Łączenie OAuth account
const token = await api.createToken({
  userId: user.id,
  purpose: 'oauth-link',
  metadata: { provider: 'google' },
});
```

---

## 📦 Registry API

### Wzorzec: Rejestr dla wymiennych implementacji

Registry API pozwala na dynamiczne wybieranie implementacji w runtime na podstawie zmiennych środowiskowych.

**Przykład: Billing Gateway Registry**

```typescript
// packages/billing/gateway/src/registry.ts
import { createRegistry } from '@kit/shared/registry';
import type { BillingGateway } from './types';

type BillingProvider = 'stripe' | 'lemon-squeezy' | 'paddle';

const billingRegistry = createRegistry<BillingGateway, BillingProvider>();

// Rejestracja implementacji
billingRegistry
  .register('stripe', async () => {
    const { createStripeGateway } = await import('./stripe-gateway');
    return createStripeGateway();
  })
  .register('lemon-squeezy', async () => {
    const { createLemonSqueezyGateway } = await import('./lemon-squeezy-gateway');
    return createLemonSqueezyGateway();
  });

// Funkcja pomocnicza do pobierania gateway
export async function getBillingGateway() {
  const provider = process.env.NEXT_PUBLIC_BILLING_PROVIDER ?? 'stripe';
  return await billingRegistry.get(provider);
}
```

### Użycie Registry

```typescript
// W kodzie aplikacji
const gateway = await getBillingGateway();
// gateway będzie instancją Stripe, LemonSqueezy, lub Paddle
// w zależności od NEXT_PUBLIC_BILLING_PROVIDER
```

### Setup Hooks

```typescript
const registry = createRegistry<MyService, 'service1' | 'service2'>();

// Dodaj setup hook
registry.addSetup('billing', async () => {
  // Inicjalizacja wspólna dla wszystkich billing providers
  await verifyBillingCredentials();
});

// Wykonaj setup przed użyciem
await registry.setup('billing');
const service = await registry.get('service1');
```

### Pobieranie wielu implementacji

```typescript
const [gateway1, gateway2] = await registry.get('stripe', 'lemon-squeezy');
// Zwraca tuple zachowując kolejność
```

---

## 🎯 Feature Policy API

### Wzorzec: Tworzenie Policy Registry

```typescript
import {
  createPolicyRegistry,
  definePolicy,
  createPoliciesEvaluator,
  allow,
  deny,
} from '@kit/policies';

// 1. Utwórz rejestr dla funkcji
const tasksPolicyRegistry = createPolicyRegistry();

// 2. Zdefiniuj context type
type TasksPolicyContext = {
  userId: string;
  accountId: string;
  taskCount: number;
  subscriptionStatus?: string;
};

// 3. Zarejestruj policies
tasksPolicyRegistry.registerPolicy(
  definePolicy<TasksPolicyContext>({
    id: 'max-tasks-per-account',
    stages: ['preliminary', 'submission'],
    evaluate: async (context) => {
      const maxTasks = context.subscriptionStatus === 'active' ? 100 : 10;
      
      if (context.taskCount >= maxTasks) {
        return deny({
          code: 'MAX_TASKS_EXCEEDED',
          message: `Cannot create more than ${maxTasks} tasks`,
          remediation: 'Upgrade your subscription',
        });
      }
      
      return allow();
    },
  })
);

// 4. Utwórz evaluator
export function createTasksPolicyEvaluator() {
  const evaluator = createPoliciesEvaluator();
  
  return {
    async hasPoliciesForStage(stage: 'preliminary' | 'submission') {
      return evaluator.hasPoliciesForStage(tasksPolicyRegistry, stage);
    },
    async canCreateTask(context: TasksPolicyContext, stage: 'preliminary' | 'submission') {
      return evaluator.evaluate(tasksPolicyRegistry, context, 'ALL', stage);
    },
  };
}
```

### Użycie Policy Evaluator

```typescript
// W Server Action
export const createTaskAction = enhanceAction(
  async (data, user) => {
    const evaluator = createTasksPolicyEvaluator();
    
    // Performance optimization - sprawdź czy są policies
    const hasPolicies = await evaluator.hasPoliciesForStage('submission');
    if (hasPolicies) {
      // Zbuduj context tylko jeśli są policies
      const context = {
        userId: user.id,
        accountId: data.account_id,
        taskCount: await getTaskCount(data.account_id),
        subscriptionStatus: await getSubscriptionStatus(data.account_id),
      };
      
      const result = await evaluator.canCreateTask(context, 'submission');
      
      if (!result.allowed) {
        return {
          success: false,
          errors: result.reasons,
        };
      }
    }
    
    // Kontynuuj tworzenie taska
    // ...
  },
  { schema: CreateTaskSchema, auth: true }
);
```

### Policy z konfiguracją

```typescript
import { z } from 'zod';

const MaxTasksPolicyConfigSchema = z.object({
  maxTasks: z.number().positive(),
});

tasksPolicyRegistry.registerPolicy(
  definePolicy<TasksPolicyContext>({
    id: 'configurable-max-tasks',
    stages: ['submission'],
    configSchema: MaxTasksPolicyConfigSchema,
    evaluate: async (context, config = { maxTasks: 10 }) => {
      if (context.taskCount >= config.maxTasks) {
        return deny({
          code: 'MAX_TASKS_EXCEEDED',
          message: `Maximum ${config.maxTasks} tasks allowed`,
        });
      }
      return allow();
    },
  })
);
```

### Grupowe evaluacje (AND/OR logic)

```typescript
// ALL: Wszystkie policies muszą przejść (domyślne)
const result = await evaluator.evaluate(
  registry,
  context,
  'ALL', // AND logic
  'submission'
);

// ANY: Przynajmniej jedna policy musi przejść
const result = await evaluator.evaluate(
  registry,
  context,
  'ANY', // OR logic
  'submission'
);
```

### Obsługa błędów

```typescript
const result = await evaluator.canCreateTask(context, 'submission');

if (!result.allowed) {
  // Proste błędy (stringi)
  console.log('Reasons:', result.reasons);
  
  // Szczegółowe błędy z metadata
  result.results.forEach((policyResult) => {
    if (!policyResult.allowed && policyResult.metadata) {
      console.log('Error code:', policyResult.metadata.code);
      console.log('Message:', policyResult.metadata.message);
      console.log('Remediation:', policyResult.metadata.remediation);
    }
  });
}
```

---

## 🔄 Database Webhooks

### Konfiguracja Webhook Handler

```typescript
// app/api/db/webhook/route.ts
import { getDatabaseWebhookHandlerService } from '@kit/database-webhooks';
import type { Database } from '@kit/supabase/database';
import type { RecordChange } from '@kit/database-webhooks';

export async function POST(request: Request) {
  const service = getDatabaseWebhookHandlerService();

  try {
    await service.handleWebhook(request, {
      handleEvent(change: RecordChange<'tasks' | 'accounts' | 'subscriptions'>) {
        // INSERT na tasks
        if (change.type === 'INSERT' && change.table === 'tasks') {
          const task = change.record;
          console.log('New task created:', task.title);
          // Wyślij powiadomienie, zaktualizuj cache, etc.
        }

        // UPDATE na subscriptions
        if (change.type === 'UPDATE' && change.table === 'subscriptions') {
          const subscription = change.record;
          const oldSubscription = change.old_record;
          
          // Sprawdź czy status się zmienił
          if (subscription.status !== oldSubscription?.status) {
            console.log('Subscription status changed:', subscription.status);
            // Synchronizuj z zewnętrznym systemem
          }
        }

        // DELETE na accounts
        if (change.type === 'DELETE' && change.table === 'accounts') {
          const account = change.record;
          console.log('Account deleted:', account.id);
          // Wyczyść dane w zewnętrznych systemach
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

### Typowanie zmian

```typescript
import type { RecordChange } from '@kit/database-webhooks';

type TaskChange = RecordChange<'tasks'>;
type AccountChange = RecordChange<'accounts'>;

service.handleWebhook(request, {
  handleEvent(change: TaskChange | AccountChange) {
    if (change.table === 'tasks') {
      // TypeScript wie, że change.record to Tasks['Row']
      const task = change.record;
      // TypeScript wie, że task ma pola: id, title, account_id, etc.
    }
  },
});
```

---

## 📋 Checklist użycia API

### Personal Account API

- [ ] Użyj `createAccountsApi` w Server Components lub Server Actions
- [ ] Użyj `loadUserWorkspace` dla danych użytkownika
- [ ] Użyj `useUserWorkspace` hook w Client Components (pod `/home/(user)` layout)

### Team Account API

- [ ] Użyj `createTeamAccountsApi` dla operacji na team accounts
- [ ] Użyj `loadTeamWorkspace` dla danych workspace
- [ ] Użyj `useTeamAccountWorkspace` hook w Client Components (pod `/home/[account]` layout)
- [ ] Sprawdź uprawnienia używając `hasPermission`

### OTP API

- [ ] Utwórz token z odpowiednim `purpose`
- [ ] Wyślij email z OTP do użytkownika
- [ ] Zweryfikuj token przed wykonaniem akcji
- [ ] Użyj `VerifyOtpForm` komponentu w UI

### Policy API

- [ ] Utwórz feature-specific registry
- [ ] Zdefiniuj context type
- [ ] Zarejestruj policies z odpowiednimi `stages`
- [ ] Użyj evaluator w Server Actions
- [ ] Sprawdź `hasPoliciesForStage` przed budowaniem contextu

### Webhooks

- [ ] Dodaj handler do `app/api/db/webhook/route.ts`
- [ ] Typuj zmiany używając `RecordChange`
- [ ] Obsłuż INSERT, UPDATE, DELETE events
- [ ] Zwróć odpowiedni status HTTP

---

## 🔗 Integracja z innymi wzorcami

### API + Server Actions

```typescript
'use server';

import { enhanceAction } from '@kit/next/actions';
import { createTeamAccountsApi } from '@kit/team-accounts/api';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

export const updateTeamNameAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    const api = createTeamAccountsApi(client);

    // Sprawdź uprawnienia
    const canManage = await api.hasPermission({
      accountId: data.accountId,
      userId: user.id,
      permission: 'settings.manage',
    });

    if (!canManage) {
      throw new Error('Insufficient permissions');
    }

    // Wykonaj aktualizację
    // ...
  },
  { schema: UpdateTeamSchema, auth: true }
);
```

### API + Workspace Loader

```typescript
// W Server Component
async function TeamSettingsPage({ params }: { params: { account: string } }) {
  const { account, user } = await loadTeamWorkspace((await params).account);
  
  // account.permissions już zawiera listę uprawnień
  const canManageBilling = account.permissions.includes('billing.manage');
  
  return (
    <div>
      {canManageBilling && <BillingSettings />}
    </div>
  );
}
```

---

## 📖 Przydatne linki

- [Account API Documentation](https://makerkit.dev/docs/next-supabase-turbo/account-api)
- [Team Account API Documentation](https://makerkit.dev/docs/next-supabase-turbo/team-account-api)
- [OTP API Documentation](https://makerkit.dev/docs/next-supabase-turbo/otp-api)
- [Feature Policy API Documentation](https://makerkit.dev/docs/next-supabase-turbo/feature-policy-api)
- [Registry API Documentation](https://makerkit.dev/docs/next-supabase-turbo/registry-api)
