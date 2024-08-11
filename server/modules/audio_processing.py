import torchaudio
import tempfile
from scipy.io import wavfile
from pydub import AudioSegment
import torch
import numpy as np
import logging

def load_and_preprocess_audio(audio_path):
    # Load the audio file
    audio, sample_rate = torchaudio.load(audio_path)

    # Normalize the audio to the range [-1, 1]
    audio = audio / torch.max(torch.abs(audio))

    # Split the audio into two channels
    audio_channel_1 = audio[0]
    audio_channel_2 = audio[1]

    # Validate the audio
    try:
        validate_audio(audio_channel_1)
        validate_audio(audio_channel_2)
    except ValueError as e:
        logging.error(f"Validation error: {e}. Continuing with processing.")

    return (audio_channel_1, audio_channel_2), sample_rate

def extract_segment(audio, start_time, end_time, sample_rate):
    start_sample = int(start_time * sample_rate)
    end_sample = int(end_time * sample_rate)
    return audio[start_sample:end_sample]

def get_audio_duration(file_path):
    audio = AudioSegment.from_file(file_path)
    return len(audio) / 1000

def validate_audio(audio):
    if not np.isfinite(audio).all():
        raise ValueError("Audio buffer is not finite everywhere")
