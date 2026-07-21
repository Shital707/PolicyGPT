import json
import time

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.models.db import ChatMessage, ChatSession, User, SessionLocal, get_db
from app.services.gemini import stream_chat
from app.services.rag import search_chunks

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    session_id: int | None = None
    message: str


@router.post("")
async def chat(payload: ChatRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    session = None
    if payload.session_id:
        session = db.query(ChatSession).get(payload.session_id)
    if not session:
        session = ChatSession(user_id=user.id, title=payload.message[:50])
        db.add(session)
        db.commit()
        db.refresh(session)

    user_msg = ChatMessage(session_id=session.id, role="user", content=payload.message)
    db.add(user_msg)
    db.commit()

    context_chunks = search_chunks(db, payload.message)
    # Confidence = the top retrieved chunk's cosine similarity score (0-1),
    # surfaced to the UI so employees can gauge how well-grounded an answer is.
    citations = [
        {"document_id": c["document_id"], "title": c["title"], "confidence": c["score"]}
        for c in context_chunks
    ]

    # Capture plain values now, before the request-scoped DB session closes.
    session_id_value = session.id
    question = payload.message
    start_time = time.monotonic()

    async def event_stream():
        full_text = ""
        yield f"data: {json.dumps({'type': 'session', 'session_id': session_id_value})}\n\n"
        async for token in stream_chat(question, context_chunks):
            full_text += token
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

        elapsed_ms = int((time.monotonic() - start_time) * 1000)

        # The original `db` session is closed by now (request already returned),
        # so open a fresh one just for this final write.
        stream_db = SessionLocal()
        try:
            assistant_msg = ChatMessage(
                session_id=session_id_value, role="assistant",
                content=full_text, citations=json.dumps(citations),
                response_ms=elapsed_ms,
            )
            stream_db.add(assistant_msg)
            stream_db.commit()
            stream_db.refresh(assistant_msg)
            yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg.id, 'citations': citations, 'response_ms': elapsed_ms})}\n\n"
        finally:
            stream_db.close()

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/history")
def history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user.id).order_by(ChatSession.created_at.desc()).all()
    return [{"id": s.id, "title": s.title, "created_at": s.created_at.isoformat()} for s in sessions]


@router.get("/history/{session_id}")
def session_messages(session_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
    return [
        {
            "id": m.id, "role": m.role, "content": m.content,
            "citations": json.loads(m.citations), "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


@router.delete("/history/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    session = db.query(ChatSession).get(session_id)
    if not session or session.user_id != user.id:
        return {"deleted": False}
    db.delete(session)
    db.commit()
    return {"deleted": True}
