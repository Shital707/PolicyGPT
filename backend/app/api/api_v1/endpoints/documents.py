import os
import shutil
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.api import deps
from app.db.models import Document, DocumentVersion, User
from app.schemas.document import Document as DocumentSchema, DocumentWithContent
from app.services.document_service import calculate_file_hash, extract_text

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentSchema)
async def upload_document(
    title: str = Form(...),
    category_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a new policy document.
    """
    if current_user.role.name == "EMPLOYEE":
        raise HTTPException(status_code=403, detail="Not authorized to upload documents")

    # Calculate hash to detect duplicates
    file_bytes = await file.read()
    file_hash = calculate_file_hash(file_bytes)
    
    existing_doc = db.query(Document).filter(Document.file_hash == file_hash).first()
    if existing_doc:
        raise HTTPException(status_code=400, detail="This document has already been uploaded.")

    # Save file
    file_location = os.path.join(UPLOAD_DIR, f"{file_hash}_{file.filename}")
    with open(file_location, "wb") as f:
        f.write(file_bytes)
    
    # Extract text
    try:
        extracted_text = extract_text(file_location, file.filename)
    except Exception as e:
        os.remove(file_location)
        raise HTTPException(status_code=400, detail=f"Failed to extract text: {str(e)}")

    # Store in DB
    document = Document(
        title=title,
        content=extracted_text,
        file_path=file_location,
        file_hash=file_hash,
        uploader_id=current_user.id,
        category_id=category_id
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Create initial version
    version = DocumentVersion(
        document_id=document.id,
        version_num=1,
        content=extracted_text,
        changes_summary="Initial upload"
    )
    db.add(version)
    db.commit()

    return document

@router.get("/", response_model=List[DocumentSchema])
def read_documents(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve documents.
    """
    documents = db.query(Document).offset(skip).limit(limit).all()
    return documents

@router.get("/{id}", response_model=DocumentWithContent)
def read_document(
    id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get document by ID.
    """
    document = db.query(Document).filter(Document.id == id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document
