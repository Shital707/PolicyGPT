from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatMessageBase(BaseModel):
    content: str
    role: str

class ChatMessageCreate(BaseModel):
    question: str
    document_id: Optional[str] = None # Filter by document if needed

class ChatMessage(ChatMessageBase):
    id: str
    session_id: str
    confidence: Optional[float] = None
    source_document_id: Optional[str] = None
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class ChatSessionBase(BaseModel):
    title: str

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSession(ChatSessionBase):
    id: str
    user_id: str
    created_at: datetime
    messages: List[ChatMessage] = []

    model_config = {"from_attributes": True}
