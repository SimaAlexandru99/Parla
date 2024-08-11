from dotenv import load_dotenv
import os

load_dotenv()


ASR_MODEL_ID = "openai/whisper-large-v3"
DIARIZATION_MODEL_ID = "pyannote/speaker-diarization-3.1"
SPACY_MODEL = "ro_core_news_lg"
SENTIMENT_MODEL = "nlptown/bert-base-multilingual-uncased-sentiment"
ASSISTANT_MODEL_ID = "distil-whisper/distil-large-v3"
TARGET_SAMPLE_RATE = 16000
CHECK_INTERVAL = 60  # Time delay between checks in seconds
LANGUAGE = "romanian"
TASK = "transcribe"
SCORE = 100
AUDIO_PATH = './audio'
TRACK_PROCESSED_FILES = False
HUGGINGFACE_ACCESS_TOKEN = os.getenv('HUGGINGFACE_ACCESS_TOKEN')
MONGODB_CONNECTION_STRING = os.getenv('MONGODB_CONNECTION_STRING')
STATIC_ROOT = r'\\10.203.243.11\Public\Upload Documente ASGARD\NextCallRecords'
AI_MODEL = "Gemini"
MODEL_NAME = "gemini-1.5-pro"

# Global word sets
COMMON_WORDS = set()
POSITIVE_WORDS = set()
NEGATIVE_WORDS = set()
GREETINGS_WORDS = set()
COMPANIES_NAMES = set()
WORDS_TO_REMOVE = set()
AVAILABILITY_WORDS = set()
FROM_WHAT_COMPANY = set()
GOOD_BYE_WORDS = set()

# Dynamic flags
DYNAMIC_FLAGS = {}
