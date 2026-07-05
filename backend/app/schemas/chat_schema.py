from pydantic import BaseModel
from typing import Any


class TutorChatRequest(BaseModel):
    question: str
    context: dict[str, Any]


class TutorChatResponse(BaseModel):
    answer: str