# KhanhMelody Backend Startup Script
# Run this script to start the backend server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting KhanhMelody Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set project directory
$projectDir = "D:\khanhmelody\backend"
Set-Location $projectDir

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run setup.ps1 first to set up the backend." -ForegroundColor Yellow
    pause
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

Write-Host ""
Write-Host "Starting Flask server on http://0.0.0.0:8882" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the Flask application
python run.py
