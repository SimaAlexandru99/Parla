import os
import time
import re
import logging
import tempfile
from datetime import datetime
from scipy.io import wavfile
from modules.audio_processing import extract_segment, load_and_preprocess_audio, get_audio_duration, validate_audio
from modules.models import configure_asr_pipeline, configure_sentiment_pipeline
from modules.utils import get_device
from modules.impact import calculate_impact
from modules.satisfaction import predict_satisfaction_score
from modules.rating_projection import project_customer_rating
from modules.evaluation import evaluate_agent_performance
from modules.firebase_storage import download_file_from_firebase, upload_file_to_firebase
from modules.call_info import extract_call_info
from modules.database import get_collection, insert_agent_info
from modules.text_processing import extract_and_combine_words, lemmatize_text, extract_key_phrases, extract_entities
from bson import ObjectId
from modules.config import AI_MODEL, SENTIMENT_MODEL, TRACK_PROCESSED_FILES, GREETINGS_WORDS, COMPANIES_NAMES, DYNAMIC_FLAGS
from modules.gemini_ai import generate_call_summary
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

if AI_MODEL == "Gemini":
    from modules.gemini_ai import generate_call_summary

COMMON_ERRORS = [
    "Să vă mulțumim pentru vizionare!", "Nu uitați să vă abonați la canal!", "La revedere!", "Ai revedere!", "Nu uitați să dați like, să lăsați un comentariu și să distribuiți acest material video pe alte rețele sociale", "MULȚUMIT PENTRU VIZIONARE!", "Nu uitați să dați like, să lăsați un comentariu și să distribuiți acest material video pe alte rețele sociale", "Să vă mulțumim pentru vizionare!", "Să vă mulțumim pentru vizionare.", "Până la următoarea mea rețetă!"
]

def is_valid_transcription(transcription, previous_transcription=None):
    """Validates the transcription text."""
    if not transcription or not transcription.strip():
        return False
    for error in COMMON_ERRORS:
        if error in transcription:
            return False
    if len(transcription) < 5 or len(transcription) > 200:
        return False
    if not re.search(r'[a-zA-Z]', transcription):
        return False
    if previous_transcription and transcription in COMMON_ERRORS:
        if previous_transcription.strip().endswith(('!', '.', '?')):
            return True
        return False
    return True

def process_segments(asr_pipe, sentiment_pipe, nlp, audio, sample_rate, segment_length=5.0):
    """Processes audio segments with ASR and sentiment pipelines."""
    segments = []
    sentiment_scores, speaker_durations, crosstalk_duration, dead_air_duration, previous_turn_end, agent_all_text = initialize_metrics()
    previous_transcription = None

    with ThreadPoolExecutor(max_workers=4) as executor:
        future_segments = []
        future_segments.extend([
            executor.submit(process_single_segment, audio[0], start_time, end_time, sample_rate,
                            "SPEAKER_00", asr_pipe, nlp, sentiment_pipe, previous_transcription)
            for start_time, end_time in detect_segments(audio[0], sample_rate, segment_length)
        ])
        future_segments.extend([
            executor.submit(process_single_segment, audio[1], start_time, end_time, sample_rate,
                            "SPEAKER_01", asr_pipe, nlp, sentiment_pipe, previous_transcription)
            for start_time, end_time in detect_segments(audio[1], sample_rate, segment_length)
        ])

        for future in future_segments:
            segment = future.result()
            if segment:
                segments.append(segment)
                if segment["type_speaker"] == "agent":
                    agent_all_text += segment["transcription"] + " "
                sentiment_scores.append(segment["sentiment_score"])
                speaker_durations[segment["speaker"]] += segment["time_range"]["end"] - segment["time_range"]["start"]
                update_dead_air_duration(segment["time_range"]["start"], previous_turn_end, segment["speaker"], dead_air_duration)
                update_crosstalk_duration(segment["time_range"]["start"], segment["time_range"]["end"], previous_turn_end, segment["speaker"], crosstalk_duration)
                previous_turn_end[segment["speaker"]] = segment["time_range"]["end"]
                previous_transcription = segment["transcription"]

    segments.sort(key=lambda x: x["time_range"]["start"])

    return finalize_segment_processing(sentiment_scores, speaker_durations, dead_air_duration, crosstalk_duration, agent_all_text, segments)

