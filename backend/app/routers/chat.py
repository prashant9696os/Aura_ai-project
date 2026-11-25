import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm_service import llm_service

router = APIRouter(tags=["Chat & LLM Inference"])

@router.post("/chat", response_model=ChatResponse)
async def chat_completion(req: ChatRequest):
    result = await llm_service.generate_response(
        prompt=req.prompt,
        model=req.model,
        system_persona=req.systemPersona,
        document_ids=req.documents,
        temperature=req.temperature,
    )
    return ChatResponse(**result)

@router.post("/chat/stream")
async def chat_streaming(req: ChatRequest):
    async def event_generator():
        async for token in llm_service.stream_response(
            prompt=req.prompt,
            model=req.model,
            system_persona=req.systemPersona,
            document_ids=req.documents,
        ):
            # Send SSE formatted data
            yield f"data: {json.dumps({'token': token})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
