import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, AutoModelForCausalLM, pipeline
from pyannote.audio import Pipeline as PyannotePipeline
import spacy
from .config import HUGGINGFACE_ACCESS_TOKEN, LANGUAGE, TASK

def load_asr_model(model_id, device):
    """Loads the ASR model and processor."""
    torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    asr_model = AutoModelForSpeechSeq2Seq.from_pretrained(
        model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True, attn_implementation="sdpa"
    )
    asr_model.to(device)
    processor = AutoProcessor.from_pretrained(model_id)
    return asr_model, processor

def load_assistant_model(model_id, device):
    """Loads the assistant model (e.g., for generating responses)."""
    torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    assistant_model = AutoModelForCausalLM.from_pretrained(
        model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
    )
    assistant_model.to(device)
    return assistant_model

def load_diarization_pipeline(model_id):
    """Loads the speaker diarization pipeline."""
    return PyannotePipeline.from_pretrained(model_id, use_auth_token=HUGGINGFACE_ACCESS_TOKEN)

def configure_sentiment_pipeline(model_id):
    """Configures the sentiment analysis pipeline."""
    return pipeline("sentiment-analysis", model=model_id)

def load_spacy_model(model_id):
    """Loads the SpaCy model for NLP tasks."""
    return spacy.load(model_id)

def configure_asr_pipeline(asr_model, processor, device, assistant_model):
    """Configures the ASR pipeline."""
    return pipeline(
        "automatic-speech-recognition",
        model=asr_model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        max_new_tokens=400,
        return_timestamps=True,
        torch_dtype=asr_model.dtype,
        device=device,
        generate_kwargs={
            "language": LANGUAGE, "task": TASK, "temperature": 0.2, "do_sample": False
        }
    )
