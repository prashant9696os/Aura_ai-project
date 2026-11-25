from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.routers import health, chat, documents, tickets, analytics

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Enterprise API supporting RAG Vector Embeddings, Autonomous Ticket Triage, and Streaming LLM Inference",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enable Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Register routers under /api
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(chat.router, prefix=settings.API_PREFIX)
app.include_router(documents.router, prefix=settings.API_PREFIX)
app.include_router(tickets.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "api": settings.API_PREFIX
    }