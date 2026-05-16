from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.db_models import Feedback as FeedbackRow
from app.db_models import Idea as IdeaRow
from app.db_models import User
from app.db_models import Vote as VoteRow
from app.models import Idea, IdeaCreate, IdeaStatus


class IdeaStore:
    def __init__(self, db: Session, current_user: User) -> None:
        self._db = db
        self._user = current_user

    def _has_voted(self, idea_id: int) -> bool:
        return (
            self._db.query(VoteRow.id)
            .filter(VoteRow.idea_id == idea_id, VoteRow.user_id == self._user.id)
            .first()
            is not None
        )

    def _to_schema(self, row: IdeaRow) -> Idea:
        return Idea(
            id=row.id,
            title=row.title,
            type=row.type,
            description=row.description,
            author=row.author.display_name,
            status=row.status,
            rating=row.rating,
            voted=self._has_voted(row.id),
        )

    def _get_row(self, idea_id: int) -> IdeaRow | None:
        return (
            self._db.query(IdeaRow)
            .options(joinedload(IdeaRow.author))
            .filter(IdeaRow.id == idea_id)
            .first()
        )

    def list_ideas(self) -> list[Idea]:
        rows = (
            self._db.query(IdeaRow)
            .options(joinedload(IdeaRow.author))
            .order_by(IdeaRow.id)
            .all()
        )
        return [self._to_schema(row) for row in rows]

    def get_idea(self, idea_id: int) -> Idea | None:
        row = self._get_row(idea_id)
        return self._to_schema(row) if row else None

    def create_idea(self, payload: IdeaCreate, author: str) -> Idea:
        row = IdeaRow(
            title=payload.title.strip(),
            type=payload.type,
            description=payload.description.strip(),
            author_id=self._user.id,
            status=IdeaStatus.VOTING.value,
            rating=0,
        )
        self._db.add(row)
        self._db.commit()
        loaded = self._get_row(row.id)
        if loaded is None:
            raise RuntimeError("Не удалось загрузить созданную идею")
        idea = self._to_schema(loaded)
        return idea.model_copy(update={"author": author})

    def vote(self, idea_id: int, delta: int) -> Idea | None:
        row = self._get_row(idea_id)
        if row is None or row.status != IdeaStatus.VOTING.value or self._has_voted(idea_id):
            return None

        self._db.add(VoteRow(user_id=self._user.id, idea_id=idea_id, value=delta))
        row.rating += delta
        try:
            self._db.commit()
        except IntegrityError:
            self._db.rollback()
            return None

        self._db.refresh(row)
        return self._to_schema(row)

    def update_status(self, idea_id: int, status: str) -> Idea | None:
        row = self._get_row(idea_id)
        if row is None:
            return None
        row.status = status
        self._db.commit()
        self._db.refresh(row)
        return self._to_schema(row)

    def save_plan(self, idea_id: int) -> Idea | None:
        row = self._get_row(idea_id)
        if row is None or row.status != IdeaStatus.IMPLEMENTATION.value:
            return None
        row.status = IdeaStatus.DONE.value
        self._db.commit()
        self._db.refresh(row)
        return self._to_schema(row)

    def create_feedback(self, idea_id: int, rating: int, text: str) -> None:
        self._db.add(
            FeedbackRow(
                idea_id=idea_id,
                user_id=self._user.id,
                rating=rating,
                text=text.strip(),
            )
        )
        self._db.commit()
