# Sema Translator - Utility Scripts & Code Snippets Reference

This document consolidates various Python scripts and code snippets discussed during the planning and design phase of the Sema Translator project. It's intended as a quick reference for developers.

## 1. Original FastAPI Translation Script (Baseline)

*   **Description:** This was the initial script provided, forming the baseline for the FastAPI backend. It included local model loading for translation (FastText for language ID, CTranslate2 for translation, SentencePiece for tokenization) and basic FastAPI endpoints.
*   **Purpose:** To demonstrate a functional translation service that needed enhancement into a proper backend with Hugging Face integration, Swagger UI, and more features.
*   **Key Takeaways for Current Project:**
    *   Concept of loading models.
    *   FastAPI endpoint structure.
    *   Timezone-aware timestamping.
    *   CORS middleware.

```python
'''
        Created By Lewis Kamau Kimaru
        Sema translator fastapi implementation
        January 2024
        Docker deployment
'''

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline # Kept for later Hugging Face integration
import ctranslate2
import sentencepiece as spm
import fasttext
import torch

from datetime import datetime
import pytz
import time
import os

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# set this key as an environment variable
hf_read_key = os.environ.get('huggingface_token')
os.environ["HUGGINGFACEHUB_API_TOKEN"] = hf_read_key

fasttext.FastText.eprint = lambda x: None # Suppress FastText warnings

# User interface
templates_folder = os.path.join(os.path.dirname(__file__), "templates")

# Get time of request
def get_time():
    nairobi_timezone = pytz.timezone('Africa/Nairobi')
    current_time_nairobi = datetime.now(nairobi_timezone)

    curr_day = current_time_nairobi.strftime('%A')
    curr_date = current_time_nairobi.strftime('%Y-%m-%d')
    curr_time = current_time_nairobi.strftime('%H:%M:%S')

    full_date = f"{curr_day} | {curr_date} | {curr_time}"
    return full_date, curr_time

# Original model loading (commented out in provided script, adapted later for HF)
# def load_models():
#     # build model and tokenizer
#     model_name_dict = {
#             #'nllb-distilled-600M': 'facebook/nllb-200-distilled-600M',
#             #'nllb-1.3B': 'facebook/nllb-200-1.3B',
#             #'nllb-distilled-1.3B': 'facebook/nllb-200-distilled-1.3B',
#             #'nllb-3.3B': 'facebook/nllb-200-3.3B',
#             #'nllb-moe-54b': 'facebook/nllb-moe-54b',
#             }
#     model_dict = {}
#     for call_name, real_name in model_name_dict.items():
#         print('\tLoading model: %s' % call_name)
#         model = AutoModelForSeq2SeqLM.from_pretrained(real_name)
#         tokenizer = AutoTokenizer.from_pretrained(real_name)
#         model_dict[call_name+'_model'] = model
#         model_dict[call_name+'_tokenizer'] = tokenizer
#     return model_dict

# Load the model and tokenizer ..... only once!
beam_size = 1
device = "cpu" if not torch.cuda.is_available() else "cuda" # Adapted for PyTorch check

print('(note-to-self)..... I play the Orchestra🦋.......')

# Language Prediction model
print("\n1️⃣importing Language Prediction model")
lang_model_file = "lid218e.bin" # Assumed to be in the same directory or models_local/
lang_model_full_path = os.path.join(os.path.dirname(__file__), lang_model_file)
# lang_model_full_path = os.path.join(os.path.dirname(__file__), "models_local", lang_model_file) # More likely path
if os.path.exists(lang_model_full_path):
    lang_model = fasttext.load_model(lang_model_full_path)
else:
    print(f"Warning: Language model {lang_model_full_path} not found.")
    lang_model = None


# Load the source SentencePiece model
print("\n2️⃣importing SentencePiece model")
sp_model_file = "spm.model"
# sp_model_full_path = os.path.join(os.path.dirname(__file__), "models_local", sp_model_file)
sp_model_full_path = os.path.join(os.path.dirname(__file__), sp_model_file)
sp = spm.SentencePieceProcessor()
if os.path.exists(sp_model_full_path):
    sp.load(sp_model_full_path)
else:
    print(f"Warning: SentencePiece model {sp_model_full_path} not found.")
    sp = None # Handle gracefully

# Import The Translator model
print("\n3️⃣importing Translator model (CTranslate2)")
ct_model_file = "sematrans-3.3B" # This is a directory for CTranslate2 models
# ct_model_full_path = os.path.join(os.path.dirname(__file__), "models_local", ct_model_file)
ct_model_full_path = os.path.join(os.path.dirname(__file__), ct_model_file)
if os.path.exists(ct_model_full_path) and os.path.isdir(ct_model_full_path):
    translator = ctranslate2.Translator(ct_model_full_path, device=device)
else:
    print(f"Warning: CTranslate2 model directory {ct_model_full_path} not found or not a directory.")
    translator = None # Handle gracefully

# model_dict = load_models() # This was commented out; HF models loaded differently in final design

print('\nDone importing models 🙈\n')

def translate_detect(userinput: str, target_lang: str):
    if not lang_model or not sp or not translator:
        raise RuntimeError("Required local models (FastText, SentencePiece, CTranslate2) are not loaded.")
    source_sents = [userinput]
    source_sents = [sent.strip() for sent in source_sents]
    target_prefix = [[target_lang]] * len(source_sents)

    predictions = lang_model.predict(source_sents[0], k=1)
    source_lang = predictions[0][0].replace('__label__', '')

    source_sents_subworded = sp.encode(source_sents, out_type=str)
    source_sents_subworded = [[source_lang] + sent + ["</s>"] for sent in source_sents_subworded]

    translations_ct2 = translator.translate_batch(
        source_sents_subworded,
        batch_type="tokens",
        max_batch_size=2024,
        beam_size=beam_size,
        target_prefix=target_prefix,
    )
    translations_ct2 = [translation[0]['tokens'] for translation in translations_ct2]

    translations_desubword = sp.decode(translations_ct2)
    translations_desubword = [sent[len(target_lang):].strip() for sent in translations_desubword] # Added strip

    return source_lang, translations_desubword

def translate_enter(userinput: str, source_lang: str, target_lang: str):
    if not sp or not translator:
        raise RuntimeError("Required local models (SentencePiece, CTranslate2) are not loaded.")
    source_sents = [userinput]
    source_sents = [sent.strip() for sent in source_sents]
    target_prefix = [[target_lang]] * len(source_sents)

    source_sents_subworded = sp.encode(source_sents, out_type=str)
    source_sents_subworded = [[source_lang] + sent + ["</s>"] for sent in source_sents_subworded]

    translations_ct2 = translator.translate_batch(
        source_sents_subworded,
        batch_type="tokens",
        max_batch_size=2024,
        beam_size=beam_size,
        target_prefix=target_prefix
    )
    translations_ct2 = [translation[0]['tokens'] for translation in translations_ct2]

    translations_desubword = sp.decode(translations_ct2)
    translations_desubword = [sent[len(target_lang):].strip() for sent in translations_desubword] # Added strip

    return translations_desubword[0]

# This function was problematic due to model_dict and undefined source/target
# def translate_faster(userinput3: str, source_lang3: str, target_lang3: str):
#     # if len(model_dict) == 2: # model_dict was likely empty or not populated as intended
#     #     model_name = 'nllb-moe-54b' # This model is extremely large
#
#     # This needs to be adapted to use models loaded at startup, e.g., from app.core.ML_MODELS
#     # For example, using the primary NLLB pipeline from the final design:
#     # from app.services import translate_text_with_nllb # Conceptual import
#     # result_obj, _, _ = translate_text_with_nllb(userinput3, target_lang3, source_lang3)
#     # return {"result": result_obj}
#     raise NotImplementedError("translate_faster needs to be properly integrated with Hugging Face NLLB pipeline.")


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    html_file_path = os.path.join(templates_folder, "translator.html")
    if os.path.exists(html_file_path):
        with open(html_file_path, "r") as f:
            content = f.read()
        return HTMLResponse(content=content, status_code=200)
    return HTMLResponse(content="<h1>Sema Translator API (Original)</h1><p>Welcome!</p>", status_code=200)


@app.post("/translate_detect/")
async def translate_detect_endpoint(request: Request):
    datad = await request.json()
    userinputd = datad.get("userinput")
    target_langd = datad.get("target_lang")
    dfull_date, dcurrent_time = get_time() # Unpack both
    print(f"\nrequest: {dfull_date}\nTarget Language: {target_langd}, User Input: {userinputd}\n")

    if not userinputd or not target_langd:
        raise HTTPException(status_code=422, detail="Both 'userinput' and 'target_lang' are required.")

    try:
        source_langd, translated_text_d_list = translate_detect(userinputd, target_langd)
        translated_text_d = translated_text_d_list[0] if translated_text_d_list else ""
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) # Service unavailable if models not loaded
    except Exception as e:
        print(f"Error in translate_detect: {e}")
        raise HTTPException(status_code=500, detail="Translation failed.")

    _, dcurrent_time_resp = get_time() # Get current time again for response log
    print(f"\nresponse: {dcurrent_time_resp}; ... Source_language: {source_langd}, Translated Text: {translated_text_d}\n\n")
    return {
        "source_language": source_langd,
        "translated_text": translated_text_d,
    }


@app.post("/translate_enter/")
async def translate_enter_endpoint(request: Request):
    datae = await request.json()
    userinpute = datae.get("userinput")
    source_lange = datae.get("source_lang")
    target_lange = datae.get("target_lang")
    efull_date, ecurrent_time = get_time() # Unpack both
    print(f"\nrequest: {efull_date}\nSource_language: {source_lange}, Target Language: {target_lange}, User Input: {userinpute}\n")

    if not userinpute or not source_lange or not target_lange: # source_lange is required here
        raise HTTPException(status_code=422, detail="'userinput', 'source_lang', and 'target_lang' are required.")

    try:
        translated_text_e = translate_enter(userinpute, source_lange, target_lange)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        print(f"Error in translate_enter: {e}")
        raise HTTPException(status_code=500, detail="Translation failed.")

    _, ecurrent_time_resp = get_time()
    print(f"\nresponse: {ecurrent_time_resp}; ... Translated Text: {translated_text_e}\n\n")
    return {
        "translated_text": translated_text_e,
    }

# This endpoint was buggy due to variable scope (datae instead of dataf) and undefined vars
# @app.post("/translate_faster/")
# async def translate_faster_endpoint(request: Request):
#     dataf = await request.json()
#     userinputf = dataf.get("userinput") # Corrected from datae
#     source_langf = dataf.get("source_lang") # Corrected from datae
#     target_langf = dataf.get("target_lang") # Corrected from datae
#     ffull_date, _ = get_time()
#     print(f"\nrequest: {ffull_date}\nSource_language; {source_langf}, Target Language; {target_langf}, User Input: {userinputf}\n")
#
#     if not userinputf or not source_langf or not target_langf: # Added source_langf check
#         raise HTTPException(status_code=422, detail="'userinput', 'source_lang', and 'target_lang' are required.")
#
#     try:
#         # This function needs to be properly implemented using Hugging Face pipeline
#         # translated_text_f_obj = translate_faster(userinputf, source_langf, target_langf)
#         # translated_text_f = translated_text_f_obj.get('result', "Error in translation") # Assuming dict output
#         raise NotImplementedError("translate_faster endpoint needs reimplementation with HF NLLB pipeline.")
#     except Exception as e:
#         print(f"Error in translate_faster: {e}")
#         raise HTTPException(status_code=500, detail="Translation failed.")
#
#     _, fcurrent_time_resp = get_time()
#     # print(f"\nresponse: {fcurrent_time_resp}; ... Translated Text: {translated_text_f}\n\n")
#     # return {
#     #     "translated_text": translated_text_f,
#     # }

if __name__ == "__main__":
    print("\nAPI (Original Script) starting... Ensure local models are present.")
    # Check if models were loaded
    if not lang_model: print("Warning: FastText Language Model failed to load.")
    if not sp: print("Warning: SentencePiece Model failed to load.")
    if not translator: print("Warning: CTranslate2 Translator Model failed to load.")
    if lang_model and sp and translator:
        print("\nAll local models loaded successfully 😁\n")
    else:
        print("\nOne or more local models failed to load. Some endpoints may not work. 😭\n")

    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 2. NLLB Model Loading and Gradio Demo Script

*   **Description:** This script demonstrated how to load NLLB models (tokenizer and model) directly from Hugging Face Hub using `AutoModelForSeq2SeqLM.from_pretrained` and `AutoTokenizer.from_pretrained`. It also included a Gradio interface for interactive translation.
*   **Purpose:** To show the preferred method of Hugging Face model integration and provide a simple UI for testing NLLB translation. It also introduced the concept of `flores_codes` for NLLB language mapping.
*   **Key Takeaways for Current Project:**
    *   Pattern for loading Hugging Face models and tokenizers.
    *   Use of `transformers.pipeline` for translation.
    *   Necessity of NLLB-specific language codes (e.g., `eng_Latn`, `fra_Latn`) and a mapping system (like `flores_codes`).
    *   Awareness of different NLLB model sizes and their implications.

```python
import os
import torch
import gradio as gr # For demo purposes, not directly in FastAPI backend
import time
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
# from flores200_codes import flores_codes # Assumes this file exists with NLLB code mappings

