"""
Translation service - handles model loading and translation logic
"""

import os
import time
import warnings
from typing import Tuple, Optional
from huggingface_hub import hf_hub_download

# Handle NumPy compatibility issues
try:
    import numpy as np
    # Suppress NumPy 2.0 warnings for compatibility
    warnings.filterwarnings("ignore", message=".*copy.*", category=np.VisibleDeprecationWarning)
    warnings.filterwarnings("ignore", message=".*copy.*", category=UserWarning)
except ImportError:
    pass

import ctranslate2
import sentencepiece as spm
import fasttext

from ..core.config import settings
from ..core.logging import get_logger

logger = get_logger()

# Global model instances
lang_model: Optional[fasttext.FastText._FastText] = None
sp_model: Optional[spm.SentencePieceProcessor] = None
translator: Optional[ctranslate2.Translator] = None


def get_model_paths() -> Tuple[str, str, str]:
    """Get model paths from HuggingFace cache (models pre-downloaded in Docker)"""
    logger.info("loading_models_from_cache")

    try:
        # Check if we're in offline mode (Docker environment)
        offline_mode = os.environ.get("HF_HUB_OFFLINE", "0") == "1"

        if offline_mode:
            logger.info("running_in_offline_mode")
            # In offline mode, models are already downloaded and cached
            spm_path = hf_hub_download(
                repo_id=settings.model_repo_id,
                filename="spm.model",
                local_files_only=True
            )

            ft_path = hf_hub_download(
                repo_id=settings.model_repo_id,
                filename="lid218e.bin",
                local_files_only=True
            )

            # Get the translation model path
            model_bin_path = hf_hub_download(
                repo_id=settings.model_repo_id,
                filename=f"translation_models/{settings.translation_model}/model.bin",
                local_files_only=True
            )

            ct_model_full_path = os.path.dirname(model_bin_path)

        else:
            logger.info("running_in_online_mode")
            # Online mode - download models (for local development)
            spm_path = hf_hub_download(
                repo_id=settings.model_repo_id,
                filename="spm.model"
            )

            ft_path = hf_hub_download(
                repo_id=settings.model_repo_id,
                filename="lid218e.bin"
            )

            # Download all necessary CTranslate2 files
            model_bin_path = hf_hub_download(
                repo_id=settings.model_repo_id,
                filename=f"translation_models/{settings.translation_model}/model.bin"
            )

            hf_hub_download(
                repo_id=settings.model_repo_id,
                filename=f"translation_models/{settings.translation_model}/config.json"
            )

            hf_hub_download(
                repo_id=settings.model_repo_id,
                filename=f"translation_models/{settings.translation_model}/shared_vocabulary.txt"
            )

            ct_model_full_path = os.path.dirname(model_bin_path)

        logger.info(
            "model_paths_resolved",
            spm_path=spm_path,
            ft_path=ft_path,
            ct_model_path=ct_model_full_path
        )

        return spm_path, ft_path, ct_model_full_path

    except Exception as e:
        logger.error("model_path_resolution_failed", error=str(e))
        raise e


def load_models():
    """Load all models into memory"""
    global lang_model, sp_model, translator

    logger.info("starting_model_loading")

    # Get model paths
    spm_path, ft_path, ct_model_path = get_model_paths()

    # Suppress fasttext warnings
    fasttext.FastText.eprint = lambda x: None

    try:
        # Load language detection model
        logger.info("loading_language_detection_model")
        lang_model = fasttext.load_model(ft_path)

        # Load SentencePiece model
        logger.info("loading_sentencepiece_model")
        sp_model = spm.SentencePieceProcessor()
        sp_model.load(spm_path)

        # Load translation model
        logger.info("loading_translation_model")
        translator = ctranslate2.Translator(ct_model_path, settings.device)

        logger.info("all_models_loaded_successfully")

    except Exception as e:
        logger.error("model_loading_failed", error=str(e))
        raise e


def translate_with_detection(text: str, target_lang: str) -> Tuple[str, str, float]:
    """Translate text with automatic source language detection"""
    start_time = time.time()

    try:
        # Prepare input
        source_sents = [text.strip()]
        target_prefix = [[target_lang]]

        # Detect source language
        predictions = lang_model.predict(text.replace('\n', ' '), k=1)
        source_lang = predictions[0][0].replace('__label__', '')

        # Tokenize source text
        source_sents_subworded = sp_model.encode(source_sents, out_type=str)
        source_sents_subworded = [[source_lang] + sent + ["</s>"] for sent in source_sents_subworded]

        # Translate
        translations = translator.translate_batch(
            source_sents_subworded,
            batch_type="tokens",
            max_batch_size=2048,
            beam_size=settings.beam_size,
            target_prefix=target_prefix,
        )

        # Decode translation
        translations = [translation[0]['tokens'] for translation in translations]
        translations_desubword = sp_model.decode(translations)
        translated_text = translations_desubword[0][len(target_lang):]

        inference_time = time.time() - start_time

        return source_lang, translated_text, inference_time

    except Exception as e:
        logger.error("translation_with_detection_failed", error=str(e), error_type=type(e).__name__)
        # Re-raise the exception to be handled by the endpoint
        raise e


def translate_with_source(text: str, source_lang: str, target_lang: str) -> Tuple[str, float]:
    """Translate text with provided source language"""
    start_time = time.time()

    try:
        # Prepare input
        source_sents = [text.strip()]
        target_prefix = [[target_lang]]

        # Tokenize source text
        source_sents_subworded = sp_model.encode(source_sents, out_type=str)
        source_sents_subworded = [[source_lang] + sent + ["</s>"] for sent in source_sents_subworded]

        # Translate
        translations = translator.translate_batch(
            source_sents_subworded,
            batch_type="tokens",
            max_batch_size=2048,
            beam_size=settings.beam_size,
            target_prefix=target_prefix
        )

        # Decode translation
        translations = [translation[0]['tokens'] for translation in translations]
        translations_desubword = sp_model.decode(translations)
        translated_text = translations_desubword[0][len(target_lang):]

        inference_time = time.time() - start_time

        return translated_text, inference_time

    except Exception as e:
        logger.error("translation_with_source_failed", error=str(e), error_type=type(e).__name__)
        # Re-raise the exception to be handled by the endpoint
        raise e


def detect_language(text: str) -> Tuple[str, float]:
    """
    Detect the language of input text

    Returns:
        Tuple of (language_code, confidence_score)
    """
    try:
        # Clean and normalize text for better detection
        # FastText models work better with lowercase text
        cleaned_text = text.replace('\n', ' ').strip().lower()

        # Get predictions with confidence scores
        predictions = lang_model.predict(cleaned_text, k=1)

        # Extract language code and confidence
        language_code = predictions[0][0].replace('__label__', '')
        raw_confidence = float(predictions[1][0])

        # Normalize confidence to ensure it's within [0.0, 1.0]
        # FastText sometimes returns values slightly above 1.0
        confidence = min(raw_confidence, 1.0)

        logger.info(
            "language_detected",
            text_length=len(text),
            original_text_sample=text[:50] + "..." if len(text) > 50 else text,
            cleaned_text_sample=cleaned_text[:50] + "..." if len(cleaned_text) > 50 else cleaned_text,
            detected_language=language_code,
            raw_confidence=raw_confidence,
            normalized_confidence=confidence
        )

        return language_code, confidence

    except Exception as e:
        logger.error("language_detection_failed", error=str(e), error_type=type(e).__name__)
        # Re-raise the exception to be handled by the endpoint
        raise e


def models_loaded() -> bool:
    """Check if all models are loaded"""
    return all([lang_model, sp_model, translator])
