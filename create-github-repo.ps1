# Skrypt pomocniczy do utworzenia repozytorium GitHub dla Cliento 2.0
# Autor: Auto-generated

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tworzenie repozytorium GitHub: cliento-2.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Sprawdź czy repozytorium już istnieje
Write-Host "Sprawdzanie czy repozytorium już istnieje..." -ForegroundColor Yellow
$repoExists = git ls-remote https://github.com/sebastiankelm/cliento-2.0.git 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Repozytorium już istnieje!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Wypychanie kodu do repozytorium..." -ForegroundColor Yellow
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Kod został wypchnięty pomyślnie!" -ForegroundColor Green
    } else {
        Write-Host "✗ Błąd podczas wypychania kodu" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Repozytorium nie istnieje jeszcze" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opcje:" -ForegroundColor Cyan
    Write-Host "1. Utwórz repozytorium przez przeglądarkę" -ForegroundColor White
    Write-Host "2. Zainstaluj GitHub CLI i użyj: gh repo create sebastiankelm/cliento-2.0 --public --source=. --push" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Czy chcesz otworzyć stronę GitHub do utworzenia repozytorium? (T/N)"
    if ($choice -eq "T" -or $choice -eq "t" -or $choice -eq "Y" -or $choice -eq "y") {
        Start-Process "https://github.com/new?name=cliento-2.0"
        Write-Host ""
        Write-Host "Po utworzeniu repozytorium na GitHubie, wykonaj:" -ForegroundColor Yellow
        Write-Host "  git push -u origin main" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Remote URL jest już skonfigurowany:" -ForegroundColor Cyan
git remote -v

