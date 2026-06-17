from fastapi import APIRouter

from app.schemas.target_schema import (
    TargetSelectionRequest,
    TargetSelectionResponse,
)
from app.services.target_service import analyze_target_column


router = APIRouter(
    prefix="/api/datasets",
    tags=["Target Selection"]
)


@router.post("/{dataset_id}/select-target", response_model=TargetSelectionResponse)
def select_target(dataset_id: str, request: TargetSelectionRequest):
    return analyze_target_column(
        dataset_id=dataset_id,
        target_column=request.target_column
    )