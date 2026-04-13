from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.base import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.activity_log import ActivityLog
from app.schemas.auth import LoginRequest, TokenResponse, ChangePasswordRequest
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == request.email,
        User.is_active == True
    ).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    roles = db.query(UserRole.role).filter(UserRole.user_id == user.id).all()
    role_values = [r.role.value for r in roles]
    token = create_access_token(data={
        "sub": str(user.id),
        "tenant_id": str(user.tenant_id),
        "roles": role_values
    })
    user.last_login_at = datetime.utcnow()
    log = ActivityLog(
        id=uuid.uuid4(),
        tenant_id=user.tenant_id,
        user_id=user.id,
        action="user.login",
        entity_type="user",
        entity_id=user.id,
        payload={"email": user.email}
    )
    db.add(log)
    db.commit()
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        tenant_id=user.tenant_id,
        full_name=f"{user.first_name} {user.last_name}",
        roles=role_values,
        must_change_password=user.must_change_password
    )

@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters"
        )
    current_user.password_hash = hash_password(request.new_password)
    current_user.must_change_password = False
    db.commit()
    return {"message": "Password changed successfully"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    roles = db.query(UserRole.role).filter(UserRole.user_id == current_user.id).all()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "tenant_id": current_user.tenant_id,
        "roles": [r.role.value for r in roles],
        "must_change_password": current_user.must_change_password
    }