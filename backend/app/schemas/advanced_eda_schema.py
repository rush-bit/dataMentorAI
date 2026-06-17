from pydantic import BaseModel
from typing import Any


class AdvancedEDARequest(BaseModel):
    target_column: str | None = None
    problem_type: str | None = None


class AdvancedEDAResponse(BaseModel):
    dataset_id: str
    target_column: str | None
    problem_type: str | None

    correlation_matrix: dict[str, Any]
    distributions: dict[str, Any]
    outliers: dict[str, Any]
    skewness: dict[str, Any]
    feature_target_relationships: dict[str, Any]
    eda_insights: list[dict[str, Any]]