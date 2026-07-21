from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.models import Department, User
from app.schemas.department import Department as DepartmentSchema, DepartmentCreate, DepartmentUpdate

router = APIRouter()

@router.get("/", response_model=List[DepartmentSchema])
def read_departments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve departments.
    """
    departments = db.query(Department).offset(skip).limit(limit).all()
    return departments

@router.post("/", response_model=DepartmentSchema)
def create_department(
    *,
    db: Session = Depends(deps.get_db),
    department_in: DepartmentCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new department.
    """
    department = db.query(Department).filter(Department.name == department_in.name).first()
    if department:
        raise HTTPException(
            status_code=400,
            detail="The department with this name already exists.",
        )
    department = Department(name=department_in.name)
    db.add(department)
    db.commit()
    db.refresh(department)
    return department
