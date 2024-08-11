from .firebase_config import get_storage_bucket
import logging
from google.cloud import exceptions
import firebase_admin
import os
from firebase_admin import credentials, storage



def initialize_firebase():
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'next-mind-project.appspot.com'
    })

def download_file_from_firebase(project_name, filename, local_file_path, folder="calls"):
    try:
        if not firebase_admin._apps:
            initialize_firebase()
        
        bucket = storage.bucket()
        source_blob_name = f"{folder}/{project_name}/{filename}"
        
        blob = bucket.blob(source_blob_name)
        
        if not blob.exists():
            logging.error(f"File {filename} does not exist in Firebase Storage for project {project_name}.")
            return None
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
        
        blob.download_to_filename(local_file_path)
        logging.info(f"Successfully downloaded {filename} to {local_file_path}")
        return local_file_path
    except Exception as e:
        logging.error(f"Error downloading file from Firebase: {e}", exc_info=True)
        return None
    
    
def upload_file_to_firebase(local_file_path, remote_file_name, project_name, folder="calls"):
    try:
        bucket = get_storage_bucket()
        blob = bucket.blob(f"{folder}/{project_name}/{remote_file_name}")

        # Check if the file already exists
        if blob.exists():
            logging.info(f"File {remote_file_name} already exists in Firebase Storage for project {project_name}.")
            return blob.public_url

        # Upload the file if it does not exist
        blob.upload_from_filename(local_file_path)
        blob.make_public()  # Make the file publicly accessible
        logging.info(f"Successfully uploaded {remote_file_name} to Firebase Storage for project {project_name}.")
        return blob.public_url
    except Exception as e:
        logging.error(f"Error uploading file to Firebase: {e}", exc_info=True)
        return None