def detect_segments(audio, sample_rate, segment_length=5.0):
    """Detects segments of the given length in the audio."""
    total_duration = len(audio) / sample_rate
    segments = [(i * segment_length, min((i + 1) * segment_length, total_duration)) for i in range(int(total_duration / segment_length))]
    return segments

def initialize_metrics():
    """Initializes metrics for processing."""
    sentiment_scores = []
    speaker_durations = {"SPEAKER_00": 0, "SPEAKER_01": 0}
    crosstalk_duration = 0
    dead_air_duration = {"SPEAKER_00": 0, "SPEAKER_01": 0}
    previous_turn_end = {"SPEAKER_00": 0, "SPEAKER_01": 0}
    agent_all_text = ""
    return sentiment_scores, speaker_durations, crosstalk_duration, dead_air_duration, previous_turn_end, agent_all_text

def update_dead_air_duration(start_time, previous_turn_end, speaker, dead_air_duration):
    """Updates the dead air duration metric."""
    if start_time > previous_turn_end[speaker]:
        dead_air_duration[speaker] += start_time - previous_turn_end[speaker]

def update_crosstalk_duration(start_time, end_time, previous_turn_end, speaker, crosstalk_duration):
    """Updates the crosstalk duration metric."""
    for other_speaker, end in previous_turn_end.items():
        if other_speaker != speaker and start_time < end:
            overlap = min(end_time, end) - start_time
            if overlap > 0:
                crosstalk_duration += overlap

def process_single_segment(audio, start_time, end_time, sample_rate, speaker, asr_pipe, nlp, sentiment_pipe, previous_transcription=None, min_confidence=0.5):
    """Processes a single audio segment."""
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_segment_file:
            audio_segment = extract_segment(audio, start_time, end_time, sample_rate)
            wavfile.write(temp_segment_file.name, sample_rate, audio_segment.numpy())
            temp_segment_file.close()

            result = asr_pipe(temp_segment_file.name)
            transcription = result['text'] if result and isinstance(result, dict) and 'text' in result else "[Transcription error]"
            confidence = result.get('confidence', 1.0)

            if confidence < min_confidence or not is_valid_transcription(transcription, previous_transcription):
                logging.warning(f"Low confidence or invalid transcription: {transcription}")
                return None

            lemmatized_text = lemmatize_text(nlp, transcription)
            key_phrases = extract_key_phrases(lemmatized_text)
            sentiment = sentiment_pipe(lemmatized_text)[0]
            entities = extract_entities(nlp, lemmatized_text)

            sentiment_score = int(sentiment['label'][0])
            type_speaker = "agent" if speaker == "SPEAKER_00" else "client"

            logging.info(f"Speaker: {speaker}")
            logging.info(f"Time: {start_time:.1f}s to {end_time:.1f}s")
            logging.info(f"Transcription: {transcription}")
            logging.info(f"Sentiment: {sentiment['label']}")

            return {
                "speaker": speaker,
                "time_range": {
                    "start": start_time,
                    "end": end_time
                },
                "transcription": transcription,
                "sentiment": sentiment['label'],
                "key_phrases": key_phrases,
                "entities": entities,
                "sentiment_score": sentiment_score,
                "type_speaker": type_speaker
            }
    except Exception as e:
        logging.error(f"Error processing segment {start_time}-{end_time} for speaker {speaker}: {e}")
    finally:
        if os.path.exists(temp_segment_file.name):
            os.remove(temp_segment_file.name)
    return None

