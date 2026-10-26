@echo off
chcp 65001 >nul
echo ========================================
echo   Testing KhanhMelody Backend
echo ========================================
echo.

cd /d D:\khanhmelody\backend

if exist venv (
    call venv\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found!
    pause
    exit /b 1
)

echo Running backend tests...
echo.

python -c "import requests; import sys; import json; BASE_URL = 'http://localhost:8882'; print('\n[1/8] Testing server connection...'); r = requests.get(f'{BASE_URL}/api/login', timeout=5); print('✓ Server is running' if r.status_code < 500 else '✗ Server error'); print('\n[2/8] Testing login...'); r = requests.post(f'{BASE_URL}/api/login', json={'username': 'admin', 'password': 'admin123'}, timeout=5); token = r.json().get('access_token') if r.status_code == 200 else None; print('✓ Login successful' if token else '✗ Login failed'); headers = {'Authorization': f'Bearer {token}'} if token else {}; print('\n[3/8] Testing get current user...'); r = requests.get(f'{BASE_URL}/api/me', headers=headers, timeout=5); print('✓ Get user successful' if r.status_code == 200 else '✗ Get user failed'); print('\n[4/8] Testing get songs...'); r = requests.get(f'{BASE_URL}/api/admin/songs', headers=headers, timeout=5); print('✓ Get songs successful' if r.status_code == 200 else '✗ Get songs failed'); print('\n[5/8] Testing get users...'); r = requests.get(f'{BASE_URL}/api/admin/users', headers=headers, timeout=5); print('✓ Get users successful' if r.status_code == 200 else '✗ Get users failed'); print('\n[6/8] Testing get revenue...'); r = requests.get(f'{BASE_URL}/api/admin/revenue', headers=headers, timeout=5); print('✓ Get revenue successful' if r.status_code == 200 else '✗ Get revenue failed'); print('\n[7/8] Testing get wallets...'); r = requests.get(f'{BASE_URL}/api/admin/wallets', headers=headers, timeout=5); print('✓ Get wallets successful' if r.status_code == 200 else '✗ Get wallets failed'); print('\n[8/8] Testing create song...'); r = requests.post(f'{BASE_URL}/api/admin/songs', json={'title': 'Test Song', 'artist': 'Test Artist', 'album': 'Test Album', 'genre': 'Test', 'price': 10000}, headers=headers, timeout=5); print('✓ Create song successful' if r.status_code == 201 else '✗ Create song failed'); print('\n' + '='*50); print('All tests completed!'); print('='*50)"

echo.
if %errorlevel% equ 0 (
    echo ✓ Backend is working correctly!
) else (
    echo ✗ Backend test failed
    echo Make sure the backend server is running (start_backend.bat)
)

echo.
pause
