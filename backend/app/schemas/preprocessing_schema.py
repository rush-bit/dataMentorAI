from pydantic import BaseModel
from typing import Any


class PreprocessingSuggestionRequest(BaseModel):
    target_column: str
    problem_type: str


class PreprocessingSuggestionResponse(BaseModel):
    dataset_id: str
    target_column: str
    problem_type: str

    numeric_features: list[str]
    categorical_features: list[str]
    date_features: list[str]

    suggestions: list[dict[str, Any]]
    pipeline_plan: dict[str, Any]