# --- Mock flores200_codes.py for this snippet ---
# In the actual project, this would be a separate file or integrated into app/core.py
# e.g. from app.flores200_codes import FLORES_LANGUAGES
FLORES_LANGUAGES_EXAMPLE = {
    "English": "eng_Latn",
    "French": "fra_Latn",
    "Spanish": "spa_Latn",
    "German": "deu_Latn",
    "Swahili": "swh_Latn",
    "Korean": "kor_Hang",
    # Add more as needed for the demo
}
# --- End Mock ---

# Global model dictionary to hold loaded models
model_dict_gradio = {} # Renamed to avoid conflict if run in same context as other scripts

def load_nllb_models_for_gradio():
    # build model and tokenizer
    # For demo, let's use a smaller, manageable model
    model_name_dict_gradio = {
            'nllb-distilled-600M': 'facebook/nllb-200-distilled-600M',
            # 'nllb-1.3B': 'facebook/nllb-200-1.3B', # Larger, takes more time/memory
            # 'nllb-moe-54b': 'facebook/nllb-moe-54b', # Extremely large, not suitable for typical local demo
            }

    # For FastAPI, models loaded into app.core.ML_MODELS on startup
    # This function is illustrative of the loading process.

    for call_name, real_name in model_name_dict_gradio.items():
        print(f'\tLoading model for Gradio: {call_name} ({real_name})')
        try:
            # In FastAPI, use HF_TOKEN from app.core
            # tokenizer = AutoTokenizer.from_pretrained(real_name, use_auth_token=os.environ.get("HUGGINGFACE_TOKEN"))
            # model = AutoModelForSeq2SeqLM.from_pretrained(real_name, use_auth_token=os.environ.get("HUGGINGFACE_TOKEN"))
            tokenizer = AutoTokenizer.from_pretrained(real_name) # Assuming public model or token set in env
            model = AutoModelForSeq2SeqLM.from_pretrained(real_name)

            # For FastAPI, model.to(DEVICE) would be done. For Gradio on CPU, this is fine.
            # device = "cuda" if torch.cuda.is_available() else "cpu"
            # model.to(device)

            model_dict_gradio[call_name+'_model'] = model
            model_dict_gradio[call_name+'_tokenizer'] = tokenizer
            print(f"\tModel {call_name} loaded.")
        except Exception as e:
            print(f"Error loading model {call_name}: {e}")

    return model_dict_gradio


