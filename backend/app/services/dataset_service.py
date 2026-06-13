import pandas as pd
from fastapi import UploadFile, HTTPException
from app.utils.file_utils import save_uploaded_file


def analyze_uploaded_csv(file: UploadFile) -> dict:
    dataset_id, file_path = save_uploaded_file(file)

    try:
        df = pd.read_csv(file_path)
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read CSV file: {str(error)}"
        )

    if df.empty:
        raise HTTPException(status_code=400, detail="CSV file is empty")

    # Convert preview rows to JSON-safe format
    preview_df = df.head(5).astype(object).where(pd.notnull(df.head(5)), None)

    data_types = {
        column: str(dtype)
        for column, dtype in df.dtypes.items()
    }

    missing_values = {
        column: int(count)
        for column, count in df.isnull().sum().items()
    }

    response = {
        "dataset_id": dataset_id,
        "filename": file.filename,
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": df.columns.tolist(),
        "data_types": data_types,
        "missing_values": missing_values,
        "preview": preview_df.to_dict(orient="records"),
    }

    return response