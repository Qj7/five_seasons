# Five Seasons

Мобильный магазин Crocs и Jibbitz в стиле Unicorn-приложения.

**Live:** https://qj7.github.io/five_seasons/

## Запуск

```bash
npm install
npm run dev
```

Открывай **http://localhost:5173/**

## Авторизация

Вкладка **Профиль** — вход и регистрация. Менеджеры публикуют товар на отдельном экране (**+ Товар** на главной/в каталоге или пункт «Выложить товар» в профиле).

Механизм публикации:

1. Менеджер сохраняет SKU в свой `localStorage` (staging).
2. При старте приложения и после каждой публикации код смотрит staging: для каждого SKU, которого ещё нет в магазине (`shared-published.json` / `baseProducts`), выкладывает его в общий каталог.
3. После успешной выкладки `localStorage` очищается.

Общий файл витрины — `public/shared-published.json`. В `npm run dev` запись идёт на диск через `/api/shared-catalog`. На GitHub Pages для записи в репозиторий нужен секрет `CATALOG_WRITE_TOKEN` (fine-grained PAT, `contents:write`) — в сборку как `VITE_CATALOG_TOKEN`.

| Имя | Email | Пароль |
|-----|-------|--------|
| Никита | `nikita@fiveseasons.vn` | `NikitaMgr2024` |
| Анна | `anna@fiveseasons.vn` | `AnnaMgr2024` |

## Сборка

```bash
npm run build
npm run preview
```

## GitHub Pages

Пуш в `main` → Actions собирает сайт и публикует в ветку `gh-pages`. В **Settings → Pages** источник: **Deploy from a branch**, ветка `gh-pages`, папка `/ (root)`.
