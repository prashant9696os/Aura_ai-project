# AURA AI – Enterprise Intelligence Platform

AURA AI is an AI-powered enterprise intelligence platform designed to provide intelligent conversations, document-based question answering, and support ticket management through a modern web application.

The platform combines Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and FastAPI to deliver context-aware AI responses using uploaded documents.

## Key Features

- **AI-Powered Chat:** Ask questions and receive intelligent responses.
- **Document Intelligence:** Upload documents and ask questions based on their content.
- **Retrieval-Augmented Generation (RAG):** Retrieve relevant document information to generate context-aware answers.
- **Streaming Responses:** Receive AI responses through a streaming chat API.
- **Ticket Management:** Manage support tickets through the application.
- **Analytics Dashboard:** View application insights and operational information.
- **Local AI Inference:** Run AI responses using Ollama without requiring a paid OpenAI API.
- **Prometheus Monitoring:** Expose backend application metrics through the `/metrics` endpoint.

## Technology Stack

### Backend
- Python
- FastAPI
- Uvicorn
- SQL/JSON-based application storage (depending on configured modules)
- HTTPX
- Prometheus FastAPI Instrumentator

### Frontend
- React.js
- JavaScript
- HTML
- CSS
- Vite

### Artificial Intelligence
- Ollama
- Qwen2.5 1.5B
- Large Language Models (LLMs)
- Retrieval-Augmented Generation (RAG)
- Semantic Search

### Monitoring
- Prometheus
- Prometheus FastAPI Instrumentator

## Project Architecture

```text
AURA AI/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── health.py
│   │   │   ├── chat.py
│   │   │   ├── documents.py
│   │   │   ├── tickets.py
│   │   │   └── analytics.py
│   │   ├── services/
│   │   │   ├── llm_service.py
│   │   │   └── rag_service.py
│   │   ├── config.py
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── context/
│   └── package.json
│
├── README.md
└── .gitignore
```

*Note: This is a logical overview. Actual filenames and folders may differ.*

## Installation and Setup

### Prerequisites

- Python 3.10+
- Node.js and npm
- Ollama
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd AI_project
```

### 2. Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

### 3. Install Local AI Model

Install and start Ollama, then download the model:

```bash
ollama pull qwen2.5:1.5b
```

Verify the installed model:

```bash
ollama list
```

The local Ollama API normally runs at:

```text
http://127.0.0.1:11434
```

### 4. Run Backend

From the backend directory:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Backend URL:

```text
http://127.0.0.1:8000
```

### 5. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `/` | Application information |
| `/docs` | Interactive API documentation |
| `/redoc` | ReDoc documentation |
| `/api/health` | Backend health check |
| `/api/chat/stream` | Streaming AI chat |
| `/api/documents` | Document management |
| `/api/documents/upload` | Upload documents |
| `/api/tickets` | Ticket management |
| `/metrics` | Prometheus metrics |

Refer to `/docs` for the current request methods and API schemas.

## How RAG Works

1. User uploads a document.
2. The backend processes the document.
3. Document content is divided into smaller chunks.
4. Relevant information is retrieved through semantic search.
5. Retrieved context is provided to the local language model.
6. The model generates a context-aware response.

## Monitoring

AURA AI uses Prometheus FastAPI Instrumentator to expose application metrics.

Metrics endpoint:

```text
http://127.0.0.1:8000/metrics
```

## Configuration and Security

- Keep environment variables and credentials outside source code.
- Never commit `.env` files or API keys.
- Use `.env.example` with placeholder values for configuration documentation.
- Validate uploaded documents before processing.
- Configure CORS and access controls appropriately before deployment.

## Current Development Status

AURA AI is under active development and local testing.

The backend API, local Ollama model integration, document-based question answering, streaming chat, and Prometheus metrics endpoint have been tested locally.

## Future Enhancements

- Improved document processing and retrieval.
- Advanced AI-powered ticket classification.
- User authentication and role-based access.
- Enhanced analytics and monitoring.
- Cloud deployment and scalability improvements.

## License

This project is currently under development. A license can be added before public distribution.
