import os
import time
import logging
import signal
from datetime import datetime
from typing import Set, Tuple, List, Dict, Any
from modules import (
    ASR_MODEL_ID,
    ASSISTANT_MODEL_ID,
    SPACY_MODEL,
    SENTIMENT_MODEL,
    AUDIO_PATH,
    CHECK_INTERVAL,
)
from modules.rating_projection import project_customer_rating
from modules.utils import get_device
from modules.database import load_words_from_mongodb, check_for_to_process_files, check_database_connection
from modules.call_processing import process_files
from modules.models import load_asr_model, load_assistant_model, load_spacy_model, configure_sentiment_pipeline

def configure_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler("audio_processing.log"),
            logging.StreamHandler()
        ]
    )

def signal_handler(sig: int, frame: Any):
    logging.info('Exiting...')
    exit(0)

def initialize_models() -> Tuple[Any, Any, Any, Any, Any]:
    device = get_device()
    asr_model, processor = load_asr_model(ASR_MODEL_ID, device)
    assistant_model = load_assistant_model(ASSISTANT_MODEL_ID, device)
    nlp = load_spacy_model(SPACY_MODEL)
    sentiment_pipeline = configure_sentiment_pipeline(SENTIMENT_MODEL)
    return asr_model, processor, assistant_model, nlp, sentiment_pipeline

def process_files_in_directory(
    project_name: str,
    processed_files: Set[str],
    asr_model: Any,
    processor: Any,
    assistant_model: Any,
    sentiment_pipeline: Any,
    nlp: Any
) -> None:
    project_path = os.path.join(AUDIO_PATH, project_name)
    audio_files = [f for f in os.listdir(project_path) if f not in processed_files]
    
    if not audio_files:
        logging.info(f"No new files to process in {project_name}.")
        return

    files_to_process = [
        {"filename": f, "file_path": os.path.join(project_path, f)}
        for f in audio_files
    ]
    process_files(
        project_name,
        files_to_process,
        asr_model,
        processor,
        assistant_model,
        sentiment_pipeline,
        nlp,
        processed_files
    )

def main():
    try:
        configure_logging()
        signal.signal(signal.SIGINT, signal_handler)

        if not check_database_connection():
            logging.error("Failed to connect to MongoDB. Exiting...")
            return

        processed_files: Set[str] = set()
        asr_model, processor, assistant_model, nlp, sentiment_pipeline = initialize_models()
        

        while True:
            to_process_files = check_for_to_process_files()

            if to_process_files:
                for file_info in to_process_files:
                    project_name = file_info["agent_info"]["project"]
                    load_words_from_mongodb(project_name)
                    process_files(
                        project_name,
                        [file_info],
                        asr_model,
                        processor,
                        assistant_model,
                        sentiment_pipeline,
                        nlp,
                        processed_files,
                        force_process=True
                    )
                    processed_files.add(file_info["filename"])
            else:
                project_dirs = [
                    d for d in os.listdir(AUDIO_PATH)
                    if os.path.isdir(os.path.join(AUDIO_PATH, d))
                ]
                for project_name in project_dirs:
                    load_words_from_mongodb(project_name)
                    process_files_in_directory(
                        project_name,
                        processed_files,
                        asr_model,
                        processor,
                        assistant_model,
                        sentiment_pipeline,
                        nlp
                    )

            time.sleep(CHECK_INTERVAL)
    except Exception as e:
        logging.exception(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
