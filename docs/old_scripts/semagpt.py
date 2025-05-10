import os
import openai
import gradio as gr

# Get chatgpt
openai.api_key = "sk-.........."
messages = [
    {"role": "system", "content": "You are a helpful and kind AI Assistant."},
]

def chat_bot(input, targetl):
    if input:
        messages.append({"role": "user", "content": input})
        chat = openai.ChatCompletion.create(
            model="gpt-3.5-turbo", messages=messages
        )
        reply = chat.choices[0].message.content
        messages.append({"role": "assistant", "content": reply})
        # translate to the target language
        #translator = pipeline('translation', model=trans_model, tokenizer=tokenizer, src_lang='eng_Latn', tgt_lang=targetl, max_length = 800)
        #output = translator(reply)
        #translated_text = output[0]['translation_text']
        output = translate(reply, targetl)[1][0]
        return reply, output

def chatgpt_clone(input, history):
    history = history or []
    s = list(sum(history, ()))
    engprompt = translate(input, 'eng_Latn')[1][0]
    # print(engprompt)
    userlang = translate(input, 'eng_Latn')[0]
    s.append(input)
    inp = ' '.join(s)
    Response = chat_bot(engprompt, userlang)
    output = Response[1]
    # print(Response[0])
    history.append((input, output))
    return history, history


block = gr.Blocks()


with block:
    gr.Markdown("""<h1><center>Sema GPT</center></h1>
    """)
    Chatbot = gr.Chatbot()
    message = gr.Textbox(placeholder = "Ask anything ...... ")
    state = gr.State()
    submit = gr.Button("\u25B6")
    submit.click(chatgpt_clone, inputs=[message, state], outputs=[Chatbot, state])

block.launch(share=True)