def translation_gradio_demo(source_human_name, target_human_name, text_to_translate):
    # In Gradio, user selects a model. Here, we'll pick the one loaded.
    # For simplicity, assume only 'nllb-distilled-600M' is loaded or is the default.
    active_model_key = 'nllb-distilled-600M' # Or make this selectable in Gradio UI

    if not (active_model_key + '_model' in model_dict_gradio and active_model_key + '_tokenizer' in model_dict_gradio) :
        return {"error": f"Model {active_model_key} not loaded. Please check console."}

    start_time = time.time()

    # Convert human-readable names to NLLB codes
    source_nllb_code = FLORES_LANGUAGES_EXAMPLE.get(source_human_name)
    target_nllb_code = FLORES_LANGUAGES_EXAMPLE.get(target_human_name)

    if not source_nllb_code:
        return {"error": f"Source language '{source_human_name}' not found in NLLB mapping."}
    if not target_nllb_code:
        return {"error": f"Target language '{target_human_name}' not found in NLLB mapping."}

    model = model_dict_gradio[active_model_key + '_model']
    tokenizer = model_dict_gradio[active_model_key + '_tokenizer']

    # In FastAPI, device is managed globally (app.core.DEVICE)
    # device_pipeline = 0 if torch.cuda.is_available() else -1
    device_pipeline = -1 # For CPU Gradio demo

    translator = pipeline(
        'translation',
        model=model,
        tokenizer=tokenizer,
        src_lang=source_nllb_code,
        tgt_lang=target_nllb_code,
        device=device_pipeline # pipeline uses 0 for cuda:0, -1 for CPU
    )

    # NLLB models might need a higher max_length
    # For NLLB-600M, max_length for generation is often around 512 or model.config.max_position_embeddings
    max_gen_length = getattr(model.config, 'max_position_embeddings', 512)
    output = translator(text_to_translate, max_length=max_gen_length)

    end_time = time.time()

    translated_text = output[0]['translation_text']
    result = {
        'inference_time_seconds': round(end_time - start_time, 3),
        'source_language_nllb': source_nllb_code,
        'target_language_nllb': target_nllb_code,
        'original_text': text_to_translate,
        'translated_text': translated_text
    }
    return result


