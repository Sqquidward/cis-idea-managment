# E2E-тестирование — техническая спецификация

**Система:** КИС «Управление идеями»  
**Инструмент:** [Playwright](https://playwright.dev/) (`@playwright/test` ≥ 1.49)  
**Расположение:** каталог `e2e/` в корне репозитория  
**Краткое руководство:** [e2e/README.md](../../e2e/README.md)

---

## 1. Цели и границы

### 1.1. Что покрывается

- Авторизация по JWT (через UI, токен в `sessionStorage`).
- Навигация по вкладкам в разрезе ролей RBAC.
- Сквозной бизнес-сценарий жизненного цикла идеи в UI.

### 1.2. Что не покрывается

- Прямые HTTP-тесты API без браузера (отдельный уровень — pytest/httpx при необходимости).
- Нагрузочное и кросс-браузерное тестирование (только Chromium).
- Visual regression (скриншотные сравнения).

---

## 2. Архитектура тестового стека

```
┌─────────────────────────────────────────────────────────┐
│  Playwright Test Runner (playwright.config.ts)          │
│  baseURL: http://127.0.0.1:5173                         │
│  webServer: npm run dev --prefix frontend (optional)    │
└──────────────────────────┬──────────────────────────────┘
                           │ Chromium
                           ▼
┌─────────────────────────────────────────────────────────┐
│  React SPA (Vite :5173)  ──proxy /api──►  FastAPI      │
│                                           (:8001)       │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
                    PostgreSQL (:15432)
```

**Важно:** порт backend для E2E должен совпадать с `frontend/vite.config.ts` → `server.proxy["/api"].target`.  
Сейчас: **8001**. Запуск только на 8000 без правки прокси приведёт к ошибкам загрузки данных.

Константа в коде: `e2e/constants.ts` → `BACKEND_PORT = 8001`.

---

## 3. Слои кодовой базы E2E

| Слой | Файлы | Ответственность |
|------|-------|-----------------|
| **Types** | `e2e/types.ts` | Доменные union-типы, синхронизированные с продуктом |
| **Constants** | `e2e/constants.ts` | URL, порты, `SELECTORS`, `TABS_BY_ROLE` |
| **Helpers** | `e2e/helpers/*` | Локаторы, формы, диалоги — без сценарной логики |
| **Fixtures** | `e2e/fixtures/*` | Переиспользуемые шаги (login, lifecycle) |
| **Specs** | `e2e/specs/*` | Тест-кейсы, теги `@tour` / `@lifecycle` |

### 3.1. Типы (`e2e/types.ts`)

```typescript
type IdeaStatus = "Голосование" | "Реализация" | "Реализована" | "Архив";
type TabLabel = "Новая идея" | "Мои идеи" | ... ;
type DemoUser = "Admin" | "User" | "Committee";
type FeedbackRating = 1 | 2 | 3 | 4 | 5;

interface LifecycleTestData {
  readonly title: string;
  readonly description: string;
  readonly feedbackText: string;
  readonly deadline: string; // ISO YYYY-MM-DD
}
```

Type guards: `isIdeaStatus()`, `isTabLabel()`.

### 3.2. Соответствие продукту

| E2E | Исходник в продукте |
|-----|---------------------|
| `IdeaStatus` | `backend/app/models.py` → `class IdeaStatus` |
| `TabLabel` | `frontend/src/App.tsx` → `ALL_TABS[].label` |
| `TABS_BY_ROLE` | `frontend/src/lib/roles.ts` → `TAB_ACCESS`, `getDefaultTab` |
| `SELECTORS.*` | `id` атрибуты полей форм |
| `STATUS_BADGE_BG` | `frontend/src/components/ui/StatusBadge.tsx` |

---

## 4. Конфигурация Playwright

Файл: `playwright.config.ts`.

| Параметр | Значение | Примечание |
|----------|----------|------------|
| `testDir` | `./e2e/specs` | |
| `workers` | `1` | Serial-сценарии, общая БД |
| `fullyParallel` | `false` | |
| `timeout` | `120_000` ms | `@lifecycle` → `180_000` в spec |
| `expect.timeout` | `15_000` ms | |
| `retries` | `1` в CI | |
| `reporter` | `list`, `html` | |

Проект: один — `Desktop Chrome`.

---

## 5. Спецификации тестов

### 5.1. `smoke.spec.ts`

| Кейс | Проверка |
|------|----------|
| Вход User + «Лента идей» | Текст-подсказка ленты |
| Неверный пароль | `role="alert"`, сообщение об ошибке |

### 5.2. `visual-tour.spec.ts` — тег `@tour`

Три serial-кейса. Общий алгоритм `tourRole(page, role)`:

1. `loginAs(role)`
2. `openTab(DEFAULT_TAB_BY_ROLE[role])` + `tourPause()`
3. Цикл по `TABS_BY_ROLE[role].slice(1)`
4. `logout()`

Данные вкладок централизованы в `constants.ts`, не дублируются в spec.

### 5.3. `idea-lifecycle.spec.ts` — тег `@lifecycle`

**Предусловие:** seed БД, демо-пользователи, работающий API.

**Данные:** `createLifecycleTestData()` — уникальные `title` и `feedbackText` на каждый прогон (избежание strict mode и коллизий в списке отзывов).

**Цепочка API (неявно, через UI):**

| Шаг UI | Метод API | Эффект |
|--------|-----------|--------|
| Публикация | `POST /api/ideas` | `status = Голосование` |
| Голос | `POST /api/ideas/{id}/vote` | `delta = 1` |
| Утверждение | `PATCH /api/ideas/{id}/status` | `status = Реализация` |
| План | `POST /api/ideas/{id}/plan` | `status = Реализована` |
| Отзыв | `POST /api/feedbacks` | запись отзыва |

**Особенность домена:** сохранение плана (`save_plan` в `IdeaStore`) автоматически переводит идею в «Реализована» — отдельный шаг смены статуса в UI не требуется.

**Диалоги:** нативные `alert()` после публикации и плана закрываются через `acceptNativeDialogs(page)` до начала сценария.

---

## 6. Стратегия локаторов

### 6.1. Вкладки

Кнопки `role="tab"` содержат номер раздела: текст **«1 Пользователи»**, а не «Пользователи».

```typescript
page.getByRole("tab").filter({ hasText: label })
```

### 6.2. Статус в «Мои идеи»

Текст статуса дублируется в бейдже и в блоке «Прогресс». Используется бейдж по CSS-классу фона:

```typescript
statusBadge(card, "Голосование") // span.bg-amber-50
```

### 6.3. `<select>` с названием идеи

`page.selectOption({ label: RegExp })` **не поддерживается**. Реализация: `selectOptionByIdeaTitle()` — поиск `option`, у которого `text` начинается с `title` (учёт суффикса «· черновик»).

### 6.4. Стабильные id форм

См. `constants.SELECTORS`: `#idea-title`, `#plan-project`, `#feedback-project` и др.

---

## 7. Переменные окружения

См. таблицу в [e2e/README.md](../../e2e/README.md#переменные-окружения).

Проверка Node: `scripts/check-node-version.mjs` (hook `pretest:e2e*`).

---

## 8. Запуск в CI (рекомендация)

```yaml
# фрагмент pipeline
services:
  postgres: ...
steps:
  - run: docker compose up -d db
  - run: cd backend && alembic upgrade head && uvicorn app.main:app --port 8001 &
  - run: nvm use && npm ci && npm run playwright:install
  - run: npm run test:e2e
    env:
      CI: true
      PW_NO_WEB_SERVER: "1"  # если frontend поднимается отдельным шагом
```

Артефакты: `playwright-report/`, `test-results/`.

---

## 9. Расширение набора тестов

1. Добавить типы/константы в `types.ts` / `constants.ts`.
2. Вынести шаги в `fixtures/` или `helpers/`.
3. Создать spec в `e2e/specs/` с тегом `@имя` для выборочного запуска: `playwright test --grep @имя`.
4. Обновить таблицы в этом документе и в `e2e/README.md`.

**Рекомендация:** для новых полей форм задавать `id` в React и регистрировать в `SELECTORS`.

---

## 10. История изменений

| Версия | Дата | Изменение |
|--------|------|-----------|
| 1.0 | 2026-05 | Первоначальный набор: smoke, @tour, @lifecycle; слои types/constants/helpers |
