from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import rag, ocr

app = FastAPI(title="Novator AI Backend", version="1.0.0")

# Configure CORS for local development. In production, restrict allow_origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rag.router, prefix="/api/rag", tags=["RAG Document Uploads"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR Image Uploads"])

@app.get("/")
def read_root():
    return {"message": "Novator AI Backend API is running."}
