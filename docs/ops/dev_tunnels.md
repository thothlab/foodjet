# Разработка: Cloudflare Tunnels для локального доступа

Telegram Mini App требует HTTPS-ссылку для WebApp-кнопок. Для локальной разработки используются Cloudflare Quick Tunnels — бесплатные временные HTTPS-тоннели без регистрации.

---

## Предварительные требования

```bash
brew install cloudflared
```

---

## Архитектура

```
Telegram → cloudflare tunnel (HTTPS) → localhost:5173 (nginx)
                                              ↓
                                       proxy /api/ → backend:3000
```

Каждый фронтенд-контейнер (mini-app, admin, courier) имеет nginx, который:
- Раздаёт статику React SPA
- Проксирует `/api/*` запросы к backend-контейнеру

Это позволяет использовать один тоннель на каждый фронтенд — API доступен через тот же домен.

---

## Запуск

### 1. Поднять Docker-контейнеры

```bash
docker compose up -d
```

### 2. Запустить тоннели

```bash
# Mini App (покупатель)
cloudflared tunnel --url http://localhost:5173 > /tmp/cloudflared-mini.log 2>&1 &

# Admin Panel (администратор/владелец магазина)
cloudflared tunnel --url http://localhost:5174 > /tmp/cloudflared-admin.log 2>&1 &

# Courier Panel (курьер)
cloudflared tunnel --url http://localhost:5175 > /tmp/cloudflared-courier.log 2>&1 &
```

### 3. Получить URL тоннелей

```bash
grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cloudflared-mini.log | head -1
grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cloudflared-admin.log | head -1
grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cloudflared-courier.log | head -1
```

### 4. Настроить бота

Установите `MINI_APP_URL` в `.env` на URL тоннеля Mini App:

```bash
# .env (корень проекта)
MINI_APP_URL=https://xxx-xxx-xxx.trycloudflare.com
```

Перезапустите backend:

```bash
docker compose up -d backend
```

Бот автоматически:
- Настроит кнопку «Магазин» (Menu Button) в Telegram
- Будет отправлять WebApp-кнопки при `/start`

---

## Порты и сервисы

| Сервис | Локальный порт | Назначение |
|--------|---------------|------------|
| PostgreSQL | 5432 | База данных |
| Backend API | 3000 | REST API + Telegram bot |
| Mini App | 5173 | Покупательский интерфейс |
| Admin Panel | 5174 | Панель администратора |
| Courier Panel | 5175 | Панель курьера |

---

## Важно

- **URL тоннелей временные** — при перезапуске `cloudflared` URL меняются. Нужно обновить `MINI_APP_URL` и перезапустить backend.
- **Для production** используйте постоянный домен с HTTPS (VPS + Caddy/nginx + Let's Encrypt, или Cloudflare Tunnel с авторизацией).
- **ngrok не подходит** для бесплатного плана — показывает interstitial-страницу, которая блокирует Telegram Mini App.
- Все API-запросы проксируются через nginx фронтенда (относительные URL `/api/v1/...`), поэтому каждому фронтенду нужен только один тоннель.

---

## Остановка тоннелей

```bash
pkill -f cloudflared
```

---

## Troubleshooting

### Mini App показывает «Ошибка / Failed to fetch»

1. Проверьте что backend запущен:
   ```bash
   curl http://localhost:3000/health
   ```

2. Проверьте что nginx проксирует API:
   ```bash
   curl http://localhost:5173/api/v1/ping
   ```
   Ожидаемый ответ: `{"pong":true}`

3. Проверьте что тоннель работает:
   ```bash
   curl https://xxx.trycloudflare.com/api/v1/ping
   ```

### Бот не показывает кнопку Mini App

- `MINI_APP_URL` должен быть HTTPS
- Проверьте логи: `docker compose logs backend --tail 20`
- Ищите строку `Menu button configured (WebApp)` — если её нет, URL невалидный
