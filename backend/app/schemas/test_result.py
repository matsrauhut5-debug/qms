from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime
from decimal import Decimal

class TestResultCreate(BaseModel):
    product_id: UUID
    batch_id: Optional[UUID] = None
    parameter_id: UUID
    value_numeric: Optional[Decimal] = None
    value_boolean: Optional[bool] = None
    value_text: Optional[str] = None
    notes: Optional[str] = None
    measured_at: datetime

class TestResultOut(BaseModel):
    id: UUID
    product_id: UUID
    parameter_id: UUID
    batch_id: Optional[UUID] = None
    value_numeric: Optional[Decimal] = None
    value_boolean: Optional[bool] = None
    value_text: Optional[str] = None
    status: str
    evaluation: Optional[str] = None
    notes: Optional[str] = None
    measured_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True