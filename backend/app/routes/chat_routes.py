from fastapi import APIRouter

from app.schemas.chat_schema import (
    TutorChatRequest,
    TutorChatResponse,
    SectionExplanationRequest,
    SectionExplanationResponse,
)
from app.services.chat_service import (
    generate_tutor_answer,
    generate_section_explanation,
)


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


@router.post("/explain-section", response_model=SectionExplanationResponse)
def explain_section(request: SectionExplanationRequest):
    explanation = generate_section_explanation(
        section_type=request.section_type,
        section_title=request.section_title,
        raw_context=request.context,
    )

    return {
        "explanation": explanation
    }