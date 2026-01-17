# Przewodnik konfiguracji zmiennych środowiskowych

## 📋 Status konfiguracji

### ✅ Zainstalowane zmienne (apps/web/.env)
- **NEXT_PUBLIC_SITE_URL**: `http://localhost:3000` (development)
- **NEXT_PUBLIC_PRODUCT_NAME**: Makerkit
- **NEXT_PUBLIC_AUTH_PASSWORD**: `true`
- **NEXT_PUBLIC_BILLING_PROVIDER**: `stripe`
- **CMS_CLIENT**: `keystatic`

### ⚠️ Wymagane zmienne do skonfigurowania

#### Supabase (WYMAGANE)
Twój projekt Supabase: `https://gnwpzliiwwrlothcwxxv.supabase.co`

**Do konfiguracji w `.env.local` (lokalnie) lub Vercel (produkcja):**

```bash
# Supabase - dla lokalnego developmentu używaj wartości z Supabase lokalnego
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321  # lokalnie
# lub
NEXT_PUBLIC_SUPABASE_URL=https://gnwpzliiwwrlothcwxxv.supabase.co  # produkcja

# Klucze Supabase (nowa wersja - od 2.12.0)
NEXT_PUBLIC_SUPABASE_PUBLIC_KEY=your-public-key-here
SUPABASE_SECRET_KEY=your-service-role-key-here

# Webhook Secret
SUPABASE_DB_WEBHOOK_SECRET=your-webhook-secret
```

**Jak uzyskać klucze Supabase:**
1. Lokalnie: Po uruchomieniu `pnpm supabase:web:start`, klucze są wyświetlane w terminalu
2. Produkcja: Dashboard Supabase > Settings > API

#### Billing - Stripe (opcjonalne, jeśli włączone)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Email Configuration (opcjonalne)
```bash
MAILER_PROVIDER=nodemailer  # lub resend
EMAIL_SENDER=info@yourapp.com
CONTACT_EMAIL=contact@yourapp.com

# Dla Nodemailer:
EMAIL_HOST=smtp.provider.com
EMAIL_PORT=587
EMAIL_USER=your-email-user
EMAIL_PASSWORD=your-email-password
EMAIL_TLS=true

# Dla Resend:
RESEND_API_KEY=re_...
```

## 📁 Struktura plików .env

```
apps/web/
├── .env                    # Wspólne zmienne (publiczne)
├── .env.local              # Lokalne zmienne (git-ignored) - DLA SEKRETÓW
├── .env.development        # Zmienne dla developmentu
└── .env.production         # Zmienne dla produkcji
```

## 🔧 Jak skonfigurować dla lokalnego developmentu

### Krok 1: Utwórz plik `.env.local`
```bash
# W katalogu apps/web/
cp .env .env.local
```

### Krok 2: Dodaj klucze Supabase (po uruchomieniu Supabase lokalnie)

1. Uruchom Supabase lokalnie:
   ```bash
   pnpm supabase:web:start
   ```

2. Skopiuj klucze z terminala lub znajdź je w Supabase Studio (http://localhost:54323)

3. Dodaj do `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_PUBLIC_KEY=<key-from-terminal>
   SUPABASE_SECRET_KEY=<service-role-key-from-terminal>
   SUPABASE_DB_WEBHOOK_SECRET=your-webhook-secret
   ```

## 🚀 Jak skonfigurować dla produkcji (Vercel)

### Krok 1: Dodaj zmienne środowiskowe w Vercel

1. Przejdź do projektu Vercel: https://vercel.com/sebastiankelms-projects/cliento2-0/settings/environment-variables

2. Dodaj wszystkie wymagane zmienne (szczególnie Supabase keys)

### Krok 2: Ustaw zmienne dla odpowiedniego środowiska

- **Production**: Tylko dla produkcji
- **Preview**: Dla preview deployments
- **Development**: Dla lokalnego developmentu (rzadko używane)

## 🔐 Bezpieczeństwo

### ✅ DOZWOLONE w `.env` (committowane):
- `NEXT_PUBLIC_*` zmienne (są publiczne)
- Feature flags
- Konfiguracja (paths, themes, etc.)

### ❌ NIGDY NIE COMMITUJ:
- `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `EMAIL_PASSWORD`
- `KEYSTATIC_GITHUB_TOKEN`

**Wszystkie sekrety powinny być w `.env.local` (lokalnie) lub w zmiennych środowiskowych Vercel (produkcja).**

## 📝 Przydatne komendy

### Sprawdź zmienne środowiskowe:
```bash
# Wyświetl wszystkie zmienne (bez wartości sekretów)
cat apps/web/.env

# Wyświetl zmienne lokalne (jeśli istnieją)
cat apps/web/.env.local
```

### Walidacja konfiguracji:
```bash
# Sprawdź czy wszystkie wymagane zmienne są ustawione
pnpm env:validate
```

### Generowanie szablonu zmiennych:
```bash
# Użyj generatora do stworzenia szablonu
pnpm turbo gen env
```

## 🎯 Feature Flags (opcjonalne)

Aktualnie włączone:
- `NEXT_PUBLIC_ENABLE_THEME_TOGGLE=true`
- `NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS=true`
- `NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION=true`
- `NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_BILLING=true`
- `NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_BILLING=true`

## 🔗 Przydatne linki

- [Dokumentacja Makerkit - Environment Variables](https://makerkit.dev/docs/next-supabase-turbo/environment-variables)
- [Supabase Dashboard](https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv)
- [Vercel Environment Variables](https://vercel.com/sebastiankelms-projects/cliento2-0/settings/environment-variables)
