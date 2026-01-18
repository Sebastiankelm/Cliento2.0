# 🔧 Naprawa konfiguracji Vercel dla Monorepo

## ❌ Problem

Błąd: `No Output Directory named "public" found after the Build completed`

## ✅ Rozwiązanie

Dla monorepo z Turborepo, Vercel wymaga ustawienia **Root Directory** w Project Settings.

### Krok 1: Ustaw Root Directory w Vercel Dashboard

1. Otwórz: https://vercel.com/sebastiankelms-projects/cliento2-0/settings/general
2. Przewiń do sekcji **"Root Directory"**
3. Kliknij **"Edit"**
4. Wybierz: `apps/web`
5. Kliknij **"Save"**

### Krok 2: Weryfikacja

Po ustawieniu Root Directory:
- Vercel automatycznie wykryje Next.js
- Output Directory będzie `.next` (automatycznie)
- Build powinien przejść pomyślnie

### Alternatywa: Przez Vercel CLI

```powershell
cd apps/web
vercel link --project cliento2-0
```

To automatycznie ustawi Root Directory na `apps/web`.

## 📝 Uwaga

- `vercel.json` został zaktualizowany (usunięto `outputDirectory` - nie jest potrzebne)
- Vercel automatycznie wykrywa Next.js i używa `.next` jako output directory
- Root Directory musi wskazywać na `apps/web` dla monorepo
