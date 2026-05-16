from __future__ import annotations

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.db_models import Idea, User, Vote
from app.models import IdeaStatus
from app.roles import UserRole
from app.security import hash_password


def seed_database(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(User)):
        _ensure_committee_user(db)
        return

    admin = User(
        username="Admin",
        password_hash=hash_password("12345"),
        role=UserRole.EMPLOYEE.value,
        display_name="Admin (Пользователь)",
    )
    committee = User(
        username="Committee",
        password_hash=hash_password("12345"),
        role=UserRole.COMMITTEE.value,
        display_name="Комитет (Эксперт)",
    )
    kulikova = User(
        username="kulikova",
        password_hash=hash_password("unused"),
        role=UserRole.EMPLOYEE.value,
        display_name="Куликова И. В.",
    )
    mukhayarov = User(
        username="mukhayarov",
        password_hash=hash_password("unused"),
        role=UserRole.EMPLOYEE.value,
        display_name="Мухаяров В. А.",
    )
    db.add_all([admin, committee, kulikova, mukhayarov])
    db.flush()

    idea_101 = Idea(
        id=101,
        title="Оптимизация работы столовой предприятия",
        type="Организационная",
        description=(
            "Внедрение мобильного терминала предварительного заказа блюд "
            "для снижения очередей в обеденные перерывы сотрудников банка."
        ),
        status=IdeaStatus.VOTING.value,
        rating=15,
        author_id=kulikova.id,
    )
    idea_102 = Idea(
        id=102,
        title="Внедрение нового отказоустойчивого VPN-клиента",
        type="Технологическая",
        description=(
            "Замена текущего VPN-сервиса на современный клиент с поддержкой "
            "асинхронного шифрования для повышения стабильности удалённых сессий."
        ),
        status=IdeaStatus.IMPLEMENTATION.value,
        rating=32,
        author_id=mukhayarov.id,
    )
    db.add_all([idea_101, idea_102])
    db.flush()
    db.execute(text("SELECT setval('ideas_id_seq', 102, true)"))

    db.add(Vote(user_id=admin.id, idea_id=102, value=1))
    db.commit()


def _ensure_committee_user(db: Session) -> None:
    if db.query(User).filter(User.username == "Committee").first():
        return
    db.add(
        User(
            username="Committee",
            password_hash=hash_password("12345"),
            role=UserRole.COMMITTEE.value,
            display_name="Комитет (Эксперт)",
        )
    )
    db.commit()
