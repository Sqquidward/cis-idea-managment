# КИС «Управление идеями»

Система для сбора и реализации инновационных предложений сотрудников.

## Стек технологий

- **Backend:** Python (FastAPI), in-memory store (демо)
- **Frontend:** React (Vite), TypeScript, Tailwind CSS

## Запуск

### Backend (порт 8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
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

- Логин: `Admin`
- Пароль: `12345`

## Документация

- [Руководство пользователя](wiki-pages/README.md)
- [Техническая документация (PDF)](docs/manual/Техническая%20документация.pdf)
- API (Sphinx): каталог `docs/`

## Команда (ИНБО-12-23)

- Чихалов Г. В. (PM)
- Мухаяров В. А. (Developer)
- Тимошенко Д. М. (Designer)
- Полиэктов М. А. (Tech Writer)

> Файл `app.html` в корне — устаревший монолитный прототип; актуальный UI — в `frontend/`.
