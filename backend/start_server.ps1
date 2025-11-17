# Quick Start - Vote.ai Backend
# Run this script to start the server

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🚀 Starting Vote.ai Backend Server" -ForegroundColor Green
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

Write-Host "✅ Starting server on http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "📖 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start server
& $pythonPath main.py
