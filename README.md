# Контрпики MLBB

Одна статическая страница: `index.html`. Сервер и база не нужны, страница работает на любом статическом хостинге.

## GitHub Pages (бесплатно)

1. На github.com создайте публичный репозиторий, например `mlbb-helper`.
2. Нажмите **Add file → Upload files** и загрузите `index.html` и этот `README.md`. Нажмите **Commit changes**.
3. Откройте **Settings → Pages**. В разделе **Build and deployment** выберите **Source: Deploy from a branch**, ветку `main` и папку `/ (root)`, нажмите **Save**.
4. Через 1–2 минуты сайт будет доступен по адресу `https://ВАШ_ЛОГИН.github.io/mlbb-helper/`.

Через командную строку:

```bash
git init -b main
git add index.html README.md
git commit -m "Контрпики MLBB"
git remote add origin git@github.com:ВАШ_ЛОГИН/mlbb-helper.git
git push -u origin main
```

Затем включите Pages, как в шаге 3.

## Cloudflare Pages (бесплатно)

1. На dash.cloudflare.com откройте **Workers & Pages → Create → Pages → Upload assets**.
2. Укажите имя проекта и перетащите папку с `index.html`.
3. Сайт будет доступен по адресу `https://ИМЯ_ПРОЕКТА.pages.dev`.

## Как обновлять

Замените `index.html` новой версией и загрузите её так же: на GitHub через **Upload files**, на Cloudflare через **Create new deployment**.

## Свой домен

И GitHub Pages, и Cloudflare Pages позволяют подключить собственный домен в настройках проекта. Домен покупается отдельно. Не используйте в нём названия игр и товарные знаки Moonton.
