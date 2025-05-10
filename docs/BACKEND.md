# Sema Translator - Backend Development Guide

**Framework:** FastAPI (Python)
**Database:** Turso (via HTTP API)
**Primary Deployment Target:** Hugging Face Spaces (e.g., `https://sematranslate-translator.hf.space`)

## 1. Overview

This document outlines the backend architecture, API endpoints, services, and data models for the Sema Translator platform. The backend is responsible for:

*   Powering the Sema Translator web application.
*   Providing a set of commercial API endpoints for third-party integrations.
*   Handling user authentication and authorization.
*   Performing translations using NLLB models.
*   Orchestrating multilingual chat with external LLMs.
*   Managing user data, translation history, chat history, and API keys via a Turso database.
*   Serving information about supported languages, grouped by regions.

## 2. Core Architecture

*   **FastAPI Application:** A single FastAPI application serving both web application support endpoints and commercial API endpoints.
    *   **Routers:** Organized using `APIRouter` for modularity:
        *   Web App Auth (`/auth/`)
        *   Web App Translation (`/translate/`)
        *   Web App Chat (`/chat/`)
        *   Web App User Account (`/account/`)
        *   Web App History (`/history/`)
        *   Web App Languages (`/languages/`)
        *   Commercial API v1 (`/api/v1/`) - with its own sub-routers for translate, chat, account, etc.
    *   **Middleware:**
        *   `CORSMiddleware`: To handle cross-origin requests from the frontend.
        *   Authentication Middleware: Custom dependencies for JWT (web app) and API Key (commercial API) validation.
        *   Rate Limiting Middleware (e.g., `slowapi`): Applied especially to commercial API endpoints and sensitive web app endpoints.
        *   Error Handling Middleware: To provide consistent JSON error responses.
*   **Services Layer (`app/services/`):** Encapsulates business logic, separating it from the routing layer.
*   **Model Management:** Hugging Face models (NLLB, Language ID, LLM via InferenceClient) loaded on application startup and managed globally.
*   **Database Interaction:** All database operations (CRUD for users, logs, sessions, keys) performed via HTTP requests to the Turso API. A dedicated module (`app/core/db.py` or similar) will manage the Turso client and execute SQL statements.
*   **Configuration:** Managed via environment variables (`.env` file) and Pydantic settings models.

## 3. Database Schema

Refer to `README.md` Section 4 for the detailed database schema for tables:
*   `users`
*   `translation_logs`
*   `chat_sessions`
*   `chat_messages`
*   `api_keys`
*   `api_usage_logs`

## 4. API Endpoints

### 4.1 Web Application Support Endpoints

These endpoints are primarily consumed by the React frontend. Authentication is typically via JWT in an `HttpOnly` cookie.

#### 4.1.1 Authentication (`/auth/`)

*   **`POST /auth/register`**
    *   **Request:** `{ "email": "...", "password": "...", "displayName": "..." }`
    *   **Response:** `{ "message": "User registered successfully" }` or error.
*   **`POST /auth/login`**
    *   **Request:** `{ "email": "...", "password": "..." }`
    *   **Response:** `{ "user": { ...user_details... } }`. Sets `HttpOnly` cookies for access and refresh tokens.
*   **`POST /auth/logout`**
    *   **Request:** (No body)
    *   **Response:** `{ "message": "Logged out successfully" }`. Clears auth cookies.
*   **`POST /auth/refresh-token`**
    *   **Request:** (No body, uses refresh token from cookie)
    *   **Response:** Issues a new access token (in body or sets cookie).
*   **`GET /auth/me`** (Protected)
    *   **Request:** (No body, uses access token from cookie)
    *   **Response:** `{ "user": { ...current_user_details... } }`

#### 4.1.2 Translation (`/translate/`)

*   **`POST /translate/text`** (Can be used unauthenticated for basic translation)
    *   **Request:** `{ "text": "string", "target_lang": "nllb_code", "source_lang"?: "nllb_code" }`
    *   If `source_lang` is omitted, auto-detection is performed.
    *   **Response:** `{ "original_text": "...", "translated_text": "...", "detected_source_lang_nllb"?: "...", "target_lang_nllb": "..." }`
    *   **Authenticated Behavior:** If authenticated, logs the translation to `translation_logs` linked to the `user_id`.

#### 4.1.3 Chat (`/chat/`) (Protected)

