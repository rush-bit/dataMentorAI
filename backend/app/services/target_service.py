import numpy as np
import pandas as pd
from fastapi import HTTPException

from app.utils.file_utils import get_dataset_file_path


def make_json_safe_value(value):
    if pd.isna(value):
        return None

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, np.floating):
        return float(value)

    if isinstance(value, np.bool_):
        return bool(value)

    return value


def is_discrete_numeric(series: pd.Series, unique_count: int) -> bool:
    """
    Detects numeric classification targets like:
    0/1, 1/2/3, 0.0/1.0, etc.
    """

    if unique_count > 10:
        return False

    non_null = series.dropna()

    if non_null.empty:
        return False

    try:
        values = non_null.astype(float)
        return bool(np.all(values == np.floor(values)))
    except Exception:
        return False


def analyze_target_column(dataset_id: str, target_column: str) -> dict:
    file_path = get_dataset_file_path(dataset_id)

    try:
        df = pd.read_csv(file_path)
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {str(error)}"
        )

    if df.empty:
        raise HTTPException(status_code=400, detail="Dataset is empty")

    if target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail=f"Target column '{target_column}' does not exist"
        )

    target_series = df[target_column]

    total_rows = int(len(target_series))
    missing_values = int(target_series.isnull().sum())
    unique_values = int(target_series.nunique(dropna=True))
    target_dtype = str(target_series.dtype)

    non_null_count = int(target_series.notna().sum())

    sample_values = (
        target_series
        .dropna()
        .drop_duplicates()
        .head(5)
        .tolist()
    )

    sample_values = [make_json_safe_value(value) for value in sample_values]

    feature_columns = [
        column for column in df.columns
        if column != target_column
    ]

    is_numeric = pd.api.types.is_numeric_dtype(target_series)
    is_bool = pd.api.types.is_bool_dtype(target_series)

    if non_null_count == 0:
        problem_type = "unknown"
        is_suitable = False
        reason = "The target column has no non-missing values, so it cannot be used for model training."

    elif unique_values <= 1:
        problem_type = "unknown"
        is_suitable = False
        reason = "The target column has only one unique value, so there is nothing meaningful to predict."

    elif is_bool:
        problem_type = "classification"
        is_suitable = True
        reason = "The target column is boolean, so this is a classification problem."

    elif is_numeric:
        if is_discrete_numeric(target_series, unique_values):
            problem_type = "classification"
            is_suitable = True
            reason = (
                "The target column is numeric but has only a few discrete values, "
                "so it is treated as a classification problem."
            )
        else:
            problem_type = "regression"
            is_suitable = True
            reason = (
                "The target column is numeric and has many possible values, "
                "so this is treated as a regression problem."
            )

    else:
        problem_type = "classification"
        is_suitable = True
        reason = (
            "The target column is categorical/text-based, "
            "so this is treated as a classification problem."
        )

    return {
        "dataset_id": dataset_id,
        "target_column": target_column,
        "target_dtype": target_dtype,
        "problem_type": problem_type,
        "is_suitable": is_suitable,
        "total_rows": total_rows,
        "missing_values": missing_values,
        "unique_values": unique_values,
        "sample_values": sample_values,
        "feature_columns": feature_columns,
        "reason": reason,
    }