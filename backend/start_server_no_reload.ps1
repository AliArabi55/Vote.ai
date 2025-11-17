# Start server WITHOUT auto-reload to avoid issues with file changes
Write-Host "🚀 Starting Vote.ai Server (No Auto-Reload)..." -ForegroundColor Cyan
Write-Host ""

Set-Location c:\Users\aliar\OneDrive\Documents\GitHub\Vote.ai\backend

# Start without --reload flag
c:\Users\aliar\OneDrive\Documents\GitHub\Vote.ai\backend\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000

Write-Host ""
Write-Host "Server stopped." -ForegroundColor Yellow
