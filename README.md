# КИС «Управление идеями»

Система для сбора и реализации инновационных предложений сотрудников.

## Документация

| Документ | Описание |
|----------|----------|
| [Руководство пользователя](wiki-pages/README.md) | Пошаговые инструкции по этапам |
| [Техническая документация](docs/manual/Developer_Documentation_Idea_Management.md) | API, архитектура, запуск |
| [E2E-тестирование](docs/manual/E2E_Testing.md) | Playwright: архитектура, сценарии, CI |
| [E2E — быстрый старт](e2e/README.md) | Команды и устранение неполадок |

## Быстрый старт

```bash
docker compose up -d db
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

В другом терминале:

```bash
cd frontend && npm install && npm run dev
```

| Сервис | URL |
|--------|-----|
| Приложение | http://127.0.0.1:5173 |
| API (Swagger) | http://127.0.0.1:8001/docs |

Прокси Vite направляет `/api` на порт **8001** (`frontend/vite.config.ts`).  
Если запускаете backend на 8000, измените `target` в конфиге или порт `uvicorn`.

## E2E-тесты

Требуется **Node.js 18+** (файл `.nvmrc`).

```bash
nvm use
npm install && npm run playwright:install
# backend :8001 и frontend :5173 должны быть запущены
npm run test:e2e:cycle    # полный цикл идеи (видимый браузер)
npm run test:e2e:watch    # тур по вкладкам
npm run test:e2e          # все тесты, headless
```

Подробнее: [e2e/README.md](e2e/README.md).

## Команда (ИНБО-12-23)

- Чихалов Г. В. (PM)
- Мухаяров В. А. (Developer)
- Тимошенко Д. М. (Designer)
- Полиэктов М. А. (Tech Writer)
