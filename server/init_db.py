from pymongo import MongoClient
import os
from dotenv import load_dotenv
import time

load_dotenv()

def init_db():
    max_retries = 5
    retry_interval = 5  # seconds

    for attempt in range(max_retries):
        try:
            client = MongoClient(os.getenv('MONGODB_CONNECTION_STRING'))
            db = client['optima_solutions_services']
            
            # Create collections if they don't exist
            if 'calls' not in db.list_collection_names():
                db.create_collection('calls')
            
            if 'agents' not in db.list_collection_names():
                db.create_collection('agents')
            
            if 'projects' not in db.list_collection_names():
                db.create_collection('projects')
            
            if 'word_database' not in client.list_database_names():
                word_db = client['word_database']
                word_collections = [
                    'common_words', 'positive_words', 'negative_words', 'greetings_words',
                    'companies', 'words_to_remove', 'availability_words', 'from_what_company',
                    'good_bye_words'
                ]
                for collection in word_collections:
                    if collection not in word_db.list_collection_names():
                        word_db.create_collection(collection)

            print("Database initialized successfully")
            return
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                print("Max retries reached. Database initialization failed.")
                raise

if __name__ == "__main__":
    init_db()