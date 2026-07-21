import json
import math
from typing import List

import docx
from pypdf import PdfReader
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.db import Chunk, Document
from app.services.gemini import embed_query, embed_text


def extract_text(filepath: str, filename: str) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        reader = PdfReader(filepath)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if lower.endswith(".docx"):
        d = docx.Document(filepath)
        return "\n".join(p.text for p in d.paragraphs)
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def chunk_text(text: str) -> List[str]:
    size, overlap = settings.CHUNK_SIZE, settings.CHUNK_OVERLAP
    words = text.split()
    chunks = []
    step = size - overlap
    for i in range(0, len(words), step):
        chunk = " ".join(words[i:i + size])
        if chunk.strip():
            chunks.append(chunk)
        if i + size >= len(words):
            break
    return chunks or [text]


def ingest_document(db: Session, document: Document, raw_text: str):
    document.raw_text = raw_text
    pieces = chunk_text(raw_text)
    for idx, piece in enumerate(pieces):
        vector = embed_text(piece)
        db.add(Chunk(
            document_id=document.id,
            content=piece,
            embedding=json.dumps(vector),
            chunk_index=idx,
        ))
    db.commit()


def cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def search_chunks(db: Session, query: str, top_k: int = None) -> List[dict]:
    top_k = top_k or settings.TOP_K
    query_vec = embed_query(query)

    all_chunks = db.query(Chunk).all()
    scored = []
    for c in all_chunks:
        score = cosine_similarity(query_vec, c.get_embedding())
        scored.append((score, c))
    scored.sort(key=lambda x: x[0], reverse=True)

    results = []
    for score, c in scored[:top_k]:
        doc = db.query(Document).get(c.document_id)
        results.append({
            "title": doc.title if doc else "Unknown",
            "content": c.content,
            "score": round(score, 4),
            "document_id": c.document_id,
        })
    return results
