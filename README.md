# GDELT News Worker

Cloudflare Worker с D1 базой данных и Drizzle ORM для хранения и получения новостных данных GDELT.

## Технологии

- **Cloudflare Workers** — serverless runtime
- **Cloudflare D1** — SQLite база данных на edge
- **Drizzle ORM** — type-safe ORM
- **Hono** — легковесный веб-фреймворк

## Структура проекта

```
├── package.json              # Корневой workspace
├── .gitignore
└── worker/
    ├── package.json          # Зависимости и npm скрипты
    ├── tsconfig.json         # TypeScript конфигурация
    ├── wrangler.toml         # Cloudflare конфигурация
    ├── drizzle.config.ts     # Drizzle миграции
    ├── drizzle/              # SQL миграции
    └── src/
        ├── index.ts          # Точка входа (Hono роутер)
        ├── types.ts          # TypeScript типы
        └── db/
            ├── schema.ts     # Схема базы данных
            └── client.ts     # Клиент БД
```

## Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Локальная разработка

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

Все команды выполняются из директории `worker/`:

| Команда                     | Описание                            |
| --------------------------- | ----------------------------------- |
| `npm run dev`               | Запуск локального dev сервера       |
| `npm run deploy`            | Деплой на Cloudflare                |
| `npm run db:generate`       | Генерация SQL миграций из схемы     |
| `npm run db:migrate:local`  | Применение миграций к локальной D1  |
| `npm run db:migrate:remote` | Применение миграций к production D1 |

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
