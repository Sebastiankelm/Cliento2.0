# PowerShell script to apply all Supabase migrations
# This script applies all schema files (00-19) to Supabase

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Applying Supabase Migrations" -ForegroundColor Cyan
Write-Host "===========================================`n" -ForegroundColor Cyan

$originalPath = Get-Location
Set-Location "apps\web"

# Check if Supabase CLI is available
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseVersion = supabase --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Supabase CLI not found" -ForegroundColor Red
    Write-Host "Please install: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Supabase CLI: $($supabaseVersion)" -ForegroundColor Green

# Check if project is linked
Write-Host "`nChecking project link..." -ForegroundColor Yellow
if (-not (Test-Path ".supabase\config.toml")) {
    Write-Host "⚠️  Project not linked locally" -ForegroundColor Yellow
    Write-Host "Attempting to link project..." -ForegroundColor Gray
    supabase link --project-ref gnwpzliiwwrlothcwxxv --password $env:SUPABASE_DB_PASSWORD 2>&1 | Out-Null
}

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "IMPORTANT: Supabase Migrations via CLI" -ForegroundColor Cyan
Write-Host "===========================================`n" -ForegroundColor Cyan

Write-Host "Due to Supabase CLI limitations with schema files," -ForegroundColor Yellow
Write-Host "you need to apply migrations via Supabase Dashboard:`n" -ForegroundColor Yellow

Write-Host "1. Open: https://supabase.com/dashboard/project/gnwpzliiwwrlothcwxxv/sql/new" -ForegroundColor Cyan
Write-Host "2. Apply schemas 00-19 in order (see SUPABASE_FULL_MIGRATION.md)" -ForegroundColor Cyan
Write-Host "3. After migrations, run: pnpm supabase:web:typegen" -ForegroundColor Cyan
Write-Host "4. Then trigger Vercel redeploy`n" -ForegroundColor Cyan

Write-Host "Alternatively, use Supabase Dashboard to run SQL directly." -ForegroundColor Gray

# Restore original path
Set-Location $originalPath
