from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
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


class ProductSummary(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class ParameterSummary(BaseModel):
    id: UUID
    name: str
    unit: Optional[str] = None

    class Config:
        from_attributes = True


class BatchSummary(BaseModel):
    id: UUID
    batch_number: str

    class Config:
        from_attributes = True


class UserSummary(BaseModel):
    id: UUID
    first_name: str
    last_name: str

    class Config:
        from_attributes = True


class TestResultOut(BaseModel):
    id: UUID
    product_id: UUID
    batch_id: Optional[UUID] = None
    parameter_id: UUID
    value_numeric: Optional[Decimal] = None
    value_boolean: Optional[bool] = None
    value_text: Optional[str] = None
    status: str
    evaluation: Optional[str] = None
    snap_spec_min: Optional[Decimal] = None
    snap_spec_max: Optional[Decimal] = None
    snap_target_value: Optional[Decimal] = None
    notes: Optional[str] = None
    measured_at: datetime
    created_at: datetime

    product: Optional[ProductSummary] = None
    parameter: Optional[ParameterSummary] = None
    batch: Optional[BatchSummary] = None
    creator: Optional[UserSummary] = None

    class Config:
        from_attributes = True