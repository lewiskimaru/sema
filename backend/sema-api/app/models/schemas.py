"""
Pydantic models for request/response validation
"""

from typing import Optional, Dict
from pydantic import BaseModel, Field, validator


class TranslationRequest(BaseModel):
    """
    Translation request model

    Validates input for the translation endpoint with proper FLORES-200 language codes.
    """

    text: str = Field(
        ...,
        example="Habari ya asubuhi",
        description="Text to translate (1-5000 characters)",
        min_length=1,
        max_length=5000,
        title="Input Text"
    )
    target_language: str = Field(
        ...,
        example="eng_Latn",
        description="Target language in FLORES-200 format (e.g., eng_Latn for English)",
        pattern=r"^[a-z]{3}_[A-Z][a-z]{3}$",
        title="Target Language Code"
    )
    source_language: Optional[str] = Field(
        None,
        example="swh_Latn",
        description="Source language in FLORES-200 format. If not provided, language will be auto-detected",
        pattern=r"^[a-z]{3}_[A-Z][a-z]{3}$",
        title="Source Language Code (Optional)"
    )

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "summary": "Auto-detect source language",
                    "description": "Translate Swahili to English with automatic language detection",
                    "value": {
                        "text": "Habari ya asubuhi",
                        "target_language": "eng_Latn"
                    }
                },
                {
                    "summary": "Specify source language",
                    "description": "Translate English to Swahili with specified source language",
                    "value": {
                        "text": "Good morning",
                        "source_language": "eng_Latn",
                        "target_language": "swh_Latn"
                    }
                },
                {
                    "summary": "African language translation",
                    "description": "Translate Kikuyu to English",
                    "value": {
                        "text": "Wĩ mwega?",
                        "source_language": "kik_Latn",
                        "target_language": "eng_Latn"
                    }
                }
            ]
        }

    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or only whitespace')
        return v.strip()