*   **`POST /chat/stream`**
    *   **Request:** `{ "user_input": "string", "conversation_history": [{ "role": "user" | "assistant", "content": "string" }, ...] }`
    *   **Response:** `StreamingResponse` (media_type `application/x-ndjson`). Each chunk is a JSON object:
        ```json
        // First chunk often contains metadata
        { "detected_user_language_nllb": "spa_Latn", "llm_processing_language_nllb": "eng_Latn" }
        // Subsequent chunks with content
        { "content": "partial bot response..." }
        // Error chunk
        { "error": "An error occurred...", "is_final_chunk": true }
        // Final chunk marker
        { "is_final_chunk": true }
        ```
    *   **Logic:**
        1.  Detect user input language.
        2.  Translate user input to LLM processing language (e.g., English) if needed.
        3.  Call external LLM via `InferenceClient`, streaming its response.
        4.  If original user language was not LLM processing language:
            *   Collect full LLM response (in English).
            *   Translate it back to the user's original language.
            *   Stream the *fully translated* response as a single content chunk (or break it down if feasible, though hard for translation).
        5.  If no translation back was needed, stream LLM response chunks directly.
        6.  Save original and translated messages to `chat_messages` and update `chat_sessions`.

#### 4.1.4 User Account & Profile (`/account/`) (Protected)

*   **`GET /account/profile`**
    *   **Response:** User profile details.
*   **`PUT /account/profile`**
    *   **Request:** `{ "displayName"?: "...", "preferred_lang"?: "nllb_code" }`
    *   **Response:** Updated user profile.
*   **`POST /account/change-password`**
    *   **Request:** `{ "current_password": "...", "new_password": "..." }`
*   **`GET /account/api-keys`**
    *   **Response:** `[{ "key_id": "...", "name": "...", "key_prefix": "...", "created_at": "...", "last_used_at": "...", "is_active": true, "scopes": [...] }, ...]`
*   **`POST /account/api-keys`**
    *   **Request:** `{ "name": "My Key", "scopes": ["translate", "chat"] }`
    *   **Response:** `{ "key_id": "...", "name": "...", "api_key": "FULL_API_KEY_SHOWN_ONCE", "key_prefix": "...", ... }`
*   **`DELETE /account/api-keys/{key_id}`**
    *   **Response:** `204 No Content` or success message.

#### 4.1.5 History (`/history/`) (Protected)

*   **`GET /history/translations`**
    *   **Query Params:** `?limit=20&offset=0&sort_by=request_timestamp&order=desc`
    *   **Response:** `{ "items": [{...translation_log_entry...}], "total": 100, "limit": 20, "offset": 0 }`
*   **`GET /history/chat-sessions`**
    *   **Query Params:** Similar to translations history.
    *   **Response:** `{ "items": [{...chat_session_summary...}], "total": ..., ... }`
*   **`GET /history/chat-sessions/{session_uid}/messages`**
    *   **Query Params:** `?limit=50&offset=0` (usually chronological order)
    *   **Response:** `{ "items": [{...chat_message_details... (including original & translated texts)}], "total": ..., ... }`

#### 4.1.6 Languages (`/languages/`)

*   **`GET /languages`** (Unauthenticated)
    *   **Response:** A structured list of supported languages, grouped by country/region.
        ```json
        [
          {
            "language_code_nllb": "eng_Latn",
            "language_name": "English",
            "regions": [
              {"region_name": "North America", "countries": ["United States", "Canada"]},
              // ... other regions
            ]
          },
          // ... other languages
        ]
        ```

### 4.2 Commercial API Endpoints (`/api/v1/`)

Authentication via API Key (`Authorization: Bearer <KEY>` or `X-API-Key: <KEY>`). All endpoints log usage to `api_usage_logs` and respect quotas.

*   **`POST /api/v1/translate`**
    *   **Request:** `{ "text": "string" | ["string"], "target_lang": "nllb_code", "source_lang"?: "nllb_code", "format"?: "text" }`
    *   **Response:** `{ "translations": [{ "original_text": "...", "translated_text": "...", "detected_source_lang_nllb"?: "..." }], "usage": { "characters_processed": ..., "model_used": "..." } }`
*   **`POST /api/v1/detect-language`**
    *   **Request:** `{ "text": "string" | ["string"] }`
    *   **Response:** `{ "detections": [{ "text": "...", "language_code_nllb": "...", "language_name": "...", "confidence"?: ... }], "usage": { "characters_processed": ... } }`
