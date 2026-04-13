from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

class ProductOut(BaseModel):
    id: UUID
    name: str
    code: Optional[str] = None
    category: Optional[str] = None

    class Config:
        from_attributes = True