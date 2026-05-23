from __future__ import annotations

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.db_models import Feedback as FeedbackRow
from app.db_models import Idea as IdeaRow
from app.db_models import ProjectPlan as ProjectPlanRow
from app.db_models import User
from app.db_models import Vote as VoteRow
from app.models import FeedbackOut, Idea, IdeaCreate, IdeaStatus, PlanTeamMember, ProjectPlan
from app.roles import UserRole


class PlanPermissionError(PermissionError):
    pass


class IdeaStore:
    def __init__(self, db: Session, current_user: User) -> None:
        self._db = db
        self._user = current_user

    def _my_vote(self, idea_id: int) -> int | None:
        row = (
            self._db.query(VoteRow.value)
            .filter(VoteRow.idea_id == idea_id, VoteRow.user_id == self._user.id)
            .first()
        )
        return row[0] if row is not None else None

    def _has_voted(self, idea_id: int) -> bool:
        return self._my_vote(idea_id) is not None

    def _can_manage_plan(self, row: IdeaRow) -> bool:
        if row.author_id == self._user.id:
            return True
        return self._user.role == UserRole.ADMIN.value

    def _normalize_team(self, row: IdeaRow, team: list[PlanTeamMember]) -> list[dict]:
        author_name = row.author.display_name.replace(" (Вы)", "").strip()
        author_task = ""
        extra: list[PlanTeamMember] = []

        for member in team:
            if member.is_author:
                author_task = member.task.strip()
            else:
                name = member.display_name.strip()
                if name:
                    extra.append(
                        PlanTeamMember(
                            display_name=name,
                            task=member.task.strip(),
                            is_author=False,
                        )
                    )

        return [
            {
                "display_name": author_name,
                "task": author_task,
                "is_author": True,
            },
            *[
                {
                    "display_name": m.display_name,
                    "task": m.task,
                    "is_author": False,
                }
                for m in extra
            ],
        ]

    def _parse_team_members(
        self,
        plan_row: ProjectPlanRow,
        author_name: str,
    ) -> list[PlanTeamMember]:
        raw = plan_row.team_members
        if isinstance(raw, list) and raw:
            return [PlanTeamMember.model_validate(item) for item in raw]

        if isinstance(plan_row.tasks, dict) and plan_row.tasks:
            members = [
                PlanTeamMember(display_name=author_name, task="", is_author=True),
            ]
            for _key, task in plan_row.tasks.items():
                if task:
                    members[0] = PlanTeamMember(
                        display_name=author_name,
                        task=str(task),
                        is_author=True,
                    )
                    break
            return members

        return [PlanTeamMember(display_name=author_name, task="", is_author=True)]

    def _plan_to_schema(self, plan_row: ProjectPlanRow | None, author_name: str) -> ProjectPlan | None:
        if plan_row is None:
            return None
        return ProjectPlan(
            deadline=plan_row.deadline,
            team=self._parse_team_members(plan_row, author_name),
        )

    def _to_schema(self, row: IdeaRow) -> Idea:
        author_name = row.author.display_name
        return Idea(
            id=row.id,
            title=row.title,
            type=row.type,
            description=row.description,
            author=author_name,
            author_id=str(row.author_id),
            is_owner=row.author_id == self._user.id,
            status=row.status,
            rating=row.rating,
            voted=self._has_voted(row.id),
            my_vote=self._my_vote(row.id),
            plan=self._plan_to_schema(row.plan, author_name.replace(" (Вы)", "").strip()),
        )

    def _get_row(self, idea_id: int) -> IdeaRow | None:
        return (
            self._db.query(IdeaRow)
            .options(joinedload(IdeaRow.author), joinedload(IdeaRow.plan))
            .filter(IdeaRow.id == idea_id)
            .first()
        )

    def list_ideas(self) -> list[Idea]:
        rows = (
            self._db.query(IdeaRow)
            .options(joinedload(IdeaRow.author), joinedload(IdeaRow.plan))
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

    def save_plan(self, idea_id: int, deadline: str, team: list[PlanTeamMember]) -> Idea:
        row = self._get_row(idea_id)
        if row is None or row.status != IdeaStatus.IMPLEMENTATION.value:
            raise ValueError("Проект недоступен для планирования")
        if not self._can_manage_plan(row):
            raise PlanPermissionError("Рабочую группу может формировать только автор идеи")

        normalized_team = self._normalize_team(row, team)

        if row.plan is None:
            self._db.add(
                ProjectPlanRow(
                    idea_id=idea_id,
                    deadline=deadline,
                    tasks={},
                    team_members=normalized_team,
                )
            )
        else:
            row.plan.deadline = deadline
            row.plan.team_members = normalized_team

        row.status = IdeaStatus.DONE.value
        self._db.commit()
        loaded = self._get_row(idea_id)
        if loaded is None:
            raise RuntimeError("Не удалось загрузить план проекта")
        return self._to_schema(loaded)

    def list_feedbacks(self) -> list[FeedbackOut]:
        rows = (
            self._db.query(FeedbackRow)
            .options(joinedload(FeedbackRow.idea), joinedload(FeedbackRow.user))
            .order_by(FeedbackRow.created_at.desc())
            .all()
        )
        return [self._feedback_to_schema(row) for row in rows]

    def _feedback_to_schema(self, row: FeedbackRow) -> FeedbackOut:
        created = row.created_at
        return FeedbackOut(
            id=row.id,
            idea_id=row.idea_id,
            idea_title=row.idea.title,
            user_id=str(row.user_id),
            author_name=row.user.display_name,
            rating=row.rating,
            text=row.text,
            is_mine=row.user_id == self._user.id,
            created_at=created.isoformat() if created else "",
        )

    def create_feedback(self, idea_id: int, rating: int, text: str) -> FeedbackOut:
        row = FeedbackRow(
            idea_id=idea_id,
            user_id=self._user.id,
            rating=rating,
            text=text.strip(),
        )
        self._db.add(row)
        try:
            self._db.commit()
        except IntegrityError:
            self._db.rollback()
            raise ValueError("Вы уже оставляли отзыв по этому проекту") from None
        self._db.refresh(row)
        row = (
            self._db.query(FeedbackRow)
            .options(joinedload(FeedbackRow.idea), joinedload(FeedbackRow.user))
            .filter(FeedbackRow.id == row.id)
            .one()
        )
        return self._feedback_to_schema(row)
