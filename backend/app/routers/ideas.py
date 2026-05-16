from fastapi import APIRouter, HTTPException, status

from app.models import Idea, IdeaCreate, MessageResponse, PlanCreate, StatusUpdate, VoteRequest
from app.store import store

router = APIRouter(prefix="/api/ideas", tags=["ideas"])


@router.get("", response_model=list[Idea])
def list_ideas() -> list[Idea]:
    return store.list_ideas()


@router.post("", response_model=Idea, status_code=status.HTTP_201_CREATED)
def create_idea(payload: IdeaCreate) -> Idea:
    return store.create_idea(payload, author="Admin (Вы)")


@router.post("/{idea_id}/vote", response_model=Idea)
def vote(idea_id: int, payload: VoteRequest) -> Idea:
    if payload.delta not in (-1, 1):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="delta должен быть -1 или 1")
    idea = store.vote(idea_id, payload.delta)
    if idea is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Голосование недоступно")
    return idea


@router.patch("/{idea_id}/status", response_model=Idea)
def update_status(idea_id: int, payload: StatusUpdate) -> Idea:
    idea = store.update_status(idea_id, payload.status)
    if idea is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Идея не найдена")
    return idea


@router.post("/{idea_id}/plan", response_model=Idea)
def save_plan(idea_id: int, payload: PlanCreate) -> Idea:
    if not payload.deadline:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Укажите плановую дату реализации!")
    idea = store.save_plan(idea_id)
    if idea is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Проект недоступен для планирования")
    return idea
