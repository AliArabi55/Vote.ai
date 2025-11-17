# Test Authentication - Quick Test Script
# This script tests the authentication system

$ErrorActionPreference = "Stop"

Write-Host "🧪 Testing Authentication System..." -ForegroundColor Cyan
Write-Host ""

# Set backend path
$backendPath = Split-Path -Parent $PSScriptRoot
$pythonExe = Join-Path $backendPath "backend\venv\Scripts\python.exe"
$testScript = Join-Path $backendPath "backend\scripts\test_auth.py"

# Check server
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Server not running. Please start it first:" -ForegroundColor Red
    Write-Host "   cd backend" -ForegroundColor Yellow
    Write-Host "   .\venv\Scripts\python.exe main.py" -ForegroundColor Yellow
    exit 1
}

# Run tests
Write-Host ""
& $pythonExe $testScript

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Some tests failed" -ForegroundColor Red
    exit 1
}
