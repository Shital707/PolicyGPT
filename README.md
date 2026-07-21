# PolicyGPT — AI Business Policy Assistant

An internal RAG-powered chat assistant that answers employee questions from
uploaded company policy documents (HR, IT, Finance, Travel, Procurement,
Compliance), with cited sources. Built for the Vibe Coding Masterclass
capstone.

## Tech stack

| Layer      | Choice |
|------------|--------|
| Frontend   | React 18 + Vite + TypeScript + Tailwind CSS, Zustand, React Router, Axios |
| Backend    | FastAPI, SQLAlchemy, JWT auth, SSE streaming |
| AI / RAG   | Google Gemini 2.5 Flash (chat) + text-embedding-004 (embeddings), manual cosine-similarity retrieval |
| Storage    | SQLite (chunks + embeddings as JSON) — swappable for Postgres/pgvector later |
| Container  | Single multi-stage Dockerfile (frontend build → served by FastAPI) |
| Deployment | AWS App Runner, free tier |

## Architecture

```
 Browser (React SPA)
        │  fetch() + JWT bearer, SSE stream
        ▼
 FastAPI (single container)
   ├─ /api/auth        login / register / me
   ├─ /api/documents   upload → extract text → chunk → embed (Gemini) → store
   ├─ /api/chat        embed question → cosine search top-k chunks →
   │                    stream Gemini response token-by-token (SSE)
   └─ /api/feedback    thumbs up/down on answers
        │
        ▼
 SQLite (users, documents, chunks+embeddings, chat_sessions, chat_messages, feedback)
```

RAG flow for each question:
1. Embed the employee's question with Gemini's embedding model.
2. Compute cosine similarity against every stored chunk embedding, take top 4.
3. Build a grounded prompt: system instructions + retrieved excerpts (labeled
   by source document) + the question.
4. Stream Gemini's response to the browser via Server-Sent Events; render
   token-by-token.
5. Persist the assistant message and its citations for chat history.

## Roles

- **super_admin / hr_admin** — upload/delete policy documents, seen in "Manage policies"
- **employee** — chat only

## Prompting strategy (Vibe Coding documentation)

Representative prompts used to scaffold this project:

- *"Design a FastAPI backend with JWT auth (roles: super_admin, hr_admin,
  employee), a documents table, and a RAG chat endpoint that streams via
  SSE."*
- *"Write a chunking function that splits extracted text into ~800-word
  chunks with 120-word overlap, and a cosine-similarity search function
  against stored embeddings."*
- *"Build a React chat page with a message list, streaming assistant
  replies, and citation tags under each answer showing which policy
  document it came from."*
- *"Write a multi-stage Dockerfile that builds the Vite frontend and serves
  it from FastAPI as static files, so the whole app is one container for
  App Runner."*

Each generated block was reviewed, adjusted for consistency with the schema,
and tested locally before being kept.

## Local development

```bash
# Backend
cd backend
cp .env.example .env        # fill in GEMINI_API_KEY and JWT_SECRET
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                 # proxies /api to localhost:8000
```

Create your first admin user:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"changeme","role":"super_admin"}'
```

## Running with Docker

```bash
docker compose up --build
# visit http://localhost:8000
```

## Deploying to AWS App Runner (free tier)

1. **Push the image to Amazon ECR:**
   ```bash
   aws ecr create-repository --repository-name policygpt
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
   docker build -t policygpt .
   docker tag policygpt:latest <account>.dkr.ecr.<region>.amazonaws.com/policygpt:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/policygpt:latest
   ```
2. **Create an App Runner service** pointing at that ECR image.
   - Port: `8000`
   - Environment variables: `GEMINI_API_KEY`, `JWT_SECRET`, `DATABASE_URL=sqlite:///./data/policygpt.db`
   - Instance: 0.25 vCPU / 0.5 GB (smallest tier, free-tier eligible for the trial period)
3. **Note on storage:** App Runner containers are ephemeral — SQLite data
   resets on redeploy/restart. For the course demo this is acceptable; for
   anything longer-lived, swap `DATABASE_URL` to an RDS Postgres free-tier
   instance (schema is already SQLAlchemy, so only the connection string
   changes).
4. **Set a AWS Budget alert** (Billing → Budgets) at a low threshold (e.g.
   $5) so you're notified of any unexpected usage.
5. Copy the public App Runner URL into your Concept Note and Project Report.

## Team distribution (suggested for 2–3 members)

- **Frontend** — React pages, Tailwind styling, streaming UI, citation display
- **Backend + Auth + Deployment** — FastAPI routes, JWT/roles, Dockerfile, App Runner
- **AI/RAG** (3rd member) — chunking strategy, prompt engineering, retrieval tuning, and writing up the prompting-strategy section of the report

## Known limitations / roadmap (good material for "challenges" section)

- Cosine search is O(n) over all chunks in Python — fine for a course demo;
  swap to pgvector or a proper vector DB (Chroma/FAISS) for larger corpora.
- No Celery/Redis background jobs — uploads are processed synchronously,
  which is simpler to deploy but blocks the request for large PDFs.
- CORS is wide open (`*`) — tighten to your deployed frontend origin before
  any real production use.
