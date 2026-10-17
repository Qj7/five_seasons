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

Вкладка **Профиль** — вход и регистрация. Менеджеры публикуют товар на отдельном экране (**+ Товар** на главной/в каталоге или пункт «Выложить товар» в профиле; хранение в `localStorage`).

| Имя | Email | Пароль |
|-----|-------|--------|
| Анна | `anna@fiveseasons.vn` | `AnnaMgr2024` |
| Дмитрий | `dmitry@fiveseasons.vn` | `DmitryMgr2024` |
| Лена | `lena@fiveseasons.vn` | `LenaMgr2024` |

## Сборка

```bash
npm run build
npm run preview
```

## GitHub Pages

Пуш в `main` → Actions собирает сайт и публикует в ветку `gh-pages`. В **Settings → Pages** источник: **Deploy from a branch**, ветка `gh-pages`, папка `/ (root)`.
