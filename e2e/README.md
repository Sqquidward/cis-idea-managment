# E2E-тестирование (Playwright)

Автоматическая проверка UI КИС «Управление идеями» в браузере Chromium.  
Полная техническая спецификация: [docs/manual/E2E_Testing.md](../docs/manual/E2E_Testing.md).

## Требования

| Компонент | Версия / значение |
|-----------|-------------------|
| Node.js | ≥ 18 ([`.nvmrc`](../.nvmrc) → 18) |
| PostgreSQL | Docker Compose, порт хоста **15432** |
| Backend | `uvicorn` на порту **8001** (прокси Vite) |
| Frontend | Vite dev, порт **5173** |

## Быстрый старт

```bash
# 1. Node
nvm use && node -v

# 2. Зависимости E2E (корень репозитория)
npm install && npm run playwright:install

# 3. Инфраструктура приложения (три терминала)
docker compose up -d db
cd backend && source .venv/bin/activate && alembic upgrade head && uvicorn app.main:app --reload --port 8001
cd frontend && npm run dev

# 4. Прогон
npm run test:e2e              # все тесты, headless
npm run test:e2e:cycle        # сквозной цикл, видимый браузер
npm run test:e2e:watch        # тур по вкладкам, видимый браузер
```

## Структура каталога

```
e2e/
├── constants.ts          # порты, селекторы, вкладки по ролям
├── types.ts              # IdeaStatus, TabLabel, DemoUser, LifecycleTestData
├── fixtures/
│   ├── auth.ts           # loginAs, logout, openTab
│   ├── idea-lifecycle.ts # шаги сценария @lifecycle
│   └── test-data.ts      # уникальные title / feedback, createLifecycleTestData()
├── helpers/
│   ├── locators.ts       # tabButton, statusBadge, карточки идей
│   ├── forms.ts          # selectOptionByIdeaTitle
│   └── dialogs.ts        # acceptNativeDialogs (alert)
└── specs/
    ├── smoke.spec.ts
    ├── visual-tour.spec.ts   # @tour
    └── idea-lifecycle.spec.ts # @lifecycle
```

Конфигурация Playwright: [`playwright.config.ts`](../playwright.config.ts) в корне репозитория.

## Команды npm

| Скрипт | Режим | Фильтр | Назначение |
|--------|-------|--------|------------|
| `npm run test:e2e` | headless | — | CI / полный прогон |
| `npm run test:e2e:cycle` | headed + slowMo | `@lifecycle` | Сквозной жизненный цикл идеи |
| `npm run test:e2e:watch` | headed + slowMo | `@tour` | Обход вкладок по ролям |
| `npm run test:e2e:ui` | Playwright UI | — | Пошаговый просмотр и отладка |
| `npm run test:e2e:debug` | debug | `@tour` | Инспектор Playwright |
| `npm run test:e2e:headed` | headed | — | Все спеки в видимом окне |
| `npm run playwright:install` | — | — | Установка браузера Chromium |

Перед каждым `test:e2e:*` выполняется проверка версии Node (`scripts/check-node-version.mjs`).

## Переменные окружения

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `HEADLESS` | `true` | `false` — показать окно браузера |
| `SLOW_MO` | `0` | Задержка между действиями (мс), в watch/cycle задаётся в npm-скрипте |
| `TOUR_PAUSE_MS` | `1200` | Пауза между вкладками в `@tour` |
| `PLAYWRIGHT_BASE_URL` | `http://127.0.0.1:5173` | URL приложения |
| `PW_NO_WEB_SERVER` | — | Не запускать `vite` из конфига (если dev уже поднят) |
| `CI` | — | Включает retry и `forbidOnly` |

Пример замедленного просмотра:

```bash
HEADLESS=false SLOW_MO=800 TOUR_PAUSE_MS=2000 npm run test:e2e:watch
```

## Наборы тестов

### `@lifecycle` — полный цикл идеи

Один serial-тест, смена учёток, уникальные `title` и `feedbackText` на прогон.

| # | Учётка | Действие | Ожидаемый статус |
|---|--------|----------|------------------|
| 1 | `User` | Публикация идеи | `Голосование` |
| 2 | `Admin` | Голос «Поддержать» | — |
| 3 | `Committee` | «Утвердить» | `Реализация` |
| 4 | `User` | План + дедлайн | `Реализована` (после `POST /api/ideas/{id}/plan`) |
| 5 | `Admin` | Отзыв 5★ | запись в списке отзывов |

### `@tour` — визуальный обход UI

Для каждой роли (`Admin`, `User`, `Committee`): вход → вкладка по умолчанию → остальные вкладки из `TABS_BY_ROLE` → выход.

### Smoke (без тега)

- вход `User` и раздел «Лента идей»;
- отказ при неверном пароле.

## Демо-учётки

Пароль для всех: `12345` (см. `backend/app/seed.py`).

| Логин | Роль в UI |
|-------|-----------|
| `Admin` | Админ |
| `User` | Пользователь |
| `Committee` | Комитет |

## Отчёты

```bash
npx playwright show-report   # HTML после прогона
```

При `HEADLESS=false` для упавших и успешных прогонов может сохраняться video (см. `playwright.config.ts`).

## Типичные сбои

| Симптом | Причина | Решение |
|---------|---------|---------|
| `Unexpected token '??='` | Node &lt; 18 | `nvm use`, переустановить `node_modules` |
| Зависание на «Пользователи» | Backend недоступен | `uvicorn` на **8001**, проверить `vite.config.ts` |
| `selectOption: label: expected string` | RegExp в `selectOption` | Используется `selectOptionByIdeaTitle` |
| Strict mode: два «Голосование» | Бейдж + шаг «Прогресс» | Селектор `statusBadge()` по CSS-классу |
| Два одинаковых отзыва в strict | Старые данные в БД | Уникальный `feedbackText` в `test-data.ts` |

## Связанные файлы продукта

| E2E | Продукт |
|-----|---------|
| `types.ts` → `IdeaStatus` | `backend/app/models.py` |
| `constants.TABS_BY_ROLE` | `frontend/src/lib/roles.ts` |
| `SELECTORS` | id полей в формах React |
| `STATUS_BADGE_BG` | `frontend/src/components/ui/StatusBadge.tsx` |
