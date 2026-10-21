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

Публикации пишутся в общий файл `public/shared-published.json` (его видят все покупатели после деплоя) и дублируются в `localStorage` браузера менеджера. В `npm run dev` сохранение идёт сразу на диск через `/api/shared-catalog`. На GitHub Pages для авто-синка в репозиторий нужен секрет `CATALOG_WRITE_TOKEN` (fine-grained PAT с правом `contents:write` на этот репо) — он прокидывается в сборку как `VITE_CATALOG_TOKEN`.

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
