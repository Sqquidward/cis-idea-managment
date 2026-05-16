from fastapi import APIRouter, Depends, HTTPException, status

from app.db_models import User
from app.deps import get_current_user, get_store
from app.models import FeedbackCreate, IdeaStatus, MessageResponse
from app.store import IdeaStore

router = APIRouter(prefix="/api/feedbacks", tags=["feedbacks"])


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    payload: FeedbackCreate,
    _user: User = Depends(get_current_user),
    store: IdeaStore = Depends(get_store),
) -> MessageResponse:
    idea = store.get_idea(payload.idea_id)
    if idea is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден")
    if idea.status != IdeaStatus.DONE.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Отзыв доступен только для реализованных проектов",
        )
    store.create_feedback(payload.idea_id, payload.rating, payload.text)
    return MessageResponse(
        message="Отзыв успешно добавлен в таблицу Feedbacks базы данных PostgreSQL!"
    )
