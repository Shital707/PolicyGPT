import json
from datetime import datetime

from sqlalchemy import (Column, DateTime, ForeignKey, Integer, String, Text,
                         create_engine)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="employee")  # super_admin | hr_admin | employee
    department = Column(String, default="general")
    created_at = Column(DateTime, default=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, default="general")
    filename = Column(String, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    version = Column(Integer, default=1)
    raw_text = Column(Text, default="")
    summary = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")


class DocumentVersion(Base):
    """Snapshot of a document's previous content, kept when a same-titled
    document is re-uploaded, so we can diff old vs new for version comparison."""
    __tablename__ = "document_versions"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    version_number = Column(Integer, default=1)
    raw_text = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    content = Column(Text, nullable=False)
    embedding = Column(Text, nullable=False)  # JSON-encoded float list
    chunk_index = Column(Integer, default=0)
    document = relationship("Document", back_populates="chunks")

    def get_embedding(self):
        return json.loads(self.embedding)


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="New chat")
    created_at = Column(DateTime, default=datetime.utcnow)
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    role = Column(String)  # user | assistant
    content = Column(Text)
    citations = Column(Text, default="[]")  # JSON list of {document_id, title, score}
    response_ms = Column(Integer, default=0)  # time to generate (assistant messages only)
    created_at = Column(DateTime, default=datetime.utcnow)
    session = relationship("ChatSession", back_populates="messages")


class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("chat_messages.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)  # 1 = helpful, -1 = not helpful
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)  # e.g. "document.upload", "document.delete", "auth.login"
    detail = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
