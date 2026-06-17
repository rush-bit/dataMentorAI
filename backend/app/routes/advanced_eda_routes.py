from fastapi import APIRouter

from app.schemas.advanced_eda_schema import (
    AdvancedEDARequest,
    AdvancedEDAResponse,
)
from app.services.advanced_eda_service import generate_advanced_eda_report


router = APIRouter(
    prefix="/api/datasets",
    tags=["Advanced EDA"]
)


@router.post("/{dataset_id}/advanced-eda", response_model=AdvancedEDAResponse)
def get_advanced_eda_report(dataset_id: str, request: AdvancedEDARequest):
    return generate_advanced_eda_report(
        dataset_id=dataset_id,
        target_column=request.target_column,
        problem_type=request.problem_type,
    )