import os
import subprocess

backup_dir = r'D:\khanhmelody\backend\backups'
os.makedirs(backup_dir, exist_ok=True)

backup_file = os.path.join(backup_dir, 'khanhmelody_backup.sql')

print(f"Exporting database to: {backup_file}")

try:
    subprocess.run([
        'pg_dump',
        '-U', 'postgres',
        '-h', 'localhost',
        '-d', 'khanhmelody',
        '-f', backup_file
    ], check=True)
    print(f"[OK] Database exported successfully")
    
    # Copy to D drive
    import shutil
    shutil.copy(backup_file, r'D:\khanhmelody_backup.sql')
    print(f"[OK] Copied to D:\khanhmelody_backup.sql")
except subprocess.CalledProcessError as e:
    print(f"[FAIL] Failed to export database: {str(e)}")
