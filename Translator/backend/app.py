'''
        Created By Lewis Kamau Kimaru 
        Sema fastapi backend
        August 2023
'''

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import gradio as gr
import ctranslate2
import sentencepiece as spm
import fasttext
import uvicorn
import pytz
from datetime import datetime
from pyngrok import ngrok
import os

app = FastAPI()

# Set your ngrok authtoken
ngrok.set_auth_token("2UAhCqf5zP0cCgJzeadNANkbIqx_7ZJvhkDSNWccqMX2hyxXP")
#ngrok.set_auth_token("2S6xeFEoSVFWr2egtDRcqgeUtSx_2juefHFkEW6nGbpRHS37W")
#ngrok.set_auth_token("2UAmdjHdAFV9x84TdyEknIfNhYk_4Ye8n4YK7ZhfCMob3yPBh")
#ngrok.set_auth_token("2UAqm26HuWiWvQjzK58xYufSGpy_6tStKSyLLyR9f7pcezh6R")
#ngrok.set_auth_token("2UGQqzZoI3bx7SSk8H4wuFC3iaC_2WniWyNAsW5fd2rFyKVq1")
#ngrok.set_auth_token("2UISOtStHwytO70NQK38dFhS1at_5opQaXnoQCKeyhEe4qfT2")


fasttext.FastText.eprint = lambda x: None

# Get time of request

def get_time():
    nairobi_timezone = pytz.timezone('Africa/Nairobi')
    current_time_nairobi = datetime.now(nairobi_timezone)
    
    curr_day = current_time_nairobi.strftime('%A')
    curr_date = current_time_nairobi.strftime('%Y-%m-%d')
    curr_time = current_time_nairobi.strftime('%H:%M:%S')
    
    full_date = f"{curr_day} | {curr_date} | {curr_time}"
    return full_date, curr_time
    
# Load the model and tokenizer ..... only once!
beam_size = 1  # change to a smaller value for faster inference
device = "cpu"  # or "cuda"

# Language Prediction model
print("\nimporting Language Prediction model")
lang_model_file = "lid218e.bin"
lang_model_full_path = os.path.join(os.path.dirname(__file__), lang_model_file)
lang_model = fasttext.load_model(lang_model_full_path)


# Load the source SentencePiece model
print("\nimporting SentencePiece model")
sp_model_file = "spm.model"
sp_model_full_path = os.path.join(os.path.dirname(__file__), sp_model_file)
sp = spm.SentencePieceProcessor()
sp.load(sp_model_full_path)

# Import The Translator model
print("\nimporting Translator model")
ct_model_file = "sematrans-3.3B"
ct_model_full_path = os.path.join(os.path.dirname(__file__), ct_model_file)
translator = ctranslate2.Translator(ct_model_full_path, device)

print('\nDone importing models\n')

    
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


@app.get("/")
async def read_root():
    gradio_interface = """
    <html>
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0">
    <head>
        <title>Sema</title>
    </head>
    <frameset>
        <frame src=https://kamau1-semaapi-frontend.hf.space/?embedded=true'>
    </frameset>
    </html>
    """
    return HTMLResponse(content=gradio_interface)


@app.post("/translate_detect/")
async def translate_detect_endpoint(request: Request):
    datad = await request.json()
    userinputd = datad.get("userinput")
    target_langd = datad.get("target_lang")
    dfull_date = get_time()[0]
    print(f"\n{dfull_date}\nTarget Language; {target_langd}, User Input: {userinputd}\n")

    if not userinputd or not target_langd:
        raise HTTPException(status_code=422, detail="Both 'userinput' and 'target_lang' are required.")

    source_langd, translated_text_d = translate_detect(userinputd, target_langd)
    dcurrent_time = get_time()[1]
    print(f"\n{dcurrent_time}; ... Source_language: {source_langd}, Translated Text: {translated_text_d}\n\n")
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
    print(f"\n{efull_date}\nSource_language; {source_lange}, Target Language; {target_lange}, User Input: {userinpute}\n")

    if not userinpute or not target_lange:
        raise HTTPException(status_code=422, detail="'userinput' 'sourc_lang'and 'target_lang' are required.")

    translated_text_e = translate_enter(userinpute, source_lange, target_lange)
    ecurrent_time = get_time()[1]
    print(f"\n{ecurrent_time}; ... Translated Text: {translated_text_e}\n\n")
    return {
        "translated_text": translated_text_e,
    }


print("\nAPI starting .......\n")
ngrok_tunnel = ngrok.connect(7860)
public_url = ngrok_tunnel.public_url
print('\nPublic URL✅:', public_url)
