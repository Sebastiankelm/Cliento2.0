# Instrukcje migracji CRM

## Kolejność aplikowania schematów

Wszystkie schematy CRM muszą być zastosowane w następującej kolejności:

1. **26-client-custom-fields.sql** - Pola niestandardowe
2. **27-client-interactions.sql** - Historia interakcji
3. **28-sales-pipelines.sql** - Pipeline sprzedażowe
4. **29-deals.sql** - Szanse sprzedażowe (deals)
5. **30-tasks.sql** - Zadania
6. **31-automation-rules.sql** - Reguły automatyzacji
7. **32-automation-sequences.sql** - Sekwencje automatyzacji
8. **33-email-integrations.sql** - Integracje email
9. **34-email-threads.sql** - Wątki email
10. **35-calendar-events.sql** - Wydarzenia kalendarza (wymaga deals - 29)
11. **36-crm-permissions-part1-enum-values.sql** - Dodanie wartości enum (SPECJALNE INSTRUKCJE PONIŻEJ)
12. **36-crm-permissions-part2-role-assignments.sql** - Przypisanie do ról (uruchom PO części 1)

## ⚠️ WAŻNE: 36-crm-permissions-part1-enum-values.sql

Ten plik wymaga **szczególnej uwagi**! W PostgreSQL każdy `ALTER TYPE ADD VALUE` musi być w osobnej transakcji.

### W Supabase Dashboard SQL Editor:

1. **Otwórz plik 36-crm-permissions-part1-enum-values.sql**
2. **Wykonaj każdy `ALTER TYPE` POJEDYNCZO** - jeden na raz:
   - Skopiuj pierwszą komendę: `alter type public.app_permissions add value if not exists 'deals.read';`
   - Kliknij "Run" - to automatycznie commit-uje transakcję
   - Powtórz dla każdej kolejnej komendy (łącznie 17 komend)

3. **Zweryfikuj** że wszystkie wartości zostały dodane:
   ```sql
   SELECT unnest(enum_range(NULL::public.app_permissions))::text 
   WHERE unnest::text LIKE 'deals.%' 
      OR unnest::text LIKE 'tasks.%' 
      OR unnest::text LIKE 'automation.%' 
      OR unnest::text LIKE 'integrations.%' 
      OR unnest::text LIKE 'reports.%';
   ```
   Powinieneś zobaczyć wszystkie 17 uprawnień.

4. **Dopiero po weryfikacji**, uruchom **36-crm-permissions-part2-role-assignments.sql**

### Alternatywnie - przez psql:

Jeśli używasz psql, możesz użyć tego skryptu (każdy ALTER TYPE z COMMIT):

```sql
-- Wykonaj każdy ALTER TYPE osobno z COMMIT
alter type public.app_permissions add value if not exists 'deals.read';
COMMIT;

alter type public.app_permissions add value if not exists 'deals.create';
COMMIT;
-- ... itd dla wszystkich 17 komend
```

### Po zakończeniu PART 1:

Uruchom **36-crm-permissions-part2-role-assignments.sql** aby przypisać uprawnienia do ról.

## Po migracji

Po zastosowaniu wszystkich schematów:

1. Uruchom `pnpm supabase:web:typegen` aby wygenerować typy TypeScript
2. Sprawdź czy wszystkie tabele zostały utworzone
3. Sprawdź czy uprawnienia zostały dodane do ról

## Weryfikacja

Sprawdź czy wszystko działa:

```sql
-- Sprawdź czy tabele istnieją
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'client_custom_fields',
  'client_interactions',
  'sales_pipelines',
  'pipeline_stages',
  'deals',
  'tasks',
  'automation_rules',
  'email_integrations'
);

-- Sprawdź czy uprawnienia zostały dodane
SELECT unnest(enum_range(NULL::public.app_permissions)) 
WHERE unnest::text LIKE 'deals.%' 
   OR unnest::text LIKE 'tasks.%';

-- Sprawdź czy uprawnienia są przypisane do ról
SELECT role, permission 
FROM public.role_permissions 
WHERE permission LIKE 'deals.%' 
   OR permission LIKE 'tasks.%';
```