*   **`POST /api/v1/chat/completions`**
    *   **Request:** `{ "model"?: "model_id", "messages": [...], "stream"?: boolean, "temperature"?: float, "max_tokens"?: int, "user_original_language"?: "nllb_code" }`
    *   **Response (non-stream):** OpenAI-like completion object with usage details, including translation usage if applicable.
    *   **Response (stream=true):** Server-Sent Events stream of JSON deltas.
*   **`GET /api/v1/account/usage`**
    *   **Response:** `{ "user_id": "...", "plan": "...", "billing_cycle_start": "...", "billing_cycle_end": "...", "usage": { "translation_characters": {"used": ..., "limit": ...}, ... } }`
*   **`GET /api/v1/languages`**
    *   **Response:** Similar to web app's `/languages` but perhaps with more machine-readable focus if needed.

## 5. Services Layer (`app/services/`)

*   **`auth_service.py`:**
    *   User registration, password hashing & verification.
    *   JWT generation (access & refresh tokens) and validation.
    *   Manages `HttpOnly` cookie setting/clearing.
*   **`translation_service.py`:**
    *   `translate(text, target_lang, source_lang=None)`: Core translation logic using NLLB pipeline.
    *   `detect_language(text)`: Uses FastText or HF model.
    *   Manages interaction with `translation_logs` table.
*   **`chat_service.py`:**
    *   `process_chat_stream(user_input, history)`: Orchestrates the multilingual chat flow (detection, pre-translation, LLM call, post-translation, streaming).
    *   Manages interaction with `chat_sessions` and `chat_messages` tables.
    *   Handles `InferenceClient` for LLM.
*   **`user_service.py`:**
    *   CRUD operations for user profiles.
    *   Password change logic.
*   **`api_key_service.py`:**
    *   Generation of secure API keys (value shown once, prefix & hash stored).
    *   Verification of API keys from headers.
    *   CRUD for `api_keys` table.
    *   Scope management.
*   **`usage_tracking_service.py`:**
    *   `log_api_call(...)`: Records calls to `api_usage_logs`.
    *   `check_quota(...)`: Verifies if user/API key is within usage limits.
*   **`language_info_service.py`:**
    *   Provides the structured list of languages grouped by regions. (Data might be hardcoded, from a JSON file, or a utility DB table).

## 6. Authentication & Authorization

*   **Web App:**
    *   JWT stored in `HttpOnly`, `Secure`, `SameSite` cookies.
    *   Access token for API requests, refresh token for renewing access token.
    *   FastAPI `Depends` for protecting routes.
*   **Commercial API:**
    *   API Keys passed in `Authorization` or `X-API-Key` header.
    *   Custom FastAPI `Security` dependency to validate keys against `api_keys` table (hashed keys).
    *   Scope-based authorization for fine-grained access to API features.

## 7. Model Management

*   **Loading:** All ML models (NLLB, FastText/LanguageID, LLM client) are initialized once at application startup (`@app.on_event("startup")`).
*   **Configuration:** Model names/paths, Hugging Face tokens are configurable via environment variables and `app/core/config.py`.
*   **Device:** Dynamically selects CPU/GPU based on availability (`torch.cuda.is_available()`).

## 8. Error Handling

*   Custom exception handlers in FastAPI to catch specific application errors and uncaught exceptions.
*   Responses will conform to a standard JSON error structure:
    ```json
    { "error": { "type": "...", "code": "...", "message": "...", "detail": "..." } }
    ```
*   Appropriate HTTP status codes are used.

## 9. Performance & Scalability

*   **Asynchronous Operations:** FastAPI's `async/await` used extensively for I/O-bound tasks (Turso HTTP calls, external API calls).
*   **Caching (Planned):**
    *   Frequently translated texts.
    *   Language list.
    *   User quota status.
*   **Efficient Database Queries:** Batching statements for Turso where appropriate. Proper indexing on database tables.
*   **Rate Limiting:** To prevent abuse and ensure fair usage.

## 10. Setup & Deployment

*   Refer to `README.md` for environment setup.
*   Dockerization for consistent deployment.
*   Uvicorn/Hypercorn as the ASGI server.
*   Configuration for Hugging Face Spaces deployment (secrets management, resource allocation).
