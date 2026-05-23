from __future__ import annotations

import uuid

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_emoji: Mapped[str] = mapped_column(String(16), nullable=False, default="👤")

    ideas: Mapped[list[Idea]] = relationship(back_populates="author")
    votes: Mapped[list[Vote]] = relationship(back_populates="user")
    feedbacks: Mapped[list[Feedback]] = relationship(back_populates="user")


class Idea(Base):
    __tablename__ = "ideas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(30), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    author_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    author: Mapped[User] = relationship(back_populates="ideas")
    votes: Mapped[list[Vote]] = relationship(back_populates="idea")
    feedbacks: Mapped[list[Feedback]] = relationship(back_populates="idea")
    plan: Mapped[ProjectPlan | None] = relationship(back_populates="idea", uselist=False)


class ProjectPlan(Base):
    __tablename__ = "project_plans"

    idea_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ideas.id", ondelete="CASCADE"),
        primary_key=True,
    )
    deadline: Mapped[str] = mapped_column(String(10), nullable=False)
    tasks: Mapped[dict] = mapped_column(JSON, nullable=False)
    team_members: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    idea: Mapped[Idea] = relationship(back_populates="plan")


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("user_id", "idea_id", name="uq_user_idea"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    idea_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ideas.id", ondelete="CASCADE"),
        nullable=False,
    )
    value: Mapped[int] = mapped_column(Integer, nullable=False)

    user: Mapped[User] = relationship(back_populates="votes")
    idea: Mapped[Idea] = relationship(back_populates="votes")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    idea_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ideas.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (UniqueConstraint("user_id", "idea_id", name="uq_feedback_user_idea"),)

    idea: Mapped[Idea] = relationship(back_populates="feedbacks")
    user: Mapped[User] = relationship(back_populates="feedbacks")
