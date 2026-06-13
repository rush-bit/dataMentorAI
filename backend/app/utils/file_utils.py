from pathlib import Path
from fastapi import UploadFile, HTTPException
import shutil
import uuid


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def validate_csv_file(file: UploadFile) -> None:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")


def save_uploaded_file(file: UploadFile) -> tuple[str, Path]:
    validate_csv_file(file)

    dataset_id = str(uuid.uuid4())
    safe_filename = file.filename.replace(" ", "_")
    file_path = UPLOAD_DIR / f"{dataset_id}_{safe_filename}"

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return dataset_id, file_path


def get_dataset_file_path(dataset_id: str) -> Path:
    matching_files = list(UPLOAD_DIR.glob(f"{dataset_id}_*"))

    if not matching_files:
        raise HTTPException(status_code=404, detail="Dataset not found")

    return matching_files[0]