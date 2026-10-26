import zipfile
import os

# Zip the simple test folder
with zipfile.ZipFile(r'D:\simple_test.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(r'D:\simple-test'):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, r'D:\simple-test')
            zipf.write(file_path, arcname)

print("Created: D:\\simple_test.zip")
