from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.models.db import AuditLog, User, get_db

router = APIRouter(prefix="/api/audit-logs", tags=["audit"])


@router.get("")
def list_audit_logs(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    return [
        {
            "id": l.id, "user_id": l.user_id, "action": l.action,
            "detail": l.detail, "created_at": l.created_at.isoformat(),
        }
        for l in logs
    ]
