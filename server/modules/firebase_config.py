import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, storage

# Load environment variables from .env file
load_dotenv()

# Path to the service account key file
SERVICE_ACCOUNT_KEY_PATH = os.getenv("SERVICE_ACCOUNT_KEY_PATH")
STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "next-mind-project.appspot.com")

def initialize_firebase_app():
    if not firebase_admin._apps:
        if not SERVICE_ACCOUNT_KEY_PATH:
            raise ValueError("SERVICE_ACCOUNT_KEY_PATH environment variable is not set")
        
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred, {
            'storageBucket': STORAGE_BUCKET
        })

def get_storage_bucket():
    initialize_firebase_app()
    return storage.bucket()