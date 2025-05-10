# Sema Translator & Multilingual API

**Version:** 1.0.0 (Hypothetical)
**Author:** Lewis Kamau Kimaru
**Project Status:** In Development / Planned

## 1. Overview

Sema Translator is a powerful and versatile multilingual translation and communication platform. It offers:

*   A user-friendly web application for seamless text translation and multilingual chat.
*   A robust set of commercial API endpoints for developers and businesses to integrate advanced translation and language understanding capabilities into their own applications.

The platform leverages state-of-the-art AI models from Hugging Face, including NLLB for translation and various LLMs for chat functionalities, coupled with a fast and efficient FastAPI backend and a Turso database for data persistence.

## 2. Core Features

### 2.1 Web Application Features

*   **User Authentication:** Secure user registration, login, and profile management.
*   **Text Translation:**
    *   Translate text between a wide array of languages.
    *   Option to specify source and target languages.
    *   Automatic source language detection.
*   **Multilingual Chat:**
    *   Engage in real-time chat conversations where user input and bot responses are automatically translated to ensure understanding across different languages.
    *   Conversation history is maintained.
*   **Language Discovery:** Browse supported languages, conveniently grouped by countries and regions.
*   **User Dashboard:**
    *   View translation history.
    *   Manage chat sessions.
    *   Manage API keys for commercial API access (if subscribed).
*   **Responsive Design:** Accessible on various devices.

### 2.2 Commercial API Features (`/api/v1/`)

*   **API Key Authentication:** Secure access using unique API keys managed through the web application.
*   **High-Performance Translation Endpoint:**
    *   Translate single or batch text inputs.
    *   Specify source (optional) and target languages.
    *   Clear usage information returned with each request.
*   **Language Detection Endpoint:**
    *   Detect the language of single or batch text inputs.
    *   Returns detected language (NLLB code and human-readable name) and confidence score (if available).
