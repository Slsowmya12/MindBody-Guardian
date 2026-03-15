from flask import request, Blueprint
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_community.document_loaders import PDFPlumberLoader
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain.prompts import PromptTemplate
import os

rag_model_bp = Blueprint("rag_model", __name__)

# vector database folder
folder_path = "db"

# Groq LLM
cached_llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=os.getenv("GROQ_API_KEY")
)

# embeddings
embedding = FastEmbedEmbeddings()

# text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1024,
    chunk_overlap=80,
    length_function=len,
    is_separator_regex=False
)

# prompt
raw_prompt = PromptTemplate.from_template(
"""
<s>[INST] You are a technical assistant good at searching documents.
If you do not know the answer from the context, say you don't know. [/INST] </s>

[INST]
Question: {input}

Context:
{context}

Answer:
[/INST]
"""
)

# -------------------------
# AI CHAT
# -------------------------
@rag_model_bp.route("/ai", methods=["POST"])
def aiPost():

    print("POST /ai called")

    json_content = request.json
    query = json_content.get("query")

    print(f"Query: {query}")

    response = cached_llm.invoke(query)

    return {"answer": response.content}


# -------------------------
# ASK QUESTION FROM PDF
# -------------------------
@rag_model_bp.route("/ask_pdf", methods=["POST"])
def askPDFPost():

    print("POST /ask_pdf called")

    json_content = request.json
    query = json_content.get("query")

    print(f"Query: {query}")

    print("Loading vector store")

    vector_store = Chroma(
        persist_directory=folder_path,
        embedding_function=embedding
    )

    retriever = vector_store.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "k": 20,
            "score_threshold": 0.1
        }
    )

    print("Creating chain")

    document_chain = create_stuff_documents_chain(cached_llm, raw_prompt)
    chain = create_retrieval_chain(retriever, document_chain)

    result = chain.invoke({"input": query})

    print(result)

    return {"answer": result["answer"]}


# -------------------------
# UPLOAD PDF
# -------------------------
@rag_model_bp.route("/pdf", methods=["POST"])
def pdfPost():

    file = request.files["file"]
    file_name = file.filename

    upload_folder = "Exercises1"
    os.makedirs(upload_folder, exist_ok=True)

    save_file = os.path.join(upload_folder, file_name)
    file.save(save_file)

    print(f"File uploaded: {file_name}")

    loader = PDFPlumberLoader(save_file)
    docs = loader.load_and_split()

    print(f"docs len = {len(docs)}")

    chunks = text_splitter.split_documents(docs)

    print(f"chunks len = {len(chunks)}")

    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embedding,
        persist_directory=folder_path
    )

    vector_store.persist()

    return {
        "status": "Successfully Uploaded",
        "filename": file_name,
        "documents": len(docs),
        "chunks": len(chunks)
    }