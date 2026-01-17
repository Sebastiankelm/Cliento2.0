# Przewodnik rozwoju aplikacji - Makerkit

## 📚 Przegląd architektury

### Struktura Multi-Tenant

Makerkit obsługuje dwa typy kont:

1. **Personal Accounts** (Konta osobiste)
   - ID użytkownika = ID konta (`auth.users.id = accounts.id`)
   - Automatycznie tworzone przy rejestracji
   - Idealne dla B2C aplikacji

2. **Team Accounts** (Konta zespołowe)
   - Współdzielone przestrzenie z wieloma członkami
   - Role i uprawnienia
   - Idealne dla B2B aplikacji

### Schemat bazy danych

Aktualnie zaimplementowane schematy (17 plików w `apps/web/supabase/schemas/`):

```
00-privileges.sql      - Uprawnienia bazy danych
01-enums.sql           - Typy wyliczeniowe
02-config.sql          - Konfiguracja aplikacji
03-accounts.sql        - Tabela kont (multi-tenant foundation)
04-roles.sql           - Definicje ról
05-memberships.sql     - Członkostwo w team accounts
06-roles-permissions.sql - Mapowanie uprawnień do ról
07-invitations.sql     - System zaproszeń
08-billing-customers.sql - Klienci billingowi
09-subscriptions.sql   - Subskrypcje
10-orders.sql          - Zamówienia jednorazowe
11-notifications.sql   - System powiadomień
12-one-time-tokens.sql - Tokeny OTP
13-mfa.sql             - Multi-Factor Authentication
14-super-admin.sql     - Super administratorzy
15-account-views.sql   - Widoki dla kont
16-storage.sql         - Konfiguracja storage
17-roles-seed.sql      - Seed danych dla ról
```

**Następny schemat powinien być numerowany 18-xxx.sql**

## 🗂️ Konfiguracja nawigacji

### Personal Account Navigation

Plik: `apps/web/config/personal-account-navigation.config.tsx`

Aktualna konfiguracja:
- **Home** - Strona główna
- **Settings**:
  - Profile (ustawienia użytkownika)
  - Billing (jeśli włączone przez feature flag)

### Team Account Navigation

Plik: `apps/web/config/team-account-navigation.config.tsx`

Aktualna konfiguracja:
- **Dashboard** - Pulpit zespołowy
- **Settings**:
  - Settings (ustawienia zespołu)
  - Members (zarządzanie członkami)
  - Billing (jeśli włączone)

### Style nawigacji

Możliwe wartości zmiennych środowiskowych:

```bash
# Personal Account Navigation
NEXT_PUBLIC_USER_NAVIGATION_STYLE=sidebar  # lub "header"
NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED=false
NEXT_PUBLIC_SIDEBAR_COLLAPSIBLE_STYLE=icon  # lub "offcanvas", "none"

# Team Account Navigation  
NEXT_PUBLIC_TEAM_NAVIGATION_STYLE=sidebar  # lub "header"
NEXT_PUBLIC_TEAM_SIDEBAR_COLLAPSED=false
```

**Uwaga**: Te zmienne nie są obecnie w `.env` - można je dodać w razie potrzeby.

## 🔐 Funkcje bezpieczeństwa bazy danych

### Helper Functions dla RLS

Makerkit zapewnia gotowe funkcje bezpieczeństwa:

```sql
-- Sprawdzenie właściciela konta
public.is_account_owner(account_id uuid)

-- Sprawdzenie członkostwa w zespole
public.has_role_on_account(account_id uuid, account_role varchar(50) default null)

-- Sprawdzenie konkretnego uprawnienia
public.has_permission(user_id uuid, account_id uuid, permission_name app_permissions)

-- Sprawdzenie aktywnej subskrypcji
public.has_active_subscription(account_id uuid)

-- Sprawdzenie Super Admin
public.is_super_admin()

-- Sprawdzenie MFA
public.is_mfa_compliant()
public.is_aal2()
```

### Wzorce bezpieczeństwa

**Zawsze używaj RLS na nowych tabelach:**

```sql
-- KROK 1: Utwórz tabelę
CREATE TABLE IF NOT EXISTS public.your_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  -- twoje pola
);

-- KROK 2: WŁĄCZ RLS (NIGDY NIE POMIJAJ!)
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

-- KROK 3: Utwórz polityki RLS
CREATE POLICY "your_table_select" ON public.your_table
  FOR SELECT TO authenticated
  USING (
    account_id = (SELECT auth.uid())  -- Personal account
    OR 
    public.has_role_on_account(account_id)  -- Team member
  );
```

## 📝 Tworzenie nowych funkcji (Przykład)

### Workflow dodawania nowej funkcji

#### 1. Zaplanuj schemat

Zastanów się:
- Czy dane należą do użytkownika czy konta?
- Jakie są wzorce dostępu?
- Czy potrzebujesz uprawnień?
- Czy integruje się z billingiem?

#### 2. Utwórz plik schematu

```bash
# Utwórz nowy plik schematu (następny numer po 17)
touch apps/web/supabase/schemas/18-your-feature.sql
```

#### 3. Napisz schemat SQL

Przykład: Tabela "notes" z pełnym RLS:

```sql
-- apps/web/supabase/schemas/18-notes.sql

-- 1. Utwórz tabelę
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  title varchar(500) NOT NULL,
  content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  CONSTRAINT notes_account_required CHECK (account_id IS NOT NULL)
);

-- 2. Utwórz indeksy
CREATE INDEX idx_notes_account_id ON public.notes(account_id);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);

-- 3. WŁĄCZ RLS
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 4. Utwórz polityki RLS
CREATE POLICY "notes_select" ON public.notes
  FOR SELECT TO authenticated
  USING (
    account_id = (SELECT auth.uid())
    OR public.has_role_on_account(account_id)
  );

CREATE POLICY "notes_insert" ON public.notes
  FOR INSERT TO authenticated
  WITH CHECK (
    account_id = (SELECT auth.uid())
    OR public.has_permission(auth.uid(), account_id, 'notes.create')
  );
```

