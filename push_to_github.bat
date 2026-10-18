@echo off
echo ===================================================
echo DAY MA NGUON WEB KHANH MELODY LEN GITHUB
echo ===================================================
echo.

set /p GITHUB_URL="Nhap duong dan Repository GitHub cua ban (Vi du: https://github.com/username/khanhmelody.git): "

if "%GITHUB_URL%"=="" (
    echo [LOI] Duong dan GitHub khong duoc de trang!
    pause
    exit /b
)

echo.
echo [1/3] Dat nhanh chinh thanh 'main'...
git branch -M main

echo [2/3] Them Git Remote Origin...
git remote remove origin >nul 2>&1
git remote add origin %GITHUB_URL%

echo [3/3] Dang day (push) ma nguon len GitHub...
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo DA DAY TOAN BO MA NGUON WEB LEN GITHUB THANH CONG!
    echo Bay giờ bạn có thể kết nối GitHub với Cloudflare Pages để tự động cập nhật (Auto-deploy).
    echo ===================================================
) else (
    echo [LOI] Khong thể push lên GitHub. Vui lòng kiểm tra lại đường dẫn và quyền đăng nhập Personal Access Token.
)

pause
