from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.models.db import Notification, User, get_db

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("")
def list_notifications(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    notifications = db.query(Notification).order_by(Notification.created_at.desc()).limit(20).all()
    return [
        {"id": n.id, "message": n.message, "document_id": n.document_id, "created_at": n.created_at.isoformat()}
        for n in notifications
    ]
