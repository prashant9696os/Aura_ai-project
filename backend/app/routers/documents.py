from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import DocumentMetadata
from app.services.rag_service import rag_service

router = APIRouter(prefix="/documents", tags=["Knowledge Base & RAG"])

@router.get("", response_model=List[DocumentMetadata])
async def list_documents():
    return rag_service.get_documents()

@router.post("/upload", response_model=DocumentMetadata)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    try:
        content = await file.read()
        doc = rag_service.add_document(file.filename, content)
        return DocumentMetadata(**doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    success = rag_service.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document removed successfully", "id": doc_id}
