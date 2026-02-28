# doichev.com

Монорепозиторий с Cloudflare Worker (бэкенд, GDELT sync) и Astro веб-сайтом с Keystatic CMS.

## Технологии

### Web (Astro)

- **Astro 5** — фреймворк для контентных сайтов
- **Tailwind CSS v4** — утилитарный CSS через `@tailwindcss/vite`
- **React** — для интерактивных компонентов (Keystatic UI)
- **Keystatic CMS** — Git-based CMS с локальным хранилищем
- **@astrojs/cloudflare** — адаптер для деплоя на Cloudflare Pages

### Worker (API)

- **Cloudflare Workers** — serverless runtime
- **Cloudflare D1** — SQLite база данных на edge
- **Drizzle ORM** — type-safe ORM
- **Hono** — легковесный веб-фреймворк

## Структура проекта

```
├── package.json              # Корневой workspace
├── eslint.config.js          # ESLint конфигурация
├── .prettierrc               # Prettier конфигурация
├── .husky/                   # Git hooks
├── web/                      # Astro + Keystatic сайт
│   ├── package.json
│   ├── tsconfig.json
│   ├── astro.config.mjs
│   ├── keystatic.config.ts   # Keystatic CMS конфигурация
│   ├── public/
│   └── src/
│       ├── content/
│       │   ├── config.ts     # Astro Content Collections схема
│       │   └── articles/     # Статьи (Markdoc)
│       ├── layouts/
│       │   └── BaseLayout.astro
│       ├── components/
│       │   └── ArticleCard.astro
│       ├── pages/
│       │   ├── index.astro          # Главная — список статей
│       │   └── articles/
│       │       └── [slug].astro     # Детальная страница статьи
│       └── styles/
│           └── global.css
└── worker/
    ├── package.json
    ├── tsconfig.json
    ├── wrangler.toml         # Cloudflare конфигурация
    ├── vitest.config.ts
    ├── drizzle.config.ts
    ├── drizzle/              # SQL миграции
    └── src/
        ├── index.ts          # Точка входа + scheduled handler
        ├── index.spec.ts
        ├── types.ts
        ├── db/
        │   ├── schema.ts     # Схема базы данных
        │   └── client.ts
        └── services/
            ├── gdelt.ts      # GDELT API сервис
            ├── gdelt.spec.ts
            └── database.ts
```

## Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Web (Astro + Keystatic)

```bash
npm run dev:web
```

- Сайт: `http://localhost:4321`
- Keystatic CMS: `http://localhost:4321/keystatic`

### Worker (API)

```bash
cd worker
npm run dev
```

Сервер запустится на `http://localhost:8787`

### Тестирование эндпоинтов

```bash
# Health check
curl http://localhost:8787/api/health

# Получить последние 10 записей
curl http://localhost:8787/api/latest
```

## Команды

### Корневые команды

| Команда                    | Описание                        |
| -------------------------- | ------------------------------- |
| `npm run dev:web`          | Запуск Astro dev сервера        |
| `npm run build:web`        | Сборка web для Cloudflare Pages |
| `npm run typecheck:web`    | TypeScript проверка web         |
| `npm run lint`             | ESLint проверка                 |
| `npm run lint:fix`         | ESLint с автоисправлением       |
| `npm run format`           | Форматирование Prettier         |
| `npm run format:check`     | Проверка форматирования         |
| `npm run test:worker`      | Запуск тестов worker            |
| `npm run typecheck:worker` | TypeScript проверка worker      |

### Команды worker (из директории `worker/`)

| Команда                     | Описание                            |
| --------------------------- | ----------------------------------- |
| `npm run dev`               | Запуск локального dev сервера       |
| `npm run deploy`            | Деплой на Cloudflare                |
| `npm run test`              | Запуск тестов                       |
| `npm run test:watch`        | Запуск тестов в watch режиме        |
| `npm run typecheck`         | Проверка TypeScript типов           |
| `npm run db:generate`       | Генерация SQL миграций из схемы     |
| `npm run db:migrate:local`  | Применение миграций к локальной D1  |
| `npm run db:migrate:remote` | Применение миграций к production D1 |

## Web (Astro + Keystatic)

### Архитектура

- **Гибридный режим**: публичные страницы (`/`, `/articles/[slug]`) статически пререндерятся; `/keystatic` работает через SSR
- **Keystatic CMS**: локальное хранилище (контент сохраняется в Git)
- **Tailwind CSS v4**: через Vite-плагин `@tailwindcss/vite`
- **Content Collections**: Astro Content Collections API для типобезопасного доступа к статьям

### Коллекция `articles`

| Поле          | Тип      | Описание                    |
| ------------- | -------- | --------------------------- |
| `title`       | slug     | Заголовок (генерирует slug) |
| `publishedAt` | date     | Дата публикации             |
| `draft`       | checkbox | Черновик (скрыт из списка)  |
| `summary`     | text     | Краткое описание            |
| `content`     | markdoc  | Основной контент            |

