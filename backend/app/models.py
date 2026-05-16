from enum import Enum

from pydantic import BaseModel, Field


class IdeaStatus(str, Enum):
    VOTING = "Голосование"
    IMPLEMENTATION = "Реализация"
    DONE = "Реализована"
    ARCHIVE = "Архив"


class IdeaType(str, Enum):
    TECH = "Технологическая"
    ORG = "Организационная"
    LEAN = "Бережливое производство"


class Idea(BaseModel):
    id: int
    title: str
    type: str
    description: str
    author: str
    status: str
    rating: int = 0
    voted: bool = False


class IdeaCreate(BaseModel):
    title: str = Field(min_length=1)
    type: str
    description: str = Field(min_length=1)


class VoteRequest(BaseModel):
    delta: int = Field(..., ge=-1, le=1)


class StatusUpdate(BaseModel):
    status: str


class PlanCreate(BaseModel):
    deadline: str
    tasks: dict[str, str] = Field(default_factory=dict)


class FeedbackCreate(BaseModel):
    idea_id: int
    rating: int = Field(..., ge=1, le=5)
    text: str = Field(min_length=1)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    username: str
    display_name: str


class MessageResponse(BaseModel):
    message: str
