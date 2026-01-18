# 🔧 Naprawa błędów i18n (tłumaczeń)

## ❌ Problemy

1. `Error while loading translation file: en` - problem z ładowaniem plików tłumaczeń
2. `RangeError: Invalid language tag: en` - nieprawidłowy tag języka w `Intl.NumberFormat`

## ✅ Rozwiązania

### 1. Naprawiono `formatCurrency` w `packages/shared/src/utils.ts`

- Dodano normalizację locale (trim, lowercase)
- Dodano walidację locale przed użyciem w `Intl.NumberFormat`
- Fallback do `'en'` jeśli locale jest nieprawidłowy

### 2. Naprawiono `app.config.ts`

- Dodano `.trim()` do `NEXT_PUBLIC_DEFAULT_LOCALE` aby usunąć białe znaki
- Fallback do `'en'` jeśli wartość jest pusta

### 3. Naprawiono `i18n.settings.ts`

- Dodano `.trim()` i `.toLowerCase()` do `defaultLanguage`
- Zapewnia to spójność z formatowaniem locale

## ⚠️ Ważne - Sprawdź zmienną w Vercel

Upewnij się, że `NEXT_PUBLIC_DEFAULT_LOCALE` jest poprawnie ustawione w Vercel:

1. Otwórz: https://vercel.com/sebastiankelms-projects/cliento2-0/settings/environment-variables
2. Sprawdź wartość `NEXT_PUBLIC_DEFAULT_LOCALE`:
   - Powinno być: `en` (bez białych znaków)
   - NIE powinno być: `en\r\n`, ` en `, `"en"`, itp.
3. Jeśli wartość jest nieprawidłowa:
   - Usuń zmienną
   - Dodaj ponownie z wartością: `en`
   - Upewnij się, że jest ustawione dla wszystkich środowisk (Production, Preview, Development)

## 📝 Po naprawie

Po zastosowaniu poprawek i upewnieniu się, że `NEXT_PUBLIC_DEFAULT_LOCALE=en` w Vercel:
- Błędy `Error while loading translation file: en` powinny zniknąć
- Błąd `RangeError: Invalid language tag: en` powinien zniknąć
- Aplikacja powinna poprawnie wyświetlać tłumaczenia zamiast kluczy i18n
