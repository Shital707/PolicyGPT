# PolicyGPT

Enterprise AI Business Policy Assistant powered by Google Gemini 2.5 Flash, FastAPI, and React 19.

## Features
- **AI Chat**: Ask questions about company policies using natural language (Gemini 2.5 Flash).
- **Document Processing**: Upload PDF, DOCX, and TXT files. Automatic text extraction.
- **Deduplication & Versioning**: Prevents duplicate uploads using SHA256 hashes.
- **Analytics Dashboard**: View usage statistics with beautiful charts.
- **Role-Based Access Control**: Super Admin, HR, and Employee roles.
- **Security**: JWT Authentication, secure password hashing, and local file storage.
- **Premium UI**: Dark mode, glassmorphism, responsive dashboard layout.

## Documentation
- [Setup Instructions](docs/setup.md)
- [Architecture Overview](docs/architecture.md)

## Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Zustand, TanStack Query, Framer Motion, Recharts.
- **Backend**: FastAPI (Python 3.13), SQLAlchemy, Alembic.
- **Database**: SQLite (Local Native execution)
- **AI Integration**: Google GenAI SDK (Gemini)

## Quick Start (Local Native)

1. **Clone the repository**
2. **Setup Backend**:
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
3. **Setup Frontend**:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
4. Access the UI at `http://localhost:5173`.

### Create the Super Admin

Seed the initial admin user by supplying credentials via environment variables (they are never hardcoded):

```powershell
cd backend
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "your-strong-password"
python seed.py
```
