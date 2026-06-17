from fastapi import APIRouter

from app.schemas.preprocessing_schema import (
    PreprocessingSuggestionRequest,
    PreprocessingSuggestionResponse,
)
from app.services.preprocessing_service import generate_preprocessing_suggestions


router = APIRouter(
    prefix="/api/datasets",
    tags=["Preprocessing Coach"]
)


@router.post("/{dataset_id}/preprocessing-suggestions", response_model=PreprocessingSuggestionResponse)
def get_preprocessing_suggestions(
    dataset_id: str,
    request: PreprocessingSuggestionRequest,
):
    return generate_preprocessing_suggestions(
        dataset_id=dataset_id,
        target_column=request.target_column,
        problem_type=request.problem_type,
    )