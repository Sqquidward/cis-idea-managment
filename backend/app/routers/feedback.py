from fastapi import APIRouter, Depends, HTTPException, status

from app.db_models import User
from app.deps import get_store, require_roles
from app.models import FeedbackCreate, FeedbackOut, IdeaStatus
from app.roles import UserRole
from app.store import IdeaStore

router = APIRouter(prefix="/api/feedbacks", tags=["feedbacks"])


@router.get("", response_model=list[FeedbackOut])
def list_feedbacks(
    _user: User = Depends(require_roles(UserRole.USER, UserRole.ADMIN)),
    store: IdeaStore = Depends(get_store),
) -> list[FeedbackOut]:
    return store.list_feedbacks()


@router.post("", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    payload: FeedbackCreate,
    _user: User = Depends(require_roles(UserRole.USER, UserRole.ADMIN)),
    store: IdeaStore = Depends(get_store),
) -> FeedbackOut:
    idea = store.get_idea(payload.idea_id)
    if idea is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден")
    if idea.status != IdeaStatus.DONE.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Отзыв доступен только для реализованных проектов",
        )
    try:
        return store.create_feedback(payload.idea_id, payload.rating, payload.text)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
