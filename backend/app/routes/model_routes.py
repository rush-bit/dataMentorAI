from fastapi import APIRouter

from app.schemas.model_schema import (
    ModelSuggestionRequest,
    ModelSuggestionResponse,
    TrainModelsRequest,
    TrainModelsResponse,
)
from app.services.model_service import (
    get_model_suggestions,
    train_selected_models,
)


router = APIRouter(
    prefix="/api/datasets",
    tags=["Model Trainer"]
)


@router.post("/{dataset_id}/model-suggestions", response_model=ModelSuggestionResponse)
def suggest_models(dataset_id: str, request: ModelSuggestionRequest):
    return get_model_suggestions(
        dataset_id=dataset_id,
        target_column=request.target_column,
        problem_type=request.problem_type,
    )


@router.post("/{dataset_id}/train-models", response_model=TrainModelsResponse)
def train_models(dataset_id: str, request: TrainModelsRequest):
    return train_selected_models(
        dataset_id=dataset_id,
        target_column=request.target_column,
        problem_type=request.problem_type,
        selected_models=request.selected_models,
        test_size=request.test_size,
        random_state=request.random_state,
    )