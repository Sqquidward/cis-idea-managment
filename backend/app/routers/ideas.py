from fastapi import APIRouter, Depends, HTTPException, status

from app.db_models import User
from app.deps import get_current_user, get_store, require_roles
from app.models import Idea, IdeaCreate, PlanCreate, StatusUpdate, VoteRequest
from app.roles import UserRole
from app.store import IdeaStore, PlanPermissionError

router = APIRouter(prefix="/api/ideas", tags=["ideas"])

_USER_ACTIONS = (UserRole.USER, UserRole.ADMIN)
_COMMITTEE_ACTIONS = (UserRole.COMMITTEE, UserRole.ADMIN)


@router.get("", response_model=list[Idea])
def list_ideas(
    _user: User = Depends(get_current_user),
    store: IdeaStore = Depends(get_store),
) -> list[Idea]:
    return store.list_ideas()


@router.post("", response_model=Idea, status_code=status.HTTP_201_CREATED)
def create_idea(
    payload: IdeaCreate,
    user: User = Depends(require_roles(*_USER_ACTIONS)),
    store: IdeaStore = Depends(get_store),
) -> Idea:
    return store.create_idea(payload, author=f"{user.display_name} (Вы)")


@router.post("/{idea_id}/vote", response_model=Idea)
def vote(
    idea_id: int,
    payload: VoteRequest,
    _user: User = Depends(require_roles(*_USER_ACTIONS)),
    store: IdeaStore = Depends(get_store),
) -> Idea:
    if payload.delta not in (-1, 0, 1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="delta должен быть -1 (против), 0 (воздержаться) или 1 (за)",
        )
    idea = store.vote(idea_id, payload.delta)
    if idea is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Голосование недоступно")
    return idea


@router.patch("/{idea_id}/status", response_model=Idea)
def update_status(
    idea_id: int,
    payload: StatusUpdate,
    _user: User = Depends(require_roles(*_COMMITTEE_ACTIONS)),
    store: IdeaStore = Depends(get_store),
) -> Idea:
    idea = store.update_status(idea_id, payload.status)
    if idea is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Идея не найдена")
    return idea


@router.post("/{idea_id}/plan", response_model=Idea)
def save_plan(
    idea_id: int,
    payload: PlanCreate,
    _user: User = Depends(require_roles(*_USER_ACTIONS)),
    store: IdeaStore = Depends(get_store),
) -> Idea:
    if not payload.deadline:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Укажите плановую дату реализации!")
    try:
        return store.save_plan(idea_id, payload.deadline, payload.team)
    except PlanPermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
