from fastapi import APIRouter

from app.schemas.chat_schema import TutorChatRequest, TutorChatResponse
from app.services.chat_service import generate_tutor_answer


router = APIRouter(
    prefix="/api/tutor",
    tags=["AI Tutor Chat"]
)


@router.post("/chat", response_model=TutorChatResponse)
def tutor_chat(request: TutorChatRequest):
    answer = generate_tutor_answer(
        question=request.question,
        raw_context=request.context,
    )

    return {
        "answer": answer
    }