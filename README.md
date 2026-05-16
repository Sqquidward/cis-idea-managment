# КИС «Управление идеями»

Система для сбора и реализации инновационных предложений сотрудников.

## Документация

- [Руководство пользователя](wiki-pages/README.md)
- [Техническая документация для разработчиков](docs/manual/Developer_Documentation_Idea_Management.md)

## Запуск

### База данных (PostgreSQL)

```bash
docker compose up -d db
```

По умолчанию: `postgresql://cis:cis@127.0.0.1:15432/cis_ideas` (порт **15432** в `docker-compose.yml`).  
Свой URL — в `backend/.env` (см. `backend/.env.example`).

### Backend (порт 8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

API: http://127.0.0.1:8000/docs

### Frontend (порт 5173)

Требуется Node.js 18+ (рекомендуется 20).

```bash
cd frontend
npm install
npm run dev
```

Приложение: http://127.0.0.1:5173

Запросы к `/api/*` проксируются на backend через Vite.

### Учётные данные (демо)

| Логин | Пароль | Роль |
| :--- | :--- | :--- |
| `Admin` | `12345` | Сотрудник — подача идей, голосование, план, отзывы |
| `Committee` | `12345` | Комитет — решения по статусам идей |

После входа API принимает заголовок `Authorization: Bearer <token>`.

## Команда (ИНБО-12-23)

- Чихалов Г. В. (PM)
- Мухаяров В. А. (Developer)
- Тимошенко Д. М. (Designer)
- Полиэктов М. А. (Tech Writer)