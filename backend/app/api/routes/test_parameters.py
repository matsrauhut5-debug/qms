from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.db.base import get_db
from app.core.dependencies import get_current_user
from app.models.test_parameter import TestParameter
from app.models.user import User
from app.schemas.test_parameter import TestParameterOut

router = APIRouter(prefix="/parameters", tags=["parameters"])

@router.get("/product/{product_id}", response_model=List[TestParameterOut])
def get_parameters_for_product(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(TestParameter).filter(
        TestParameter.tenant_id == current_user.tenant_id,
        TestParameter.product_id == product_id,
        TestParameter.is_active == True
    ).order_by(TestParameter.sort_order, TestParameter.name).all()