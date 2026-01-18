# PowerShell script to guide updating Supabase Auth redirect URLs
# Note: Supabase Auth configuration must be updated via Dashboard, not CLI

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Supabase Auth Redirect URLs Configuration" -ForegroundColor Cyan
Write-Host "===========================================`n" -ForegroundColor Cyan

Write-Host "⚠️  WAŻNE: Konfiguracja Auth w Supabase musi być zaktualizowana przez Dashboard!" -ForegroundColor Yellow
Write-Host ""

Write-Host "Kroki do wykonania:" -ForegroundColor Green
Write-Host ""

Write-Host "1. Otwórz Supabase Dashboard:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/auth/url-configuration" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Zaktualizuj Site URL:" -ForegroundColor White
Write-Host "   Stary: http://localhost:3000" -ForegroundColor Red
Write-Host "   Nowy:  https://cliento2-0-sebastiankelms-projects.vercel.app" -ForegroundColor Green
Write-Host ""

Write-Host "3. Dodaj następujące Redirect URLs (każdy w osobnej linii):" -ForegroundColor White
Write-Host "   https://cliento2-0-sebastiankelms-projects.vercel.app" -ForegroundColor Cyan
Write-Host "   https://cliento2-0-sebastiankelms-projects.vercel.app/auth/callback" -ForegroundColor Cyan
Write-Host "   https://cliento2-0-sebastiankelms-projects.vercel.app/auth/confirm" -ForegroundColor Cyan
Write-Host "   https://cliento2-0-sebastiankelms-projects.vercel.app/update-password" -ForegroundColor Cyan
Write-Host "   https://cliento2-0-sebastiankelms-projects.vercel.app/auth/password-reset" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Kliknij 'Save'" -ForegroundColor White
Write-Host ""

Write-Host "5. Po zapisaniu, nowe maile autoryzacyjne będą używać produkcyjnego URL!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Szczegółowe instrukcje: zobacz SUPABASE_AUTH_REDIRECT_FIX.md" -ForegroundColor Yellow
Write-Host ""
