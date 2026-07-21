from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.models import Category, User
from app.schemas.category import Category as CategorySchema, CategoryCreate, CategoryUpdate

router = APIRouter()

@router.get("/", response_model=List[CategorySchema])
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve categories.
    """
    categories = db.query(Category).offset(skip).limit(limit).all()
    return categories

@router.post("/", response_model=CategorySchema)
def create_category(
    *,
    db: Session = Depends(deps.get_db),
    category_in: CategoryCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new category.
    """
    category = db.query(Category).filter(Category.name == category_in.name).first()
    if category:
        raise HTTPException(
            status_code=400,
            detail="The category with this name already exists.",
        )
    category = Category(name=category_in.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
