"""
Test script to verify model downloading and loading from sema-utils repository
"""

import os
import sys
from huggingface_hub import hf_hub_download, snapshot_download
import ctranslate2
import sentencepiece as spm
import fasttext

def test_model_download():
    """Test downloading models from sematech/sema-utils"""
    
    REPO_ID = "sematech/sema-utils"
    MODELS_DIR = "test_models"
    
    print("🧪 Testing model download from sematech/sema-utils...")
    
    # Create test directory
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    try:
        # Test 1: Download SentencePiece model
        print("\n1️⃣ Testing SentencePiece model download...")
        smp_path = hf_hub_download(
            repo_id=REPO_ID, 
            filename="spm.model", 
            local_dir=MODELS_DIR
        )
        print(f"✅ SentencePiece model downloaded to: {smp_path}")
        
        # Test 2: Download language detection model
        print("\n2️⃣ Testing language detection model download...")
        ft_path = hf_hub_download(
            repo_id=REPO_ID, 
            filename="lid218e.bin", 
            local_dir=MODELS_DIR
        )
        print(f"✅ Language detection model downloaded to: {ft_path}")
        
        # Test 3: Download translation model
        print("\n3️⃣ Testing translation model download...")
        ct_model_path = snapshot_download(
            repo_id=REPO_ID,
            allow_patterns="translation_models/sematrans-3.3B/*",
            local_dir=MODELS_DIR
        )
        print(f"✅ Translation model downloaded to: {ct_model_path}")
        
        # Verify file structure
        ct_model_full_path = os.path.join(MODELS_DIR, "translation_models", "sematrans-3.3B")
        print(f"\n📁 Translation model directory: {ct_model_full_path}")
        
        if os.path.exists(ct_model_full_path):
            files = os.listdir(ct_model_full_path)
            print(f"📄 Files in translation model directory: {files}")
        else:
            print("❌ Translation model directory not found!")
            return False
            
        return smp_path, ft_path, ct_model_full_path
        
    except Exception as e:
        print(f"❌ Error during download: {e}")
        return False

def test_model_loading(smp_path, ft_path, ct_model_path):
    """Test loading the downloaded models"""
    
    print("\n🔄 Testing model loading...")
    
    try:
        # Suppress fasttext warnings
        fasttext.FastText.eprint = lambda x: None
        
        # Test 1: Load language detection model
        print("\n1️⃣ Testing language detection model loading...")
        lang_model = fasttext.load_model(ft_path)
        print("✅ Language detection model loaded successfully")
        
        # Test language detection
        test_text = "Habari ya asubuhi"
        predictions = lang_model.predict(test_text, k=1)
        detected_lang = predictions[0][0].replace('__label__', '')
        print(f"🔍 Detected language for '{test_text}': {detected_lang}")
        
        # Test 2: Load SentencePiece model
        print("\n2️⃣ Testing SentencePiece model loading...")
        sp_model = spm.SentencePieceProcessor()
        sp_model.load(smp_path)
        print("✅ SentencePiece model loaded successfully")
        
        # Test tokenization
        tokens = sp_model.encode(test_text, out_type=str)
        print(f"🔤 Tokenized '{test_text}': {tokens}")
        
        # Test 3: Load translation model
        print("\n3️⃣ Testing translation model loading...")
        translator = ctranslate2.Translator(ct_model_path, device="cpu")
        print("✅ Translation model loaded successfully")
        
        return lang_model, sp_model, translator
        
    except Exception as e:
        print(f"❌ Error during model loading: {e}")
        return False

def test_translation(lang_model, sp_model, translator):
    """Test the complete translation pipeline"""
    
    print("\n🔄 Testing complete translation pipeline...")
    
    test_text = "Habari ya asubuhi, ulimwengu"
    target_lang = "eng_Latn"
    
    try:
        # Step 1: Detect source language
        predictions = lang_model.predict(test_text.replace('\n', ' '), k=1)
        source_lang = predictions[0][0].replace('__label__', '')
        print(f"🔍 Detected source language: {source_lang}")
        
        # Step 2: Tokenize
        source_sents = [test_text.strip()]
        source_sents_subworded = sp_model.encode(source_sents, out_type=str)
        source_sents_subworded = [[source_lang] + sent + ["</s>"] for sent in source_sents_subworded]
        print(f"🔤 Tokenized input: {source_sents_subworded[0][:10]}...")
        
        # Step 3: Translate
        target_prefix = [[target_lang]]
        translations = translator.translate_batch(
            source_sents_subworded,
            batch_type="tokens",
            max_batch_size=2048,
            beam_size=1,
            target_prefix=target_prefix,
        )
        
        # Step 4: Decode
        translations = [translation[0]['tokens'] for translation in translations]
        translations_desubword = sp_model.decode(translations)
        translated_text = translations_desubword[0][len(target_lang):]
        
        print(f"\n🎉 Translation successful!")
        print(f"📝 Original: {test_text}")
        print(f"🔍 Source language: {source_lang}")
        print(f"🎯 Target language: {target_lang}")
        print(f"✨ Translation: {translated_text}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during translation: {e}")
        return False

def cleanup_test_files():
    """Clean up test files"""
    import shutil
    
    test_dir = "test_models"
    if os.path.exists(test_dir):
        print(f"\n🧹 Cleaning up test directory: {test_dir}")
        shutil.rmtree(test_dir)
        print("✅ Cleanup complete")

if __name__ == "__main__":
    print("🚀 Starting Sema Utils Model Test\n")
    
    # Test model download
    download_result = test_model_download()
    if not download_result:
        print("❌ Model download test failed!")
        sys.exit(1)
    
    smp_path, ft_path, ct_model_path = download_result
    
    # Test model loading
    loading_result = test_model_loading(smp_path, ft_path, ct_model_path)
    if not loading_result:
        print("❌ Model loading test failed!")
        sys.exit(1)
    
    lang_model, sp_model, translator = loading_result
    
    # Test translation
    translation_result = test_translation(lang_model, sp_model, translator)
    if not translation_result:
        print("❌ Translation test failed!")
        sys.exit(1)
    
    print("\n🎉 All tests passed! Your sema-utils repository is working correctly.")
    
    # Ask user if they want to clean up
    response = input("\n🧹 Do you want to clean up test files? (y/n): ")
    if response.lower() in ['y', 'yes']:
        cleanup_test_files()
    
    print("\n✅ Test complete!")
