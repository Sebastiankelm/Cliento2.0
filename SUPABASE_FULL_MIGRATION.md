# Pełna migracja Supabase - Wszystkie schematy

## ⚠️ Ważne

Twój projekt Supabase nie ma jeszcze podstawowych schematów Makerkit. **Musisz najpierw zastosować wszystkie schematy (00-17) przed dodaniem clients (18-19)**.

## Sposób 1: Przez Supabase Dashboard (REKOMENDOWANY) ⭐

### Krok 1: Otwórz SQL Editor
https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/sql/new

### Krok 2: Zastosuj wszystkie schematy sekwencyjnie

**WAŻNE**: Wykonuj pliki w kolejności numerycznej!

1. **00-privileges.sql** - Podstawowe uprawnienia i schema kit
2. **01-enums.sql** - Enumy (w tym app_permissions)
3. **02-config.sql** - Tabela config
4. **03-accounts.sql** - Tabela accounts
5. **04-roles.sql** - Tabela roles
6. **05-memberships.sql** - Tabela memberships
7. **06-roles-permissions.sql** - Tabela role_permissions i funkcje
8. **07-invitations.sql** - Tabela invitations
9. **08-billing-customers.sql** - Tabela billing_customers
10. **09-subscriptions.sql** - Tabela subscriptions
11. **10-orders.sql** - Tabela orders
12. **11-notifications.sql** - Tabela notifications
13. **12-one-time-tokens.sql** - Tabela nonces
14. **13-mfa.sql** - Tabela mfa
15. **14-super-admin.sql** - Funkcje super admin
16. **15-account-views.sql** - Widoki
17. **16-storage.sql** - Konfiguracja storage
18. **17-roles-seed.sql** - Seed danych (roles, role_permissions)
19. **18-clients.sql** - Tabela clients (NOWA - CRM)
20. **19-clients-permissions.sql** - Uprawnienia clients (NOWA - CRM)

### Krok 3: Weryfikacja

Po zastosowaniu wszystkich schematów sprawdź:
- Tabela `accounts` istnieje
- Enum `app_permissions` istnieje
- Tabela `clients` istnieje
- Uprawnienia `clients.*` są w enum i przypisane do ról

## Sposób 2: Przez Supabase CLI (jeśli masz dostęp)

```powershell
cd apps/web

# Połącz się z projektem
supabase link --project-ref gnwpzliiwwrlothcwxxv

# Zastosuj wszystkie migracje (jeśli są w migrations/)
supabase db push

# LUB zastosuj schematy ręcznie przez Dashboard (Sposób 1)
```

## Sposób 3: Utworzenie jednej dużej migracji

Możesz skopiować zawartość wszystkich plików schemas/00-*.sql do jednego pliku SQL i wykonać go w Supabase Dashboard.

## 📝 Uwaga

- **Nie pomijaj żadnego schematu** - są zależności między nimi
- **Zachowaj kolejność** - numery w nazwach plików określają kolejność
- **Sprawdzaj błędy** - jeśli coś się nie powiedzie, zatrzymaj i napraw przed kontynuowaniem

## Po zastosowaniu

Po zastosowaniu wszystkich schematów:
1. CRM będzie gotowe do użycia
2. Możesz wygenerować typy TypeScript lokalnie: `pnpm supabase:web:typegen`
3. Vercel build powinien przejść (jeśli zmienne środowiskowe są ustawione)
