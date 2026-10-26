@echo off
========================================
  Starting KhanhMelody Backend (Production)
========================================

echo Activating virtual environment...
call venv\Scripts\activate
echo Virtual environment activated

echo Starting Gunicorn server on http://0.0.0.0:8882
gunicorn -w 4 -b 0.0.0.0:8882 run:app

echo.
echo Server stopped
pause
