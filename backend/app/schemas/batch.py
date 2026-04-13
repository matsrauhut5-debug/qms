from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import date

class BatchCreate(BaseModel):
    product_id: UUID
    batch_number: str
    production_date: Optional[date] = None
    notes: Optional[str] = None

class BatchOut(BaseModel):
    id: UUID
    product_id: UUID
    batch_number: str
    status: str
    production_date: Optional[date] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True