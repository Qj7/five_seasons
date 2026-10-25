# Five Seasons

Магазин обуви, одежды и аксессуаров. **Next.js (App Router) + Prisma + Postgres**, деплой на Vercel.

## Запуск

```bash
npm install
npm run dev
```

Открывай **http://localhost:3000/**

Приложение открывается и без базы: каталог из встроенного seed, вход через локальный fallback. Корзина и избранное гостя живут в браузере. Как только задан `DATABASE_URL` (или `POSTGRES_URL` от интеграции Neon на Vercel) и пользователь вошёл, корзина и избранное пишутся в Postgres и подхватываются на другом устройстве. Гостевая корзина вливается в аккаунт при входе.

## База данных (Vercel Postgres / Neon)

1. Создай Postgres в Vercel/Neon, скопируй строки подключения.
2. Заполни `.env` по образцу `.env.example` (`DATABASE_URL`, `DIRECT_URL`).
3. Примени схему и залей seed:

```bash
npm run db:push     # prisma db push — создаёт таблицы
npm run db:seed     # менеджеры + базовый каталог
```

Схема — `prisma/schema.prisma` (Prisma 7, драйвер-адаптер Neon serverless). Конфиг подключения — `prisma.config.ts`.

## Маршруты

Единый optional catch-all (`app/[[...slug]]/page.tsx`) даёт реальные URL с deep-link и работающими «назад/вперёд»:

| URL | Экран |
|-----|-------|
| `/` | Главная |
| `/catalog` | Каталог |
| `/product/<id>` | Карточка товара |
| `/cart` · `/favorites` · `/profile` | Корзина · Избранное · Профиль |
| `/brands` · `/brands/<slug>` | Бренды |
| `/orders` | Мои заказы |
| `/admin` · `/admin/<new\|orders\|listings>` | Кабинет менеджера |

## API

| Маршрут | Назначение |
|---------|-----------|
| `POST /api/auth/register`·`login`·`logout`, `GET /api/auth/me` | Серверная авторизация (bcrypt + httpOnly-cookie сессии) |
| `GET/PUT /api/catalog` | Общий каталог менеджерских товаров |
| `GET/PUT /api/cart`, `GET/PUT /api/favorites` | Корзина (размер + доставка) и избранное аккаунта |
| `GET/POST /api/orders`, `PATCH /api/orders/[id]` | Заказы и смена статуса |

Все маршруты имеют graceful fallback: без `DATABASE_URL` возвращают пустые данные/`503`, и клиент переключается на localStorage.

## Авторизация

Вкладка **Профиль** — вход и регистрация. Seed-аккаунты менеджеров (смени пароли после первого деплоя):

| Имя | Email | Пароль |
|-----|-------|--------|
| Никита | `nikita@fiveseasons.vn` | `NikitaMgr2024` |
| Анна | `anna@fiveseasons.vn` | `AnnaMgr2024` |

## Деплой на Vercel

Node 22. Сборка: `prisma generate && next build` (`vercel.json`).

1. [vercel.com/new](https://vercel.com/new) → импорт `Qj7/five_seasons`. Framework: Next.js.
2. Storage → Neon (или Postgres). Интеграция сама кладёт `DATABASE_URL` / `POSTGRES_URL`. Для миграций нужен ещё прямой URL: `DIRECT_URL` или `POSTGRES_URL_NON_POOLING`.
3. Deploy. Сайт открывается сразу; аккаунт, заказы и серверная корзина включаются после схемы.
4. Локально, с prod-URL в `.env`:

```bash
npm run db:push
npm run db:seed
```

GitHub Pages больше не публикуется: workflow на `main` только проверяет сборку.

## Что дальше (roadmap)

- Оплата (VNPay/MoMo или наложенный платёж), расчёт доставки.
- Реальные уведомления (email/Telegram) поверх таблицы `Notification`.
- Полноценная админ-панель, аналитика.
