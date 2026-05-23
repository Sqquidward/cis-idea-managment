from __future__ import annotations

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.avatars import DEFAULT_AVATAR_EMOJI
from app.db_models import Feedback, Idea, ProjectPlan, User, Vote
from app.models import IdeaStatus
from app.roles import UserRole
from app.security import hash_password

DEMO_PASSWORD = "12345"


def _author_team(display_name: str, task: str) -> list[dict]:
    return [{"display_name": display_name, "task": task, "is_author": True}]


def _team_with_members(author_name: str, author_task: str, extras: list[tuple[str, str]]) -> list[dict]:
    members = [{"display_name": author_name, "task": author_task, "is_author": True}]
    for name, task in extras:
        members.append({"display_name": name, "task": task, "is_author": False})
    return members


def _get_or_create_user(
    db: Session,
    *,
    username: str,
    display_name: str,
    role: str,
    password: str = DEMO_PASSWORD,
    avatar_emoji: str = DEFAULT_AVATAR_EMOJI,
) -> User:
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        user = User(
            username=username,
            password_hash=hash_password(password),
            display_name=display_name,
            role=role,
            avatar_emoji=avatar_emoji,
        )
        db.add(user)
        db.flush()
    else:
        user.role = role
        user.display_name = display_name
        if not user.avatar_emoji:
            user.avatar_emoji = avatar_emoji
    return user


def _add_vote(db: Session, user: User, idea: Idea, value: int) -> None:
    exists = (
        db.query(Vote)
        .filter(Vote.user_id == user.id, Vote.idea_id == idea.id)
        .first()
    )
    if exists:
        return
    db.add(Vote(user_id=user.id, idea_id=idea.id, value=value))
    idea.rating += value


def _get_or_create_idea(
    db: Session,
    *,
    idea_id: int,
    title: str,
    idea_type: str,
    description: str,
    status: str,
    rating: int,
    author: User,
) -> Idea:
    idea = db.get(Idea, idea_id)
    if idea is None:
        idea = Idea(
            id=idea_id,
            title=title,
            type=idea_type,
            description=description,
            status=status,
            rating=rating,
            author_id=author.id,
        )
        db.add(idea)
        db.flush()
    return idea


def _sync_idea_sequence(db: Session) -> None:
    db.execute(
        text(
            "SELECT setval('ideas_id_seq', GREATEST("
            "(SELECT COALESCE(MAX(id), 1) FROM ideas), 1), true)"
        )
    )


def seed_database(db: Session) -> None:
    if not db.scalar(select(func.count()).select_from(User)):
        _seed_initial(db)
    _ensure_role_accounts(db)
    _ensure_demo_plans(db)
    _ensure_rich_demo_data(db)
    db.commit()


def _seed_initial(db: Session) -> None:
    admin = _get_or_create_user(
        db,
        username="Admin",
        display_name="Администратор системы",
        role=UserRole.ADMIN.value,
        avatar_emoji="🛡️",
    )
    regular_user = _get_or_create_user(
        db,
        username="User",
        display_name="Пользователь (Сотрудник)",
        role=UserRole.USER.value,
        avatar_emoji="👤",
    )
    committee = _get_or_create_user(
        db,
        username="Committee",
        display_name="Комитет (Эксперт)",
        role=UserRole.COMMITTEE.value,
        avatar_emoji="🎯",
    )
    kulikova = _get_or_create_user(
        db,
        username="kulikova",
        display_name="Куликова И. В.",
        role=UserRole.USER.value,
        avatar_emoji="👩‍💻",
    )
    mukhayarov = _get_or_create_user(
        db,
        username="mukhayarov",
        display_name="Мухаяров В. А.",
        role=UserRole.USER.value,
        avatar_emoji="🔧",
    )
    timoshenko = _get_or_create_user(
        db,
        username="timoshenko",
        display_name="Тимошенко Д. М.",
        role=UserRole.USER.value,
        avatar_emoji="💡",
    )

    idea_101 = _get_or_create_idea(
        db,
        idea_id=101,
        title="Оптимизация работы столовой предприятия",
        idea_type="Организационная",
        description=(
            "Внедрение мобильного терминала предварительного заказа блюд "
            "для снижения очередей в обеденные перерывы сотрудников."
        ),
        status=IdeaStatus.VOTING.value,
        rating=0,
        author=kulikova,
    )
    idea_102 = _get_or_create_idea(
        db,
        idea_id=102,
        title="Внедрение нового отказоустойчивого VPN-клиента",
        idea_type="Технологическая",
        description=(
            "Замена текущего VPN-сервиса на современный клиент с поддержкой "
            "асинхронного шифрования для повышения стабильности удалённых сессий."
        ),
        status=IdeaStatus.IMPLEMENTATION.value,
        rating=0,
        author=mukhayarov,
    )
    idea_103 = _get_or_create_idea(
        db,
        idea_id=103,
        title="Единый портал заявок IT-службы",
        idea_type="Технологическая",
        description=(
            "Централизация обращений сотрудников в IT через единый веб-портал "
            "с отслеживанием статуса и SLA."
        ),
        status=IdeaStatus.DONE.value,
        rating=0,
        author=timoshenko,
    )
    db.flush()
    _sync_idea_sequence(db)

    _add_vote(db, admin, idea_102, 1)
    _add_vote(db, admin, idea_103, 1)

    if idea_102.plan is None:
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
    if idea_103.plan is None:
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
    if not db.query(Feedback).filter(Feedback.idea_id == 103).first():
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

    _add_vote(db, admin, idea_101, 1)
    _add_vote(db, regular_user, idea_101, 1)
    _add_vote(db, mukhayarov, idea_101, 0)
    _add_vote(db, timoshenko, idea_101, 1)

    db.commit()


