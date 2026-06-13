from pydantic import BaseModel
from typing import Any


class DatasetUploadResponse(BaseModel):
    dataset_id: str
    filename: str
    rows: int
    columns: int
    column_names: list[str]
    data_types: dict[str, str]
    missing_values: dict[str, int]
    preview: list[dict[str, Any]]