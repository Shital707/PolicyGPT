# Architecture Overview

PolicyGPT follows a modern, decoupled architecture designed for fast iteration and scalable performance.

## High-Level Components

### 1. Frontend (Client Layer)
- **Framework**: React 19 bootstrapped with Vite.
- **Styling**: Tailwind CSS v4 coupled with Framer Motion for smooth, hardware-accelerated animations and glassmorphism UI.
- **State Management**: 
  - `Zustand` for global state (e.g., authentication, user sessions).
  - `TanStack Query` (React Query) for server state (data fetching, caching, and mutations).
- **Routing**: React Router v6.
- **Visualizations**: Recharts for dashboard analytics.

### 2. Backend (API Layer)
- **Framework**: FastAPI for high-performance, asynchronous endpoints.
- **ORM**: SQLAlchemy for database interactions.
- **Validation**: Pydantic for strict schema validation on request/response bodies.
- **Authentication**: JWT (JSON Web Tokens) with `passlib` and `bcrypt` for password hashing.
- **File Storage**: Local filesystem (`/uploads`) mapped dynamically to the backend root.

### 3. Database Layer
- **Engine**: SQLite for local development (`policygpt.db`). Easily swapable to PostgreSQL in production by changing the `SQLALCHEMY_DATABASE_URI`.
- **Migrations**: Alembic for database version control and schema migrations.

### 4. AI & NLP Layer
- **Model**: Google Gemini 2.5 Flash via the `google-genai` SDK.
- **Capabilities**: Document Q&A, summarization, and extracting insights from policy text.
- **Processing**: Uploaded documents (PDF, DOCX, TXT) are parsed natively using `PyPDF2` and `python-docx`, with their raw text stored in the DB for context-injected AI prompts.

## Directory Structure

```text
PolicyGPT/
├── backend/
│   ├── alembic/              # DB Migrations
│   ├── app/
│   │   ├── api/              # FastAPI Endpoints & Dependencies
│   │   ├── core/             # Settings, Security & Config
│   │   ├── db/               # SQLAlchemy Models & Sessions
│   │   ├── schemas/          # Pydantic Models
│   │   └── services/         # Business Logic & AI Integrations
│   ├── uploads/              # Local Document Storage
│   └── main.py               # Application Entrypoint
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/       # Reusable UI & Layouts
│       ├── lib/              # Axios instance
│       ├── pages/            # Dashboard, Chat, Settings
│       └── store/            # Zustand Stores
└── docs/                     # Project Documentation
```
