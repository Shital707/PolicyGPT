from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import (create_access_token, hash_password,
                                verify_password)
from app.models.db import AuditLog, User, get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str = "employee"
    department: str = "general"


class UserOut(BaseModel):
    id: int
    email: str
    role: str
    department: str

    class Config:
        from_attributes = True


@router.post("/register", response_model=UserOut)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        department=payload.department,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    db.add(AuditLog(user_id=user.id, action="auth.login", detail=user.email))
    db.commit()
    return {"access_token": token, "token_type": "bearer", "role": user.role}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
