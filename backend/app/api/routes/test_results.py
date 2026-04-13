from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID, uuid4
from datetime import datetime
from app.db.base import get_db
from app.core.dependencies import get_current_user
from app.models.test_result import TestResult, ResultStatusEnum, EvaluationEnum
from app.models.test_parameter import TestParameter
from app.models.activity_log import ActivityLog
from app.models.user import User
from app.schemas.test_result import TestResultCreate, TestResultOut
from decimal import Decimal

router = APIRouter(prefix="/results", tags=["results"])

def compute_evaluation(
    value: Decimal,
    spec_min, spec_max, warn_min, warn_max
) -> str:
    if spec_min is not None and value < spec_min:
        return "fail"
    if spec_max is not None and value > spec_max:
        return "fail"
    if warn_min is not None and value < warn_min:
        return "warn"
    if warn_max is not None and value > warn_max:
        return "warn"
    return "pass"

@router.post("/", response_model=TestResultOut)
def create_result(
    payload: TestResultCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    param = db.query(TestParameter).filter(
        TestParameter.id == payload.parameter_id,
        TestParameter.tenant_id == current_user.tenant_id,
    ).first()
    if not param:
        raise HTTPException(status_code=404, detail="Parameter not found")

    evaluation = None
    if param.data_type == "numeric" and payload.value_numeric is not None:
        evaluation = compute_evaluation(
            payload.value_numeric,
            param.spec_min, param.spec_max,
            param.warn_min, param.warn_max
        )
    elif param.data_type == "boolean":
        evaluation = "pass" if payload.value_boolean else "fail"
    else:
        evaluation = "na"

    result = TestResult(
        id=uuid4(),
        tenant_id=current_user.tenant_id,
        product_id=payload.product_id,
        batch_id=payload.batch_id,
        parameter_id=payload.parameter_id,
        value_numeric=payload.value_numeric,
        value_boolean=payload.value_boolean,
        value_text=payload.value_text,
        status=ResultStatusEnum.submitted,
        evaluation=evaluation,
        snap_spec_min=param.spec_min,
        snap_spec_max=param.spec_max,
        snap_target_value=param.target_value,
        notes=payload.notes,
        measured_at=payload.measured_at,
        created_by=current_user.id,
    )
    db.add(result)

    log = ActivityLog(
        id=uuid4(),
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        action="result.submitted",
        entity_type="test_result",
        entity_id=result.id,
        payload={"evaluation": evaluation}
    )
    db.add(log)
    db.commit()
    db.refresh(result)
    return result

@router.get("/", response_model=List[TestResultOut])
def get_results(
    product_id: UUID = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(TestResult).filter(
        TestResult.tenant_id == current_user.tenant_id
    )
    if product_id:
        query = query.filter(TestResult.product_id == product_id)
    return query.order_by(TestResult.measured_at.desc()).limit(limit).all()