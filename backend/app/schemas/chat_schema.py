from pydantic import BaseModel
from typing import Any


class TutorChatRequest(BaseModel):
    question: str
    context: dict[str, Any]


class TutorChatResponse(BaseModel):
    answer: str


class SectionExplanationRequest(BaseModel):
    section_type: str
    section_title: str
    context: dict[str, Any]


class SectionExplanationResponse(BaseModel):
    explanation: str