#### 4. Wygeneruj migrację

```bash
# Uruchom Supabase lokalnie
pnpm supabase:web:start

# Wygeneruj migrację z różnic
pnpm --filter web supabase:db:diff -f add-notes-feature

# Zresetuj bazę danych (zastosuje wszystkie schematy)
pnpm supabase:web:reset

# Wygeneruj typy TypeScript
pnpm supabase:web:typegen
```

#### 5. Zweryfikuj migrację

Zawsze sprawdź wygenerowany plik migracji w `apps/web/supabase/migrations/` przed push do produkcji!

#### 6. Push do produkcji (po testach)

```bash
pnpm --filter web supabase db push
```

## 🎯 Najlepsze praktyki

### Zasady projektowania tabel

1. **Zawsze dodawaj `account_id`** dla danych związanych z kontem
2. **Używaj `ON DELETE CASCADE`** dla `account_id` - automatyczne usuwanie danych przy usunięciu konta
3. **Dodawaj pola audytowe**: `created_at`, `updated_at`, `created_by`, `updated_by`
4. **Twórz indeksy** dla często używanych zapytań
5. **Używaj triggerów** dla automatycznych aktualizacji (`trigger_set_timestamps`)

### Wzorce RLS

**Podstawowy wzorzec (dla większości tabel):**

```sql
-- SELECT: Właściciel konta lub członek zespołu
CREATE POLICY "table_select" ON public.your_table
  FOR SELECT TO authenticated
  USING (
    account_id = (SELECT auth.uid())
    OR public.has_role_on_account(account_id)
  );

-- INSERT: Właściciel lub uprawnienie create
CREATE POLICY "table_insert" ON public.your_table
  FOR INSERT TO authenticated
  WITH CHECK (
    account_id = (SELECT auth.uid())
    OR public.has_permission(auth.uid(), account_id, 'your_feature.create')
  );
```

### Dodawanie uprawnień

Jeśli potrzebujesz nowych uprawnień:

```sql
-- Dodaj nowe uprawnienia do enum (RĘCZNIE - diff nie obsługuje enum!)
ALTER TYPE public.app_permissions ADD VALUE 'notes.create';
ALTER TYPE public.app_permissions ADD VALUE 'notes.manage';
ALTER TYPE public.app_permissions ADD VALUE 'notes.delete';

-- Przypisz uprawnienia do ról
INSERT INTO public.role_permissions (role, permission) VALUES
  ('owner', 'notes.create'),
  ('owner', 'notes.manage'),
  ('owner', 'notes.delete'),
  ('member', 'notes.create');
```

## 🔗 Integracja z funkcjami aplikacji

### Użycie w Server Components

```typescript
import { getSupabaseServerClient } from '@kit/supabase/server-client';

async function NotesPage({ params }: { params: { account: string } }) {
  const client = getSupabaseServerClient();
  
  // RLS automatycznie filtruje dostępne notatki
  const { data: notes } = await client
    .from('notes')
    .select('*')
    .eq('account_id', params.account)
    .order('created_at', { ascending: false });
    
  return <NotesList notes={notes} />;
}
```

### Użycie w Server Actions

```typescript
'use server';

import { enhanceAction } from '@kit/next/actions';
import { z } from 'zod';

const CreateNoteSchema = z.object({
  account_id: z.string().uuid(),
  title: z.string().min(1).max(500),
  content: z.string().optional(),
});

export const createNote = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();
    
    // RLS automatycznie sprawdza uprawnienia
    const { data: note, error } = await client
      .from('notes')
      .insert({
        account_id: data.account_id,
        title: data.title,
        content: data.content,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return { success: true, data: note };
  },
  { schema: CreateNoteSchema }
);
```

## 📊 Przydatne komendy

### Zarządzanie bazą danych

```bash
# Start Supabase lokalnie
pnpm supabase:web:start

# Reset bazy danych (zastosuje wszystkie schematy)
pnpm supabase:web:reset

# Wygeneruj migrację z różnic
pnpm --filter web supabase:db:diff -f nazwa-migracji

# Push migracji do produkcji
pnpm --filter web supabase db push

# Wygeneruj typy TypeScript z bazy danych
pnpm supabase:web:typegen

# Sprawdź status Supabase
pnpm --filter web supabase status
```

### Walidacja i testy

```bash
# Sprawdź typy TypeScript
pnpm typecheck

# Uruchom testy bazy danych (jeśli dostępne)
pnpm --filter web supabase:test
```

## 🚀 Następne kroki

1. **Przejrzyj istniejące schematy** w `apps/web/supabase/schemas/` jako przykłady
2. **Zaplanuj swoją pierwszą funkcję** używając wzorców z dokumentacji
3. **Stwórz schemat SQL** z pełnym RLS
4. **Przetestuj lokalnie** przed push do produkcji
5. **Zaktualizuj typy TypeScript** po zmianach schematu

## 📖 Przydatne linki

- [Dokumentacja Database Architecture](https://makerkit.dev/docs/next-supabase-turbo/database-architecture)
- [Database Functions Reference](https://makerkit.dev/docs/next-supabase-turbo/database-functions)
- [Extending Database Schema Guide](https://makerkit.dev/docs/next-supabase-turbo/extending-database-schema)
- [Supabase MCP Server Documentation](https://makerkit.dev/docs/next-supabase-turbo/mcp-server)
