# Instrukcja utworzenia repozytorium GitHub dla Cliento 2.0

## Metoda 1: Przez przeglądarkę (Najprostsza)

1. Przejdź do: https://github.com/new
2. Wypełnij formularz:
   - **Repository name**: `cliento-2.0`
   - **Description**: (opcjonalnie) Opis projektu
   - **Visibility**: Wybierz Public lub Private
   - **NIE zaznaczaj** "Add a README file" (mamy już kod)
   - **NIE zaznaczaj** "Add .gitignore" (mamy już)
   - **NIE zaznaczaj** "Choose a license" (chyba że chcesz)
3. Kliknij **Create repository**

Po utworzeniu repozytorium, wykonaj w terminalu:

```powershell
cd "C:\Users\sebak\OneDrive\Pulpit\Cliento 2.0\next-supabase-saas-kit-turbo"
git push -u origin main
```

## Metoda 2: Zainstaluj GitHub CLI i użyj komendy

### Instalacja GitHub CLI (jeśli nie masz):

1. Pobierz z: https://cli.github.com/
2. Zainstaluj
3. Zaloguj się: `gh auth login`

### Utworzenie repozytorium:

```powershell
cd "C:\Users\sebak\OneDrive\Pulpit\Cliento 2.0\next-supabase-saas-kit-turbo"
gh repo create sebastiankelm/cliento-2.0 --public --source=. --push
```

## Metoda 3: Użycie GitHub API (wymaga tokena)

1. Wygeneruj Personal Access Token: https://github.com/settings/tokens
   - Uprawnienia: `repo` (pełny dostęp do repozytoriów)
2. Wykonaj w PowerShell:

```powershell
$token = "TWÓJ_TOKEN_TUTAJ"
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}
$body = @{
    name = "cliento-2.0"
    description = "Cliento 2.0 - Next.js SaaS Kit"
    private = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body

# Następnie wypchnij kod
git push -u origin main
```

---

**Status**: Remote URL został już zaktualizowany na: `https://github.com/sebastiankelm/cliento-2.0.git`

Po utworzeniu repozytorium na GitHubie, możesz od razu wykonać `git push -u origin main`.

