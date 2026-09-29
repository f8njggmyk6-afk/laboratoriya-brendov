# Лаборатория брендов — перенос на Vercel

Исходный сайт: https://laboratoriya-brendov-concept.higgsfield.app

Этот пакет подготовлен из исходников Higgsfield для Vercel (TanStack Start + Nitro). Сначала разверните его на тестовом адресе Vercel. Домен переключайте после проверки формы.

## Загрузка

На странице создания проекта Vercel выберите Import Git Repository и репозиторий `f8njggmyk6-afk/laboratoriya-brendov`. Framework Preset: TanStack Start. Build Command: `npm run build`. Сначала проверьте адрес Vercel, затем подключайте домен.

## Уведомления

Форма отправляет заявку через серверный обработчик `/api/contact` в Resend. В настройках проекта Vercel → Environment Variables нужны:

- `RESEND_API_KEY` — ключ Resend, хранить только как секрет в Vercel.
- `RESEND_FROM_EMAIL` — адрес отправителя на подтверждённом в Resend домене (например, `notify@laboratoriyabrendov.com`).
- `NOTIFY_TO_EMAIL` — `laboratoriabrendov@gmail.com`.

После настройки переменных выполните Redeploy и отправьте тестовую заявку. Если уведомление не доставлено, форма покажет ошибку, а не ложное сообщение об успехе. Текущий сайт в Higgsfield не затрагивается.
