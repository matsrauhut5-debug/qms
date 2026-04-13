from pydantic import BaseModel, EmailStr
from typing import List
from uuid import UUID

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    tenant_id: UUID
    full_name: str
    roles: List[str]
    must_change_password: bool

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str