def finalize_segment_processing(sentiment_scores, speaker_durations, dead_air_duration, crosstalk_duration, agent_all_text, segments):
    """Finalizes the processing of segments and computes various metrics."""
    average_sentiment, impact_result, satisfaction_score, projected_rating = None, None, None, None

    if sentiment_scores:
        average_sentiment = sum(sentiment_scores) / len(sentiment_scores)
        logging.info(f"Average Sentiment Score: {average_sentiment:.2f}")

        start_sentiment = sentiment_scores[0]
        end_sentiment = sentiment_scores[-1]
        conversion_rate = 0.1
        impact_result = calculate_impact(start_sentiment, end_sentiment, conversion_rate)
        logging.info(f"Impact Result: {impact_result}")

        satisfaction_score = predict_satisfaction_score(end_sentiment)
        logging.info(f"Satisfaction Score: {satisfaction_score}")

        projected_rating = project_customer_rating(average_sentiment, end_sentiment, satisfaction_score)
        logging.info(f"Projected Customer Rating: {projected_rating}")

    for speaker, duration in speaker_durations.items():
        logging.info(f"{speaker} Total Talk Duration: {duration:.2f} seconds")

    logging.info(f"Total Crosstalk Duration: {crosstalk_duration:.2f} seconds")
    for speaker, duration in dead_air_duration.items():
        logging.info(f"{speaker} Total Dead Air Duration: {duration:.2f} seconds")

    logging.info(f"Agent's Complete Text: {agent_all_text}")

    score = evaluate_agent_performance(agent_all_text)
    call_summary = generate_call_summary(agent_all_text)

    return {
        "average_sentiment": average_sentiment,
        "total_talk_duration": speaker_durations,
        "total_dead_air_duration": dead_air_duration,
        "crosstalk_duration": crosstalk_duration,
        "score": score,
        "impact_result": impact_result,
        "satisfaction_score": satisfaction_score,
        "projected_rating": projected_rating,
        "segments": segments,
        "call_summary": call_summary,
    }

def process_single_file(file_info: dict, project_name: str, asr_pipe, sentiment_pipe, nlp, processed_files: set, force_process: bool):
    """Processes a single audio file."""
    collection = get_collection("optima_solutions_services", "calls")

    filename = file_info['filename']
    original_file_path = file_info['file_path']


    local_file_path: Optional[str] = None

    try:
        # Download the file if it's a remote URL
        if original_file_path.startswith(("http://", "https://")):
            local_file_path = download_remote_file(original_file_path, filename, project_name)
            if local_file_path is None:
                logging.error(f"Failed to download file {filename} from Firebase. Skipping processing.")
                return
            firebase_url = original_file_path
        else:
            local_file_path = original_file_path
            firebase_url = upload_file_to_firebase(local_file_path, filename, project_name, folder="calls")

        # Get audio duration
        audio_duration = get_audio_duration(local_file_path)
        logging.info(f"Audio Duration: {audio_duration} seconds")

        # Skip processing if audio duration is less than 5 seconds
        if audio_duration < 5:
            logging.info(f"Skipping file {filename} as its duration is less than 5 seconds.")
            return

        start_time = time.time()
        logging.info(f"Processing file: {filename}")

        agent_info, day, phone_number, final_status = extract_call_info(filename)

        # Insert agent info into the database
        insert_agent_info(agent_info, project_name)
        log_call_info(agent_info, project_name, day, phone_number, final_status)

        # Check if the document already exists
        existing_document = collection.find_one({"filename": filename, "agent_info.project": project_name})

        if existing_document:
            document_id = existing_document["_id"]
            # Update existing document
            update_existing_document(collection, document_id, firebase_url, final_status, day, audio_duration, agent_info, project_name, phone_number)
        else:
            # Insert new document
            document_id = insert_new_document(collection, filename, firebase_url, final_status, day, audio_duration, agent_info, project_name, phone_number)

        audio, sample_rate = load_and_preprocess_audio(local_file_path)

        try:
            validate_audio(audio[0])
            validate_audio(audio[1])
        except ValueError as e:
            logging.error(f"Validation error: {e}. Continuing with processing.")

        segments_info = process_segments(asr_pipe, sentiment_pipe, nlp, audio, sample_rate)
        update_document_with_results(collection, document_id, segments_info, audio_duration, start_time, processed_files, filename, force_process)

    except Exception as e:
        logging.error(f"An error occurred while processing file {filename}: {e}")
    finally:
        # Clean up the temporary file if it was downloaded
        if original_file_path.startswith(("http://", "https://")) and local_file_path:
            if os.path.exists(local_file_path):
                try:
                    os.remove(local_file_path)
                except Exception as e:
                    logging.error(f"Error removing temporary file {local_file_path}: {e}")

