# Skrypt do dodawania zmiennych środowiskowych w Vercel
# Wymaga zalogowania: vercel login

Write-Host "Dodawanie zmiennych środowiskowych do Vercel..." -ForegroundColor Cyan
Write-Host ""

$envVars = @(
    @{Key="NEXT_PUBLIC_SITE_URL"; Value="https://cliento2-0-sebastiankelms-projects.vercel.app"},
    @{Key="NEXT_PUBLIC_PRODUCT_NAME"; Value="Cliento"},
    @{Key="NEXT_PUBLIC_SITE_TITLE"; Value="Cliento - CRM Management"},
    @{Key="NEXT_PUBLIC_SITE_DESCRIPTION"; Value="CRM application for managing clients"},
    @{Key="NEXT_PUBLIC_DEFAULT_LOCALE"; Value="en"},
    @{Key="NEXT_PUBLIC_DEFAULT_THEME_MODE"; Value="system"},
    @{Key="NEXT_PUBLIC_THEME_COLOR"; Value="#000000"},
    @{Key="NEXT_PUBLIC_THEME_COLOR_DARK"; Value="#ffffff"},
    @{Key="NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS"; Value="true"},
    @{Key="NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION"; Value="true"},
    @{Key="NEXT_PUBLIC_ENABLE_NOTIFICATIONS"; Value="true"},
    @{Key="NEXT_PUBLIC_REALTIME_NOTIFICATIONS"; Value="false"}
)

$targets = @("production", "preview", "development")

Set-Location "apps\web"

foreach ($target in $targets) {
    Write-Host "Dodawanie zmiennych dla: $target" -ForegroundColor Yellow
    foreach ($var in $envVars) {
        Write-Host "  - $($var.Key) = $($var.Value)" -ForegroundColor Gray
        echo $var.Value | vercel env add $($var.Key) $target
    }
}

Write-Host ""
Write-Host "Dodaj także zmienne Supabase ręcznie:" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_SUPABASE_URL = https://gnwpzliiwwrlothcwxxv.supabase.co" -ForegroundColor Gray
Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY = [skopiuj z Supabase Dashboard]" -ForegroundColor Gray
Write-Host "  SUPABASE_SERVICE_ROLE_KEY = [skopiuj z Supabase Dashboard]" -ForegroundColor Gray
Write-Host ""

Set-Location ..\..
