from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import Optional
from datetime import date

from app.db.base import get_db
from app.core.dependencies import get_current_user, get_current_tenant_id
from app.models.test_result import TestResult, ResultStatusEnum, EvaluationEnum
from app.models.product import Product
from app.models.test_parameter import TestParameter
from app.models.batch import Batch
from app.models.user import User
from app.schemas.test_result import TestResultCreate, TestResultOut

router = APIRouter()


@router.post("/results/", response_model=TestResultOut)
def submit_result(
    payload: TestResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant_id),
):
    parameter = db.query(TestParameter).filter(
        TestParameter.id == payload.parameter_id,
        TestParameter.tenant_id == tenant_id,
    ).first()

    if not parameter:
        raise HTTPException(status_code=404, detail="Parameter not found")

    # Compute evaluation
    evaluation = EvaluationEnum.na
    if payload.value_numeric is not None:
        v = float(payload.value_numeric)
        spec_min = float(parameter.spec_min) if parameter.spec_min is not None else None
        spec_max = float(parameter.spec_max) if parameter.spec_max is not None else None
        warn_min = float(parameter.warn_min) if parameter.warn_min is not None else None
        warn_max = float(parameter.warn_max) if parameter.warn_max is not None else None

        if (spec_min is not None and v < spec_min) or (spec_max is not None and v > spec_max):
            evaluation = EvaluationEnum.fail
        elif (warn_min is not None and v < warn_min) or (warn_max is not None and v > warn_max):
            evaluation = EvaluationEnum.warn
        else:
            evaluation = EvaluationEnum.pass_

    result = TestResult(
        tenant_id=tenant_id,
        product_id=payload.product_id,
        batch_id=payload.batch_id,
        parameter_id=payload.parameter_id,
        value_numeric=payload.value_numeric,
        value_boolean=payload.value_boolean,
        value_text=payload.value_text,
        status=ResultStatusEnum.submitted,
        evaluation=evaluation,
        snap_spec_min=parameter.spec_min,
        snap_spec_max=parameter.spec_max,
        snap_target_value=parameter.target_value,
        notes=payload.notes,
        measured_at=payload.measured_at,
        created_by=current_user.id,
    )

    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.get("/results/", response_model=list[TestResultOut])
def list_results(
    product_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    evaluation: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: str = Depends(get_current_tenant_id),
):
    query = (
        db.query(TestResult)
        .options(
            joinedload(TestResult.product),
            joinedload(TestResult.parameter),
            joinedload(TestResult.batch),
            joinedload(TestResult.creator),
        )
        .filter(TestResult.tenant_id == tenant_id)
    )

    if product_id:
        query = query.filter(TestResult.product_id == product_id)

    if status:
        try:
            status_enum = ResultStatusEnum(status)
            query = query.filter(TestResult.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    if evaluation:
        try:
            eval_enum = EvaluationEnum(evaluation)
            query = query.filter(TestResult.evaluation == eval_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid evaluation: {evaluation}")

    if date_from:
        query = query.filter(TestResult.measured_at >= date_from)

    if date_to:
        query = query.filter(TestResult.measured_at <= date_to)

    results = (
        query
        .order_by(desc(TestResult.created_at))
        .limit(limit)
        .offset(offset)
        .all()
    )

    return results