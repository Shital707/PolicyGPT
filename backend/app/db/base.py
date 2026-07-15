# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base
from app.db.models import User, Department, Category, Document, DocumentVersion, ChatSession, ChatMessage, Feedback, AuditLog
