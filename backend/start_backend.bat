@echo off
chcp 65001 >nul
echo ========================================
echo   Starting KhanhMelody Backend
echo ========================================
echo.

cd /d D:\khanhmelody\backend

if not exist venv (
    echo ERROR: Virtual environment not found!
    echo Please run setup.bat first to set up the backend.
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated

echo.
echo Starting Flask server on http://0.0.0.0:8882
echo Press Ctrl+C to stop the server
echo.

python run.py
