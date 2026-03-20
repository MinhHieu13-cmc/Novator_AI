from fastapi import APIRouter, File, UploadFile, HTTPException
import httpx
import base64
from io import BytesIO
from PIL import Image

router = APIRouter()

# Update URL to actual accessible ollama instance, could use env var
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "glm-ocr"  # Based on user's instruction

@router.post("/upload_image")
async def upload_image(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Only PNG and JPG files are allowed")
    
    try:
        contents = await file.read()
        
        # Tối ưu hoá dung lượng ảnh (Tránh lỗi 500 tràn VRAM của Ollama)
        try:
            img = Image.open(BytesIO(contents))
            if img.mode != 'RGB':
                img = img.convert('RGB')
                
            max_size = 1024
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=85) # Nén chất lượng 85%
            compressed_bytes = buffer.getvalue()
        except Exception as img_e:
            raise HTTPException(status_code=400, detail=f"Image processing failed: {str(img_e)}")

        encoded_string = base64.b64encode(compressed_bytes).decode('utf-8')
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(OLLAMA_API_URL, json={
                    "model": MODEL_NAME,
                    "prompt": "Trích xuất văn bản từ hình ảnh này.",
                    "images": [encoded_string],
                    "stream": False
                }, timeout=120.0)
                
                response.raise_for_status()
                result = response.json()
                extracted_text = result.get('response', '')
                
                return {"text": extracted_text, "message": "OCR successful"}
                
            except httpx.HTTPStatusError as e:
                # Log exactly what Ollama is complaining about (e.g. VRAM, context window)
                error_body = e.response.text
                return {"error": f"Ollama 500 Error: {error_body}", "status": "failed"}
            except httpx.RequestError as e:
                # If Ollama is not running or model not found
                return {"error": f"Ollama connection error: {str(e)}", "status": "failed"}
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")


