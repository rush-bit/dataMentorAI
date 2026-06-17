from pydantic import BaseModel
from typing import Any


class TargetSelectionRequest(BaseModel):
    target_column: str


class TargetSelectionResponse(BaseModel):
    dataset_id: str
    target_column: str
    target_dtype: str
    problem_type: str
    is_suitable: bool

    total_rows: int
    missing_values: int
    unique_values: int
    sample_values: list[Any]

    feature_columns: list[str]
    reason: str