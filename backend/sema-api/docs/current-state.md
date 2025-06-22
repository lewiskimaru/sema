# Current State of the Sema API
### Analysis of the Current `app.py`

You're right to want to refactor this. While it works, it has several issues that make it difficult to maintain and scale:

1.  **Global Scope:** All the models (`lang_model`, `sp`, `translator`) are loaded in the global scope of the script. This works for simple scripts but is bad practice in applications. It makes the code hard to test and can lead to unexpected side effects.
2.  **Redundant Code:** The functions `translate_detect` and `translate_enter` are almost identical. The only difference is that one detects the source language and the other takes it as an argument. This can be combined into a single, more flexible function.
3.  **Unused/Confusing Code:** The `load_models` function, `model_name_dict`, and the entire `translate_faster` endpoint seem to be remnants of a different implementation (likely using standard `transformers` pipelines). This code is not being used by the main translation endpoints and adds confusion.
4.  **Hardcoded Paths:** Model file paths are constructed using `os.path.join` relative to the script's location (`__file__`). This is not ideal for deployment, especially with Docker, where file paths need to be explicit and predictable.
5.  **Direct Request Handling:** The endpoints use `await request.json()` to parse the request body. This works, but using Pydantic models (as shown in the previous example) is the standard FastAPI way, providing automatic validation, type hints, and documentation.
6.  **Mixing Concerns:** The script mixes model loading, business logic (translation), utility functions (`get_time`), and API endpoint definitions all in one file. The previous folder structure we discussed solves this by separating these concerns.

### A Simple, Straightforward Dockerized Script for HF Spaces

Given your goal—a simple, straightforward script that runs in Docker on HF Spaces and uses your centralized models—we can create a much cleaner version.

This setup will:
1.  Define the necessary files for a Hugging Face Space.
2.  Automatically download your models from `sematech/sema-utils` when the Space builds.
3.  Provide a single, clear translation endpoint.
4.  Be easy to understand and maintain.

---

#### Step 1: Create the Project Folder and Files

Create a new folder for your Hugging Face Space. Let's call it `sema_api_space`. Inside, create the following files:

```
sema_api_space/
├── app.py           <-- The simplified FastAPI app
├── requirements.txt <-- Python dependencies
└── Dockerfile       <-- Instructions to build the Docker image
```

---

#### Step 2: Write the Code for Each File

##### **`requirements.txt`**

This file lists the libraries that `pip` will install.

```text
# requirements.txt
fastapi
uvicorn[standard]
ctranslate2
sentencepiece
fasttext-wheel
huggingface_hub
pydantic
```

##### **`Dockerfile`**

This file tells Hugging Face Spaces how to build your application environment. It will copy your code, install dependencies, and define the command to run the server.

```dockerfile
# Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /code

# Copy the requirements file into the container at /code
COPY ./requirements.txt /code/requirements.txt

# Install any needed packages specified in requirements.txt
# --no-cache-dir reduces image size
# --upgrade pip ensures we have the latest version
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r /code/requirements.txt

# Copy the rest of your application code to the working directory
COPY ./app.py /code/app.py

# Tell uvicorn to run on port 7860, which is the standard for HF Spaces
# Use 0.0.0.0 to make it accessible from outside the container
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
```

##### **`app.py`**

This is the heart of your application. It's a heavily simplified and cleaned-up version of your original script. It uses the best practices we discussed.

