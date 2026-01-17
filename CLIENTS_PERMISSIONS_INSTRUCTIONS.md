# Instrukcja: Dodawanie uprawnień clients do Supabase

## ⚠️ Problem

PostgreSQL wymaga osobnych transakcji (COMMIT) dla każdego `ALTER TYPE ADD VALUE`. Nie można dodać wartości do enum i użyć jej w tej samej transakcji.

## ✅ Rozwiązanie - Krok po kroku

### Otwórz Supabase SQL Editor:
https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/sql/new

### Krok 1: Dodaj enum 'clients.read'

Skopiuj i wykonaj **TYLKO TĘ LINIĘ**:

```sql
alter type public.app_permissions add value if not exists 'clients.read';
```

Kliknij **"Run"** (lub Ctrl+Enter).

---

### Krok 2: Dodaj enum 'clients.create'

Po zakończeniu Kroku 1, skopiuj i wykonaj:

```sql
alter type public.app_permissions add value if not exists 'clients.create';
```

Kliknij **"Run"**.

---

### Krok 3: Dodaj enum 'clients.update'

```sql
alter type public.app_permissions add value if not exists 'clients.update';
```

Kliknij **"Run"**.

---

### Krok 4: Dodaj enum 'clients.delete'

```sql
alter type public.app_permissions add value if not exists 'clients.delete';
```

Kliknij **"Run"**.

---

### Krok 5: Dodaj enum 'clients.manage'

```sql
alter type public.app_permissions add value if not exists 'clients.manage';
```

Kliknij **"Run"**.

---

### Krok 6: Przypisz uprawnienia do ról

Po zakończeniu wszystkich kroków 1-5, wykonaj **cały poniższy blok**:

```sql
-- Owner gets all permissions
insert into public.role_permissions (role, permission) values
  ('owner', 'clients.read'),
  ('owner', 'clients.create'),
  ('owner', 'clients.update'),
  ('owner', 'clients.delete'),
  ('owner', 'clients.manage')
on conflict (role, permission) do nothing;

-- Member gets read and create permissions
insert into public.role_permissions (role, permission) values
  ('member', 'clients.read'),
  ('member', 'clients.create')
on conflict (role, permission) do nothing;
```

Kliknij **"Run"**.

---

## ✅ Weryfikacja

Sprawdź czy wszystko działa:

```sql
-- Sprawdź czy enum ma nowe wartości
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'public.app_permissions'::regtype 
  AND enumlabel LIKE 'clients.%'
ORDER BY enumlabel;

-- Sprawdź czy uprawnienia są przypisane
SELECT role, permission 
FROM public.role_permissions 
WHERE permission LIKE 'clients.%'
ORDER BY role, permission;
```

Powinieneś zobaczyć:
- 5 nowych wartości enum: `clients.read`, `clients.create`, `clients.update`, `clients.delete`, `clients.manage`
- 7 rekordów w `role_permissions` (5 dla owner, 2 dla member)

## 📝 Dlaczego osobne kroki?

PostgreSQL nie pozwala na użycie nowej wartości enum w tej samej transakcji, w której została dodana. Każdy `ALTER TYPE ADD VALUE` wymaga osobnego COMMIT, co w Supabase Dashboard SQL Editor dzieje się automatycznie po kliknięciu "Run".