class TranslationResponse(BaseModel):
    """
    Translation response model

    Contains the translated text and metadata about the translation process.
    """

    translated_text: str = Field(
        ...,
        description="The translated text result",
        example="Good morning",
        title="Translated Text"
    )
    source_language: str = Field(
        ...,
        description="Detected or provided source language code",
        example="swh_Latn",
        title="Source Language"
    )
    target_language: str = Field(
        ...,
        description="Target language code as requested",
        example="eng_Latn",
        title="Target Language"
    )
    inference_time: float = Field(
        ...,
        description="Time taken for translation in seconds",
        example=0.234,
        ge=0,
        title="Inference Time (seconds)"
    )
    character_count: int = Field(
        ...,
        description="Number of characters in the input text",
        example=17,
        ge=1,
        title="Character Count"
    )
    timestamp: str = Field(
        ...,
        description="Timestamp of the translation in Nairobi timezone",
        example="Monday | 2024-06-21 | 14:30:25",
        title="Timestamp"
    )
    request_id: str = Field(
        ...,
        description="Unique request identifier for debugging and tracking",
        example="550e8400-e29b-41d4-a716-446655440000",
        title="Request ID"
    )
    total_time: float = Field(
        ...,
        description="Total request processing time in seconds",
        example=1.234,
        ge=0,
        title="Total Processing Time (seconds)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "translated_text": "Good morning",
                "source_language": "swh_Latn",
                "target_language": "eng_Latn",
                "inference_time": 0.234,
                "character_count": 17,
                "timestamp": "Monday | 2024-06-21 | 14:30:25",
                "request_id": "550e8400-e29b-41d4-a716-446655440000",
                "total_time": 1.234
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check endpoints"""

    status: str = Field(..., description="API health status")
    version: str = Field(..., description="API version")
    models_loaded: bool = Field(..., description="Whether models are loaded")
    uptime: float = Field(..., description="API uptime in seconds")
    timestamp: str = Field(..., description="Current timestamp")


class LanguageDetectionRequest(BaseModel):
    """
    Language detection request model

    For detecting the language of input text.
    """

    text: str = Field(
        ...,
        example="Habari ya asubuhi",
        description="Text to detect language for (1-1000 characters)",
        min_length=1,
        max_length=1000,
        title="Input Text"
    )

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "summary": "Swahili text detection",
                    "description": "Detect language for Swahili greeting",
                    "value": {
                        "text": "Habari ya asubuhi"
                    }
                },
                {
                    "summary": "English text detection",
                    "description": "Detect language for English text",
                    "value": {
                        "text": "Good morning, how are you?"
                    }
                },
                {
                    "summary": "French text detection",
                    "description": "Detect language for French text",
                    "value": {
                        "text": "Bonjour, comment allez-vous?"
                    }
                }
            ]
        }


class LanguageDetectionResponse(BaseModel):
    """
    Language detection response model

    Contains detected language information and confidence.
    """

    detected_language: str = Field(
        ...,
        description="Detected language code in FLORES-200 format",
        example="swh_Latn",
        title="Detected Language Code"
    )
    language_name: str = Field(
        ...,
        description="Human-readable name of detected language",
        example="Swahili",
        title="Language Name"
    )
    native_name: str = Field(
        ...,
        description="Native name of detected language",
        example="Kiswahili",
        title="Native Language Name"
    )
    confidence: float = Field(
        ...,
        description="Detection confidence score (0.0 to 1.0)",
        example=0.9876,
        ge=0.0,
        le=1.1,  # Allow slightly above 1.0 for FastText edge cases
        title="Confidence Score"
    )
    is_english: bool = Field(
        ...,
        description="Whether the detected language is English",
        example=False,
        title="Is English"
    )
    character_count: int = Field(
        ...,
        description="Number of characters in input text",
        example=17,
        ge=1,
        title="Character Count"
    )
    timestamp: str = Field(
        ...,
        description="Detection timestamp in Nairobi timezone",
        example="Monday | 2024-06-21 | 14:30:25",
        title="Timestamp"
    )
    request_id: str = Field(
        ...,
        description="Unique request identifier for debugging",
        example="550e8400-e29b-41d4-a716-446655440000",
        title="Request ID"
    )
    total_time: float = Field(
        ...,
        description="Total request processing time in seconds",
        example=0.045,
        ge=0,
        title="Total Processing Time (seconds)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "detected_language": "swh_Latn",
                "language_name": "Swahili",
                "native_name": "Kiswahili",
                "confidence": 0.9876,
                "is_english": False,
                "character_count": 17,
                "timestamp": "Monday | 2024-06-21 | 14:30:25",
                "request_id": "550e8400-e29b-41d4-a716-446655440000",
                "total_time": 0.045
            }
        }


class ErrorResponse(BaseModel):
    """Response model for error responses"""

    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    request_id: str = Field(..., description="Request identifier")
    timestamp: str = Field(..., description="Error timestamp")


class LanguageInfo(BaseModel):
    """
    Language information model

    Contains metadata about a supported language.
    """

    name: str = Field(..., description="English name of the language", example="Swahili")
    native_name: str = Field(..., description="Native name of the language", example="Kiswahili")
    region: str = Field(..., description="Geographic region", example="Africa")
    script: str = Field(..., description="Writing script", example="Latin")


class LanguagesResponse(BaseModel):
    """
    Languages list response model

    Contains a dictionary of supported languages with their metadata.
    """

    languages: Dict[str, LanguageInfo] = Field(..., description="Dictionary of language codes to language info")
    total_count: int = Field(..., description="Total number of languages")

    class Config:
        json_schema_extra = {
            "example": {
                "languages": {
                    "swh_Latn": {
                        "name": "Swahili",
                        "native_name": "Kiswahili",
                        "region": "Africa",
                        "script": "Latin"
                    },
                    "eng_Latn": {
                        "name": "English",
                        "native_name": "English",
                        "region": "Europe",
                        "script": "Latin"
                    }
                },
                "total_count": 2
            }
        }


class LanguageStatsResponse(BaseModel):
    """
    Language statistics response model

    Contains statistics about supported languages.
    """

    total_languages: int = Field(..., description="Total number of supported languages")
    regions: int = Field(..., description="Number of geographic regions covered")
    scripts: int = Field(..., description="Number of writing scripts supported")
    by_region: Dict[str, int] = Field(..., description="Language count by region")

    class Config:
        json_schema_extra = {
            "example": {
                "total_languages": 200,
                "regions": 6,
                "scripts": 15,
                "by_region": {
                    "Africa": 25,
                    "Europe": 40,
                    "Asia": 80,
                    "Middle East": 15,
                    "Americas": 30,
                    "Oceania": 10
                }
            }
        }
