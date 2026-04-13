import uuid
from sqlalchemy import Column, String, DateTime, Text, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from app.db.base import Base

class ActivityLog(Base):
    __tablename__ = "activity_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(60), nullable=True)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    payload = Column(JSONB, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"), index=True)