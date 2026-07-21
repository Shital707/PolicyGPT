from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryInDBBase(CategoryBase):
    id: str

    model_config = {"from_attributes": True}

class Category(CategoryInDBBase):
    pass
