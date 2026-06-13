from fastapi import APIRouter

from app.schemas.eda_schema import EDAResponse
from app.services.eda_service import generate_eda_report


router = APIRouter(
    prefix="/api/datasets",
    tags=["EDA"]
)


@router.get("/{dataset_id}/eda", response_model=EDAResponse)
def get_eda_report(dataset_id: str):
    return generate_eda_report(dataset_id)