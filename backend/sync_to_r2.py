import os
import boto3
from botocore.exceptions import NoCredentialsError, ClientError
from dotenv import load_dotenv
import shutil

# Load environment variables
load_dotenv()

# R2 Configuration
R2_ACCOUNT_ID = os.getenv('R2_ACCOUNT_ID')
R2_ACCESS_KEY_ID = os.getenv('R2_ACCESS_KEY_ID')
R2_SECRET_ACCESS_KEY = os.getenv('R2_SECRET_ACCESS_KEY')
R2_BUCKET_NAME = os.getenv('R2_BUCKET_NAME', 'khanhmelody')

# Initialize R2 client
def get_r2_client():
    return boto3.client(
        's3',
        endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name='auto'
    )

def upload_file_to_r2(local_path, s3_path):
    """Upload a single file to R2"""
    try:
        s3 = get_r2_client()
        s3.upload_file(local_path, R2_BUCKET_NAME, s3_path)
        print(f"[OK] Uploaded: {local_path} -> {s3_path}")
        return True
    except Exception as e:
        print(f"[FAIL] Failed to upload {local_path}: {str(e)}")
        return False

def upload_directory_to_r2(local_dir, s3_prefix=''):
    """Upload entire directory to R2"""
    s3 = get_r2_client()
    uploaded_count = 0
    failed_count = 0
    
    for root, dirs, files in os.walk(local_dir):
        for file in files:
            local_path = os.path.join(root, file)
            # Calculate relative path for S3
            relative_path = os.path.relpath(local_path, local_dir)
            s3_path = os.path.join(s3_prefix, relative_path).replace('\\', '/')
            
            if upload_file_to_r2(local_path, s3_path):
                uploaded_count += 1
            else:
                failed_count += 1
    
    print(f"\nUpload Summary: {uploaded_count} succeeded, {failed_count} failed")
    return uploaded_count, failed_count

def sync_frontend_to_r2():
    """Sync frontend dist folder to R2"""
    print("=" * 50)
    print("Syncing Frontend to R2")
    print("=" * 50)
    
    dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'admin', 'dist')
    
    if not os.path.exists(dist_dir):
        print(f"[FAIL] Frontend dist directory not found: {dist_dir}")
        return
    
    print(f"Uploading from: {dist_dir}")
    print(f"To bucket: {R2_BUCKET_NAME}/frontend/")
    print()
    
    upload_directory_to_r2(dist_dir, 'frontend')

def sync_database_to_r2():
    """Export database and upload to R2"""
    print("=" * 50)
    print("Syncing Database to R2")
    print("=" * 50)
    
    # Export database using pg_dump
    backup_dir = os.path.join(os.path.dirname(__file__), 'backups')
    os.makedirs(backup_dir, exist_ok=True)
    
    backup_file = os.path.join(backup_dir, 'khanhmelody_backup.sql')
    
    print(f"Exporting database to: {backup_file}")
    
    # Run pg_dump
    import subprocess
    try:
        subprocess.run([
            'pg_dump',
            '-U', 'postgres',
            '-h', 'localhost',
            '-d', 'khanhmelody',
            '-f', backup_file
        ], check=True)
        print("[OK] Database exported successfully")
    except subprocess.CalledProcessError as e:
        print(f"[FAIL] Failed to export database: {str(e)}")
        return
    
    # Upload to R2
    timestamp = os.path.getmtime(backup_file)
    s3_path = f'database/backups/khanhmelody_backup_{int(timestamp)}.sql'
    
    if upload_file_to_r2(backup_file, s3_path):
        print(f"[OK] Database backup uploaded to R2: {s3_path}")
    else:
        print("[FAIL] Failed to upload database backup")

def sync_uploads_to_r2():
    """Sync uploaded files to R2"""
    print("=" * 50)
    print("Syncing Uploads to R2")
    print("=" * 50)
    
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    
    if not os.path.exists(uploads_dir):
        print(f"✗ Uploads directory not found: {uploads_dir}")
        return
    
    print(f"Uploading from: {uploads_dir}")
    print(f"To bucket: {R2_BUCKET_NAME}/uploads/")
    print()
    
    upload_directory_to_r2(uploads_dir, 'uploads')

def main():
    print("\n" + "=" * 50)
    print("KhanhMelody - R2 Sync Tool")
    print("=" * 50 + "\n")
    
    # Check credentials
    if not all([R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY]):
        print("✗ R2 credentials not found in .env file")
        print("Please update .env with:")
        print("  - R2_ACCOUNT_ID")
        print("  - R2_ACCESS_KEY_ID")
        print("  - R2_SECRET_ACCESS_KEY")
        return
    
    print(f"R2 Account ID: {R2_ACCOUNT_ID}")
    print(f"R2 Bucket: {R2_BUCKET_NAME}")
    print()
    
    # Sync frontend
    sync_frontend_to_r2()
    print()
    
    # Sync database
    sync_database_to_r2()
    print()
    
    # Sync uploads
    sync_uploads_to_r2()
    print()
    
    print("=" * 50)
    print("Sync Complete!")
    print("=" * 50)

if __name__ == '__main__':
    main()
