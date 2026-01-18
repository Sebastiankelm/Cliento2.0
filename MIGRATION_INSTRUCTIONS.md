# Instrukcje zastosowania migracji dla personal accounts

## Problem
Błąd 500 podczas dodawania klienta - RLS policy blokuje INSERT, ponieważ funkcja `has_permission` nie obsługuje personal accounts.

## Rozwiązanie
Należy zastosować migrację `26-fix-has-permission-for-personal-accounts.sql` w Supabase Dashboard.

## Kroki:

1. **Otwórz Supabase Dashboard**
   - Przejdź do https://supabase.com/dashboard
   - Wybierz swój projekt

2. **Otwórz SQL Editor**
   - W lewym menu kliknij "SQL Editor"
   - Kliknij "New query"

3. **Skopiuj i wykonaj migrację**
   - Otwórz plik `apps/web/supabase/schemas/26-fix-has-permission-for-personal-accounts.sql`
   - Skopiuj całą zawartość
   - Wklej do SQL Editor w Supabase Dashboard
   - Kliknij "Run" lub naciśnij Ctrl+Enter

4. **Sprawdź wynik**
   - Powinieneś zobaczyć komunikat "Success. No rows returned"
   - Jeśli jest błąd, sprawdź szczegóły i upewnij się, że wszystkie poprzednie migracje zostały zastosowane

5. **Przetestuj**
   - Spróbuj dodać klienta ponownie
   - Powinno działać poprawnie

## Alternatywnie - sprawdź czy migracja została już zastosowana:

Wykonaj w SQL Editor:
```sql
-- Check if has_permission function includes personal account support
SELECT 
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%is_personal_account%' 
    THEN 'PASS: Function includes personal account support'
    ELSE 'FAIL: Function does not include personal account support'
  END AS result
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'has_permission';
```

Jeśli wynik to "FAIL", zastosuj migrację `26-fix-has-permission-for-personal-accounts.sql`.
