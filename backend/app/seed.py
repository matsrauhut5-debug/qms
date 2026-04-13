import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.base import SessionLocal
from app.models.tenant import Tenant, TenantBranding
from app.models.user import User, UserRole, RoleEnum
from app.core.security import hash_password
import uuid

def seed():
    db = SessionLocal()
    try:
        existing = db.query(Tenant).filter(Tenant.slug == "demo").first()
        if existing:
            print("Seed data already exists — skipping.")
            return

        tenant = Tenant(
            id=uuid.uuid4(),
            slug="demo",
            name="Demo Company",
            timezone="Europe/Berlin",
            locale="de-DE",
            plan="trial",
        )
        db.add(tenant)
        db.flush()

        branding = TenantBranding(
            id=uuid.uuid4(),
            tenant_id=tenant.id,
            primary_color="#3b82f6",
            company_email="admin@demo.com",
        )
        db.add(branding)

        admin = User(
            id=uuid.uuid4(),
            tenant_id=tenant.id,
            email="admin@demo.com",
            password_hash=hash_password("admin1234"),
            first_name="Admin",
            last_name="User",
            is_active=True,
            must_change_password=False,
        )
        db.add(admin)
        db.flush()

        for role in [RoleEnum.admin, RoleEnum.analyst, RoleEnum.operator]:
            db.add(UserRole(
                user_id=admin.id,
                role=role,
                granted_by=admin.id,
            ))

        db.commit()
        print("Seed complete.")
        print("Email:    admin@demo.com")
        print("Password: admin1234")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()