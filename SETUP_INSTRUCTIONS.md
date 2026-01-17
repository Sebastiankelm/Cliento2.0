# Instrukcje konfiguracji Vercel i Supabase

## 1. Vercel - Dodanie zmiennych środowiskowych

### Krok 1: Logowanie do Vercel CLI
```powershell
cd apps/web
vercel login
```

### Krok 2: Dodanie zmiennych (automatycznie przez skrypt)
```powershell
cd ..\..
.\setup-vercel-env.ps1
```

### Krok 3: Dodanie zmiennych Supabase ręcznie (po skopiowaniu kluczy z Supabase Dashboard)
```powershell
cd apps/web

# NEXT_PUBLIC_SUPABASE_URL
echo "https://gnwpzliiwwrlothcwxxv.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "https://gnwpzliiwwrlothcwxxv.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo "https://gnwpzliiwwrlothcwxxv.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL development

# NEXT_PUBLIC_SUPABASE_ANON_KEY (skopiuj z Supabase Dashboard → Settings → API)
echo "[TWÓJ_ANON_KEY]" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "[TWÓJ_ANON_KEY]" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview  
echo "[TWÓJ_ANON_KEY]" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development

# SUPABASE_SERVICE_ROLE_KEY (skopiuj z Supabase Dashboard → Settings → API → service_role key)
echo "[TWÓJ_SERVICE_ROLE_KEY]" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "[TWÓJ_SERVICE_ROLE_KEY]" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview
echo "[TWÓJ_SERVICE_ROLE_KEY]" | vercel env add SUPABASE_SERVICE_ROLE_KEY development
```

## 2. Supabase - Zastosowanie migracji

### Opcja A: Przez Supabase Dashboard (NAJŁATWIEJSZE)

1. Otwórz: https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/sql/new
2. Skopiuj całą zawartość z `apps/web/supabase/schemas/18-clients.sql`
3. Wklej do SQL Editor i kliknij **Run**
4. Skopiuj całą zawartość z `apps/web/supabase/schemas/19-clients-permissions.sql`  
5. Wklej do SQL Editor i kliknij **Run**

### Opcja B: Przez Supabase CLI

```powershell
cd apps/web

# Logowanie do Supabase
supabase login

# Połączenie z projektem (project_ref z URL: gnwpzliiwwrlothcwxxv)
supabase link --project-ref gnwpzliiwwrlothcwxxv

# Zastosowanie migracji
supabase db push
```

### Opcja C: Bezpośrednio przez SQL (jeśli masz connection string)

```powershell
cd apps/web

# Wykonaj SQL bezpośrednio (wymaga SUPABASE_DB_URL)
$env:SUPABASE_DB_URL = "postgresql://postgres:[PASSWORD]@db.gnwpzliiwwrlothcwxxv.supabase.co:5432/postgres"

Get-Content "supabase\schemas\18-clients.sql" | supabase db push
Get-Content "supabase\schemas\19-clients-permissions.sql" | supabase db push
```

## 3. Weryfikacja

### Vercel
- Sprawdź zmienne: https://vercel.com/sebastiankelms-projects/cliento2-0/settings/environment-variables
- Zobacz deployments: https://vercel.com/sebastiankelms-projects/cliento2-0/deployments

### Supabase  
- Sprawdź tabele: https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/editor
- Powinna być tabela `clients` z kolumnami: id, account_id, first_name, last_name, etc.

## 4. Po zastosowaniu migracji

Po zastosowaniu migracji w Supabase, wygeneruj typy TypeScript lokalnie:
```powershell
cd apps/web
pnpm supabase:typegen
```

Następnie wypchnij zmiany do GitHub i Vercel automatycznie zbuduje aplikację.
