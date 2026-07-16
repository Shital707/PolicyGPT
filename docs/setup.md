# Setup Instructions

PolicyGPT is configured to run natively on your machine without Docker for a faster development experience. It utilizes a local SQLite database.

## Prerequisites
- Node.js (v18+)
- Python (v3.12 or v3.13)
- Git

## 1. Environment Configuration
Create a `.env` file in the root directory `C:\Users\SURYAWANSHI\Desktop\PolicyGPT\.env` with the following variables:

```ini
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Backend Database (SQLite)
# No DB credentials needed as it's SQLite. 

# Frontend
VITE_API_URL=http://localhost:8000/api/v1
```

## 2. Backend Setup
The backend is built with FastAPI and Python.

1. Open a terminal and navigate to the backend directory:
   ```powershell
   cd backend
   ```
2. Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Apply database migrations to create the SQLite file (`policygpt.db`):
   ```powershell
   alembic upgrade head
   ```
5. Seed the initial admin user:
   ```powershell
   python seed.py
   ```
6. Start the development server:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```

## 3. Frontend Setup
The frontend is a Vite + React 19 application.

1. Open a new terminal and navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
2. Install Node modules:
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```

## 4. Access the Application
- Frontend Dashboard: `http://localhost:5173`
- Backend API Docs (Swagger UI): `http://localhost:8000/docs`

**Create the Super Admin:**

Run the seed script with credentials supplied via environment variables (never hardcoded):

```powershell
cd backend
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "your-strong-password"
python seed.py
```
