# Test Authentication System
# Make sure the server is running first (run start_server.ps1)

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🧪 Testing Vote.ai Authentication System" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

# Navigate to backend
Set-Location -Path $PSScriptRoot

# Get Python path
$pythonPath = ".\venv\Scripts\python.exe"

if (-not (Test-Path $pythonPath)) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "   Run setup.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔍 Checking if server is running..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Server is running!" -ForegroundColor Green
        Write-Host ""
    }
} catch {
    Write-Host "❌ Server is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the server first:" -ForegroundColor Yellow
    Write-Host "  .\start_server.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Run tests
Write-Host "Running authentication tests..." -ForegroundColor Cyan
Write-Host ""

& $pythonPath scripts\test_auth.py

Write-Host ""
Write-Host "Tests completed!" -ForegroundColor Green
