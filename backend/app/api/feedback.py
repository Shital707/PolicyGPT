from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.models.db import Feedback, User, get_db

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


class FeedbackRequest(BaseModel):
    message_id: int
    rating: int  # 1 or -1
    comment: str = ""


@router.post("")
def submit_feedback(payload: FeedbackRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    fb = Feedback(message_id=payload.message_id, user_id=user.id, rating=payload.rating, comment=payload.comment)
    db.add(fb)
    db.commit()
    return {"submitted": True}
