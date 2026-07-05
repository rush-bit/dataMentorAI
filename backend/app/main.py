from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.dataset_routes import router as dataset_router
from app.routes.eda_routes import router as eda_router
from app.routes.target_routes import router as target_router
from app.routes.preprocessing_routes import router as preprocessing_router
from app.routes.advanced_eda_routes import router as advanced_eda_router
from app.routes.model_routes import router as model_router
from app.routes.chat_routes import router as chat_router

app = FastAPI(
    title="DataMentor AI API",
    description="AI-powered data science tutor backend",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dataset_router)
app.include_router(eda_router)
app.include_router(target_router)
app.include_router(preprocessing_router)
app.include_router(advanced_eda_router)
app.include_router(model_router)
app.include_router(chat_router)


@app.get("/")
def root():
    return {
        "message": "DataMentor AI backend is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "DataMentor AI Backend"
    }