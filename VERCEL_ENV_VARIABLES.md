# Zmienne środowiskowe dla Vercel - Cliento 2.0

## Instrukcja dodawania zmiennych w Vercel Dashboard

1. Przejdź do: https://vercel.com/sebastiankelms-projects/cliento2-0/settings/environment-variables
2. Dodaj każdą zmienną poniżej (wartości w kolumnie "Value")
3. Ustaw **Target**: Production, Preview, Development (lub wybierz odpowiednie)
4. Zapisz i wykonaj redeploy

## Wymagane zmienne środowiskowe

### Podstawowa konfiguracja aplikacji

| Key | Value | Type | Target |
|-----|-------|------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://cliento2-0-sebastiankelms-projects.vercel.app` | Plain | Production, Preview, Development |
| `NEXT_PUBLIC_PRODUCT_NAME` | `Cliento` | Plain | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_TITLE` | `Cliento - CRM Management` | Plain | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | `CRM application for managing clients` | Plain | Production, Preview, Development |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en` | Plain | Production, Preview, Development |
| `NEXT_PUBLIC_DEFAULT_THEME_MODE` | `system` | Plain | Production, Preview, Development |
| `NEXT_PUBLIC_THEME_COLOR` | `#000000` | Plain | Production, Preview, Development |
| `NEXT_PUBLIC_THEME_COLOR_DARK` | `#ffffff` | Plain | Production, Preview, Development |

### Supabase Configuration

**UWAGA**: Poniższe wartości musisz skopiować ze swojego projektu Supabase:
- `NEXT_PUBLIC_SUPABASE_URL` - znajdziesz w Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - znajdziesz w Supabase Dashboard → Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` - znajdziesz w Supabase Dashboard → Settings → API (Secret key)

| Key | Value | Type | Target |
|-----|-------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gnwpzliiwwrlothcwxxv.supabase.co` | Plain | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[SKOPIUJ_Z_SUPABASE_DASHBOARD]` | Encrypted | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `[SKOPIUJ_Z_SUPABASE_DASHBOARD]` | Secret | Production, Preview, Development |

### Opcjonalne zmienne (Feature Flags)

| Key | Value | Type | Target |
|-----|-------|------|--------|
| `NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS` | `true` | Plain | Production, Preview, Development |
| `NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION` | `true` | Plain | Production, Preview, Development |
| `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` | `true` | Plain | Production, Preview, Development |
| `NEXT_PUBLIC_REALTIME_NOTIFICATIONS` | `false` | Plain | Production, Preview, Development |

## Szybkie dodanie przez Vercel CLI (alternatywa)

Jeśli masz zainstalowany Vercel CLI i jesteś zalogowany:

```bash
cd apps/web

# Dodaj zmienne dla production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_PRODUCT_NAME production
vercel env add NEXT_PUBLIC_SITE_TITLE production
vercel env add NEXT_PUBLIC_SITE_DESCRIPTION production
vercel env add NEXT_PUBLIC_DEFAULT_LOCALE production
vercel env add NEXT_PUBLIC_DEFAULT_THEME_MODE production
vercel env add NEXT_PUBLIC_THEME_COLOR production
vercel env add NEXT_PUBLIC_THEME_COLOR_DARK production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

## Po dodaniu zmiennych

1. **Zapisz** wszystkie zmienne w Vercel Dashboard
2. **Wykonaj redeploy** lub poczekaj na automatyczny rebuild po następnym pushu do GitHub
3. Sprawdź status buildu w: https://vercel.com/sebastiankelms-projects/cliento2-0/deployments
