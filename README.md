<div align="center">

# 🎓 Novator-AI: Autonomous AI Tutor Squad

**A comprehensive AI Tutor Web App integrating the Socratic Method, RAG, and Computer Vision (GLM-OCR).**

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Vector-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-GLM--OCR-000000?style=for-the-badge&logo=ollama&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash_Audio-Google_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

### 🎥 Video Demo

<div align="center">
  <a href="https://github.com/MinhHieu13-cmc/Novator_AI/blob/main/demo/demo_video.mp4">
    <img src="https://github.com/MinhHieu13-cmc/Novator_AI/raw/main/demo/thumbnail.png" width="800" alt="Video Demo Novator AI" style="border-radius: 12px; border: 2px solid #ddd;" />
    <br/>
    <b>▶️ Bấm vào hình trên để xem trực tiếp Video Demo (Full HD - 99MB) 🚀</b>
  </a>
</div>


</div>

---

## 📌 Overview
Welcome to **Novator-AI** - an AI Tutor Web App I developed to help students study independently using the Socratic method. Instead of providing immediate answers, this system acts like a patient tutor: analyzing mistakes, asking guiding questions, and only offering the solution when the student has demonstrated sufficient effort.

The project integrates state-of-the-art AI features:
- **Ultra-low latency Realtime Audio Chat** powered by the Google Gemini Live API.
- **RAG (Retrieval-Augmented Generation)**: Ingests vast amounts of PDF Textbooks as a foundation for responses.
- **OCR (Optical Character Recognition)**: Decodes handwritten text from students' exercise images using an internal GLM-OCR model.

---

## 🏗 System Architecture
I designed this project using Clean Architecture, completely separating the components:
- `frontend/`: Next.js 14 (React, TypeScript, TailwindCSS). Handles the UI and direct WebSocket streams with Gemini.
- `backend/`: FastAPI (Python). Handles heavy workloads (RAG, Vector Store, image compression, and OCR processing).
- **Database**: Strictly utilizes Supabase (PostgreSQL + pgvector).

---

## 🚀 Installation & Local Setup
If you want to clone this project to tinker with it, please follow these steps sequentially:

### 1. Initialize Postgres Vector Database (Supabase)
- Log in / Register an account at [Supabase.com](https://supabase.com).
- Create a new Project.
- Go to the **SQL Editor** and execute the entire SQL block below to set up vector storage:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;

  CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT,
    embedding VECTOR(3072),
    metadata JSONB
  );

  CREATE FUNCTION match_documents (
    query_embedding VECTOR(3072),
    match_count INT DEFAULT 5
  ) RETURNS TABLE (
    id UUID,
    content TEXT,
    similarity FLOAT
  ) LANGUAGE plpgsql AS $$
  BEGIN
    RETURN QUERY
    SELECT d.id, d.content, 1 - (d.embedding <=> query_embedding) AS similarity
    FROM documents d
    ORDER BY d.embedding <=> query_embedding
    LIMIT match_count;
  END;
  $$;
  ```

### 2. Set Up the Backend (FastAPI Python)
System requirements: `Python 3.9+` installed.

1. Navigate to the backend workspace:
   ```bash
   cd backend
   ```
2. Install libraries (highly recommend creating a `.venv` virtual environment):
   ```bash
   pip install -r requirements.txt
   ```
3. Create a secret `.env` file (keep this completely private):
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. Start the Web Server for the Backend:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 3. Set Up the Frontend (Next.js)
System requirements: `Node.js v18+` installed.

1. Navigate to the Frontend directory:
   ```bash
   cd frontend
   ```
2. Install Modules:
   ```bash
   npm install
   ```
3. Declare your API Key in the `.env.local` file:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. Run the Web Interface:
   ```bash
   npm run dev
   ```
   Then open your browser at `http://localhost:3000`.

### 4. ⚠️ Activate the Internal OCR Feature
The image OCR feature is incredibly resource-heavy, so I configured it to run locally on an LLM server (instead of relying on the Cloud) to save costs and optimize data privacy.
You need to install the **Ollama** platform:
1. Download the app at [Ollama.com](https://ollama.com).
2. Pull and run the `glm-ocr` model (VRAM-intensive, minimum 6GB dedicated VGA recommended):
   ```bash
   ollama run glm-ocr
   ```
3. As soon as you hit upload on the Frontend, the system will ping `http://localhost:11434` to automatically scan your images.

---

## 🌍 Deployment Guide (For the Open Source Community)
If you clone this source and want to bring it online, take note of my deployment tricks:

* **For the Frontend:** Just throw it on **Vercel**. Select the Root directory as `frontend/`. Vercel will automatically build Next.js natively with excellent SSL. Remember to fill in the `NEXT_PUBLIC_GEMINI_API_KEY` configuration variable.
* **For the Backend:** **Koyeb** or **Render** are the two best free Web Services for FastAPI. 
* **⚡ Trick to Handle Local Ollama OCR when Deploying to the Cloud:**
Deploying the Backend to the Cloud = losing the internal Ollama instance (Resulting in 500/Connection Refused errors). My workaround: Keep pushing the Frontend to Vercel. However, plug your personal laptop into the wall and run the Backend at home (running both Uvicorn + Ollama simultaneously), then use the `Ngrok` app to tunnel a Public link from port 8000 to the outside world. Change the backend URL on your Vercel Frontend to point to that Ngrok link. Boom! You now have a majestic Web Server powered by the sheer brute force of your own personal hardware!

---
*This project was completed as an open-source initiative. Please leave a Star if you find this project helpful!*
