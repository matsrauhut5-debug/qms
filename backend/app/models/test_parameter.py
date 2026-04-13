import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, Numeric, SmallInteger, Enum, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base

class DataTypeEnum(str, enum.Enum):
    numeric = "numeric"
    boolean = "boolean"
    text = "text"
    select = "select"

class TestParameter(Base):
    __tablename__ = "test_parameters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    method_description = Column(Text, nullable=True)
    unit = Column(String(30), nullable=True)
    data_type = Column(Enum(DataTypeEnum), nullable=False, default=DataTypeEnum.numeric)
    target_value = Column(Numeric(15, 6), nullable=True)
    spec_min = Column(Numeric(15, 6), nullable=True)
    spec_max = Column(Numeric(15, 6), nullable=True)
    warn_min = Column(Numeric(15, 6), nullable=True)
    warn_max = Column(Numeric(15, 6), nullable=True)
    decimal_places = Column(SmallInteger, nullable=False, default=2)
    select_options = Column(JSONB, nullable=True)
    is_required = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))