def _ensure_role_accounts(db: Session) -> None:
    _get_or_create_user(
        db,
        username="Admin",
        display_name="Администратор системы",
        role=UserRole.ADMIN.value,
        avatar_emoji="🛡️",
    )
    _get_or_create_user(
        db,
        username="User",
        display_name="Пользователь (Сотрудник)",
        role=UserRole.USER.value,
        avatar_emoji="👤",
    )
    _get_or_create_user(
        db,
        username="Committee",
        display_name="Комитет (Эксперт)",
        role=UserRole.COMMITTEE.value,
        avatar_emoji="🎯",
    )

    for user in db.query(User).filter(User.role == "Сотрудник").all():
        user.role = UserRole.USER.value


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
        else:
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


def _ensure_rich_demo_data(db: Session) -> None:
    admin = db.query(User).filter(User.username == "Admin").first()
    regular = db.query(User).filter(User.username == "User").first()
    committee = db.query(User).filter(User.username == "Committee").first()
    kulikova = _get_or_create_user(
        db,
        username="kulikova",
        display_name="Куликова И. В.",
        role=UserRole.USER.value,
        avatar_emoji="👩‍💻",
    )
    mukhayarov = _get_or_create_user(
        db,
        username="mukhayarov",
        display_name="Мухаяров В. А.",
        role=UserRole.USER.value,
        avatar_emoji="🔧",
    )
    timoshenko = _get_or_create_user(
        db,
        username="timoshenko",
        display_name="Тимошенко Д. М.",
        role=UserRole.USER.value,
        avatar_emoji="💡",
    )
    ivanov = _get_or_create_user(
        db,
        username="ivanov",
        display_name="Иванов П. С.",
        role=UserRole.USER.value,
        avatar_emoji="📊",
    )

    if admin is None or regular is None:
        return

    idea_101 = db.get(Idea, 101)
    if idea_101 and idea_101.status == IdeaStatus.VOTING.value:
        _add_vote(db, admin, idea_101, 1)
        _add_vote(db, regular, idea_101, 1)
        _add_vote(db, mukhayarov, idea_101, 0)
        _add_vote(db, timoshenko, idea_101, 1)
        _add_vote(db, ivanov, idea_101, -1)

    if db.get(Idea, 104) is None:
        author_name = regular.display_name.replace(" (Вы)", "").strip()
        idea_104 = _get_or_create_idea(
            db,
            idea_id=104,
            title="Автоматизация onboarding новых сотрудников",
            idea_type="Организационная",
            description=(
                "Цифровой чек-лист и автоматические заявки в IT и HR "
                "при приёме нового сотрудника: учётные записи, оборудование, доступы."
            ),
            status=IdeaStatus.IMPLEMENTATION.value,
            rating=0,
            author=regular,
        )
        _add_vote(db, admin, idea_104, 1)
        _add_vote(db, kulikova, idea_104, 1)
        _add_vote(db, timoshenko, idea_104, 1)
        if idea_104.plan is None:
            db.add(
                ProjectPlan(
                    idea_id=104,
                    deadline="2026-11-01",
                    tasks={},
                    team_members=_team_with_members(
                        author_name,
                        "Проектирование сценариев onboarding и контроль сроков",
                        [("Куликова И. В.", "Согласование процессов с HR")],
                    ),
                )
            )

    if db.get(Idea, 105) is None:
        idea_105 = _get_or_create_idea(
            db,
            idea_id=105,
            title="Канбан-доска для операционных задач филиала",
            idea_type="Бережливое производство",
            description=(
                "Визуализация потока мелких задач отделения: лимиты WIP, "
                "еженедельные stand-up и метрики просрочки."
            ),
            status=IdeaStatus.VOTING.value,
            rating=0,
            author=ivanov,
        )
        _add_vote(db, admin, idea_105, 1)
        _add_vote(db, regular, idea_105, 1)
        _add_vote(db, kulikova, idea_105, 1)
        _add_vote(db, mukhayarov, idea_105, -1)

    if db.get(Idea, 106) is None:
        idea_106 = _get_or_create_idea(
            db,
            idea_id=106,
            title="Мобильное приложение для внутренних опросов",
            idea_type="Технологическая",
            description=(
                "Быстрые пульс-опросы сотрудников с анонимным режимом "
                "и дашбордом для руководителей."
            ),
            status=IdeaStatus.VOTING.value,
            rating=0,
            author=timoshenko,
        )
        _add_vote(db, regular, idea_106, 1)
        _add_vote(db, ivanov, idea_106, 0)
        _add_vote(db, kulikova, idea_106, 1)

    if db.get(Idea, 107) is None:
        _get_or_create_idea(
            db,
            idea_id=107,
            title="Замена бумажного архива на электронный",
            idea_type="Организационная",
            description=(
                "Сканирование и индексация исторических документов с поиском по метаданным. "
                "Инициатива снята с рассмотрения из-за высокой стоимости."
            ),
            status=IdeaStatus.ARCHIVE.value,
            rating=-2,
            author=mukhayarov,
        )
        idea_107 = db.get(Idea, 107)
        if idea_107:
            _add_vote(db, admin, idea_107, -1)
            _add_vote(db, regular, idea_107, -1)

    if db.get(Idea, 108) is None:
        idea_108 = _get_or_create_idea(
            db,
            idea_id=108,
            title="Электронная визитка для клиентских встреч",
            idea_type="Организационная",
            description=(
                "Генерация QR-визиток с актуальными контактами и ссылкой на профиль "
                "в корпоративном каталоге."
            ),
            status=IdeaStatus.DONE.value,
            rating=0,
            author=kulikova,
        )
        _add_vote(db, admin, idea_108, 1)
        _add_vote(db, regular, idea_108, 1)
        _add_vote(db, timoshenko, idea_108, 1)
        if idea_108.plan is None:
            db.add(
                ProjectPlan(
                    idea_id=108,
                    deadline="2026-04-20",
                    tasks={},
                    team_members=_author_team(
                        "Куликова И. В.",
                        "Внедрение шаблонов и обучение сотрудников фронт-офиса",
                    ),
                )
            )
        if not db.query(Feedback).filter(Feedback.idea_id == 108, Feedback.user_id == regular.id).first():
            db.add(
                Feedback(
                    idea_id=108,
                    user_id=regular.id,
                    rating=4,
                    text="Удобно на встречах с корпоративными клиентами, меньше печатных визиток.",
                )
            )
        if not db.query(Feedback).filter(Feedback.idea_id == 108, Feedback.user_id == admin.id).first():
            db.add(
                Feedback(
                    idea_id=108,
                    user_id=admin.id,
                    rating=5,
                    text="Быстрый запуск, интеграция с каталогом сотрудников работает стабильно.",
                )
            )

    if db.get(Idea, 109) is None:
        idea_109 = _get_or_create_idea(
            db,
            idea_id=109,
            title="Шаблоны отчётов для еженедельных комитетов",
            idea_type="Организационная",
            description=(
                "Единые макеты в корпоративном BI с авто-подстановкой KPI филиалов."
            ),
            status=IdeaStatus.VOTING.value,
            rating=0,
            author=admin,
        )
        _add_vote(db, regular, idea_109, 1)
        _add_vote(db, kulikova, idea_109, 0)

    if db.get(Idea, 110) is None:
        idea_110 = _get_or_create_idea(
            db,
            idea_id=110,
            title="Резервное копирование рабочих станций в облако",
            idea_type="Технологическая",
            description=(
                "Автоматический бэкап профилей разработчиков с шифрованием "
                "и восстановлением за один рабочий день."
            ),
            status=IdeaStatus.VOTING.value,
            rating=0,
            author=mukhayarov,
        )
        _add_vote(db, admin, idea_110, 1)
        _add_vote(db, timoshenko, idea_110, 1)
        _add_vote(db, ivanov, idea_110, 1)
        _add_vote(db, regular, idea_110, -1)

    idea_103 = db.get(Idea, 103)
    if idea_103 is None and timoshenko:
        idea_103 = _get_or_create_idea(
            db,
            idea_id=103,
            title="Единый портал заявок IT-службы",
            idea_type="Технологическая",
            description=(
                "Централизация обращений сотрудников в IT через единый веб-портал "
                "с отслеживанием статуса и SLA."
            ),
            status=IdeaStatus.DONE.value,
            rating=0,
            author=timoshenko,
        )
        _add_vote(db, admin, idea_103, 1)
        _add_vote(db, regular, idea_103, 1)
        if idea_103.plan is None:
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
        if not db.query(Feedback).filter(Feedback.idea_id == 103).first():
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
    elif idea_103 and not db.query(Feedback).filter(Feedback.idea_id == 103, Feedback.user_id == regular.id).first():
        db.add(
            Feedback(
                idea_id=103,
                user_id=regular.id,
                rating=4,
                text="Заявки в IT теперь не теряются в почте, удобно отслеживать статус.",
            )
        )

    _sync_idea_sequence(db)
