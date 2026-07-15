from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentBase(BaseModel):
    title: str
    category_id: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(DocumentBase):
    title: Optional[str] = None
    category_id: Optional[str] = None

class DocumentInDBBase(DocumentBase):
    id: str
    file_path: str
    file_hash: str
    uploader_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class Document(DocumentInDBBase):
    # content is usually large, we might not want to return it in lists
    pass

class DocumentWithContent(DocumentInDBBase):
    content: str
