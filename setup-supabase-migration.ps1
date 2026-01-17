# Skrypt do zastosowania migracji Supabase
# Wymaga zalogowania: supabase login
# Wymaga linku projektu: supabase link --project-ref YOUR_PROJECT_REF

Write-Host "Zastosowanie migracji Supabase..." -ForegroundColor Cyan
Write-Host ""

Set-Location "apps\web"

# Sprawdź czy jest link do projektu
Write-Host "Sprawdzanie połączenia z projektem Supabase..." -ForegroundColor Yellow
$linkStatus = supabase status 2>&1

if ($linkStatus -match "not linked" -or $linkStatus -match "No project linked") {
    Write-Host "Projekt nie jest połączony. Łączenie z projektem..." -ForegroundColor Yellow
    Write-Host "Project Ref z URL: gnwpzliiwwrlothcwxxv" -ForegroundColor Gray
    Write-Host "Uruchom ręcznie: supabase link --project-ref gnwpzliiwwrlothcwxxv" -ForegroundColor Yellow
} else {
    Write-Host "Projekt jest połączony. Zastosowanie migracji..." -ForegroundColor Green
    
    # Zastosuj migracje SQL bezpośrednio
    Write-Host ""
    Write-Host "Uruchamianie migracji schemas/18-clients.sql..." -ForegroundColor Yellow
    Get-Content "supabase\schemas\18-clients.sql" | supabase db push --db-url $env:SUPABASE_DB_URL
    
    Write-Host ""
    Write-Host "Uruchamianie migracji schemas/19-clients-permissions.sql..." -ForegroundColor Yellow  
    Get-Content "supabase\schemas\19-clients-permissions.sql" | supabase db push --db-url $env:SUPABASE_DB_URL
}

Write-Host ""
Write-Host "Alternatywnie możesz wykonać migracje ręcznie w Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "  1. Otwórz: https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/sql/new" -ForegroundColor Gray
Write-Host "  2. Skopiuj zawartość: apps/web/supabase/schemas/18-clients.sql" -ForegroundColor Gray
Write-Host "  3. Wykonaj SQL" -ForegroundColor Gray
Write-Host "  4. Skopiuj zawartość: apps/web/supabase/schemas/19-clients-permissions.sql" -ForegroundColor Gray
Write-Host "  5. Wykonaj SQL" -ForegroundColor Gray

Set-Location ..\..
