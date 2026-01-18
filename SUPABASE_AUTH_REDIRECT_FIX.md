# 🔧 Naprawa linków autoryzacyjnych Supabase

## ❌ Problem

Linki autoryzacyjne w mailach z Supabase kierują na `http://localhost:3000` zamiast na produkcyjny URL.

## ✅ Rozwiązanie

Musisz zaktualizować konfigurację Auth w Supabase Dashboard.

### Krok 1: Otwórz Supabase Dashboard

Przejdź do: https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/auth/url-configuration

### Krok 2: Zaktualizuj Site URL

W sekcji **"Site URL"**:
- **Usuń**: `http://localhost:3000`
- **Dodaj**: `https://cliento2-0-sebastiankelms-projects.vercel.app`

### Krok 3: Zaktualizuj Redirect URLs

W sekcji **"Redirect URLs"** dodaj następujące URL-e (każdy w osobnej linii):

```
https://cliento2-0-sebastiankelms-projects.vercel.app
https://cliento2-0-sebastiankelms-projects.vercel.app/auth/callback
https://cliento2-0-sebastiankelms-projects.vercel.app/auth/confirm
https://cliento2-0-sebastiankelms-projects.vercel.app/update-password
https://cliento2-0-sebastiankelms-projects.vercel.app/auth/password-reset
```

**WAŻNE**: 
- Każdy URL musi być w osobnej linii
- Upewnij się, że wszystkie URL-e używają `https://`
- Nie usuwaj `http://localhost:3000` jeśli nadal używasz lokalnego developmentu

### Krok 4: Zapisz zmiany

Kliknij **"Save"** na dole strony.

### Krok 5: Weryfikacja

Po zapisaniu:
1. Nowe maile autoryzacyjne będą używać produkcyjnego URL
2. Linki w mailach będą kierować na `https://cliento2-0-sebastiankelms-projects.vercel.app/auth/callback`
3. Stare maile (już wysłane) nadal będą używać starego URL - to normalne

## 📝 Alternatywa: Przez Supabase CLI

Jeśli masz dostęp do Supabase CLI, możesz zaktualizować konfigurację lokalnie:

```powershell
cd apps/web

# Połącz się z projektem (jeśli jeszcze nie)
supabase link --project-ref gnwpzliiwwrlothcwxxv

# Zaktualizuj config.toml (dla lokalnego developmentu)
# Następnie użyj Dashboard do aktualizacji produkcyjnej konfiguracji
```

**UWAGA**: `config.toml` dotyczy tylko lokalnego developmentu. Produkcyjna konfiguracja musi być zmieniona przez Dashboard.

## 🔍 Sprawdzenie

Po aktualizacji, sprawdź:
1. Zarejestruj nowego użytkownika
2. Sprawdź mail - link powinien kierować na produkcyjny URL
3. Kliknij link - powinien przekierować na `https://cliento2-0-sebastiankelms-projects.vercel.app/auth/callback`
