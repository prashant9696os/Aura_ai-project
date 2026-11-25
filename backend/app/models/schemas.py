from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = "ok"
    app: str = "AURA AI Enterprise Intelligence"
    version: str = "1.0.0"
    mode: str = "online"
    features: List[str] = [
        "Semantic Vector Search",
        "RAG Document Grounding",
        "Autonomous AI Ticket Triage",
        "Streaming LLM Inference",
        "Real-Time Telemetry Analytics"
    ]

class ChatRequest(BaseModel):
    prompt: str
    model: str = "GPT-4o Omni"
    systemPersona: str = "Senior AI Architect"
    documents: Optional[List[str]] = []
    temperature: float = 0.7
    maxTokens: int = 4096

class ChatResponse(BaseModel):
    response: str
    model: str
    tokens: int
    latency: str
    sources: List[str] = []

class DocumentMetadata(BaseModel):
    id: str
    name: str
    size: str
    type: str
    tokens: int
    chunks: int
    uploadedAt: str
    status: str = "indexed"
    summary: str

class AITriage(BaseModel):
    urgency: str
    rootCauseHypothesis: str
    confidence: str
    suggestedResolution: str
    suggestedDraft: str

class TicketMessage(BaseModel):
    sender: str
    text: str

class TicketCreate(BaseModel):
    title: str
    customer: Optional[str] = "Enterprise Client"
    email: Optional[str] = "client@enterprise.com"
    priority: Optional[str] = "Urgent"
    category: Optional[str] = "Infrastructure"
    description: Optional[str] = ""

class TicketStatusUpdate(BaseModel):
    status: str

class TicketResponse(BaseModel):
    id: str
    title: str
    customer: str
    email: str
    priority: str
    status: str
    category: str
    sentiment: str
    sentimentScore: float
    createdAt: str
    slaDue: str
    messages: List[Dict[str, str]]
    aiTriage: Dict[str, Any]

class AnalyticsResponse(BaseModel):
    tokenTrends: List[Dict[str, Any]]
    modelCosts: List[Dict[str, Any]]
    latencyBuckets: List[Dict[str, Any]]
    topTopics: List[Dict[str, Any]]
    totalQueries: int
    totalTokens: int
    slaComplianceRate: str
