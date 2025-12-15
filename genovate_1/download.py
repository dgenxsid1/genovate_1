
import os
import zipfile

# --- Configuration ---
ZIP_FILENAME = 'cre_analyst_app.zip'
# List of all files and directories to include in the zip
# This should include all your frontend and backend source code
FILES_AND_DIRS_TO_ZIP = [
    # Root files
    'metadata.json',
    'index.html',
    'index.tsx',
    'App.tsx',
    'types.ts',
    'README.md',
    'download.py',
    'docker-compose.yml',
    'Dockerfile.frontend',
    'deploy.sh',
    # Frontend directories
    'services/',
    'hooks/',
    'components/',
    # Backend directory
    'backend/',
]

def zip_project(zip_filename, items_to_zip):
    """
    Creates a zip archive of the specified files and directories.
    """
    print(f"Creating zip archive: {zip_filename}")
    
    try:
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for item in items_to_zip:
                if not os.path.exists(item):
                    print(f"Warning: Item not found and will be skipped: {item}")
                    continue

                if os.path.isdir(item):
                    print(f"Adding directory: {item}")
                    for root, dirs, files in os.walk(item):
                        # Exclude __pycache__ directories and .env files
                        if '__pycache__' in root:
                            continue
                        
                        # Exclude .env file for security
                        files_to_archive = [f for f in files if f != '.env']

                        for file in files_to_archive:
                            file_path = os.path.join(root, file)
                            archive_path = os.path.join(root, file)
                            print(f"  - Adding file: {file_path}")
                            zipf.write(file_path, archive_path)
                elif os.path.isfile(item):
                    print(f"Adding file: {item}")
                    zipf.write(item, item)

        print("-" * 20)
        print(f"Successfully created {zip_filename}")
        print("You can now download and distribute this file.")
        print("-" * 20)

    except Exception as e:
        print(f"An error occurred while creating the zip file: {e}")

if __name__ == '__main__':
    # To run this script:
    # 1. Make sure you are in the root directory of the project.
    # 2. Run `python download.py` in your terminal.
    zip_project(ZIP_FILENAME, FILES_AND_DIRS_TO_ZIP)
