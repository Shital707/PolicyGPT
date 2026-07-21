from fastapi import APIRouter

api_router = APIRouter()

from app.api.api_v1.endpoints import auth, users, departments, categories, documents, chat

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(departments.router, prefix="/departments", tags=["departments"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
