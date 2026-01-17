# Szybka konfiguracja - Vercel i Supabase

## ⚡ Szybki Start

### Krok 1: Vercel CLI - Logowanie i dodanie zmiennych

```powershell
# 1. Przejdź do katalogu web
cd apps/web

# 2. Zaloguj się do Vercel (otworzy się przeglądarka)
vercel login

# 3. Dodaj zmienne środowiskowe podstawowe
echo "https://cliento2-0-sebastiankelms-projects.vercel.app" | vercel env add NEXT_PUBLIC_SITE_URL production
echo "Cliento" | vercel env add NEXT_PUBLIC_PRODUCT_NAME production
echo "Cliento - CRM Management" | vercel env add NEXT_PUBLIC_SITE_TITLE production
echo "CRM application for managing clients" | vercel env add NEXT_PUBLIC_SITE_DESCRIPTION production
echo "en" | vercel env add NEXT_PUBLIC_DEFAULT_LOCALE production
echo "system" | vercel env add NEXT_PUBLIC_DEFAULT_THEME_MODE production
echo "#000000" | vercel env add NEXT_PUBLIC_THEME_COLOR production
echo "#ffffff" | vercel env add NEXT_PUBLIC_THEME_COLOR_DARK production
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS production
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION production
echo "true" | vercel env add NEXT_PUBLIC_ENABLE_NOTIFICATIONS production

# 4. Dodaj dla preview i development (skopiuj te same komendy zmieniając "production" na "preview" i "development")

# 5. Dodaj Supabase (SKOPIUJ klucze z https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/settings/api)
echo "https://gnwpzliiwwrlothcwxxv.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "[TWÓJ_ANON_KEY]" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "[TWÓJ_SERVICE_ROLE_KEY]" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### Krok 2: Supabase - Zastosowanie migracji

**Opcja A: Przez Dashboard (NAJŁATWIEJSZE) ⭐**

1. Otwórz: https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/sql/new
2. Skopiuj **całą zawartość** z: `apps/web/supabase/schemas/18-clients.sql`
3. Wklej do SQL Editor → **Run**
4. Skopiuj **całą zawartość** z: `apps/web/supabase/schemas/19-clients-permissions.sql`  
5. Wklej do SQL Editor → **Run**

**Opcja B: Przez CLI**

```powershell
cd apps/web

# Logowanie
supabase login

# Połączenie z projektem
supabase link --project-ref gnwpzliiwwrlothcwxxv

# Zastosowanie migracji (wymaga uruchomionego Supabase lokalnie lub connection string)
# LUB użyj ręcznie przez Dashboard (Opcja A)
```

## ✅ Po wykonaniu

1. **Vercel** automatycznie uruchomi nowy build po następnym pushu
2. **Sprawdź status**: https://vercel.com/sebastiankelms-projects/cliento2-0/deployments
3. **CRM będzie działać** po zastosowaniu migracji w Supabase

## 📝 Uwagi

- `vercel login` wymaga interakcji w przeglądarce
- Klucze Supabase znajdziesz w: Supabase Dashboard → Settings → API
- Migracja przez Dashboard jest najprostsza - po prostu skopiuj i wklej SQL
