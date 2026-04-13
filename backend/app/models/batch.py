import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, Date, Enum, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class BatchStatusEnum(str, enum.Enum):
    open = "open"
    completed = "completed"
    approved = "approved"
    rejected = "rejected"

class Batch(Base):
    __tablename__ = "batches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    batch_number = Column(String(100), nullable=False)
    status = Column(Enum(BatchStatusEnum), nullable=False, default=BatchStatusEnum.open)
    quantity_produced = Column(Integer, nullable=True)
    quantity_unit = Column(String(30), nullable=True)
    production_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))

    __table_args__ = (
        __import__("sqlalchemy").UniqueConstraint("tenant_id", "batch_number", name="uq_batches_tenant_number"),
    )