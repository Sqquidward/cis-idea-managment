# КИС «Управление идеями»

Система для сбора и реализации инновационных предложений сотрудников.

## Документация

- [Руководство пользователя](wiki-pages/README.md)
- [Техническая документация для разработчиков](docs/manual/Developer_Documentation_Idea_Management.md)

## Быстрый старт

```bash
docker compose up -d db
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && alembic upgrade head
uvicorn app.main:app --reload
```

В другом терминале:

```bash
cd frontend && npm install && npm run dev
```

Приложение: http://127.0.0.1:5173 · API: http://127.0.0.1:8000/docs

Полная инструкция (окружение, учётные записи, JWT, устранение неполадок):  
[Запуск системы](docs/manual/Developer_Documentation_Idea_Management.md#запуск-системы) в технической документации.

## Команда (ИНБО-12-23)

- Чихалов Г. В. (PM)
- Мухаяров В. А. (Developer)
- Тимошенко Д. М. (Designer)
- Полиэктов М. А. (Tech Writer)