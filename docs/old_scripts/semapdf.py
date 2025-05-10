from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import ElasticVectorSearch, Pinecone, Weaviate, FAISS
from dotenv import load_dotenv
import streamlit as st
from PyPDF2 import PdfReader
from langchain.callbacks import get_openai_callback
import wget
import os
import fasttext
from SemaTrans import Translator



#set your Open-AI key
key="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"
os.environ["OPENAI_API_KEY"] = key


def main():
    st.set_page_config(page_title="Ask your PDF")
    st.header("Ask your PDF 💬")

    trans = Translator()
    # upload file
    pdf = st.file_uploader("Upload your PDF", type="pdf")
    # extract the text
    if pdf is not None:
      reader = PdfReader(pdf)
      pdf_text = ''
      for page in (reader.pages):
        text = page.extract_text()
        if text:
            pdf_text += text

      # Define our text splitter
      text_splitter = CharacterTextSplitter(
      separator = "\n",
      chunk_size = 1000, #thousand charctere
      chunk_overlap  = 200,
      length_function = len,
      )
      #Apply splitting
      text_chunks = text_splitter.split_text(pdf_text)

      # Use embeddings from OpenAI
      embeddings = OpenAIEmbeddings()
      #Convert text to embeddings
      pdf_embeddings = FAISS.from_texts(text_chunks, embeddings)
      chain = load_qa_chain(OpenAI(), chain_type="stuff")

      # Get user input
      user_question = st.text_input("Ask a question about your PDF:")

      Query = trans.translate(user_question, 'eng_Latn')[1] # Translate User Quiz to English
      user_lang = trans.translate(user_question, 'eng_Latn')[0]
      if user_question:
        docs = pdf_embeddings.similarity_search(Query)
        # print(len(docs))
        response = chain.run(input_documents=docs, question=Query)
        output = trans.translate(response, user_lang)[1]
        translated_text = output[0]['translation_text']
        st.write(translated_text)


if __name__ == '__main__':
    main()
