# 🔧 Naprawa błędu buildu Vercel

## ❌ Problem

Build Vercel kończy się błędem:
```
Error [ZodError]: Please provide a valid HTTPS URL. Set the variable NEXT_PUBLIC_SITE_URL with a valid URL
```

## ✅ Rozwiązanie

Zmienna `NEXT_PUBLIC_SITE_URL` **nie jest ustawiona** w Vercel lub ma **nieprawidłową wartość** (np. `http://` zamiast `https://`).

### Krok 1: Sprawdź URL Twojego projektu Vercel

Otwórz: https://vercel.com/sebastiankelms-projects/cliento2-0/settings/environment-variables

Sprawdź domyślny URL projektu w zakładce **"Domains"** lub użyj wzorca:
- `https://cliento2-0.vercel.app` (główny deployment)
- `https://cliento2-0-sebastiankelms-projects.vercel.app` (alternatywny)

### Krok 2: Dodaj/uaktualnij zmienną `NEXT_PUBLIC_SITE_URL`

W Vercel Dashboard → Settings → Environment Variables:

1. **Dodaj nową zmienną** (lub edytuj istniejącą):
   - **Key**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://cliento2-0.vercel.app` (lub Twój domenę, jeśli masz custom domain)
   - **Target**: Production, Preview, Development (zaznacz wszystkie)

2. **Zapisz**

### Krok 3: Wykonaj redeploy

Po dodaniu zmiennej:
1. Przejdź do: https://vercel.com/sebastiankelms-projects/cliento2-0/deployments
2. Kliknij **"..."** przy najnowszym deploymencie
3. Wybierz **"Redeploy"**

LUB po prostu zrób nowy commit i push do GitHub (automatyczny redeploy).

## ✅ Pozostałe wymagane zmienne

Upewnij się, że masz również ustawione (sprawdź `VERCEL_ENV_VARIABLES.md`):

- ✅ `NEXT_PUBLIC_SITE_URL` - **WYMAGANE** (błąd buildu)
- ✅ `NEXT_PUBLIC_PRODUCT_NAME` - np. `Cliento`
- ✅ `NEXT_PUBLIC_SITE_TITLE` - np. `Cliento - CRM Management`
- ✅ `NEXT_PUBLIC_SITE_DESCRIPTION` - np. `CRM application for managing clients`
- ✅ `NEXT_PUBLIC_DEFAULT_LOCALE` - np. `en`
- ✅ `NEXT_PUBLIC_DEFAULT_THEME_MODE` - np. `system`
- ✅ `NEXT_PUBLIC_THEME_COLOR` - np. `#000000`
- ✅ `NEXT_PUBLIC_THEME_COLOR_DARK` - np. `#ffffff`
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Twój Supabase URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Twój Supabase Anon Key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Twój Supabase Service Role Key

## ⚠️ Uwaga

Wszystkie zmienne z prefiksem `NEXT_PUBLIC_` **MUSZĄ** używać `https://` w produkcji (nie `http://`).

## 📝 Szybkie sprawdzenie

Po ustawieniu `NEXT_PUBLIC_SITE_URL`, wykonaj:

```bash
cd apps/web
vercel env ls
```

Powinieneś zobaczyć `NEXT_PUBLIC_SITE_URL` na liście.