if __name__ == '__main__':
    # This __main__ block is for running the Gradio demo independently.
    # In the FastAPI app, model loading happens at startup.
    print('\tInitializing models for Gradio Demo...')
    model_dict_gradio = load_nllb_models_for_gradio()

    if not model_dict_gradio:
        print("No models were loaded. Gradio demo cannot start.")
    else:
        # Define Gradio demo interface
        lang_human_names = list(FLORES_LANGUAGES_EXAMPLE.keys())

        inputs = [
            gr.Dropdown(lang_human_names, value='English', label='Source Language'),
            gr.Dropdown(lang_human_names, value='French', label='Target Language'), # Changed from Korean for commonality
            gr.Textbox(lines=5, label="Input Text"),
        ]
        outputs = gr.JSON(label="Translation Result") # Output as JSON for clarity

        title = "NLLB Distilled 600M Demo (via Hugging Face Transformers)"
        demo_status = "Demo is running on CPU (unless CUDA is available and configured for pipeline)"
        description = f"Translate text using Facebook's NLLB model. {demo_status}"
        examples = [
            ['English', 'French', 'Hello, world! This is a test.'],
            ['English', 'Spanish', 'Good morning, how are you today?'],
            ['Swahili', 'English', 'Habari yako? Mimi ni mwanafunzi.'] # Example with Swahili
        ]

        gr.Interface(
            fn=translation_gradio_demo,
            inputs=inputs,
            outputs=outputs,
            title=title,
            description=description,
            examples=examples
        ).launch()