def download_remote_file(file_path, filename, project_name):
    """Downloads a remote file."""
    local_file_path = os.path.join(tempfile.gettempdir(), filename)
    result = download_file_from_firebase(project_name, filename, local_file_path, folder="calls")
    if result is None:
        logging.error(f"Failed to download file {filename} for project {project_name}")
        return None
    return local_file_path

def log_call_info(agent_info, project_name, day, phone_number, final_status):
    """Logs call information."""
    logging.info(f"Agent Name: {agent_info['first_name']} {agent_info['last_name']}")
    logging.info(f"Project Name: {project_name}")
    logging.info(f"Day: {day}")
    logging.info(f"Phone Number: {phone_number}")
    logging.info(f"Final Status: {final_status}")

def update_existing_document(collection, document_id: ObjectId, firebase_url: Optional[str], final_status: Optional[str], day: Optional[str], audio_duration: float, agent_info: dict, project_name: str, phone_number: Optional[str]):
    """Updates an existing document in the MongoDB collection."""
    update_info = {
        "day_processed": datetime.now().strftime("%Y-%m-%d"),
        "status": "processing",
        "file_info": {
            "duration": audio_duration,
            "final_status": final_status if final_status else "",
            "day": day if day else "",
            "file_path": firebase_url if firebase_url else ""
        },
        "phone_number": phone_number if phone_number else "",
        "agent_info": {
            "username": agent_info['username'],
            "first_name": agent_info['first_name'],
            "last_name": agent_info['last_name'],
            "project": project_name
        }
    }
    collection.update_one({"_id": document_id}, {"$set": update_info})

def insert_new_document(collection, filename: str, firebase_url: Optional[str], final_status: Optional[str], day: Optional[str], audio_duration: float, agent_info: dict, project_name: str, phone_number: Optional[str]) -> ObjectId:
    """Inserts a new document into the MongoDB collection."""
    new_document = {
        "filename": filename,
        "day_processed": datetime.now().strftime("%Y-%m-%d"),
        "status": "processing",
        "file_info": {
            "extension": os.path.splitext(filename)[1][1:],
            "duration": audio_duration,
            "final_status": final_status if final_status else "",
            "day": day if day else "",
            "file_path": firebase_url if firebase_url else ""
        },
        "phone_number": phone_number if phone_number else "",
        "agent_info": {
            "username": agent_info['username'],
            "first_name": agent_info['first_name'],
            "last_name": agent_info['last_name'],
            "project": project_name
        }
    }
    return collection.insert_one(new_document).inserted_id

def update_document_with_results(collection, document_id, segments_info, audio_duration, start_time, processed_files, filename, force_process):
    """Updates the MongoDB document with the results of processing."""
    processing_time = time.time() - start_time
    updated_info = {
        "file_info.duration": audio_duration,
        "status": "processed",
        "day_processed": datetime.now().strftime("%Y-%m-%d"),
        "average_sentiment": segments_info["average_sentiment"],
        "total_talk_duration": segments_info["total_talk_duration"],
        "total_dead_air_duration": segments_info["total_dead_air_duration"],
        "crosstalk_duration": segments_info["crosstalk_duration"],
        "score": segments_info["score"],
        "impact_result": segments_info["impact_result"],
        "satisfaction_score": segments_info["satisfaction_score"],
        "projected_rating": segments_info["projected_rating"],
        "segments": segments_info["segments"],
        "processing_time_seconds": processing_time,
        "call_summary": segments_info["call_summary"],
    }
    collection.update_one({"_id": document_id}, {"$set": updated_info})
    if TRACK_PROCESSED_FILES or force_process:
        processed_files.add(filename)

def process_files(project_name, files_to_process, asr_model, processor, assistant_model, sentiment_pipeline, nlp, processed_files, force_process=False):
    """Processes a batch of files."""
    asr_pipe = configure_asr_pipeline(asr_model, processor, get_device(), assistant_model)
    sentiment_pipe = configure_sentiment_pipeline(SENTIMENT_MODEL)

    for file_info in files_to_process:
        process_single_file(file_info, project_name, asr_pipe, sentiment_pipe, nlp, processed_files, force_process)
