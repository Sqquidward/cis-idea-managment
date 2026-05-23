from enum import Enum
from typing import Optional

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


class PlanTeamMember(BaseModel):
    display_name: str
    task: str = ""
    is_author: bool = False


class ProjectPlan(BaseModel):
    deadline: str
    team: list[PlanTeamMember] = Field(default_factory=list)


class Idea(BaseModel):
    id: int
    title: str
    type: str
    description: str
    author: str
    author_id: str
    is_owner: bool = False
    status: str
    rating: int = 0
    voted: bool = False
    my_vote: Optional[int] = None
    plan: Optional[ProjectPlan] = None


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
    team: list[PlanTeamMember] = Field(default_factory=list)


class FeedbackCreate(BaseModel):
    idea_id: int
    rating: int = Field(..., ge=1, le=5)
    text: str = Field(min_length=1)


class FeedbackOut(BaseModel):
    id: int
    idea_id: int
    idea_title: str
    user_id: str
    author_name: str
    rating: int
    text: str
    is_mine: bool
    created_at: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    display_name: str
    avatar_emoji: str
    role: str


class UserProfile(BaseModel):
    user_id: str
    username: str
    display_name: str
    avatar_emoji: str
    role: str


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    avatar_emoji: Optional[str] = Field(default=None, max_length=16)


class UserAdmin(BaseModel):
    user_id: str
    username: str
    display_name: str
    avatar_emoji: str
    role: str


class UserCreate(BaseModel):
    username: str = Field(min_length=2, max_length=50)
    display_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=4, max_length=100)
    role: str


class MessageResponse(BaseModel):
    message: str
