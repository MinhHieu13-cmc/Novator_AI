from fastapi import APIRouter, File, UploadFile, HTTPException
import shutil
import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from supabase.client import create_client

router = APIRouter()

@router.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Determine environment variables
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
        if not supabase_url or not supabase_key:
            raise HTTPException(status_code=500, detail="Supabase credentials not configured")
        
        supabase = create_client(supabase_url, supabase_key)
        embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
        
        # Load and split PDF
        loader = PyPDFLoader(temp_path)
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        docs = text_splitter.split_documents(documents)
        
        # Store in Supabase
        # Assume a table named 'documents' exists with pgvector extension enabled.
        SupabaseVectorStore.from_documents(
            docs,
            embeddings,
            client=supabase,
            table_name="documents",
            query_name="match_documents"
        )
        
        return {"message": f"Successfully processed {len(docs)} chunks from {file.filename} into RAG database."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
