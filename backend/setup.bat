@echo off
chcp 65001 >nul
echo ========================================
echo   KhanhMelody Backend Setup
echo ========================================
echo.

cd /d D:\khanhmelody\backend

echo [1/7] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Python not found. Please install Python 3.9 or higher from https://www.python.org/
    pause
    exit /b 1
)
echo ✓ Python found

echo.
echo [2/7] Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ PostgreSQL not found. Please install PostgreSQL from https://www.postgresql.org/download/windows/
    echo After installation, set password to 'postgres' and run this script again.
    pause
    exit /b 1
)
echo ✓ PostgreSQL found

echo.
echo [3/7] Creating Python virtual environment...
if not exist venv (
    python -m venv venv
    echo ✓ Virtual environment created
) else (
    echo ✓ Virtual environment already exists
)

echo.
echo [4/7] Activating virtual environment...
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated

echo.
echo [5/7] Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
echo ✓ Dependencies installed

echo.
echo [6/7] Setting up PostgreSQL database...
psql -U postgres -c "CREATE DATABASE khanhmelody;" >nul 2>&1
if %errorlevel% neq 0 (
    echo Database may already exist or connection failed
) else (
    echo ✓ Database created
)
echo ✓ Database setup complete

echo.
echo [7/7] Initializing database and optional first administrator...
python init_db.py
echo ✓ Database initialized

echo.
echo ========================================
echo   Setup Completed Successfully!
echo ========================================
echo.
echo No default account is created. Configure INITIAL_ADMIN_USERNAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD in .env before initialization to create the first administrator.
echo.
echo To start the backend server, run:
echo   start_backend.bat
echo.
echo To test the backend, run:
echo   test_backend.bat
echo.
pause
