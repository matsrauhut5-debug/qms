from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.settings import settings

Base = declarative_base()

# Import all models here so Base.metadata knows about them
from app.models.tenant import Tenant, TenantBranding
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.test_parameter import TestParameter
from app.models.batch import Batch
from app.models.test_result import TestResult
from app.models.activity_log import ActivityLog

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()