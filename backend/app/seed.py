from __future__ import annotations

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.db_models import Feedback, Idea, ProjectPlan, User, Vote
from app.models import IdeaStatus
from app.roles import UserRole
from app.security import hash_password


def _author_team(display_name: str, task: str) -> list[dict]:
    return [{"display_name": display_name, "task": task, "is_author": True}]


def seed_database(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(User)):
        _ensure_role_accounts(db)
        _ensure_demo_plans(db)
        return

    admin = User(
        username="Admin",
        password_hash=hash_password("12345"),
        role=UserRole.ADMIN.value,
        display_name="Администратор системы",
    )
    regular_user = User(
        username="User",
        password_hash=hash_password("12345"),
        role=UserRole.USER.value,
        display_name="Пользователь (Сотрудник)",
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
        role=UserRole.USER.value,
        display_name="Куликова И. В.",
    )
    mukhayarov = User(
        username="mukhayarov",
        password_hash=hash_password("unused"),
        role=UserRole.USER.value,
        display_name="Мухаяров В. А.",
    )
    timoshenko = User(
        username="timoshenko",
        password_hash=hash_password("unused"),
        role=UserRole.USER.value,
        display_name="Тимошенко Д. М.",
    )
    db.add_all([admin, regular_user, committee, kulikova, mukhayarov, timoshenko])
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
    idea_103 = Idea(
        id=103,
        title="Единый портал заявок IT-службы",
        type="Технологическая",
        description=(
            "Централизация обращений сотрудников в IT через единый веб-портал "
            "с отслеживанием статуса и SLA."
        ),
        status=IdeaStatus.DONE.value,
        rating=28,
        author_id=timoshenko.id,
    )
    db.add_all([idea_101, idea_102, idea_103])
    db.flush()
    db.execute(text("SELECT setval('ideas_id_seq', 103, true)"))

    db.add(Vote(user_id=admin.id, idea_id=102, value=1))
    db.add(Vote(user_id=admin.id, idea_id=103, value=1))

    db.add(
        ProjectPlan(
            idea_id=102,
            deadline="2026-09-30",
            tasks={},
            team_members=_author_team(
                "Мухаяров В. А.",
                "Координация внедрения VPN и интеграция с корпоративной сетью",
            ),
        )
    )
    db.add(
        ProjectPlan(
            idea_id=103,
            deadline="2026-06-15",
            tasks={},
            team_members=_author_team(
                "Тимошенко Д. М.",
                "Руководство проектом и приёмка результата внедрения портала",
            ),
        )
    )
    db.add(
        Feedback(
            idea_id=103,
            user_id=admin.id,
            rating=5,
            text=(
                "Портал сократил время обработки заявок на 40%. "
                "Интерфейс понятный, сотрудники быстро адаптировались."
            ),
        )
    )
    db.commit()


def _ensure_role_accounts(db: Session) -> None:
    admin = db.query(User).filter(User.username == "Admin").first()
    if admin:
        admin.role = UserRole.ADMIN.value
        if admin.display_name.startswith("Admin"):
            admin.display_name = "Администратор системы"

    if not db.query(User).filter(User.username == "User").first():
        db.add(
            User(
                username="User",
                password_hash=hash_password("12345"),
                role=UserRole.USER.value,
                display_name="Пользователь (Сотрудник)",
            )
        )

    if not db.query(User).filter(User.username == "Committee").first():
        db.add(
            User(
                username="Committee",
                password_hash=hash_password("12345"),
                role=UserRole.COMMITTEE.value,
                display_name="Комитет (Эксперт)",
            )
        )

    for user in db.query(User).filter(User.role == "Сотрудник").all():
        user.role = UserRole.USER.value

    db.commit()


def _ensure_demo_plans(db: Session) -> None:
    idea_102 = db.get(Idea, 102)
    if idea_102:
        author_name = "Мухаяров В. А."
        if idea_102.plan:
            idea_102.plan.team_members = _author_team(
                author_name,
                "Координация внедрения VPN и интеграция с корпоративной сетью",
            )
            idea_102.plan.tasks = {}
        elif not idea_102.plan:
            db.add(
                ProjectPlan(
                    idea_id=102,
                    deadline="2026-09-30",
                    tasks={},
                    team_members=_author_team(
                        author_name,
                        "Координация внедрения VPN и интеграция с корпоративной сетью",
                    ),
                )
            )

    has_implementation = (
        db.query(Idea).filter(Idea.status == IdeaStatus.IMPLEMENTATION.value).first() is not None
    )
    if not has_implementation:
        mukhayarov = db.query(User).filter(User.username == "mukhayarov").first()
        regular_user = db.query(User).filter(User.username == "User").first()
        author = regular_user or mukhayarov
        if author and db.get(Idea, 104) is None:
            author_name = author.display_name.replace(" (Вы)", "").strip()
            idea_104 = Idea(
                id=104,
                title="Автоматизация onboarding новых сотрудников",
                type="Организационная",
                description=(
                    "Цифровой чек-лист и автоматические заявки в IT/HR "
                    "при приёме нового сотрудника."
                ),
                status=IdeaStatus.IMPLEMENTATION.value,
                rating=21,
                author_id=author.id,
            )
            db.add(idea_104)
            db.flush()
            db.add(
                ProjectPlan(
                    idea_id=104,
                    deadline="2026-11-01",
                    tasks={},
                    team_members=_author_team(
                        author_name,
                        "Проектирование сценариев onboarding и контроль сроков",
                    ),
                )
            )
            db.execute(
                text("SELECT setval('ideas_id_seq', GREATEST(104, (SELECT MAX(id) FROM ideas)), true)")
            )

    if db.get(Idea, 103) is None:
        timoshenko = db.query(User).filter(User.username == "timoshenko").first()
        admin = db.query(User).filter(User.username == "Admin").first()
        if timoshenko is None:
            timoshenko = User(
                username="timoshenko",
                password_hash=hash_password("unused"),
                role=UserRole.USER.value,
                display_name="Тимошенко Д. М.",
            )
            db.add(timoshenko)
            db.flush()

        idea_103 = Idea(
            id=103,
            title="Единый портал заявок IT-службы",
            type="Технологическая",
            description=(
                "Централизация обращений сотрудников в IT через единый веб-портал "
                "с отслеживанием статуса и SLA."
            ),
            status=IdeaStatus.DONE.value,
            rating=28,
            author_id=timoshenko.id,
        )
        db.add(idea_103)
        db.flush()
        db.execute(text("SELECT setval('ideas_id_seq', GREATEST(103, (SELECT MAX(id) FROM ideas)), true)"))

        db.add(
            ProjectPlan(
                idea_id=103,
                deadline="2026-06-15",
                tasks={},
                team_members=_author_team(
                    "Тимошенко Д. М.",
                    "Руководство проектом и приёмка результата внедрения портала",
                ),
            )
        )
        if admin and not db.query(Vote).filter(Vote.idea_id == 103, Vote.user_id == admin.id).first():
            db.add(Vote(user_id=admin.id, idea_id=103, value=1))
        if admin and not db.query(Feedback).filter(Feedback.idea_id == 103).first():
            db.add(
                Feedback(
                    idea_id=103,
                    user_id=admin.id,
                    rating=5,
                    text=(
                        "Портал сократил время обработки заявок на 40%. "
                        "Интерфейс понятный, сотрудники быстро адаптировались."
                    ),
                )
            )

    db.commit()
