@echo off
========================================
  KhanhMelody Database Backup Script
========================================

set BACKUP_DIR=D:\khanhmelody\backups
set DATE=%date:~-4,4%%date:~-7,2%%date:~-10,2%
set TIME=%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%DATE%_%TIME%
set BACKUP_FILE=%BACKUP_DIR%\khanhmelody_backup_%TIMESTAMP%.sql

echo Creating backup directory if not exists...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Starting database backup...
pg_dump -U postgres -h localhost khanhmelody > "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo Backup successful: %BACKUP_FILE%
    
    echo Compressing backup...
    powershell Compress-Archive -Path "%BACKUP_FILE%" -DestinationPath "%BACKUP_FILE%.zip" -Force
    del "%BACKUP_FILE%"
    
    echo Backup compressed: %BACKUP_FILE%.zip
    
    echo Keeping only last 7 backups...
    for /f "skip=7 delims=" %%F in ('dir "%BACKUP_DIR%\*.zip" /b /o-d') do del "%BACKUP_DIR%\%%F"
    
    echo Backup completed successfully!
) else (
    echo Backup failed with error code %ERRORLEVEL%
)

pause
