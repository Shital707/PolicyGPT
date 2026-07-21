from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.models import ChatSession, ChatMessage, Document, User
from app.schemas.chat import ChatSession as ChatSessionSchema, ChatMessageCreate, ChatMessage as ChatMessageSchema
from app.services.ai_service import get_policy_answer

router = APIRouter()

@router.post("/sessions", response_model=ChatSessionSchema)
def create_session(
    title: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new chat session.
    """
    session = ChatSession(user_id=current_user.id, title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/sessions/{session_id}/message", response_model=ChatMessageSchema)
def create_message(
    session_id: str,
    msg_in: ChatMessageCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Send a message to Gemini and get a response based on policies.
    """
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Save user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=msg_in.question)
    db.add(user_msg)
    db.commit()

    # Get document text context (If document_id is provided use that, else use all or top docs - for now simple concatenation)
    if msg_in.document_id:
        docs = db.query(Document).filter(Document.id == msg_in.document_id).all()
    else:
        # In a real enterprise app without RAG, sending ALL docs might exceed limits. 
        # We'll just fetch a few latest for demonstration or require document selection.
        docs = db.query(Document).limit(5).all()
    
    context_text = "\n\n".join([f"--- Document: {d.title} (ID: {d.id}) ---\n{d.content}" for d in docs])
    
    if not context_text:
        ai_msg = ChatMessage(
            session_id=session.id, 
            role="ai", 
            content="I couldn't find any policy documents to answer your question."
        )
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)
        return ai_msg

    # Call Gemini
    ai_response = get_policy_answer(msg_in.question, context_text)
    
    answer = ai_response.get("answer", "Error generating answer.")
    confidence = ai_response.get("confidence", 0.0)
    section = ai_response.get("section_title")
    page = ai_response.get("page_number")
    
    ai_msg = ChatMessage(
        session_id=session.id,
        role="ai",
        content=answer,
        confidence=confidence,
        section_title=section,
        page_number=page,
        source_document_id=docs[0].id if docs else None # Approximation
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    
    return ai_msg
