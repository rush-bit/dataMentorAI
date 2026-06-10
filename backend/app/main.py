from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="DataMentor AI API",
    description="AI-powered data science tutor backend",
    version="0.1.0"
)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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