```

---

## 3. Hugging Face InferenceClient for Chat (SambaNova/DeepSeek Example)

*   **Description:** This script demonstrates how to use the `huggingface_hub.InferenceClient` to interact with a chat model, specifically mentioning `deepseek-ai/DeepSeek-R1` and the `sambanova` provider. It shows how to send messages and stream responses.
*   **Purpose:** To provide the foundational code for integrating a third-party or Hugging Face hosted LLM into the chat service, enabling multilingual chat through a translation layer.
*   **Key Takeaways for Current Project:**
    *   Using `InferenceClient` for chat completions.
    *   Structuring messages with roles (`user`, `assistant`).
    *   Handling streaming responses from the LLM.
    *   The need for an API key (`HF_TOKEN` or provider-specific key).

```python
from huggingface_hub import InferenceClient
import os

# Ensure your Hugging Face token is set as an environment variable
# For SambaNova, this token might be used as the api_key or you might have a separate one.
# The InferenceClient will try to pick up HF_TOKEN from the environment by default.
HF_TOKEN = os.environ.get("HUGGINGFACE_TOKEN")
if not HF_TOKEN:
    print("Warning: HUGGINGFACE_TOKEN environment variable not set. InferenceClient may fail.")

# Configuration for the chat client (these would be in app.core.py in the final app)
CHAT_LLM_PROVIDER_EXAMPLE = "huggingface" # or "sambanova" or None if model ID is a full endpoint
CHAT_LLM_MODEL_ID_EXAMPLE = "deepseek-ai/DeepSeek-R1" # Example model
# CHAT_LLM_MODEL_ID_EXAMPLE = "mistralai/Mistral-7B-Instruct-v0.2" # Another common HF model

