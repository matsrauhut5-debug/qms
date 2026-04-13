from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID, uuid4
from app.db.base import get_db
from app.core.dependencies import get_current_user
from app.models.batch import Batch, BatchStatusEnum
from app.models.user import User
from app.schemas.batch import BatchCreate, BatchOut

router = APIRouter(prefix="/batches", tags=["batches"])

@router.get("/", response_model=List[BatchOut])
def get_batches(
    product_id: UUID = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Batch).filter(
        Batch.tenant_id == current_user.tenant_id,
        Batch.status == BatchStatusEnum.open
    )
    if product_id:
        query = query.filter(Batch.product_id == product_id)
    return query.order_by(Batch.created_at.desc()).all()

@router.post("/", response_model=BatchOut)
def create_batch(
    payload: BatchCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    batch = Batch(
        id=uuid4(),
        tenant_id=current_user.tenant_id,
        product_id=payload.product_id,
        batch_number=payload.batch_number,
        status=BatchStatusEnum.open,
        production_date=payload.production_date,
        notes=payload.notes,
        created_by=current_user.id,
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch