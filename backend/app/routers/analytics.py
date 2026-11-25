from fastapi import APIRouter
from app.models.schemas import AnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["Telemetry & Observability"])

@router.get("", response_model=AnalyticsResponse)
async def get_analytics_metrics():
    token_trends = [
        {"day": "Mon", "tokens": 32000, "queries": 1420},
        {"day": "Tue", "tokens": 45000, "queries": 1980},
        {"day": "Wed", "tokens": 38000, "queries": 1650},
        {"day": "Thu", "tokens": 52000, "queries": 2340},
        {"day": "Fri", "tokens": 68000, "queries": 3120},
        {"day": "Sat", "tokens": 28000, "queries": 1190},
        {"day": "Sun", "tokens": 42000, "queries": 1890},
    ]

    model_costs = [
        {"name": "GPT-4o Omni", "cost": "$142.50", "percentage": 42, "color": "var(--accent-emerald)"},
        {"name": "Claude 3.5 Sonnet", "cost": "$98.20", "percentage": 29, "color": "var(--accent-purple)"},
        {"name": "DeepSeek R1", "cost": "$54.00", "percentage": 16, "color": "var(--primary-500)"},
        {"name": "Gemini 1.5 Pro", "cost": "$44.10", "percentage": 13, "color": "var(--accent-cyan)"},
    ]

    latency_buckets = [
        {"range": "< 20ms (Edge Cache)", "pct": 64, "color": "var(--accent-emerald)"},
        {"range": "20 - 50ms (Direct Node)", "pct": 26, "color": "var(--primary-500)"},
        {"range": "50 - 100ms (Heavy RAG)", "pct": 8, "color": "var(--accent-amber)"},
        {"range": "> 100ms (Complex Re-rank)", "pct": 2, "color": "var(--accent-rose)"},
    ]

    top_topics = [
        {"topic": "Vector Search & HNSW Indexing", "queries": 842, "share": "34%"},
        {"topic": "Customer SLA Incident Triage", "queries": 512, "share": "21%"},
        {"topic": "Distributed Architecture Blueprint", "queries": 430, "share": "17%"},
        {"topic": "Security & SOC2 Data Scrubbing", "queries": 380, "share": "15%"},
        {"topic": "API Token Quota & Cost Optimization", "queries": 320, "share": "13%"},
    ]

    return AnalyticsResponse(
        tokenTrends=token_trends,
        modelCosts=model_costs,
        latencyBuckets=latency_buckets,
        topTopics=top_topics,
        totalQueries=13590,
        totalTokens=305000,
        slaComplianceRate="99.4%"
    )