Статьи хранятся в `web/src/content/articles/` в формате Markdoc (`.mdoc`).

## API Эндпоинты

### GET /api/health

Проверка работоспособности сервиса.

**Ответ:**

```json
{ "status": "ok" }
```

### GET /api/latest

Получение 10 последних записей из таблицы `gdelt_events`.

**Ответ:**

```json
[
  {
    "id": 1,
    "url": "https://example.com/news/1",
    "title": "News Title",
    "publish_date": "2024-01-15",
    "snippet": "Short description...",
    "raw_json": "{...}",
    "created_at": 1705312800
  }
]
```

## Scheduled Cron (GDELT Sync)

Worker автоматически получает данные из GDELT 2.0 DOC API каждые 2 часа.

### Конфигурация

В `wrangler.toml`:

```toml
[triggers]
crons = ["0 */2 * * *"]
```

### GDELT API

- **Endpoint**: `https://api.gdeltproject.org/api/v2/doc/doc`
- **Query**: `"Artificial Intelligence" OR "Automation"`
- **Лимит**: 50 статей за запрос
- **Сортировка**: по дате (новые первые)

### Дедупликация

Статьи вставляются с `ON CONFLICT DO NOTHING` по полю `url` — дубликаты автоматически пропускаются.

### Тестирование cron локально

```bash
# Запустить dev сервер
cd worker && npm run dev

# В другом терминале — триггер cron вручную
curl "http://localhost:8787/__scheduled?cron=0+*/2+*+*+*"

# Проверить результаты
curl http://localhost:8787/api/latest
```

### Логи

При каждом запуске в консоль выводится:

```
Starting scheduled GDELT fetch...
Fetched 50 articles from GDELT
GDELT sync complete: 12 inserted, 38 skipped (duplicates)
```

## База данных

### Схема таблицы `gdelt_events`

| Поле           | Тип     | Описание                         |
| -------------- | ------- | -------------------------------- |
| `id`           | INTEGER | Primary key, auto-increment      |
| `url`          | TEXT    | URL источника (unique, not null) |
| `title`        | TEXT    | Заголовок новости (not null)     |
| `publish_date` | TEXT    | Дата публикации (ISO формат)     |
| `snippet`      | TEXT    | Краткое описание                 |
| `raw_json`     | TEXT    | Полный JSON от GDELT             |
| `created_at`   | INTEGER | Unix timestamp создания записи   |

### Работа с миграциями

1. Измените схему в `src/db/schema.ts`
2. Сгенерируйте миграцию:
   ```bash
   npm run db:generate
   ```
3. Примените локально:
   ```bash
   npm run db:migrate:local
   ```
4. После тестирования примените на production:
   ```bash
   npm run db:migrate:remote
   ```

## Деплой на Cloudflare

### Первоначальная настройка

1. Авторизуйтесь в Cloudflare:

   ```bash
   npx wrangler login
   ```

2. Создайте D1 базу данных:

   ```bash
   npx wrangler d1 create gdelt_raw_news
   ```

3. Скопируйте `database_id` из вывода и обновите `wrangler.toml`:

   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "gdelt_raw_news"
   database_id = "ваш-database-id"
   ```

4. Примените миграции:

   ```bash
   npm run db:migrate:remote
   ```

5. Задеплойте worker:
   ```bash
   npm run deploy
   ```

### Последующие деплои

```bash
npm run deploy
```

При изменении схемы БД не забудьте сначала применить миграции:

```bash
npm run db:generate
npm run db:migrate:remote
npm run deploy
```

## Разработка

### Тестирование

Проект использует Vitest с `@cloudflare/vitest-pool-workers` для тестирования в среде Workers.

```bash
# Запуск тестов
cd worker && npm run test

# Или из корня
npm run test:worker

# Watch режим
cd worker && npm run test:watch
```

Тесты находятся в:

- `src/index.spec.ts` — тесты API эндпоинтов
- `src/services/gdelt.spec.ts` — тесты GDELT сервиса

### Линтинг и форматирование

Pre-commit hooks автоматически запускают ESLint и Prettier при коммите.

```bash
# Ручной запуск
npm run lint        # проверка
npm run lint:fix    # с исправлением
npm run format      # форматирование
```

### Добавление нового эндпоинта

Отредактируйте `src/index.ts`:

```typescript
app.get("/api/events/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const db = getDb(c.env.DB);

  const event = await db
    .select()
    .from(gdeltEvents)
    .where(eq(gdeltEvents.id, id))
    .get();

  if (!event) {
    return c.json({ error: "Not found" }, 404);
  }

  return c.json(event);
});
```

### Добавление новой таблицы

1. Добавьте определение в `src/db/schema.ts`:

   ```typescript
   export const newTable = sqliteTable("new_table", {
     id: integer("id").primaryKey({ autoIncrement: true }),
     // ... поля
   });
   ```

2. Сгенерируйте и примените миграцию:
   ```bash
   npm run db:generate
   npm run db:migrate:local
   ```
