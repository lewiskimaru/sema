'''
        Created By Lewis Kamau Kimaru
        Gradio Frontend
        August 2023
'''
import gradio as gr
from flores200_codes import flores_codes
from languages import lang_names
import requests

public_url = "https://794e-3-223-72-184.ngrok-free.app"

def translate_detect(userinput, target_lang):
    trg_lang = flores_codes[target_lang]
    url = public_url+"/translate_detect/"
    data = {
        "userinput": userinput,
        "target_lang": trg_lang,
    }
    response = requests.post(url, json=data)
    result = response.json()
    src_lang = result['source_language']
    source_lang = lang_names[src_lang]
    translation = result['translated_text']
    return source_lang, translation

def translate_enter(userinput, source_lang, target_lang):
    src_lang = flores_codes[source_lang]
    trg_lang = flores_codes[target_lang]
    url = public_url+"/translate_enter/"
    data = {
        "userinput": userinput,
        "source_lang": src_lang,
        "target_lang": trg_lang,
    }
    response = requests.post(url, json=data)
    result = response.json()
    translation = result['translated_text']
    return translation

lang_codes = list(flores_codes.keys())

# Gradio interface
demo = gr.Blocks()


sema_detect_slang = gr.Interface(
    fn=translate_detect,
    inputs=[
        gr.inputs.Textbox(lines=5, label="Enter text to translate"),
        gr.inputs.Dropdown(lang_codes, default='Swahili', label='Target Language'),
    ],
    outputs=[
        gr.Text(label="Source language"),
        gr.Text(label="Translated Text"),
    ],
    #title="Sema Translator",
    allow_flagging="never",
    description="automatically identify the language you're using. It's like magic; just type, and we'll take care of the rest.",
    examples=[
        ["Bonjour, comment allez-vous?", "English"],
        ["Hello, how are you?", "French"],
        ["Habari, unaendeleaje?", "Amharic"],
        ["ሰላም፣ እንዴት ናችሁ?", "Swahili"],
        ["Salaan, sidee tahay?", "Hausa"],
        ["Sannu, yaya kuke?", "Somali"]
    ]
)

sema_enter_slang = gr.Interface(
    fn=translate_enter,
    inputs=[
        gr.inputs.Textbox(lines=5, label="Enter text to translate"),
        gr.inputs.Dropdown(lang_codes, default='English', label='Source Language'),
        gr.inputs.Dropdown(lang_codes, default='Swahili', label='Target Language'),
    ],
    outputs=[
        gr.Text(label="Translated Text"),
    ],
    #title="Sema Translator",
    allow_flagging="never",
    description="Select your source and target languages from the options provided.",
    examples=[
        ["Bonjour, comment allez-vous?", "French", "English"],
        ["Hello, how are you?", "English", "French"],
        ["Habari, unaendeleaje?", "Swahili", "Amharic"],
        ["ሰላም፣ እንዴት ናችሁ?", "Amharic", "Swahili"]
    ]
)

tabbed_interface = gr.TabbedInterface(
    [sema_detect_slang, sema_enter_slang],
    ["Detect Source language", "Enter Source Language"],
)

with gr.Blocks() as demo:
    # Header Box
    gr.HTML(
        f"""
        <div class="Header" style="text-align:center">
              <h1>Sema Translator</h1>
        </div>
        <div class="Description" style="text-align:center; margin-left: 20px;">
            <p>Discover seamless, instant translation at your fingertips with Sema.</p>
        </div>
        """
    )

    # Language Dropdown Box
    gr.HTML(f"""
        <div class="LanguageDropdown" style="text-align:center">
            <h2>Supported Languages 🚀</h2>
            <select id="languageSelect" style="border-radius: 5px; padding: 5px; color: black;">
                {"".join(f"<option value='{code}'>{lang} - {code}</option>" for lang, code in flores_codes.items())}
            </select>
        </div>
    """)

    # User interface
    tabbed_interface.render()

    # Instructions Container
    gr.HTML(
        f"""
        <div class="Header" style="text-align:center">
              <h1>Sema API for python devs</h1>
        </div>
        
        <div class="Description" style="text-align:left; margin-left: 20px;">
            <p>Unlock a world 🌍 of linguistic possibilities with Sema Translator API – Seamlessly integrate our powerful multilingual translation capabilities into your applications and break down barriers to global communication.</p>
        </div>
        <div style="display: flex;">
            <div class="instructions" style="background-color: #32a852; padding: 20px; width: 50%; border: 2px solid black; border-radius: 15px;">
                <h2>Detect Source Language</h2>
                <pre style="text-align: left;">
import requests
url = "{public_url}/translate_detect/"
data = {{
    "userinput": "rũcinĩ rwega, niwokĩra wega?",
    "target_lang": "eng_Latn",
}}
response = requests.post(url, json=data)
result = response.json()
print(result)
</pre>
            </div>
            <div class="instructions" style="background-color: #9da3a3; padding: 20px; width: 50%; border: 2px solid black; border-radius: 15px;">
                <h2>Enter Source Language</h2>
                <pre style="text-align: left;">
import requests
url = "{public_url}/translate_enter/"
data = {{
    "userinput": "rũcinĩ rwega, niwokĩra wega?",
    "source_lang": "kik_Latn",
    "target_lang": "eng_Latn",
}}
response = requests.post(url, json=data)
result = response.json()
print(result)
</pre>
            </div>
        </div>
        """
    )
    # Contact form
    gr.HTML(
    f"""
    <script type="text/javascript" src="https://form.jotform.com/jsform/232755680556566"></script>     
    """
    )

    # Footer Box
    gr.HTML(
        f"""
        <div class="Description" style="text-align:right">
            <p>Created by Lewis Kamau Kimaru</p>
        </div>
        """
    )

print("Creating interface")
demo.launch()
