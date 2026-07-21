# --- Stage 1: build the React frontend ---
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
# Vite is configured to output directly into ../backend/static

# --- Stage 2: assemble the FastAPI backend + built frontend ---
FROM python:3.12-slim AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY --from=frontend-build /backend/static ./static

RUN mkdir -p /app/uploads /app/data
ENV DATABASE_URL=sqlite:///./data/policygpt.db

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