*   **Chat Completions Endpoint:**
    *   Access powerful LLMs for conversational AI.
    *   Supports streaming and non-streaming responses.
    *   Automatic handling of multilingual inputs/outputs (translation to/from LLM's primary processing language).
    *   Contextual conversation history management.
*   **Account & Usage Endpoint:** Programmatically retrieve API usage statistics and quota information.
*   **Supported Languages Endpoint:** Get a list of supported languages, including regional groupings.
*   **Rate Limiting & Quota Management:** Ensures fair usage and platform stability, tied to user subscription plans.
*   **Developer-Friendly:** Clear error messages, structured JSON responses, and comprehensive API documentation (Swagger UI).

## 3. Technology Stack

*   **Backend Framework:** FastAPI (Python)
*   **AI/ML Models:**
    *   Hugging Face Transformers (for NLLB, language detection models, LLMs)
    *   NLLB Models (e.g., `facebook/nllb-200-distilled-600M`) for translation.
    *   FastText (or Hugging Face model) for language detection.
    *   LLMs (e.g., `deepseek-ai/DeepSeek-R1`) via Hugging Face InferenceClient for chat.
*   **Database:** Turso (SQLite-compatible, accessed via HTTP API)
*   **Authentication:** JWT for web app sessions, API Keys for commercial API.
*   **Deployment (Conceptual):** Docker, ASGI Server (Uvicorn/Hypercorn)
*   **Caching (Recommended):** Redis or in-memory caching for performance.

## 4. Database Schema

The application utilizes a relational database (Turso) with the following key tables:

### 4.1 `users`
Stores user profile information.
| Column           | Type    | Constraints                 | Description                                  |
|------------------|---------|-----------------------------|----------------------------------------------|
| `id`             | INTEGER | PRIMARY KEY AUTOINCREMENT   | User ID                                      |
| `user_uid`       | TEXT    | UNIQUE NOT NULL             | Universal unique ID (e.g., from auth provider) |
| `email`          | TEXT    | UNIQUE                      | User's email                                 |
| `username`       | TEXT    | UNIQUE                      | User's username                              |
| `hashed_password`| TEXT    |                             | For local authentication                     |
| `display_name`   | TEXT    |                             | Display name                                 |
| `preferred_lang` | TEXT    |                             | Preferred language (NLLB code)               |
| `created_at`     | TEXT    | NOT NULL DEFAULT CURR_TIME  | Creation timestamp                           |
| `updated_at`     | TEXT    | NOT NULL DEFAULT CURR_TIME  | Last update timestamp                        |
| `is_active`      | INTEGER | NOT NULL DEFAULT 1          | Account status                               |
| `metadata`       | TEXT    |                             | JSON for additional info                     |

### 4.2 `translation_logs`
Logs individual translation requests.
| Column                 | Type    | Constraints                | Description                                  |
|------------------------|---------|----------------------------|----------------------------------------------|
| `id`                   | INTEGER | PRIMARY KEY AUTOINCREMENT  | Log ID                                       |
| `user_id`              | INTEGER | REFERENCES `users(id)`     | User who made request (nullable)             |
| `original_text`        | TEXT    | NOT NULL                   | Input text                                   |
| `translated_text`      | TEXT    | NOT NULL                   | Output translated text                       |
| `source_lang_detected` | TEXT    |                            | Detected NLLB source language                |
| `source_lang_provided` | TEXT    |                            | User-provided NLLB source language           |
| `target_lang`          | TEXT    | NOT NULL                   | NLLB target language                         |
| `model_used`           | TEXT    |                            | Translation model ID                         |
| `request_timestamp`    | TEXT    | NOT NULL DEFAULT CURR_TIME | Request timestamp                            |
| ... (other relevant fields like `inference_time_seconds`) |         |                            |                                              |

### 4.3 `chat_sessions`
Groups messages into conversations.
| Column             | Type    | Constraints                | Description                                  |
|--------------------|---------|----------------------------|----------------------------------------------|
| `id`               | INTEGER | PRIMARY KEY AUTOINCREMENT  | Session ID                                   |
| `session_uid`      | TEXT    | UNIQUE NOT NULL            | Client-facing unique session ID (UUID)       |
| `user_id`          | INTEGER | REFERENCES `users(id)`     | User who initiated (nullable)                |
| `start_time`       | TEXT    | NOT NULL DEFAULT CURR_TIME | Session start time                           |
| `last_active_time` | TEXT    | NOT NULL DEFAULT CURR_TIME | Last message time in session                 |
| `summary`          | TEXT    |                            | Optional AI-generated summary                |
| `metadata`         | TEXT    |                            | JSON for session-specific settings           |

### 4.4 `chat_messages`
Stores individual chat messages with translation details.
| Column                               | Type    | Constraints                                       | Description                                      |
|--------------------------------------|---------|---------------------------------------------------|--------------------------------------------------|
| `id`                                 | INTEGER | PRIMARY KEY AUTOINCREMENT                         | Message ID                                       |
| `chat_session_id`                    | INTEGER | NOT NULL REFERENCES `chat_sessions(id) ON DELETE CASCADE` | Links to chat session                            |
| `message_order`                      | INTEGER | NOT NULL                                          | Order within session                             |
| `role`                               | TEXT    | NOT NULL (`user`, `assistant`)                    | Sender's role                                    |
| `timestamp`                          | TEXT    | NOT NULL DEFAULT CURR_TIME                        | Message timestamp                                |
| `user_original_text`                 | TEXT    |                                                   | User's raw input                                 |
| `user_original_lang_nllb`            | TEXT    |                                                   | Detected language of user's raw input            |
| `user_text_for_llm`                  | TEXT    |                                                   | User input translated to LLM language            |
| `assistant_response_from_llm`        | TEXT    |                                                   | LLM's raw response (in LLM language)             |
| `assistant_final_text_for_user`      | TEXT    |                                                   | LLM response translated to user's language       |
| `llm_model_used`                     | TEXT    |                                                   | LLM model ID                                     |
| `translation_model_used`             | TEXT    |                                                   | Translation model ID used for this turn          |
| ... (other fields like `feedback_score`, NLLB codes for each text segment) |         |                                                   |                                                  |
| `UNIQUE(chat_session_id, message_order)` |         |                                                   | Ensures order                                    |

### 4.5 `api_keys`
Manages API keys for commercial API access.
| Column         | Type    | Constraints                                  | Description                                      |
|----------------|---------|----------------------------------------------|--------------------------------------------------|
| `id`           | INTEGER | PRIMARY KEY AUTOINCREMENT                    | API Key record ID                                |
| `user_id`      | INTEGER | NOT NULL REFERENCES `users(id) ON DELETE CASCADE` | Owning user                                      |
| `key_prefix`   | TEXT    | NOT NULL                                     | Short, non-sensitive prefix for display          |
| `hashed_key`   | TEXT    | NOT NULL UNIQUE                              | Securely hashed API key                          |
| `name`         | TEXT    |                                              | User-defined name for the key                    |
| `scopes`       | TEXT    |                                              | JSON array of permissions (e.g., `["translate"]`)|
| `created_at`   | TEXT    | NOT NULL DEFAULT CURR_TIME                   | Creation timestamp                               |
| `last_used_at` | TEXT    |                                              | Last successful use                              |
| `is_active`    | INTEGER | NOT NULL DEFAULT 1                           | Key status (active/revoked)                      |

### 4.6 `api_usage_logs`
Tracks usage of commercial API endpoints.
| Column            | Type    | Constraints                                  | Description                                      |
|-------------------|---------|----------------------------------------------|--------------------------------------------------|
| `id`              | INTEGER | PRIMARY KEY AUTOINCREMENT                    | Log ID                                           |
| `api_key_id`      | INTEGER | NOT NULL REFERENCES `api_keys(id)`           | API key used                                     |
| `user_id`         | INTEGER | NOT NULL REFERENCES `users(id)`              | Owning user                                      |
| `endpoint`        | TEXT    | NOT NULL                                     | API endpoint path                                |
| `request_details` | TEXT    |                                              | JSON of key request parameters                   |
| `timestamp`       | TEXT    | NOT NULL DEFAULT CURR_TIME                   | Request timestamp                                |
| `cost_units`      | INTEGER |                                              | Units consumed for billing                       |

*(Note: `CURR_TIME` is conceptual for `DEFAULT CURRENT_TIMESTAMP` in SQLite.)*

## 5. API Endpoints

The application exposes two main sets of API endpoints: those for the web application's internal use and the commercial API.

### 5.1 Web Application Endpoints (Illustrative)

*   `/auth/register` (POST): User registration.
*   `/auth/login` (POST): User login (returns JWT).
*   `/auth/logout` (POST): User logout.
*   `/auth/me` (GET): Get current authenticated user's profile.
*   `/translate/text` (POST): Translate text (used by web UI).
    *   Request: `{ "text": "...", "source_lang": "...", "target_lang": "..." }` or `{ "text": "...", "target_lang": "..." }` (for auto-detect).
    *   Response: `{ "translated_text": "...", "detected_source_lang": "..." }`
*   `/chat/stream` (POST): Handle streaming chat interactions for the web UI.
    *   Request: `{ "user_input": "...", "conversation_history": [...] }`
    *   Response: Server-Sent Events (SSE) stream of chat chunks.
*   `/languages` (GET): Get list of supported languages, grouped by region/country.
*   `/history/translations` (GET): Get user's translation history (paginated).
*   `/history/chat-sessions` (GET): Get user's chat sessions (paginated).
*   `/history/chat-sessions/{session_uid}/messages` (GET): Get messages for a specific chat session.
*   `/account/api-keys` (GET, POST): Manage user's API keys.
*   `/account/api-keys/{key_id}` (DELETE): Revoke an API key.

### 5.2 Commercial API Endpoints (`/api/v1/`)

All endpoints under `/api/v1/` require API Key authentication via an `Authorization: Bearer <YOUR_API_KEY>` or `X-API-Key: <YOUR_API_KEY>` header.

*   **`POST /api/v1/translate`**
    *   Translates single or batch text.
    *   Request Body: `{ "text": "string" | ["string"], "source_lang"?: "nllb_code", "target_lang": "nllb_code" }`
    *   Response: Details translations and usage.
*   **`POST /api/v1/detect-language`**
    *   Detects language for single or batch text.
    *   Request Body: `{ "text": "string" | ["string"] }`
    *   Response: Details detected languages and confidence.
*   **`POST /api/v1/chat/completions`**
    *   Provides access to the chat LLM.
    *   Request Body: `{ "model"?: "model_id", "messages": [{"role": "...", "content": "..."}], "stream"?: false, ... }` (OpenAI-like structure).
    *   Response: Chat completion object or SSE stream if `stream: true`.
*   **`GET /api/v1/account/usage`**
    *   Retrieves API usage and quota information for the authenticated API key.
*   **`GET /api/v1/languages`**
    *   Lists supported languages, potentially with regional grouping, suitable for programmatic use.

*(Detailed request/response schemas for commercial APIs will be available in the dedicated Swagger/OpenAPI documentation for `/api/v1/`.)*

## 6. Project Structure (Conceptual)

```
translator/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Main FastAPI app instance, routers
│   ├── core/                   # Core settings, configurations (DB, models, etc.)
│   │   ├── config.py
│   │   └── db.py               # Turso client setup
│   ├── models/                 # Pydantic models for requests/responses
│   │   ├── user_models.py
│   │   ├── translation_models.py
│   │   └── chat_models.py
│   ├── services/               # Business logic
│   │   ├── auth_service.py
│   │   ├── translation_service.py
│   │   ├── chat_service.py
│   │   └── user_service.py
│   ├── routers/                # API endpoint definitions (FastAPI routers)
│   │   ├── web_auth.py
│   │   ├── web_translate.py
│   │   ├── web_chat.py
│   │   └── web_account.py
│   ├── api/                    # Commercial API specific modules
│   │   ├── v1/
│   │   │   ├── dependencies.py # API key auth
│   │   │   └── endpoints/      # Commercial API endpoint routers
│   │   │       ├── translate.py
│   │   │       ├── chat.py
│   │   │       └── account.py
│   │   └── __init__.py
│   ├── db_models/              # SQLAlchemy models (if using an ORM with Turso, otherwise SQL strings)
│   │   └── schema.py
│   └── utils/                  # Helper utilities (e.g., language code mapping)
├── models/                     # Local ML models (e.g., FastText lang ID model)
│   ├── spm.model
│   └── lid218e.bin
├── templates/                  # HTML templates for the basic web UI (if any served by backend)
├── .env                        # Environment variables
├── requirements.txt            # Python dependencies
├── Dockerfile                  # For containerization
└── README.md                   # This file
```

## 7. Setup and Installation

1.  **Prerequisites:**
    *   Python 3.8+
    *   Access to a Turso database instance (get URL and auth token).
    *   Hugging Face Hub account and `HUGGINGFACE_TOKEN` (for downloading models and potentially for InferenceClient).
2.  **Clone the Repository:**
    ```bash
    git clone https://github.com/lewiskimaru/sema
    cd translator
    ```
3.  **Create a Virtual Environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
4.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **Configure Environment Variables:**
    Create a `.env` file in the project root and populate it with necessary values:
    ```env
    HUGGINGFACE_TOKEN="your_hf_read_token"
    TURSO_DATABASE_URL="your_turso_db_url_with_ libsql_ws_prefix" # e.g., libsql+ws://your-db-org.turso.io
    TURSO_AUTH_TOKEN="your_turso_db_auth_token"

    # For chat LLM (e.g., DeepSeek via HF InferenceClient)
    CHAT_LLM_PROVIDER="huggingface" # or "sambanova" or other
    CHAT_LLM_MODEL_ID="deepseek-ai/DeepSeek-R1" # or your specific model

    # Secret key for JWT tokens (generate a strong random string)
    SECRET_KEY="your_strong_random_secret_key"
    ALGORITHM="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES=30

    # Other configurations...
    ```
6.  **Database Setup:**
    *   The first time the application runs, or via a separate script, execute the SQL `CREATE TABLE` statements (from section 4) against your Turso database to set up the schema. (Your `app/core/db.py` might handle this or you'll need a migration tool/script).
7.  **Run the Application:**
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 7860
    ```
    *   `--reload` is for development. Remove for production.

## 8. API Documentation (Swagger UI)

Once the application is running, interactive API documentation will be available at:

*   **Main Web Application APIs:** `http://localhost:7860/docs`
*   **Commercial API (v1):** `http://localhost:7860/api/v1/docs` (or a similar distinct path if configured)

## 9. Future Considerations & Enhancements

*   **Advanced Caching Strategies:** Implement Redis for distributed caching.
*   **Real-time Monitoring & Logging:** Integrate with Prometheus/Grafana or Sentry.
*   **Subscription & Billing System:** Connect with Stripe/Paddle for commercial API monetization.
*   **Admin Panel:** For managing users, monitoring usage, and application settings.
*   **Scalability Improvements:** Further optimize model serving, potentially with dedicated inference servers for very high loads.
*   **CI/CD Pipeline:** Automate testing and deployment.

## 10. Contributing

(Details on how to contribute to the project, if applicable: coding standards, pull request process, etc.)

## 11. License

(Specify the project's license, e.g., MIT, Apache 2.0.)

## Project Structure

```
sema/
├── netlify.toml       # Netlify configuration
└── sema-frontend/     # React frontend application
    ├── public/        # Static assets
    │   ├── logo.png   # Sema logo
    │   └── _redirects # Netlify redirects file
    ├── src/           # Source code
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── stores/
    └── package.json   # Dependencies and scripts
```

## Features

- **Text Translation**: Translate text between 200+ languages
- **Language Detection**: Automatically detect the source language
- **Multilingual Chat**: Chat with AI in your preferred language
- **Language Explorer**: Browse and discover supported languages by region
- **User Accounts**: Save translation history and preferences
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Development

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/lewiskimaru/sema.git
   cd sema
   ```

2. Install dependencies:
   ```
   cd sema-frontend
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Deployment to Netlify

The project is configured to deploy the nested frontend directory structure to Netlify.

### Automatic Deployments

1. Connect your GitHub repository to Netlify
2. Netlify will automatically detect the `netlify.toml` file and use the configuration

### Manual Deployments

1. Build the project:
   ```
   cd sema-frontend
   npm run build
   ```

2. Deploy the `dist` directory to Netlify:
   ```
   npx netlify deploy --dir=dist --prod
   ```

### Key Configuration Files

- **netlify.toml**: Specifies build settings and redirect rules
  ```toml
  [build]
    base = "sema-frontend"
    publish = "dist"
    command = "npm run build"
  ```

- **public/_redirects**: Handles SPA routing
  ```
  /* /index.html 200
  ```

## License

MIT
