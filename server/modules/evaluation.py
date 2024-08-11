import logging
import re
from modules.config import SCORE, DYNAMIC_FLAGS
from modules.database import (
    COMMON_WORDS, POSITIVE_WORDS, NEGATIVE_WORDS, GREETINGS_WORDS,
    COMPANIES_NAMES, AVAILABILITY_WORDS,
    FROM_WHAT_COMPANY, GOOD_BYE_WORDS
)
from .text_processing import normalize_text, check_for_words



def evaluate_dynamic_flags(agent_all_text):
    agent_all_text = normalize_text(agent_all_text)
    score_deductions = 0
    for flag, data in DYNAMIC_FLAGS.items():
        found_keywords = [word for word in data['keywords'] if re.search(r'\b' + re.escape(word) + r'\b', agent_all_text)]
        if found_keywords:
            logging.info(f"Agent met flag '{flag}': {', '.join(found_keywords)}")
        else:
            logging.info(f"Agent did not meet flag '{flag}'")
            score_deductions += data['score']
    logging.debug(f"Score deductions from dynamic flags: {score_deductions}")
    return score_deductions

def evaluate_agent_performance(agent_all_text):
    score = SCORE
    logging.debug(f"Initial score: {score}")

    # Check for greetings
    found_greetings = check_for_words(agent_all_text, GREETINGS_WORDS, "Greetings")
    if found_greetings:
        logging.info(f"Agent used greetings: {', '.join(found_greetings)}")
    else:
        logging.info("Agent did not use any greetings words.")
        score -= 5

    # Check for company names
    found_companies = check_for_words(agent_all_text, COMPANIES_NAMES, "Companies")
    if found_companies:
        logging.info(f"Agent mentioned companies: {', '.join(found_companies)}")
    else:
        logging.info("Agent did not mention any company names.")
        score -= 5

    # Check for goodbye words
    found_goodbyes = check_for_words(agent_all_text, GOOD_BYE_WORDS, "Goodbyes")
    if found_goodbyes:
        logging.info(f"Agent used goodbye words: {', '.join(found_goodbyes)}")
    else:
        logging.info("Agent did not use any goodbye words.")
        score -= 5

    # Check for availability words
    found_availability = check_for_words(agent_all_text, AVAILABILITY_WORDS, "Availability")
    if found_availability:
        logging.info(f"Agent used availability words: {', '.join(found_availability)}")
    else:
        logging.info("Agent did not use any availability words.")
        score -= 3

    # Check for company inquiry words
    found_company_inquiry = check_for_words(agent_all_text, FROM_WHAT_COMPANY, "Company Inquiry")
    if found_company_inquiry:
        logging.info(f"Agent inquired about the customer's company: {', '.join(found_company_inquiry)}")
    else:
        logging.info("Agent did not inquire about the customer's company.")
        score -= 3

    # Check for positive words
    found_positive = check_for_words(agent_all_text, POSITIVE_WORDS, "Positive")
    logging.info(f"Agent used {len(found_positive)} positive words.")

    # Check for negative words
    found_negative = check_for_words(agent_all_text, NEGATIVE_WORDS, "Negative")
    logging.info(f"Agent used {len(found_negative)} negative words.")

    # Adjust score based on positive/negative ratio
    if found_positive and found_negative:
        positive_ratio = len(found_positive) / (len(found_positive) + len(found_negative))
        if positive_ratio < 0.6:
            score -= 5
            logging.info("Agent used too many negative words compared to positive words.")



    # Check for common words (optional, for information only)
    found_common = check_for_words(agent_all_text, COMMON_WORDS, "Common")
    logging.info(f"Agent used {len(found_common)} common words.")

    logging.info(f"Final Score: {score}")
    return score