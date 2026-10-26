import os
import zipfile

def zip_directory(source_dir, output_zip):
    """Zip entire directory"""
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)
    print(f"Created: {output_zip}")

# Zip frontend dist
zip_directory(
    r'D:\khanhmelody\frontend\admin\dist',
    r'D:\r2_frontend_dist.zip'
)

print("Done!")
