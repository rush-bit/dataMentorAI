import numpy as np
import pandas as pd
from fastapi import HTTPException

from app.utils.file_utils import get_dataset_file_path


def make_json_safe(value):
    """
    Converts pandas/numpy values into JSON-safe Python values.
    Prevents errors caused by NaN, numpy int64, numpy float64, etc.
    """

    if isinstance(value, dict):
        return {str(key): make_json_safe(val) for key, val in value.items()}

    if isinstance(value, list):
        return [make_json_safe(item) for item in value]

    if isinstance(value, tuple):
        return [make_json_safe(item) for item in value]

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, np.floating):
        if np.isnan(value):
            return None
        return float(value)

    if isinstance(value, np.ndarray):
        return value.tolist()

    if pd.isna(value):
        return None

    return value


def detect_date_columns(df: pd.DataFrame) -> list[str]:
    date_columns = []

    for column in df.columns:
        if df[column].dtype == "object":
            parsed_dates = pd.to_datetime(df[column], errors="coerce")
            valid_ratio = parsed_dates.notna().mean()

            if valid_ratio >= 0.8:
                date_columns.append(column)

    return date_columns


def generate_eda_report(dataset_id: str) -> dict:
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

    rows, columns = df.shape

    numeric_columns = df.select_dtypes(include=["number"]).columns.tolist()
    categorical_columns = df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
    date_columns = detect_date_columns(df)

    # Remove detected date columns from categorical list
    categorical_columns = [
        column for column in categorical_columns
        if column not in date_columns
    ]

    missing_values = {
        column: int(count)
        for column, count in df.isnull().sum().items()
    }

    missing_percentage = {
        column: round(float((count / rows) * 100), 2)
        for column, count in df.isnull().sum().items()
    }

    unique_values = {
        column: int(df[column].nunique(dropna=True))
        for column in df.columns
    }

    duplicate_rows = int(df.duplicated().sum())

    if numeric_columns:
        numeric_summary = (
            df[numeric_columns]
            .describe()
            .T
            .round(3)
            .to_dict(orient="index")
        )
    else:
        numeric_summary = {}

    categorical_summary = {}

    for column in categorical_columns:
        mode_series = df[column].mode(dropna=True)

        most_frequent = None
        most_frequent_count = 0

        if not mode_series.empty:
            most_frequent = mode_series.iloc[0]
            most_frequent_count = int((df[column] == most_frequent).sum())

        categorical_summary[column] = {
            "unique_count": int(df[column].nunique(dropna=True)),
            "most_frequent": most_frequent,
            "most_frequent_count": most_frequent_count,
        }

    report = {
        "dataset_id": dataset_id,
        "rows": int(rows),
        "columns": int(columns),
        "duplicate_rows": duplicate_rows,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "date_columns": date_columns,
        "missing_values": missing_values,
        "missing_percentage": missing_percentage,
        "unique_values": unique_values,
        "numeric_summary": numeric_summary,
        "categorical_summary": categorical_summary,
    }

    return make_json_safe(report)