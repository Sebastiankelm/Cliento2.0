# 🚀 Przewodnik wdrożenia - GitHub, Vercel i Supabase

## ✅ Status wdrożenia

### 1. GitHub ✅
- **Repozytorium**: https://github.com/Sebastiankelm/Cliento2.0
- **Status**: Kod został wypchnięty pomyślnie
- **Ostatni commit**: `cc0d443a` - "Add development guides and configuration documentation"

### 2. Vercel ✅
- **Projekt**: `cliento2-0`
- **Project ID**: `prj_W4Gmwfvh1AJ4qqHHkCLb8ub12yVS`
- **Status**: Wdrożenie w trakcie budowania
- **URL produkcji**: https://cliento2-0-sebastiankelms-projects.vercel.app
- **URL preview**: https://cliento2-0-git-main-sebastiankelms-projects.vercel.app
- **Git Integration**: ✅ Włączona (automatyczne wdrożenia przy push)

### 3. Supabase ⚠️
- **Project URL**: https://gnwpzliiwwrlothcwxxv.supabase.co
- **Status**: Wymaga konfiguracji zmiennych środowiskowych w Vercel

---

## 🔧 Konfiguracja Supabase w Vercel

### Krok 1: Pobierz klucze z Supabase Dashboard

1. Przejdź do: https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/settings/api
2. Skopiuj następujące wartości:
   - **Project URL**: `https://gnwpzliiwwrlothcwxxv.supabase.co` (już masz)
   - **anon/public key**: Klucz publiczny (używany po stronie klienta)
   - **service_role key**: Klucz serwisowy (tylko po stronie serwera - NIE UDOSTĘPNIAJ)

### Krok 2: Dodaj zmienne środowiskowe w Vercel

1. Przejdź do: https://vercel.com/sebastiankelms-projects/cliento2-0/settings/environment-variables

2. Dodaj następujące zmienne dla środowiska **Production** (i opcjonalnie **Preview**):

#### Wymagane zmienne Supabase:

```bash
# URL projektu Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gnwpzliiwwrlothcwxxv.supabase.co

# Klucz publiczny (anon key) - można używać po stronie klienta
NEXT_PUBLIC_SUPABASE_PUBLIC_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# LUB (starsza wersja)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Klucz serwisowy (service_role) - TYLKO po stronie serwera!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# LUB
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL aplikacji (Vercel)
NEXT_PUBLIC_SITE_URL=https://cliento2-0-sebastiankelms-projects.vercel.app
```

#### Opcjonalne zmienne:

```bash
# Webhook secret (jeśli używasz database webhooks)
SUPABASE_DB_WEBHOOK_SECRET=your-webhook-secret-here
```

### Krok 3: Ustawienia zmiennych w Vercel

Dla każdej zmiennej:
- **Type**: Wybierz `Encrypted` lub `Secret` dla kluczy
- **Environment**: 
  - ✅ **Production** (wymagane)
  - ✅ **Preview** (zalecane dla testów)
  - ⚪ **Development** (opcjonalne)

### Krok 4: Ponowne wdrożenie

Po dodaniu zmiennych środowiskowych:
1. Vercel automatycznie wykryje zmiany i uruchomi nowe wdrożenie
2. LUB możesz ręcznie wywołać redeploy w dashboardzie Vercel

---

## 🔗 Linki do konfiguracji

### Vercel
- **Dashboard projektu**: https://vercel.com/sebastiankelms-projects/cliento2-0
- **Zmienne środowiskowe**: https://vercel.com/sebastiankelms-projects/cliento2-0/settings/environment-variables
- **Deployments**: https://vercel.com/sebastiankelms-projects/cliento2-0/deployments

### Supabase
- **Dashboard**: https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv
- **API Settings**: https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/settings/api
- **Database**: https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/editor

### GitHub
- **Repozytorium**: https://github.com/Sebastiankelm/Cliento2.0

---

## 📋 Checklist wdrożenia

- [x] Kod wypchnięty do GitHub
- [x] Projekt połączony z Vercel
- [x] Wdrożenie uruchomione na Vercel
- [ ] Zmienne środowiskowe Supabase dodane w Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` skonfigurowane
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLIC_KEY` skonfigurowane
- [ ] `SUPABASE_SERVICE_ROLE_KEY` skonfigurowane
- [ ] `NEXT_PUBLIC_SITE_URL` skonfigurowane
- [ ] Aplikacja działa poprawnie na Vercel
- [ ] Połączenie z Supabase działa

---

## 🛠️ Dodatkowe kroki (opcjonalne)

### Migracja bazy danych do Supabase produkcyjnego

Jeśli masz lokalne migracje, które chcesz zastosować w produkcyjnej bazie:

```bash
# Połącz się z produkcyjnym Supabase
cd apps/web
supabase link --project-ref gnwpzliiwwrlothcwxxv

# Zastosuj migracje
supabase db push
```

### Konfiguracja domeny niestandardowej

1. W Vercel: Settings → Domains
2. Dodaj swoją domenę
3. Zaktualizuj `NEXT_PUBLIC_SITE_URL` w zmiennych środowiskowych

### Konfiguracja Supabase Auth redirects

W Supabase Dashboard → Authentication → URL Configuration:
- Dodaj URL Vercel do **Redirect URLs**:
  - `https://cliento2-0-sebastiankelms-projects.vercel.app/auth/callback`
  - `https://cliento2-0-sebastiankelms-projects.vercel.app/update-password`

---

## 🐛 Rozwiązywanie problemów

### Problem: Błąd "Missing Supabase keys"
**Rozwiązanie**: Upewnij się, że wszystkie wymagane zmienne są dodane w Vercel i że wybrałeś odpowiednie środowisko (Production/Preview).

### Problem: Błąd połączenia z Supabase
**Rozwiązanie**: 
1. Sprawdź czy `NEXT_PUBLIC_SUPABASE_URL` jest poprawne
2. Sprawdź czy klucze są poprawne w Supabase Dashboard
3. Sprawdź logi w Vercel: Deployments → wybierz deployment → Logs

### Problem: Aplikacja nie buduje się
**Rozwiązanie**: 
1. Sprawdź logi budowania w Vercel
2. Upewnij się, że wszystkie zależności są w `package.json`
3. Sprawdź czy `turbo.json` jest poprawnie skonfigurowany

---

## 📞 Wsparcie

Jeśli napotkasz problemy:
1. Sprawdź logi w Vercel Dashboard
2. Sprawdź logi w Supabase Dashboard
3. Sprawdź dokumentację:
   - [Vercel Docs](https://vercel.com/docs)
   - [Supabase Docs](https://supabase.com/docs)
   - [Makerkit Docs](https://makerkit.dev/docs)

---

**Ostatnia aktualizacja**: $(Get-Date -Format "yyyy-MM-dd HH:mm")
