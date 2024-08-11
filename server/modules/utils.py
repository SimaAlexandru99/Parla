# modules/utils.py
import logging
import signal
import sys
import torch

def configure_logging():
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s - %(levelname)s - %(message)s')
    transformers_logger = logging.getLogger("transformers")
    transformers_logger.setLevel(logging.ERROR)

def signal_handler(sig, frame):
    try:
        logging.info('Signal received: %s. Exiting gracefully...', sig)
        sys.exit(0)
    except Exception as e:
        logging.error(f"Error during signal handling: {e}")
        sys.exit(1)  # Exit with a non-zero status to indicate an error

def get_device():
    try:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logging.info(f"Using device: {device}")
        return device
    except Exception as e:
        logging.error(f"Error determining device: {e}")
        # Default to CPU if there's an error
        return torch.device("cpu")
    
def get_index(parts, key):
    try:
        return parts.index(key) + 1
    except ValueError:
        return None
