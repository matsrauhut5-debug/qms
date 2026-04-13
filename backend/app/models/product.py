import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    batch_format = Column(String(60), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, nullable=False, default=0)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    __table_args__ = (
        __import__("sqlalchemy").UniqueConstraint("tenant_id", "name", name="uq_products_tenant_name"),
    )