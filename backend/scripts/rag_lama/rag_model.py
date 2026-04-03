from flask import request, Blueprint, current_app
import jwt
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_community.document_loaders import PDFPlumberLoader
from langchain_core.runnables import RunnablePassthrough
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

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
If you do not know the answer from the context, say you don't know.
Do not include any customer personal information or private data in your output.
Only use information from the provided context and avoid making assumptions.
[/INST] </s>

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

    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
    if not token:
        token = json_content.get("token")

    user_context = ""
    if token:
        try:
            secret = os.getenv("SECRET_KEY", "your-secret-key-here")
            user_data = jwt.decode(token, secret, algorithms=["HS256"])
            mongo = current_app.config['pymongo']
            user = mongo.db.Users.find_one({'username': user_data.get('username')})
            if user:
                details = []
                name = user.get('fullName') or user.get('name') or user.get('username')
                if name:
                    details.append(f"Name: {name}")
                if user.get('email'):
                    details.append(f"Email: {user['email']}")
                if user.get('dob'):
                    details.append(f"Date of Birth: {user['dob']}")
                if user.get('gender'):
                    details.append(f"Gender: {user['gender']}")
                if user.get('fitnessGoals'):
                    details.append(f"Fitness Goals: {user['fitnessGoals']}")
                if details:
                    user_context = "User details:\n" + "\n".join(details) + "\n\n"
        except Exception as exc:
            print("User token decode failed", exc)

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

    # Create the RAG chain using LCEL
    prompt_template = """
<s>[INST] You are a technical assistant good at searching documents.
If you do not know the answer from the context, say you don't know.
Do not include any customer-specific data or private info in your output.
Only answer from the supplied context and avoid assumptions.
[/INST] </s>

[INST]
Question: {input}

Context:
{context}

Answer:
[/INST]
"""
    prompt = ChatPromptTemplate.from_template(prompt_template)
    
    chain = (
        {"context": retriever, "input": RunnablePassthrough()}
        | prompt
        | cached_llm
        | StrOutputParser()
    )

    enriched_query = f"{user_context}{query}" if query else user_context
    result = chain.invoke(enriched_query)

    print(result)

    return {"answer": result}


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