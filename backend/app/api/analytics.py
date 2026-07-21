import json
from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.models.db import ChatMessage, ChatSession, Document, Feedback, User, get_db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_documents = db.query(Document).count()
    total_users = db.query(User).count()
    questions_asked = db.query(ChatMessage).filter(ChatMessage.role == "user").count()

    assistant_messages = db.query(ChatMessage).filter(ChatMessage.role == "assistant").all()
    avg_response_ms = (
        sum(m.response_ms or 0 for m in assistant_messages) / len(assistant_messages)
        if assistant_messages else 0
    )

    helpful = db.query(Feedback).filter(Feedback.rating == 1).count()
    not_helpful = db.query(Feedback).filter(Feedback.rating == -1).count()
    total_feedback = helpful + not_helpful
    accuracy_pct = round((helpful / total_feedback) * 100, 1) if total_feedback else None

    # Popular policies: tally how often each document_id appears across all citations
    doc_hits = Counter()
    for m in assistant_messages:
        try:
            for c in json.loads(m.citations or "[]"):
                doc_hits[c["document_id"]] += 1
        except (json.JSONDecodeError, KeyError):
            continue
    popular = []
    for doc_id, count in doc_hits.most_common(5):
        doc = db.query(Document).get(doc_id)
        if doc:
            popular.append({"document_id": doc_id, "title": doc.title, "citation_count": count})

    return {
        "total_documents": total_documents,
        "total_users": total_users,
        "questions_asked": questions_asked,
        "avg_response_ms": round(avg_response_ms),
        "feedback_helpful": helpful,
        "feedback_not_helpful": not_helpful,
        "accuracy_pct": accuracy_pct,
        "popular_policies": popular,
    }


@router.get("/questions")
def recent_questions(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.role == "user")
        .order_by(ChatMessage.created_at.desc())
        .limit(50)
        .all()
    )
    return [{"id": m.id, "content": m.content, "created_at": m.created_at.isoformat()} for m in messages]
