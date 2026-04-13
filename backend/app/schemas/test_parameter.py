from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List
from decimal import Decimal

class TestParameterOut(BaseModel):
    id: UUID
    name: str
    unit: Optional[str] = None
    data_type: str
    target_value: Optional[Decimal] = None
    spec_min: Optional[Decimal] = None
    spec_max: Optional[Decimal] = None
    warn_min: Optional[Decimal] = None
    warn_max: Optional[Decimal] = None
    decimal_places: int
    select_options: Optional[List[str]] = None
    method_description: Optional[str] = None
    is_required: bool
    sort_order: int

    class Config:
        from_attributes = True