import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.base import SessionLocal
from app.models.tenant import Tenant
from app.models.product import Product
from app.models.test_parameter import TestParameter, DataTypeEnum
import uuid

def seed_products():
    db = SessionLocal()
    try:
        tenant = db.query(Tenant).filter(Tenant.slug == "demo").first()
        if not tenant:
            print("No demo tenant found — run seed.py first")
            return

        existing = db.query(Product).filter(Product.tenant_id == tenant.id).first()
        if existing:
            print("Products already exist — skipping.")
            return

        product = Product(
            id=uuid.uuid4(),
            tenant_id=tenant.id,
            name="Brake Disc A400",
            code="BD-A400",
            category="Metal Parts",
            is_active=True,
            sort_order=1,
        )
        db.add(product)
        db.flush()

        parameters = [
            TestParameter(
                id=uuid.uuid4(),
                tenant_id=tenant.id,
                product_id=product.id,
                name="Wall thickness",
                unit="mm",
                data_type=DataTypeEnum.numeric,
                target_value=10.0,
                spec_min=9.5,
                spec_max=10.5,
                warn_min=9.7,
                warn_max=10.3,
                decimal_places=2,
                is_required=True,
                sort_order=1,
                method_description="Measure wall thickness at point A using calibrated caliper.",
            ),
            TestParameter(
                id=uuid.uuid4(),
                tenant_id=tenant.id,
                product_id=product.id,
                name="Surface roughness",
                unit="Ra",
                data_type=DataTypeEnum.numeric,
                target_value=1.6,
                spec_min=0.8,
                spec_max=3.2,
                warn_min=1.0,
                warn_max=2.5,
                decimal_places=2,
                is_required=True,
                sort_order=2,
                method_description="Measure surface roughness using profilometer at centre point.",
            ),
            TestParameter(
                id=uuid.uuid4(),
                tenant_id=tenant.id,
                product_id=product.id,
                name="Visual inspection",
                unit=None,
                data_type=DataTypeEnum.boolean,
                decimal_places=0,
                is_required=True,
                sort_order=3,
                method_description="Inspect visually for cracks, burrs, or surface defects.",
            ),
            TestParameter(
                id=uuid.uuid4(),
                tenant_id=tenant.id,
                product_id=product.id,
                name="Surface grade",
                unit=None,
                data_type=DataTypeEnum.select,
                select_options=["Grade A", "Grade B", "Reject"],
                decimal_places=0,
                is_required=True,
                sort_order=4,
            ),
        ]

        for p in parameters:
            db.add(p)

        db.commit()
        print("Products and parameters seeded successfully.")
        print(f"Product: {product.name} ({product.code})")
        print(f"Parameters: {len(parameters)}")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()