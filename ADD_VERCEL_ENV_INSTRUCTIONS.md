# 📝 Instrukcje: Dodawanie zmiennych środowiskowych do Vercel

## 🔐 Krok 1: Zaloguj się do Vercel CLI

```powershell
vercel login
```

To otworzy przeglądarkę i poprosi o autoryzację. Po zalogowaniu możesz kontynuować.

## 🚀 Krok 2: Uruchom skrypt PowerShell

Skrypt automatycznie doda wszystkie nie-sensytywne zmienne środowiskowe:

```powershell
.\add-vercel-env-variables.ps1
```

### Co robi skrypt:

- ✅ Dodaje wszystkie `NEXT_PUBLIC_*` zmienne do production, preview, development
- ✅ Sprawdza czy użytkownik jest zalogowany
- ✅ Obsługuje przypadki gdy zmienna już istnieje
- ✅ Pokazuje raport z wynikami

## ⚠️ Krok 3: Dodaj SECRET zmienne ręcznie

Po uruchomieniu skryptu, **MUSISZ** dodać te zmienne ręcznie w Vercel Dashboard (ze względów bezpieczeństwa):

1. Otwórz: https://vercel.com/sebastiankelms-projects/cliento2-0/settings/environment-variables

2. Dodaj **NEXT_PUBLIC_SUPABASE_ANON_KEY**:
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Skopiuj z Supabase Dashboard → Settings → API → `anon` `public` key
   - Type: Encrypted
   - Target: Production, Preview, Development

3. Dodaj **SUPABASE_SERVICE_ROLE_KEY**:
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Skopiuj z Supabase Dashboard → Settings → API → `service_role` `secret` key
   - Type: Secret (very important!)
   - Target: Production, Preview, Development

## ✅ Krok 4: Weryfikacja

Sprawdź czy wszystkie zmienne zostały dodane:

```powershell
cd apps/web
vercel env ls
```

## 🚀 Krok 5: Redeploy

Po dodaniu wszystkich zmiennych, wykonaj redeploy:

1. Automatycznie: Zrób nowy commit i push do GitHub
2. Ręcznie: Vercel Dashboard → Deployments → "..." → "Redeploy"

## 📋 Lista wszystkich zmiennych

### Dodawane automatycznie przez skrypt:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_PRODUCT_NAME`
- `NEXT_PUBLIC_SITE_TITLE`
- `NEXT_PUBLIC_SITE_DESCRIPTION`
- `NEXT_PUBLIC_DEFAULT_LOCALE`
- `NEXT_PUBLIC_DEFAULT_THEME_MODE`
- `NEXT_PUBLIC_THEME_COLOR`
- `NEXT_PUBLIC_THEME_COLOR_DARK`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS`
- `NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION`
- `NEXT_PUBLIC_ENABLE_NOTIFICATIONS`
- `NEXT_PUBLIC_REALTIME_NOTIFICATIONS`

### Do dodania ręcznie (SECRET):
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ⚠️
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️
