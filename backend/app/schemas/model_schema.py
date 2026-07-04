from pydantic import BaseModel
from typing import Any


class ModelSuggestionRequest(BaseModel):
    target_column: str
    problem_type: str


class ModelSuggestionResponse(BaseModel):
    dataset_id: str
    target_column: str
    problem_type: str
    suggested_models: list[dict[str, Any]]


class TrainModelsRequest(BaseModel):
    target_column: str
    problem_type: str
    selected_models: list[str]
    test_size: float = 0.2
    random_state: int = 42


class TrainModelsResponse(BaseModel):
    dataset_id: str
    target_column: str
    problem_type: str
    trained_models: list[dict[str, Any]]
    best_model: dict[str, Any] | None
    comparison_summary: str