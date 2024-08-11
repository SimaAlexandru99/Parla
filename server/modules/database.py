import pymongo
import logging
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get MongoDB connection string from environment variables
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")

# Initialize MongoDB client
client = pymongo.MongoClient(MONGODB_CONNECTION_STRING)

# Initialize global variables
COMMON_WORDS = set()
POSITIVE_WORDS = set()
NEGATIVE_WORDS = set()
GREETINGS_WORDS = set()
COMPANIES_NAMES = set()
WORDS_TO_REMOVE = set()
AVAILABILITY_WORDS = set()
FROM_WHAT_COMPANY = set()
GOOD_BYE_WORDS = set()


def check_database_connection():
    """
    Check the connection to MongoDB.

    Returns:
    bool: True if the connection is successful, False otherwise.
    """
    try:
        client.list_database_names()
        logging.info("Successfully connected to MongoDB.")
        return True
    except Exception as e:
        logging.error(f"Error connecting to MongoDB: {e}")
        return False

def get_collection(database_name, collection_name):
    """
    Get a MongoDB collection.

    Parameters:
    database_name (str): The name of the database.
    collection_name (str): The name of the collection.

    Returns:
    Collection: The requested MongoDB collection.
    """
    db = client[database_name]
    return db[collection_name]

def extract_words_from_collection(collection):
    """
    Extract words from a MongoDB collection.

    Parameters:
    collection (Collection): The MongoDB collection.

    Returns:
    set: A set of words extracted from the collection.
    """
    words = set()
    try:
        logging.info(f"Accessing collection: {collection.name}")
        for document in collection.find({}):
            word = document.get("word")
            if word:
                words.add(word)
                logging.info(f"Extracted word: {word} from {collection.name}")
        logging.info(f"Extracted {len(words)} words from {collection.name} collection.")
    except Exception as e:
        logging.error(f"Error extracting words from collection {collection.name}: {e}", exc_info=True)
    return words

def load_words_from_mongodb(project_name):
    """
    Load words from MongoDB into global variables, first from word_database,
    then add project-specific words from optima_solutions_services.

    Parameters:
    project_name (str): The name of the project to load additional words for.
    """
    global COMMON_WORDS, POSITIVE_WORDS, NEGATIVE_WORDS, GREETINGS_WORDS, COMPANIES_NAMES, WORDS_TO_REMOVE, AVAILABILITY_WORDS, FROM_WHAT_COMPANY, GOOD_BYE_WORDS

    word_collections = {
        "common_words": COMMON_WORDS,
        "positive_words": POSITIVE_WORDS,
        "negative_words": NEGATIVE_WORDS,
        "greetings_words": GREETINGS_WORDS,
        "companies_names": COMPANIES_NAMES,
        "words_to_remove": WORDS_TO_REMOVE,
        "availability_words": AVAILABILITY_WORDS,
        "from_what_company": FROM_WHAT_COMPANY,
        "good_bye_words": GOOD_BYE_WORDS
    }

    try:
        # Step 1: Load general words from word_database
        for collection_name, word_set in word_collections.items():
            collection = get_collection("word_database", collection_name)
            words = extract_words_from_collection(collection)
            word_set.update(words)
            logging.info(f"Loaded {len(words)} general words into {collection_name}.")

        # Step 2: Load project-specific words from optima_solutions_services
        projects_collection = get_collection("optima_solutions_services", "projects")
        project = projects_collection.find_one({"project_name": project_name})
        if project:
            for collection_name, word_set in word_collections.items():
                project_words = project.get(collection_name, [])
                word_set.update(project_words)
                logging.info(f"Added {len(project_words)} project-specific words to {collection_name} for project '{project_name}'.")
        else:
            logging.warning(f"Project '{project_name}' not found in the database. Only general words loaded.")

    except Exception as e:
        logging.error(f"Error loading words from MongoDB: {e}", exc_info=True)

    # Log the final count of words in each set
    for collection_name, word_set in word_collections.items():
        logging.info(f"Final count for {collection_name}: {len(word_set)} words")

def insert_agent_info(agent_info, project_name):
    """
    Insert agent information into the agents collection.

    Parameters:
    agent_info (dict): Information about the agent.
    project_name (str): The name of the project.
    """
    collection = get_collection("optima_solutions_services", "agents")
    try:
        logging.info(f"Checking for existing agent with username: {agent_info['username']} and project: {project_name}")
        existing_agent = collection.find_one({
            "username": agent_info['username'],
            "project": project_name
        })

        if not existing_agent:
            agent_data = {
                "username": agent_info['username'],
                "first_name": agent_info['first_name'],
                "last_name": agent_info['last_name'],
                "project": project_name
            }
            collection.insert_one(agent_data)
            logging.info(f"Inserted agent {agent_info['username']} into the agents database.")
        else:
            logging.info(f"Agent {agent_info['username']} already exists in the agents database.")
    except Exception as e:
        logging.error(f"Error inserting agent info: {e}", exc_info=True)

def check_for_to_process_files():
    try:
        collection = client["optima_solutions_services"]["calls"]
        to_process_files = collection.find({"status": "to_process"})
        files_info = []
        for file in to_process_files:
            file_info = file.get("file_info", {})
            agent_info = file.get("agent_info", {})
            files_info.append({
                "filename": file.get("filename"),
                "file_path": file_info.get("file_path"),
                "agent_info": {
                    "username": agent_info.get("username"),
                    "first_name": agent_info.get("first_name"),
                    "last_name": agent_info.get("last_name"),
                    "project": agent_info.get("project")
                }
            })
        logging.info(
            f"Found {len(files_info)} files with status 'to_process'.")
        return files_info
    except Exception as e:
        logging.error(f"Error checking for to_process files in MongoDB: {e}", exc_info=True)
        return []