# Initialize client
# The way you initialize might depend on the provider and model.
# For a model directly on HF Inference API:
if CHAT_LLM_PROVIDER_EXAMPLE == "huggingface":
    client = InferenceClient(model=CHAT_LLM_MODEL_ID_EXAMPLE, token=HF_TOKEN)
# For a provider like SambaNova, the initialization might be:
# client = InferenceClient(provider="sambanova", model="your-sambanova-model-endpoint-id", api_key=YOUR_SAMBANOVA_KEY_IF_DIFFERENT_FROM_HF_TOKEN)
# Or if the model_id itself is a SambaNova endpoint URL:
# client = InferenceClient(model="https://your-sambanova-endpoint/...", token=HF_TOKEN_OR_SAMBANOVA_TOKEN)

# For this generic example, let's assume it's a model accessible via standard HF Inference API or a provider that uses HF_TOKEN.
# If CHAT_LLM_MODEL_ID_EXAMPLE is a public model, token might not be strictly needed for some operations,
# but it's good practice for rate limits and private models.
try:
    client = InferenceClient(model=CHAT_LLM_MODEL_ID_EXAMPLE, token=HF_TOKEN)
    print(f"InferenceClient initialized for model: {CHAT_LLM_MODEL_ID_EXAMPLE}")
except Exception as e:
    print(f"Failed to initialize InferenceClient: {e}")
    client = None


def run_chat_example(user_query="Hello, who are you?"):
    if not client:
        print("InferenceClient not initialized. Cannot run chat example.")
        return

    messages = [
        {"role": "system", "content": "You are a helpful AI assistant designed for the Sema Translator platform."},
        {"role": "user", "content": user_query}
    ]

    print(f"\n--- Sending to LLM ({CHAT_LLM_MODEL_ID_EXAMPLE}) ---")
    print(f"User: {user_query}")
    print("Assistant (streaming): ", end="")

    full_response = ""
    try:
        stream = client.chat.completions.create(
            # model=CHAT_LLM_MODEL_ID_EXAMPLE, # Model already set in client for some versions
            messages=messages,
            temperature=0.5, # Controls randomness: lower is more deterministic
            max_tokens=150,  # Max length of the generated response
            top_p=0.7,       # Nucleus sampling: considers tokens with cumulative probability >= top_p
            stream=True      # Enable streaming
        )

        for chunk in stream:
            # The structure of 'chunk' can vary slightly based on InferenceClient version and endpoint.
            # For chat.completions.create, it's usually:
            if hasattr(chunk, 'choices') and chunk.choices and hasattr(chunk.choices[0], 'delta') and chunk.choices[0].delta:
                delta_content = chunk.choices[0].delta.content
                if delta_content:
                    print(delta_content, end="", flush=True)
                    full_response += delta_content
            # For older text-generation streams, it might be chunk.token.text
            # elif hasattr(chunk, 'token') and hasattr(chunk.token, 'text'):
            #     delta_content = chunk.token.text
            #     if delta_content:
            #         print(delta_content, end="", flush=True)
            #         full_response += delta_content

        print("\n--- End of Stream ---")
        print(f"Full Assistant Response: {full_response}")

    except Exception as e:
        print(f"\nError during chat completion: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    # Example usage of the chat client
    run_chat_example("What is the capital of France?")
    run_chat_example("Can you tell me a short story about a friendly robot?")
    # Example for multilingual aspect (though this client only sends, translation happens outside)
    # In the full app, this 'user_query' would first be translated to English if needed.
    # run_chat_example("Quelle est la capitale de la France?") # User asks in French
```
