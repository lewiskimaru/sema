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

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
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

fasttext.FastText.eprint = lambda x: None

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


def load_models():
    # build model and tokenizer
    model_name_dict = {
            #'nllb-distilled-600M': 'facebook/nllb-200-distilled-600M',
            #'nllb-1.3B': 'facebook/nllb-200-1.3B',
            #'nllb-distilled-1.3B': 'facebook/nllb-200-distilled-1.3B',
            #'nllb-3.3B': 'facebook/nllb-200-3.3B',
            #'nllb-moe-54b': 'facebook/nllb-moe-54b',
            }

    model_dict = {}

    for call_name, real_name in model_name_dict.items():
        print('\tLoading model: %s' % call_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(real_name)
        tokenizer = AutoTokenizer.from_pretrained(real_name)
        model_dict[call_name+'_model'] = model
        model_dict[call_name+'_tokenizer'] = tokenizer

    return model_dict 

    
# Load the model and tokenizer ..... only once!
beam_size = 1  # change to a smaller value for faster inference
device = "cpu"  # or "cuda"

print('(note-to-self)..... I play the Orchestra🦋.......')

# Language Prediction model
print("\n1️⃣importing Language Prediction model")
lang_model_file = "lid218e.bin"
lang_model_full_path = os.path.join(os.path.dirname(__file__), lang_model_file)
lang_model = fasttext.load_model(lang_model_full_path)


# Load the source SentencePiece model
print("\n2️⃣importing SentencePiece model")
sp_model_file = "spm.model"
sp_model_full_path = os.path.join(os.path.dirname(__file__), sp_model_file)
sp = spm.SentencePieceProcessor()
sp.load(sp_model_full_path)

# Import The Translator model

print("\n3️⃣importing Translator model")
ct_model_file = "sematrans-3.3B"
ct_model_full_path = os.path.join(os.path.dirname(__file__), ct_model_file)
translator = ctranslate2.Translator(ct_model_full_path, device)

#model_dict = load_models()

print('\nDone importing models 🙈\n')

    
def translate_detect(userinput: str, target_lang: str):
    source_sents = [userinput]
    source_sents = [sent.strip() for sent in source_sents]
    target_prefix = [[target_lang]] * len(source_sents)

    # Predict the source language
    predictions = lang_model.predict(source_sents[0], k=1)
    source_lang = predictions[0][0].replace('__label__', '')

    # Subword the source sentences
    source_sents_subworded = sp.encode(source_sents, out_type=str)
    source_sents_subworded = [[source_lang] + sent + ["</s>"] for sent in source_sents_subworded]

    # Translate the source sentences
    translations = translator.translate_batch(
        source_sents_subworded,
        batch_type="tokens",
        max_batch_size=2024,
        beam_size=beam_size,
        target_prefix=target_prefix,
    )
    translations = [translation[0]['tokens'] for translation in translations]

    # Desubword the target sentences
    translations_desubword = sp.decode(translations)
    translations_desubword = [sent[len(target_lang):] for sent in translations_desubword]

    # Return the source language and the translated text
    return source_lang, translations_desubword

def translate_enter(userinput: str, source_lang: str, target_lang: str):  
  source_sents = [userinput]
  source_sents = [sent.strip() for sent in source_sents]
  target_prefix = [[target_lang]] * len(source_sents)

  # Subword the source sentences
  source_sents_subworded = sp.encode(source_sents, out_type=str)
  source_sents_subworded = [[source_lang] + sent + ["</s>"] for sent in source_sents_subworded]

  # Translate the source sentences
  translations = translator.translate_batch(source_sents_subworded, batch_type="tokens", max_batch_size=2024, beam_size=beam_size, target_prefix=target_prefix)
  translations = [translation[0]['tokens'] for translation in translations]

  # Desubword the target sentences
  translations_desubword = sp.decode(translations)
  translations_desubword = [sent[len(target_lang):] for sent in translations_desubword]

  # Return the source language and the translated text
  return translations_desubword[0]


def translate_faster(userinput3: str, source_lang3: str, target_lang3: str):
    if len(model_dict) == 2:
        model_name = 'nllb-moe-54b'
        
    start_time = time.time()
    
    model = model_dict[model_name + '_model']
    tokenizer = model_dict[model_name + '_tokenizer']

    translator = pipeline('translation', model=model, tokenizer=tokenizer, src_lang=source_lang3, tgt_lang=target_lang3)
    output = translator(userinput3, max_length=400)
    end_time = time.time()

    output = output[0]['translation_text']
    result = {'inference_time': end_time - start_time,
              'source': source,
              'target': target,
              'result': output}
    return result
    
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return HTMLResponse(content=open(os.path.join(templates_folder, "translator.html"), "r").read(), status_code=200)

    
@app.post("/translate_detect/")
async def translate_detect_endpoint(request: Request):
    datad = await request.json()
    userinputd = datad.get("userinput")
    target_langd = datad.get("target_lang")
    dfull_date = get_time()[0]
    print(f"\nrequest: {dfull_date}\nTarget Language; {target_langd}, User Input: {userinputd}\n")

    if not userinputd or not target_langd:
        raise HTTPException(status_code=422, detail="Both 'userinput' and 'target_lang' are required.")

    source_langd, translated_text_d = translate_detect(userinputd, target_langd)
    dcurrent_time = get_time()[1]
    print(f"\nresponse: {dcurrent_time}; ... Source_language: {source_langd}, Translated Text: {translated_text_d}\n\n")
    return {
        "source_language": source_langd,
        "translated_text": translated_text_d[0],
    }


@app.post("/translate_enter/")
async def translate_enter_endpoint(request: Request):
    datae = await request.json()
    userinpute = datae.get("userinput")
    source_lange = datae.get("source_lang")
    target_lange = datae.get("target_lang")
    efull_date = get_time()[0]
    print(f"\nrequest: {efull_date}\nSource_language; {source_lange}, Target Language; {target_lange}, User Input: {userinpute}\n")

    if not userinpute or not target_lange:
        raise HTTPException(status_code=422, detail="'userinput' 'sourc_lang'and 'target_lang' are required.")

    translated_text_e = translate_enter(userinpute, source_lange, target_lange)
    ecurrent_time = get_time()[1]
    print(f"\nresponse: {ecurrent_time}; ... Translated Text: {translated_text_e}\n\n")
    return {
        "translated_text": translated_text_e,
    }


@app.post("/translate_faster/")
async def translate_faster_endpoint(request: Request):
    dataf = await request.json()
    userinputf = datae.get("userinput")
    source_langf = datae.get("source_lang")
    target_langf = datae.get("target_lang")
    ffull_date = get_time()[0]
    print(f"\nrequest: {ffull_date}\nSource_language; {source_langf}, Target Language; {target_langf}, User Input: {userinputf}\n")

    if not userinputf or not target_langf:
        raise HTTPException(status_code=422, detail="'userinput' 'sourc_lang'and 'target_lang' are required.")

    translated_text_f = translate_faster(userinputf, source_langf, target_langf)
    fcurrent_time = get_time()[1]
    print(f"\nresponse: {fcurrent_time}; ... Translated Text: {translated_text_f}\n\n")
    return {
        "translated_text": translated_text_f,
    }
    
print("\nAPI started successfully 😁\n")
