# KhanhMelody Backend Test Script
# Run this script to verify the backend is working correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing KhanhMelody Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set project directory
$projectDir = "D:\khanhmelody\backend"
Set-Location $projectDir

# Activate virtual environment
if (Test-Path "venv") {
    & ".\venv\Scripts\Activate.ps1"
} else {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    pause
    exit 1
}

# Import requests module for testing
$testScript = @"
import requests
import sys
import json

BASE_URL = "http://localhost:8882"

def test_endpoint(name, method, url, data=None, headers=None):
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=5)
        
        status_icon = "✓" if response.status_code < 400 else "✗"
        print(f"{status_icon} {name}: {response.status_code}")
        return response.status_code < 400
    except requests.exceptions.RequestException as e:
        print(f"✗ {name}: Connection failed")
        return False

def main():
    print("\n[1/8] Testing server connection...")
    if not test_endpoint("Server Health", "GET", f"{BASE_URL}/api/login"):
        print("\nERROR: Backend server is not running!")
        print("Please run start_backend.ps1 first.")
        sys.exit(1)
    
    print("\n[2/8] Testing login endpoint...")
    login_response = requests.post(f"{BASE_URL}/api/login", json={
        "username": "admin",
        "password": "admin123"
    }, timeout=5)
    
    if login_response.status_code == 200:
        token = login_response.json().get('access_token')
        print("✓ Login successful")
        headers = {"Authorization": f"Bearer {token}"}
    else:
        print("✗ Login failed")
        sys.exit(1)
    
    print("\n[3/8] Testing get current user...")
    test_endpoint("Get Current User", "GET", f"{BASE_URL}/api/me", headers=headers)
    
    print("\n[4/8] Testing get songs...")
    test_endpoint("Get Songs", "GET", f"{BASE_URL}/api/admin/songs", headers=headers)
    
    print("\n[5/8] Testing get users...")
    test_endpoint("Get Users", "GET", f"{BASE_URL}/api/admin/users", headers=headers)
    
    print("\n[6/8] Testing get revenue...")
    test_endpoint("Get Revenue", "GET", f"{BASE_URL}/api/admin/revenue", headers=headers)
    
    print("\n[7/8] Testing get wallets...")
    test_endpoint("Get Wallets", "GET", f"{BASE_URL}/api/admin/wallets", headers=headers)
    
    print("\n[8/8] Testing create song...")
    test_data = {
        "title": "Test Song",
        "artist": "Test Artist",
        "album": "Test Album",
        "genre": "Test",
        "price": 10000
    }
    test_endpoint("Create Song", "POST", f"{BASE_URL}/api/admin/songs", data=test_data, headers=headers)
    
    print("\n" + "="*50)
    print("All tests completed!")
    print("="*50)

if __name__ == "__main__":
    main()
"@

# Write test script to temporary file
$testScript | Out-File -FilePath "temp_test.py" -Encoding UTF8

Write-Host "Running backend tests..." -ForegroundColor Yellow
Write-Host ""

try {
    python temp_test.py
    Write-Host ""
    Write-Host "✓ Backend is working correctly!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "✗ Backend test failed" -ForegroundColor Red
    Write-Host "Make sure the backend server is running (start_backend.ps1)" -ForegroundColor Yellow
} finally {
    # Clean up temporary file
    if (Test-Path "temp_test.py") {
        Remove-Item "temp_test.py"
    }
}

Write-Host ""
pause
