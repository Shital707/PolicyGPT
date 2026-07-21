import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import audit, auth, analytics, chat, documents, feedback, notifications
from app.models.db import init_db

app = FastAPI(title="PolicyGPT API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(feedback.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(audit.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Serve the built React frontend (single-container deployment for AWS App Runner)
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")
