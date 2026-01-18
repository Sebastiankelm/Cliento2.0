# Weryfikacja i Testowanie Strony Klientów (Clients Page)

## ✅ Status Implementacji

### 1. Schemat Bazy Danych
- ✅ **18-clients.sql** - Tabela `clients` z pełnym schematem
- ✅ **19-clients-permissions.sql** - Uprawnienia dla klientów
- ✅ **37-optimize-rls-policies.sql** - Zoptymalizowane polityki RLS (zaktualizowane)

### 2. Komponenty Frontend
- ✅ `page.tsx` - Główna strona listy klientów
- ✅ `[id]/page.tsx` - Strona szczegółów klienta
- ✅ `clients-table.tsx` - Tabela z klientami
- ✅ `client-form.tsx` - Formularz tworzenia/edycji
- ✅ `client-details.tsx` - Widok szczegółów klienta
- ✅ `new-client-dialog.tsx` - Dialog tworzenia klienta
- ✅ `delete-client-dialog.tsx` - Dialog usuwania klienta
- ✅ `clients-filters.tsx` - Filtry i wyszukiwanie (NOWE)

### 3. Server Actions
- ✅ `clients-server-actions.ts` - CRUD operacje
- ✅ `clients-page.loader.ts` - Funkcje ładowania danych

### 4. Walidacja
- ✅ `client.schema.ts` - Schematy Zod

## 🔍 Weryfikacja Migracji

### Krok 1: Sprawdź czy tabele istnieją

```sql
-- Sprawdź czy tabela clients istnieje
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'clients'
);

-- Sprawdź strukturę tabeli
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'clients'
ORDER BY ordinal_position;
```

### Krok 2: Sprawdź uprawnienia w enum

```sql
-- Sprawdź czy uprawnienia clients.* są w enum
SELECT unnest(enum_range(NULL::public.app_permissions)) AS permission
WHERE unnest(enum_range(NULL::public.app_permissions))::text LIKE 'clients.%';
```

**Oczekiwane wartości:**
- `clients.read`
- `clients.create`
- `clients.update`
- `clients.delete`
- `clients.manage`

### Krok 3: Sprawdź przypisanie uprawnień do ról

```sql
-- Sprawdź przypisania uprawnień
SELECT rp.role, rp.permission
FROM public.role_permissions rp
WHERE rp.permission::text LIKE 'clients.%'
ORDER BY rp.role, rp.permission;
```

**Oczekiwane wyniki:**
- `owner` powinien mieć wszystkie uprawnienia clients.*
- `member` powinien mieć `clients.read` i `clients.create`

### Krok 4: Sprawdź polityki RLS

```sql
-- Sprawdź polityki RLS dla tabeli clients
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'clients'
ORDER BY policyname;
```

**Oczekiwane polityki:**
- `clients_select` - SELECT
- `clients_insert` - INSERT
- `clients_update` - UPDATE
- `clients_delete` - DELETE

### Krok 5: Sprawdź indeksy

```sql
-- Sprawdź indeksy
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'clients'
ORDER BY indexname;
```

**Oczekiwane indeksy:**
- `idx_clients_account_id`
- `idx_clients_account_created`
- `idx_clients_email`
- `idx_clients_status`
- `idx_clients_created_at`

## 🧪 Testowanie Funkcjonalności

### Test 1: Tworzenie Klienta

1. Przejdź do `/home/[account]/clients`
2. Kliknij "Add New Client"
3. Wypełnij formularz:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john@example.com"
   - Status: "lead"
4. Kliknij "Create Client"
5. **Oczekiwany wynik:** Klient zostaje utworzony i pojawia się w tabeli

### Test 2: Edycja Klienta

1. Kliknij na klienta w tabeli
2. Kliknij "Edit"
3. Zmień status na "active"
4. Kliknij "Save Changes"
5. **Oczekiwany wynik:** Zmiany są zapisane

### Test 3: Usuwanie Klienta

1. Kliknij ikonę kosza przy kliencie
2. Potwierdź usunięcie
3. **Oczekiwany wynik:** Klient zostaje usunięty

### Test 4: Wyszukiwanie

1. Wpisz w pole wyszukiwania: "John"
2. Naciśnij Enter
3. **Oczekiwany wynik:** Tabela filtruje się do klientów zawierających "John"

### Test 5: Filtrowanie po Statusie

1. Wybierz status "active" z dropdown
2. **Oczekiwany wynik:** Tabela pokazuje tylko klientów ze statusem "active"

### Test 6: Uprawnienia

**Jako Owner:**
- ✅ Powinien móc tworzyć klientów
- ✅ Powinien móc edytować klientów
- ✅ Powinien móc usuwać klientów

**Jako Member:**
- ✅ Powinien móc przeglądać klientów
- ✅ Powinien móc tworzyć klientów
- ❌ NIE powinien móc edytować klientów (chyba że ma `clients.update`)
- ❌ NIE powinien móc usuwać klientów (chyba że ma `clients.delete`)

## 🔧 Naprawione Problemy

### 1. Brakująca polityka SELECT w zoptymalizowanych RLS
**Status:** ✅ Naprawione
- Dodano brakującą politykę `clients_select` w `37-optimize-rls-policies.sql`

### 2. Brak funkcjonalnego wyszukiwania
**Status:** ✅ Naprawione
- Utworzono komponent `ClientsFilters` z działającym wyszukiwaniem i filtrowaniem

### 3. Brak filtrowania po statusie w UI
**Status:** ✅ Naprawione
- Dodano dropdown do filtrowania po statusie

## 📋 Checklist Wdrożenia

- [ ] Zastosuj migrację `18-clients.sql` w Supabase
- [ ] Zastosuj migrację `19-clients-permissions.sql` (krok po kroku!)
- [ ] Zastosuj migrację `37-optimize-rls-policies.sql`
- [ ] Sprawdź czy uprawnienia są przypisane do ról
- [ ] Przetestuj tworzenie klienta
- [ ] Przetestuj edycję klienta
- [ ] Przetestuj usuwanie klienta
- [ ] Przetestuj wyszukiwanie
- [ ] Przetestuj filtrowanie
- [ ] Przetestuj uprawnienia (owner vs member)

## 🚀 Następne Kroki (Opcjonalne Ulepszenia)

1. **Eksport/Import klientów** - Dodaj funkcję eksportu do CSV/Excel
2. **Bulk operations** - Zaznaczanie wielu klientów i operacje masowe
3. **Zaawansowane filtry** - Filtrowanie po dacie, źródle, firmie
4. **Statystyki** - Dashboard z statystykami klientów
5. **Historia zmian** - Audit log zmian w klientach
6. **Integracje** - Połączenie z email, kalendarzem, itp.

## 📝 Notatki

- Polityki RLS używają zoptymalizowanych funkcji `has_permission_for_current_user` dla lepszej wydajności
- Wszystkie operacje są logowane przez `getLogger()`
- Formularze używają `react-hook-form` z walidacją Zod
- Server Actions używają `enhanceAction` dla bezpieczeństwa
