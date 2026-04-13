import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Text, Numeric, Enum, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class ResultStatusEnum(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    flagged = "flagged"
    corrected = "corrected"

class EvaluationEnum(str, enum.Enum):
    pass_ = "pass"
    warn = "warn"
    fail = "fail"
    na = "na"

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("batches.id"), nullable=True, index=True)
    parameter_id = Column(UUID(as_uuid=True), ForeignKey("test_parameters.id"), nullable=False, index=True)
    value_numeric = Column(Numeric(15, 6), nullable=True)
    value_boolean = Column(Boolean, nullable=True)
    value_text = Column(Text, nullable=True)
    status = Column(Enum(ResultStatusEnum), nullable=False, default=ResultStatusEnum.draft)
    evaluation = Column(Enum(EvaluationEnum), nullable=True)
    snap_spec_min = Column(Numeric(15, 6), nullable=True)
    snap_spec_max = Column(Numeric(15, 6), nullable=True)
    snap_target_value = Column(Numeric(15, 6), nullable=True)
    notes = Column(Text, nullable=True)
    correction_of = Column(UUID(as_uuid=True), ForeignKey("test_results.id"), nullable=True)
    measured_at = Column(DateTime(timezone=True), nullable=False)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))