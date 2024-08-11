import subprocess
import logging
import os

# Ensure the logging directory exists
log_dir = 'logging'
os.makedirs(log_dir, exist_ok=True)

# Set up logging
logging.basicConfig(
    filename=os.path.join(log_dir, 'anydesk_start.log'),
    level=logging.INFO,
    format='%(asctime)s %(levelname)s:%(message)s'
)

def start_anydesk():
    try:
        # Path to AnyDesk executable
        anydesk_path = 'C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe'

        # Start AnyDesk
        subprocess.run([anydesk_path], check=True)
        logging.info("AnyDesk started successfully.")
    except FileNotFoundError as e:
        logging.error(f"AnyDesk executable not found: {e}")
    except subprocess.CalledProcessError as e:
        logging.error(f"Error starting AnyDesk: {e}")
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    start_anydesk()
