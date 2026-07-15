# PolicyGPT

Enterprise AI Business Policy Assistant powered by Google Gemini 2.5 Flash, FastAPI, and React 19.

## Features
- **AI Chat**: Ask questions about company policies using natural language (Gemini 2.5 Flash).
- **Document Processing**: Upload PDF, DOCX, and TXT files. Automatic text extraction.
- **Deduplication & Versioning**: Prevents duplicate uploads using SHA256 hashes.
- **Analytics Dashboard**: View usage statistics with beautiful charts.
- **Role-Based Access Control**: Super Admin, HR, and Employee roles.
- **Security**: JWT Authentication, secure password hashing, and Docker isolation.

## Architecture
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Zustand, TanStack Query, Framer Motion, Recharts.
- **Backend**: FastAPI (Python 3.12), SQLAlchemy, Alembic, Celery, Redis.
- **Database**: PostgreSQL 16.
- **Deployment**: Docker, Docker Compose, Nginx.

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Google Gemini API Key

### Installation

1. Clone the repository and navigate to the project directory.
2. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and add your `GEMINI_API_KEY`.
4. Build and start the services using Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
5. Once the containers are running, you can generate the database migrations and create the initial superuser (you'll need to run this command inside the backend container).
   ```bash
   docker-compose exec backend alembic revision --autogenerate -m "Initial schema"
   docker-compose exec backend alembic upgrade head
   ```

### Accessing the Application
- **Frontend UI**: http://localhost:3000
- **Backend API (Swagger)**: http://localhost:8000/docs
- **PgAdmin (Optional)**: Setup separately if needed to view PostgreSQL on port 5432.
