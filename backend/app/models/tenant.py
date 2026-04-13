import uuid
from sqlalchemy import Column, String, Boolean, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(60), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    timezone = Column(String(60), nullable=False, default="UTC")
    locale = Column(String(10), nullable=False, default="de-DE")
    plan = Column(String(20), nullable=False, default="trial")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))


class TenantBranding(Base):
    __tablename__ = "tenant_branding"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, unique=True)
    primary_color = Column(String(7), nullable=True)
    accent_color = Column(String(7), nullable=True)
    logo_url = Column(String, nullable=True)
    logo_dark_url = Column(String, nullable=True)
    font_family = Column(String(60), nullable=True)
    company_address = Column(String, nullable=True)
    company_email = Column(String(200), nullable=True)
    company_phone = Column(String(50), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("now()"))