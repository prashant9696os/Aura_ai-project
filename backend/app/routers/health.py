from fastapi import APIRouter
from app.models.schemas import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def check_health():
    return HealthResponse()
