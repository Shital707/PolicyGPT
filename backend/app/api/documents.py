import os
import shutil
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.models.db import (AuditLog, Chunk, Document, DocumentVersion,
                            Notification, get_db, User)
from app.services.gemini import compare_document_versions, summarize_document
from app.services.rag import extract_text, ingest_document

router = APIRouter(prefix="/api/documents", tags=["documents"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXT = (".pdf", ".docx", ".txt")


@router.post("/upload")
def upload_document(
    title: str = Form(...),
    category: str = Form("general"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if not file.filename.lower().endswith(ALLOWED_EXT):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, or TXT files are allowed")

    safe_name = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, safe_name)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_text = extract_text(filepath, file.filename)
    if not raw_text.strip():
        os.remove(filepath)
        raise HTTPException(status_code=400, detail="No extractable text found in document")

    # Version handling: if a document with the same title already exists,
    # snapshot its current content into document_versions, then update it in place.
    existing = db.query(Document).filter(Document.title.ilike(title)).first()

    if existing:
        db.add(DocumentVersion(
            document_id=existing.id,
            version_number=existing.version,
            raw_text=existing.raw_text,
        ))
        db.query(Chunk).filter(Chunk.document_id == existing.id).delete()
        old_filepath = os.path.join(UPLOAD_DIR, existing.filename)
        if os.path.exists(old_filepath):
            os.remove(old_filepath)

        existing.filename = safe_name
        existing.category = category
        existing.version += 1
        existing.summary = ""  # invalidate cached summary; regenerate on request
        db.commit()
        db.refresh(existing)
        document = existing
        action = "document.reindex"
    else:
        document = Document(title=title, category=category, filename=safe_name, uploaded_by=admin.id)
        db.add(document)
        db.commit()
        db.refresh(document)
        action = "document.upload"

    try:
        ingest_document(db, document, raw_text)
    except Exception as e:
        if action == "document.upload":
            db.delete(document)
            db.commit()
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=502, detail=f"Failed to index document (Gemini embedding error): {e}")

    db.add(AuditLog(user_id=admin.id, action=action, detail=f"{title} (v{document.version})"))
    db.add(Notification(
        message=f"{'New version of' if action == 'document.reindex' else 'New policy uploaded:'} \"{title}\" (v{document.version})",
        document_id=document.id,
    ))
    db.commit()

    return {"id": document.id, "title": document.title, "version": document.version, "chunks_created": True}


@router.get("/")
def list_documents(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return [
        {
            "id": d.id, "title": d.title, "category": d.category,
            "version": d.version, "created_at": d.created_at.isoformat(),
        }
        for d in docs
    ]


@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    doc = db.query(Document).get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    filepath = os.path.join(UPLOAD_DIR, doc.filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    db.add(AuditLog(user_id=admin.id, action="document.delete", detail=doc.title))
    db.delete(doc)
    db.commit()
    return {"deleted": True}


@router.get("/{document_id}/versions")
def list_versions(document_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    doc = db.query(Document).get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    versions = db.query(DocumentVersion).filter(DocumentVersion.document_id == document_id).order_by(DocumentVersion.version_number.desc()).all()
    return {
        "current_version": doc.version,
        "previous_versions": [
            {"id": v.id, "version_number": v.version_number, "created_at": v.created_at.isoformat()}
            for v in versions
        ],
    }


@router.post("/{document_id}/summarize")
def summarize(document_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    doc = db.query(Document).get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not doc.summary:
        doc.summary = summarize_document(doc.title, doc.raw_text)
        db.commit()
    return {"document_id": doc.id, "title": doc.title, "summary": doc.summary}


@router.post("/{document_id}/compare/{version_number}")
def compare(document_id: int, version_number: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    doc = db.query(Document).get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    old_version = db.query(DocumentVersion).filter(
        DocumentVersion.document_id == document_id,
        DocumentVersion.version_number == version_number,
    ).first()
    if not old_version:
        raise HTTPException(status_code=404, detail="That version was not found")
    diff = compare_document_versions(doc.title, old_version.raw_text, doc.raw_text)
    return {"document_id": doc.id, "title": doc.title, "compared_version": version_number, "diff": diff}
