import os
import time
import google.generativeai as genai
from google.generativeai import GenerationConfig
import logging

from modules.config import MODEL_NAME

# Configure the Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create the model configuration
generation_config = GenerationConfig(
    temperature=1,
    top_p=0.95,
    top_k=64,
    max_output_tokens=8192,
    response_mime_type="text/plain",
)

# Initialize the GenerativeModel
model = genai.GenerativeModel(
    model_name=MODEL_NAME,
    generation_config=generation_config,
    system_instruction="Vreau să acționezi ca un expert în quality assurance pentru un call center. Tu ar trebui să ofere sfaturi despre cum să vândă mai bine, să îmbunătățească atitudinea operatorilor, să ofere tehnici de abordare în apel și să ofere feedback constructiv și să ofere rezumate constructive și concise."
    # safety_settings can be adjusted if necessary
)


def generate_call_summary(transcript: str, retries: int = 3, wait_time: int = 5) -> str:
    # Ensure the prompt is in Romanian
    prompt = f"Generează un rezumat al următoarei transcrieri a apelului: {transcript}"
    chat_session = model.start_chat(history=[])
    for attempt in range(retries):
        try:
            response = chat_session.send_message(prompt)
            return response.text
        except Exception as e:
            logging.error(f"Attempt {attempt + 1} failed: {e}")
            time.sleep(wait_time)
    return "Failed to generate call summary after multiple attempts."


def draft_follow_up_email(call_summary: str, customer_name: str) -> str:
    # Ensure the prompt is in Romanian
    message = f"Generează un email de urmărire pentru un client numit {customer_name} pe baza următorului rezumat al apelului: {call_summary}"
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(message)
    return response.text


def provide_coaching_tips(agent_performance: str) -> str:
    # Ensure the prompt is in Romanian
    message = f"Oferă sfaturi de coaching pentru un agent pe baza următoarei analize a performanței: {agent_performance}"
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(message)
    return response.text


def suggest_knowledge_base_articles(call_transcript: str) -> str:
    # Ensure the prompt is in Romanian
    message = f"Sugerează articole relevante din baza de cunoștințe pe baza următoarei transcrieri a apelului: {call_transcript}"
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(message)
    return response.text


def analyze_performance(agent_performance: str) -> str:
    # Ensure the prompt is in Romanian
    message = f"Analizează următoarea performanță a agentului și oferă 3 aspecte pozitive, 3 aspecte negative și 3 recomandări: {agent_performance}"
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(message)
    return response.text


def correct_and_enhance_text(segment_text: str, retries: int = 3, wait_time: int = 5) -> str:
    # Ensure the prompt is in Romanian
    if not segment_text.strip():
        return "Textul segmentului este gol, nu a putut fi corectat."

    prompt = f"Corectează gramatical și ajustează textul următor pentru a îmbunătăți sensul propozițiilor: {segment_text}"
    chat_session = model.start_chat(history=[])
    for attempt in range(retries):
        try:
            response = chat_session.send_message(prompt)
            return response.text
        except Exception as e:
            logging.error(f"Attempt {attempt + 1} failed: {e}")
            time.sleep(wait_time)
    return "Failed to correct and enhance text after multiple attempts."
