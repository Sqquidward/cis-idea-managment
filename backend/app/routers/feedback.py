from fastapi import APIRouter, HTTPException, status

from app.models import FeedbackCreate, IdeaStatus, MessageResponse
from app.store import store

router = APIRouter(prefix="/api/feedbacks", tags=["feedbacks"])


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(payload: FeedbackCreate) -> MessageResponse:
    idea = store.get_idea(payload.idea_id)
    if idea is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Проект не найден")
    if idea.status != IdeaStatus.DONE.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Отзыв доступен только для реализованных проектов",
        )
    return MessageResponse(
        message="Отзыв успешно добавлен в таблицу Feedbacks базы данных PostgreSQL!"
    )
