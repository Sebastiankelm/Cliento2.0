# PowerShell script to add all required environment variables to Vercel
# Prerequisites: You must be logged in to Vercel CLI (run 'vercel login' first)

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Adding Environment Variables to Vercel" -ForegroundColor Cyan
Write-Host "===========================================`n" -ForegroundColor Cyan

# Check if user is logged in
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Not logged in to Vercel CLI" -ForegroundColor Red
    Write-Host "Please run: vercel login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Logged in as: $($whoami)" -ForegroundColor Green
Write-Host ""

# Change to web directory
$originalPath = Get-Location
Set-Location "apps\web"

# Environment variables to add (non-sensitive)
$envVars = @{
    "NEXT_PUBLIC_SITE_URL" = "https://cliento2-0-sebastiankelms-projects.vercel.app"
    "NEXT_PUBLIC_PRODUCT_NAME" = "Cliento"
    "NEXT_PUBLIC_SITE_TITLE" = "Cliento - CRM Management"
    "NEXT_PUBLIC_SITE_DESCRIPTION" = "CRM application for managing clients"
    "NEXT_PUBLIC_DEFAULT_LOCALE" = "en"
    "NEXT_PUBLIC_DEFAULT_THEME_MODE" = "system"
    "NEXT_PUBLIC_THEME_COLOR" = "#000000"
    "NEXT_PUBLIC_THEME_COLOR_DARK" = "#ffffff"
    "NEXT_PUBLIC_SUPABASE_URL" = "https://gnwpzliiwwrlothcwxxv.supabase.co"
    "NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS" = "true"
    "NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION" = "true"
    "NEXT_PUBLIC_ENABLE_NOTIFICATIONS" = "true"
    "NEXT_PUBLIC_REALTIME_NOTIFICATIONS" = "false"
}

# Secret variables - will prompt if not found in .env.local
$secretVars = @{
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = $null
    "SUPABASE_SERVICE_ROLE_KEY" = $null
}

# Try to load secrets from .env.local if exists
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    foreach ($line in $envContent) {
        if ($line -match '^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)$') {
            $secretVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = $matches[1]
        }
        if ($line -match '^SUPABASE_SERVICE_ROLE_KEY=(.+)$') {
            $secretVars["SUPABASE_SERVICE_ROLE_KEY"] = $matches[1]
        }
    }
}

# Environments to add variables to
$environments = @("production", "preview", "development")

Write-Host "Adding environment variables for: $($environments -join ', ')`n" -ForegroundColor Yellow

$successCount = 0
$failCount = 0

foreach ($envName in $envVars.Keys) {
    $value = $envVars[$envName]
    
    foreach ($env in $environments) {
        Write-Host "Adding $envName ($env)..." -ForegroundColor Gray -NoNewline
        
        # Use echo to pipe value to vercel env add
        $result = echo $value | vercel env add "$envName" "$env" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $successCount++
        } else {
            # Check if variable already exists (this is OK)
            if ($result -match "already exists" -or $result -match "Environment Variable already exists") {
                Write-Host " ⚠️  (already exists)" -ForegroundColor Yellow
                $successCount++
            } else {
                Write-Host " ❌" -ForegroundColor Red
                Write-Host "   Error: $result" -ForegroundColor Red
                $failCount++
            }
        }
    }
}

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Results" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })

# Add secret variables if available
Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "Adding Secret Variables" -ForegroundColor Cyan
Write-Host "===========================================`n" -ForegroundColor Cyan

foreach ($secretName in $secretVars.Keys) {
    $secretValue = $secretVars[$secretName]
    
    if ($null -eq $secretValue -or $secretValue -eq "") {
        Write-Host "⚠️  $secretName not found in .env.local" -ForegroundColor Yellow
        Write-Host "   Skipping - add manually via Vercel Dashboard" -ForegroundColor Gray
        Write-Host "   URL: https://vercel.com/sebastiankelms-projects/cliento2-0/settings/environment-variables`n" -ForegroundColor Cyan
        continue
    }
    
    foreach ($env in $environments) {
        Write-Host "Adding $secretName ($env)..." -ForegroundColor Gray -NoNewline
        
        $result = echo $secretValue | vercel env add "$secretName" "$env" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $successCount++
        } else {
            if ($result -match "already exists" -or $result -match "Environment Variable already exists") {
                Write-Host " ⚠️  (already exists)" -ForegroundColor Yellow
                $successCount++
            } else {
                Write-Host " ❌" -ForegroundColor Red
                Write-Host "   Error: $result" -ForegroundColor Red
                $failCount++
            }
        }
    }
}

if ($failCount -eq 0 -and ($secretVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] -ne $null -and $secretVars["SUPABASE_SERVICE_ROLE_KEY"] -ne $null)) {
    Write-Host "`n✅ All variables (including secrets) have been added successfully!" -ForegroundColor Green
} elseif ($secretVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] -eq $null -or $secretVars["SUPABASE_SERVICE_ROLE_KEY"] -eq $null) {
    Write-Host "`n⚠️  IMPORTANT: Secret variables were not found in .env.local" -ForegroundColor Yellow
    Write-Host "   You need to add these manually:" -ForegroundColor Yellow
    Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    Write-Host "`nAdd them via: https://vercel.com/sebastiankelms-projects/cliento2-0/settings/environment-variables" -ForegroundColor Cyan
    Write-Host "Or add them to apps/web/.env.local and run this script again." -ForegroundColor Cyan
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Add secret variables manually (see above)" -ForegroundColor White
Write-Host "2. Trigger a new deployment or redeploy from Vercel Dashboard" -ForegroundColor White

# Restore original path
Set-Location $originalPath
