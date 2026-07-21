from typing import AsyncGenerator, List

import google.generativeai as genai

from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are PolicyGPT, an internal Business Policy Assistant.
Answer ONLY using the provided policy excerpts below. If the excerpts don't
contain the answer, say you don't have that information and suggest the
employee contact HR/Admin. Always be concise and cite which document each
fact came from using the format [Source: <title>]."""


def embed_text(text: str, task_type: str = "retrieval_document") -> List[float]:
    result = genai.embed_content(
        model=f"models/{settings.EMBEDDING_MODEL}",
        content=text,
        task_type=task_type,
    )
    return result["embedding"]


def embed_query(text: str) -> List[float]:
    return embed_text(text, task_type="retrieval_query")


def summarize_document(title: str, raw_text: str) -> str:
    prompt = (
        f"Summarize the following company policy document titled '{title}' for employees.\n"
        "Structure your response as:\n"
        "**Executive Summary** (2-3 sentences)\n"
        "**Key Highlights** (bullet list of the most important rules)\n"
        "**Quick Reference** (bullet list employees ask about most, e.g. numbers/limits/deadlines)\n\n"
        f"DOCUMENT:\n{raw_text[:12000]}"
    )
    model = genai.GenerativeModel(settings.CHAT_MODEL)
    response = model.generate_content(prompt)
    return response.text


def compare_document_versions(title: str, old_text: str, new_text: str) -> str:
    prompt = (
        f"Compare these two versions of the policy document '{title}' and summarize what changed.\n"
        "Structure your response as:\n"
        "**Added rules**\n**Removed rules**\n**Modified sections**\n**Overall summary of changes**\n\n"
        f"OLD VERSION:\n{old_text[:6000]}\n\nNEW VERSION:\n{new_text[:6000]}"
    )
    model = genai.GenerativeModel(settings.CHAT_MODEL)
    response = model.generate_content(prompt)
    return response.text
async def stream_chat(question: str, context_chunks: List[dict]) -> AsyncGenerator[str, None]:
    context_text = "\n\n".join(
        f"[Source: {c['title']}]\n{c['content']}" for c in context_chunks
    ) or "No relevant policy excerpts were found."

    prompt = f"{SYSTEM_PROMPT}\n\nPOLICY EXCERPTS:\n{context_text}\n\nEMPLOYEE QUESTION:\n{question}"

    model = genai.GenerativeModel(settings.CHAT_MODEL)
    response = model.generate_content(prompt, stream=True)
    for chunk in response:
        if chunk.text:
            yield chunk.text
