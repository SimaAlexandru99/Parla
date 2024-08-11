# modules/text_processing.py
import yake
import logging
from .config import (
    COMMON_WORDS, POSITIVE_WORDS, NEGATIVE_WORDS, GREETINGS_WORDS,
    COMPANIES_NAMES, WORDS_TO_REMOVE, AVAILABILITY_WORDS, FROM_WHAT_COMPANY,
    GOOD_BYE_WORDS, DYNAMIC_FLAGS, SCORE
)
import re



def lemmatize_text(nlp, text):
    doc = nlp(text)
    return " ".join([token.lemma_ for token in doc])


def extract_entities(nlp, text):
    doc = nlp(text)
    return [(ent.text, ent.label_) for ent in doc.ents]


def extract_key_phrases(text):
    kw_extractor = yake.KeywordExtractor()
    keywords = kw_extractor.extract_keywords(text)
    return [keyword for keyword, score in keywords]


def extract_and_combine_words(project_config):
    global GREETINGS_WORDS, COMPANIES_NAMES, AVAILABILITY_WORDS, FROM_WHAT_COMPANY, POSITIVE_WORDS, NEGATIVE_WORDS, COMMON_WORDS, WORDS_TO_REMOVE, GOOD_BYE_WORDS, DYNAMIC_FLAGS

    greetings_words = set(project_config.get(
        "greetings_words", [])) | GREETINGS_WORDS
    companies_names = set(project_config.get(
        "companies_names", [])) | COMPANIES_NAMES
    availability_words = set(project_config.get(
        "availability_words", [])) | AVAILABILITY_WORDS
    from_what_company_words = set(project_config.get(
        "from_what_company", [])) | FROM_WHAT_COMPANY
    positive_words = set(project_config.get(
        "positive_words", [])) | POSITIVE_WORDS
    negative_words = set(project_config.get(
        "negative_words", [])) | NEGATIVE_WORDS
    common_words = set(project_config.get("common_words", [])) | COMMON_WORDS
    words_to_remove = set(project_config.get(
        "words_to_remove", [])) | WORDS_TO_REMOVE
    good_bye_words = set(project_config.get(
        "good_bye_words", [])) | GOOD_BYE_WORDS

    DYNAMIC_FLAGS = {flag['flag']: {'keywords': set(
        flag['keywords']), 'score': flag['score']} for flag in project_config.get("analyze_flags", [])}

    return (greetings_words, companies_names, availability_words, from_what_company_words, positive_words, negative_words, common_words, words_to_remove, good_bye_words, DYNAMIC_FLAGS)

# Helper functions that were previously in evaluation.py


def normalize_text(text):
    """Normalize the text for comparison."""
    return text.lower()


def check_for_words(agent_all_text, word_set, set_name=None):
    """
    Check for the presence of words from a given set in the agent's text.

    Args:
    agent_all_text (str): The text to search in.
    word_set (set): The set of words to search for.
    set_name (str, optional): The name of the word set, used for logging.

    Returns:
    list: A list of words found in the text.
    """
    agent_all_text = normalize_text(agent_all_text)
    words_found = [word for word in word_set if re.search(
        r'\b' + re.escape(word) + r'\b', agent_all_text)]

    if set_name:
        logging.debug(f"{set_name} words found: {words_found}")

    return words_found
