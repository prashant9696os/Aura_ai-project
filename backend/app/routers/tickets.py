from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import TicketCreate, TicketStatusUpdate, TicketResponse
from app.services.triage_service import triage_service

router = APIRouter(prefix="/tickets", tags=["Autonomous Ticket Triage"])

@router.get("", response_model=List[TicketResponse])
async def list_tickets():
    return triage_service.get_all_tickets()

@router.post("", response_model=TicketResponse)
async def create_new_ticket(ticket_in: TicketCreate):
    created = triage_service.create_ticket(ticket_in.model_dump())
    return created

@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket_status(ticket_id: str, update_in: TicketStatusUpdate):
    updated = triage_service.update_status(ticket_id, update_in.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return updated

@router.post("/{ticket_id}/triage", response_model=TicketResponse)
async def regenerate_triage(ticket_id: str):
    updated = triage_service.regenerate_triage(ticket_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return updated
