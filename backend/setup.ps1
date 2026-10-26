# KhanhMelody Backend Setup Script for Windows
# Run this script as Administrator to automatically set up the backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KhanhMelody Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Please run this script as Administrator" -ForegroundColor Red
    Write-Host "Right-click the script and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

# Set project directory
$projectDir = "D:\khanhmelody\backend"
Set-Location $projectDir

Write-Host "[1/7] Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.8 or higher from https://www.python.org/" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "[2/7] Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version 2>&1
    Write-Host "✓ PostgreSQL found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL not found. Please install PostgreSQL from https://www.postgresql.org/download/windows/" -ForegroundColor Red
    Write-Host "After installation, set password to 'postgres' and run this script again." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "[3/7] Creating Python virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✓ Virtual environment already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/7] Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

_Write-Host ""
Write-Host "[5/7] Installing Python dependencies..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt
Write-Host "✓ Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "[6/7] Setting up PostgreSQL database..." -ForegroundColor Yellow
try {
    # Test PostgreSQL connection
    $env:PGPASSWORD = "postgres"
    psql -U postgres -c "SELECT version();" 2>&1 | Out-Null
    
    # Create database if not exists
    psql -U postgres -c "CREATE DATABASE khanhmelody;" 2>&1 | Out-Null
    Write-Host "✓ Database 'khanhmelody' created or already exists" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to connect to PostgreSQL. Please ensure:" -ForegroundColor Red
    Write-Host "  - PostgreSQL is running" -ForegroundColor Yellow
    Write-Host "  - Password is set to 'postgres'" -ForegroundColor Yellow
    Write-Host "  - PostgreSQL service is started" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "[7/7] Initializing database with sample data..." -ForegroundColor Yellow
python init_db.py
Write-Host "✓ Database initialized" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Completed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default Login Credentials:" -ForegroundColor Yellow
Write-Host "  Admin: admin / admin123" -ForegroundColor White
Write-Host "  User1: user1 / user123" -ForegroundColor White
Write-Host "  User2: user2 / user123" -ForegroundColor White
Write-Host "  User3: user3 / user123" -ForegroundColor White
Write-Host ""
Write-Host "To start the backend server, run:" -ForegroundColor Yellow
Write-Host "  .\start_backend.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test the backend, run:" -ForegroundColor Yellow
Write-Host "  .\test_backend.ps1" -ForegroundColor Cyan
Write-Host ""
pause
