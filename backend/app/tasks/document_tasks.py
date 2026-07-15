from app.core.celery_app import celery_app
import time

@celery_app.task(name="app.tasks.document_tasks.process_document")
def process_document(document_id: str) -> str:
    # Placeholder for document processing (text extraction, hashing, gemini summary)
    print(f"Processing document {document_id}")
    time.sleep(2)
    return f"Processed {document_id}"
