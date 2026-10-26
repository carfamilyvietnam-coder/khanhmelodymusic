# KhanhMelody Backend Stop Script
# Run this script to stop the backend server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stopping KhanhMelody Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Find and kill Python processes using port 8882
Write-Host "Checking for processes on port 8882..." -ForegroundColor Yellow

try {
    $process = Get-NetTCPConnection -LocalPort 8882 -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($process) {
        $pid = $process.OwningProcess
        $processName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName
        
        Write-Host "Found process: $processName (PID: $pid)" -ForegroundColor Yellow
        Write-Host "Stopping process..." -ForegroundColor Yellow
        
        Stop-Process -Id $pid -Force
        Write-Host "✓ Backend server stopped successfully" -ForegroundColor Green
    } else {
        Write-Host "✓ No backend server is running on port 8882" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Failed to stop backend server" -ForegroundColor Red
    Write-Host "You may need to manually stop the Python process." -ForegroundColor Yellow
}

Write-Host ""
pause