```python
# app.py

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from huggingface_hub import hf_hub_download
import ctranslate2
import sentencepiece as spm
import fasttext

# --- 1. Define Data Schemas (for validation and documentation) ---
class TranslationRequest(BaseModel):
    text: str = Field(..., example="Wĩ mwega?")
    target_language: str = Field(..., example="eng_Latn", description="FLORES-200 code for the target language.")
    source_language: str | None = Field(None, example="kik_Latn", description="Optional FLORES-200 code for the source language.")

class TranslationResponse(BaseModel):
    translated_text: str
    detected_source_language: str

# --- 2. Model Loading ---
# This section runs only ONCE when the application starts.
print("Downloading and loading models...")

# Define the Hugging Face repo and the files to download
REPO_ID = "sematech/sema-utils"
MODELS_DIR = "hf_models" # A local directory to store the models

# Ensure the local directory exists
os.makedirs(MODELS_DIR, exist_ok=True)

# Download each file and get its local path
try:
    # Note: hf_hub_download automatically handles caching.
    # It won't re-download if the file is already there.
    spm_path = hf_hub_download(repo_id=REPO_ID, filename="spm.model", local_dir=MODELS_DIR)
    ft_path = hf_hub_download(repo_id=REPO_ID, filename="lid218e.bin", local_dir=MODELS_DIR)
    
    # For CTranslate2 models, it's often better to download the whole directory.
    # We specify the subfolder where the model lives in the repo.
    # The actual model path will be inside the returned directory.
    ct_model_dir = hf_hub_download(
        repo_id=REPO_ID, 
        filename="sematrans-3.3B/model.bin", # A file inside the dir to trigger download
        local_dir=MODELS_DIR
    )
    # The actual path to the CTranslate2 model directory
    ct_path = os.path.dirname(ct_model_dir)

except Exception as e:
    print(f"Error downloading models: {e}")
    # In a real app, you might want to exit or handle this more gracefully.
    exit()

# Suppress the fasttext warning
fasttext.FastText.eprint = lambda x: None

# Load the models into memory
sp_model = spm.SentencePieceProcessor(spm_path)
lang_model = fasttext.load_model(ft_path)
translator = ctranslate2.Translator(ct_path, device="cpu") # Use "cuda" if your Space has a GPU

print("All models loaded successfully!")


# --- 3. FastAPI Application ---
app = FastAPI(
    title="Sema Simple Translation API",
    description="A simple API using models from sematech/sema-utils on Hugging Face Hub.",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"status": "ok", "message": "Sema Translation API is running."}


@app.post("/translate", response_model=TranslationResponse)
async def translate_endpoint(request: TranslationRequest):
    """
    Performs translation. Detects source language if not provided.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")

    # A single function handles both cases (with or without source_language)
    try:
        # Detect language if not provided
        source_lang = request.source_language
        if not source_lang:
            # Replace newlines for better language detection
            predictions = lang_model.predict(request.text.replace('\n', ' '), k=1)
            source_lang = predictions[0][0].replace('__label__', '')

        # Prepare for translation
        source_tokenized = sp_model.encode(request.text, out_type=str)
        source_tokenized = [[source_lang] + sent + ["</s>"] for sent in source_tokenized]
        
        target_prefix = [[request.target_language]]

        # Perform translation
        results = translator.translate_batch(
            source_tokenized,
            batch_type="tokens",
            max_batch_size=2048,
            beam_size=2,
            target_prefix=target_prefix,
        )
        
        translated_tokens = results[0].hypotheses[0][1:] # Exclude target language token
        translated_text = sp_model.decode(translated_tokens)

        return TranslationResponse(
            translated_text=translated_text,
            detected_source_language=source_lang,
        )
    except Exception as e:
        print(f"An error occurred during translation: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred during translation.")

```

---

#### Step 3: Create and Deploy the Hugging Face Space

1.  **Go to Hugging Face** and click on your profile, then "New Space".
2.  **Choose a name** for your Space (e.g., `sema-translation-api`).
3.  **Select "Docker"** as the Space SDK.
4.  **Choose a template** (e.g., "Blank").
5.  Click "Create Space".
6.  **Upload the files:**
    *   Click on the "Files" tab in your new Space.
    *   Click "Add file" -> "Upload files".
    *   Upload the three files you created: `app.py`, `requirements.txt`, and `Dockerfile`.

The Space will automatically start building the Docker image. You can watch the progress in the "Logs" tab. It will download the models from `sematech/sema-utils` during this build process. Once it's running, you'll have a public API endpoint.

---

#### Step 4: Test the Deployed API

Once your Space is running, you can test it with a simple `curl` command or any HTTP client.

1.  **Find your Space URL:** It will be something like `https://your-username-your-space-name.hf.space`.
2.  **Run a `curl` command** from your terminal:

```bash
curl -X POST "https://your-username-your-space-name.hf.space/translate" \
-H "Content-Type: application/json" \
-d '{
    "text": "Habari ya asubuhi, ulimwengu",
    "target_language": "eng_Latn"
}'
```

**Expected Output:**

You should receive a JSON response like this:

```json
{
  "translated_text": "Good morning, world.",
  "detected_source_language": "swh_Latn"
}
```