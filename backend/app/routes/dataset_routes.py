from fastapi import APIRouter, UploadFile, File
from app.schemas.dataset_schema import DatasetUploadResponse
from app.services.dataset_service import analyze_uploaded_csv


router = APIRouter(
    prefix="/api/datasets",
    tags=["Datasets"]
)


@router.post("/upload", response_model=DatasetUploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    return analyze_uploaded_csv(file)