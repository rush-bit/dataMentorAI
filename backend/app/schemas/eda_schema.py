from pydantic import BaseModel
from typing import Any


class EDAResponse(BaseModel):
    dataset_id: str
    rows: int
    columns: int
    duplicate_rows: int

    numeric_columns: list[str]
    categorical_columns: list[str]
    date_columns: list[str]

    missing_values: dict[str, int]
    missing_percentage: dict[str, float]
    unique_values: dict[str, int]

    numeric_summary: dict[str, Any]
    categorical_summary: dict[str, Any]