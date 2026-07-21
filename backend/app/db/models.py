from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    HR = "HR"
    EMPLOYEE = "EMPLOYEE"

class Department(Base):
    __tablename__ = "departments"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String, unique=True, index=True, nullable=False)
    
    users = relationship("User", back_populates="department")

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE, nullable=False)
    department_id = Column(String, ForeignKey("departments.id"))
    is_active = Column(Boolean(), default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    department = relationship("Department", back_populates="users")
    documents = relationship("Document", back_populates="uploader")
    chat_sessions = relationship("ChatSession", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Category(Base):
    __tablename__ = "categories"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String, unique=True, index=True, nullable=False)
    
    documents = relationship("Document", back_populates="category")

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    title = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=False) # Extracted text
    file_path = Column(String, nullable=False)
    file_hash = Column(String, unique=True, index=True, nullable=False)
    uploader_id = Column(String, ForeignKey("users.id"))
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    uploader = relationship("User", back_populates="documents")
    category = relationship("Category", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="source_document")

class DocumentVersion(Base):
    __tablename__ = "document_versions"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"))
    version_num = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    changes_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    document = relationship("Document", back_populates="versions")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    title = Column(String, default="New Session")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String, nullable=False) # "user" or "ai"
    content = Column(Text, nullable=False)
    confidence = Column(Float, nullable=True)
    source_document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    page_number = Column(Integer, nullable=True)
    section_title = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    session = relationship("ChatSession", back_populates="messages")
    source_document = relationship("Document", back_populates="chat_messages")
    feedback = relationship("Feedback", back_populates="message", uselist=False, cascade="all, delete-orphan")

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    message_id = Column(String, ForeignKey("chat_messages.id"), unique=True)
    is_helpful = Column(Boolean, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    message = relationship("ChatMessage", back_populates="feedback")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    target_type = Column(String, nullable=True)
    target_id = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="audit_logs")
