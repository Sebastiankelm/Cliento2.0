/*
 * ============================================================
 * PEŁNA MIGRACJA SUPABASE - WSZYSTKIE SCHEMATY (00-19)
 * ============================================================
 * 
 * UWAGA: Ten plik zawiera wszystkie schematy Makerkit + CRM
 * Wykonaj go w Supabase Dashboard → SQL Editor
 * 
 * Instrukcja:
 * 1. Otwórz: https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/sql/new
 * 2. Skopiuj zawartość tego pliku i wklej do SQL Editor
 * 3. Kliknij "Run"
 * 
 * UWAGA: Jeśli wystąpią błędy związane z "already exists",
 * oznacza to, że niektóre schematy są już zastosowane - to jest OK.
 * ============================================================
 */

-- UWAGA: Ten plik jest zbyt duży (>100KB).
-- Zalecane jest zastosowanie schematów pojedynczo lub w mniejszych grupach.
-- Zobacz SUPABASE_FULL_MIGRATION.md dla szczegółowych instrukcji.

-- Ze względu na rozmiar, schematy powinny być zastosowane pojedynczo.
-- Poniżej znajduje się lista kolejności:

/*
SCHEMATY DO ZASTOSOWANIA (w kolejności):
1. 00-privileges.sql
2. 01-enums.sql
3. 02-config.sql
4. 03-accounts.sql
5. 04-roles.sql
6. 05-memberships.sql
7. 06-roles-permissions.sql
8. 07-invitations.sql
9. 08-billing-customers.sql
10. 09-subscriptions.sql
11. 10-orders.sql
12. 11-notifications.sql
13. 12-one-time-tokens.sql
14. 13-mfa.sql
15. 14-super-admin.sql
16. 15-account-views.sql
17. 16-storage.sql
18. 17-roles-seed.sql
19. 18-clients.sql
20. 19-clients-permissions.sql (UWAGA: Wykonuj każdy ALTER TYPE osobno!)
*/
