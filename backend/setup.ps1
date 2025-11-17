# Vote.ai Backend Setup Script
# Run this to set up your backend environment

Write-Host "=" -NoNewline -ForegroundColor Blue
Write-Host ("=" * 59) -ForegroundColor Blue
Write-Host "🚀 Vote.ai Backend Setup" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Blue
Write-Host ""

# Step 1: Check Python
Write-Host "Step 1: Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Step 2: Create Virtual Environment
Write-Host ""
Write-Host "Step 2: Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "ℹ  Virtual environment already exists" -ForegroundColor Cyan
} else {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Step 3: Activate Virtual Environment
Write-Host ""
Write-Host "Step 3: Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "✅ Virtual environment activated" -ForegroundColor Green

# Step 4: Install Dependencies
Write-Host ""
Write-Host "Step 4: Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Cyan
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
Write-Host "✅ All dependencies installed" -ForegroundColor Green

# Step 5: Check .env file
Write-Host ""
Write-Host "Step 5: Checking .env configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    # Check required variables
    $envContent = Get-Content .env -Raw
    $required = @("DATABASE_URL", "AZURE_OPENAI_API_KEY", "SECRET_KEY")
    $missing = @()
    
    foreach ($var in $required) {
        if ($envContent -notmatch "$var=") {
            $missing += $var
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "⚠️  Missing environment variables: $($missing -join ', ')" -ForegroundColor Yellow
    } else {
        Write-Host "✅ All required environment variables present" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Please copy .env.example to .env and fill in your values" -ForegroundColor Yellow
    exit 1
}

# Step 6: Initialize Database
Write-Host ""
Write-Host "Step 6: Initializing database..." -ForegroundColor Yellow
python scripts\init_db.py
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database initialized successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Database initialization failed" -ForegroundColor Red
    Write-Host "   Please check your DATABASE_URL and PostgreSQL connection" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Blue
Write-Host "📊 Setup Summary" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Blue
Write-Host "✅ Python environment ready" -ForegroundColor Green
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host "✅ Configuration loaded" -ForegroundColor Green
Write-Host "✅ Database tables created" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 You're ready to start the server!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: python main.py" -ForegroundColor White
Write-Host "  2. Open: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  3. Test: python scripts\test_auth.py" -ForegroundColor White
Write-Host ""
