[![en](https://img.shields.io/badge/lang-English-blue)](README.en.md)

# FoodJet

Мультимагазинная платформа доставки продуктов через Telegram Mini App.

## Обзор

FoodJet — это платформа для запуска сервиса доставки продуктов и товаров, работающая через Telegram-бота и Mini App. Поддерживает несколько магазинов, каждый со своим каталогом, настройками и персоналом.

### Ключевые возможности

- **Telegram Mini App** для покупателей — каталог, корзина, оформление заказа
- **Админ-панель** — управление магазинами, каталогом, заказами, персоналом
- **Панель курьера** — просмотр и управление доставками
- **Telegram-бот** — deep link вход в магазин, уведомления о статусе заказа
- **Мультимагазин** — один бот обслуживает несколько магазинов
- **RBAC** — 6 ролей с гранулярными правами (SUPER_ADMIN, STORE_MANAGER, STORE_OPERATOR, CATALOG_MANAGER, COURIER, CUSTOMER)
- **Машина состояний заказа** — 9 статусов с контролем переходов по ролям

## Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Backend | Node.js + TypeScript + Fastify v5 |
| ORM | Prisma |
| База данных | PostgreSQL 16 |
| Telegram Bot | grammy |
| Авторизация | Telegram initData HMAC-SHA256 + JWT |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| State Management | Zustand |
| Монорепо | npm workspaces |
| Контейнеризация | Docker + Docker Compose |

## Структура проекта

```
foodjet/
├── apps/
│   ├── backend/          # Fastify API + Telegram Bot
│   ├── mini-app/         # Покупательское Mini App (порт 5173)
│   ├── admin/            # Админ-панель (порт 5174)
│   └── courier/          # Панель курьера (порт 5175)
├── packages/
│   └── shared/           # Общие типы, RBAC, машина состояний
├── docs/                 # Документация проекта
└── docker-compose.yml    # Инфраструктура
```

## Быстрый старт

### Предварительные требования

- Node.js >= 20
- Docker и Docker Compose
- Telegram Bot Token (через [@BotFather](https://t.me/BotFather))

### Запуск через Docker Compose

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/thothlab/foodjet.git
cd foodjet

# 2. Создайте .env файл
cp .env.example apps/backend/.env
# Отредактируйте apps/backend/.env — укажите TELEGRAM_BOT_TOKEN и JWT_SECRET

# 3. Запустите всё
docker compose up -d

# 4. Примените миграции и загрузите демо-данные
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx tsx prisma/seed.ts
```

Сервисы будут доступны:
- **Backend API**: http://localhost:3000
- **Health check**: http://localhost:3000/health
- **Mini App**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Courier Panel**: http://localhost:5175

### Локальная разработка

```bash
# 1. Установите зависимости
npm install

# 2. Поднимите PostgreSQL
docker compose up postgres -d

# 3. Настройте backend
cp .env.example apps/backend/.env
# Отредактируйте apps/backend/.env

# 4. Сгенерируйте Prisma клиент и примените миграции
cd apps/backend
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
cd ../..

# 5. Запустите все сервисы
npm run dev
```

## API

Backend предоставляет REST API с префиксом `/api/v1`:

| Модуль | Префикс | Описание |
|--------|---------|----------|
| Auth | `/auth` | Авторизация через Telegram |
| Stores | `/stores` | Управление магазинами |
| Catalog | `/categories`, `/products` | Каталог товаров |
| Cart | `/cart` | Корзина покупателя |
| Orders | `/orders` | Заказы и статусы |
| Customer | `/profile`, `/addresses` | Профиль и адреса |
| Staff | `/staff` | Управление персоналом |
| Courier | `/couriers` | Управление курьерами |
| Media | `/upload` | Загрузка изображений |
| Audit | `/audit` | Журнал действий |

Подробная документация API: [docs/api/contracts/README.md](docs/api/contracts/README.md)

## Машина состояний заказа

```
NEW → CONFIRMED → ASSEMBLING → READY_FOR_DELIVERY → ASSIGNED_TO_COURIER → IN_DELIVERY → DELIVERED
                      ↓                                                                     
         AWAITING_SUBSTITUTION_DECISION                                              CANCELLED
```

Каждый переход контролируется по роли актора. Подробнее: [docs/product/order_status_machine.md](docs/product/order_status_machine.md)

## Доступ из интернета (Cloudflare Tunnels)

Для разработки и тестирования Mini App через Telegram используются Cloudflare Quick Tunnels:

```bash
# Установка
brew install cloudflared

# Запуск тоннелей
cloudflared tunnel --url http://localhost:5173 &  # Mini App
cloudflared tunnel --url http://localhost:5174 &  # Admin Panel
cloudflared tunnel --url http://localhost:5175 &  # Courier Panel
```

Укажите HTTPS URL Mini App в `.env` и перезапустите backend:
```bash
MINI_APP_URL=https://xxx.trycloudflare.com
docker compose up -d backend
```

Подробнее: [docs/ops/dev_tunnels.md](docs/ops/dev_tunnels.md)

## Оплата

MVP поддерживает только **наличные при доставке**. Онлайн-оплата запланирована в следующих итерациях.

## Документация

- [Скоуп MVP](docs/product/mvp_scope.md)
- [Глоссарий](docs/product/glossary.md)
- [Архитектура бэкенда](docs/architecture/backend_modules.md)
- [RBAC матрица](docs/security/rbac_matrix.md)
- [Стандарты API](docs/api/api_standards.md)
- [Стратегия тестирования](docs/qa/test_strategy.md)
- [Cloudflare Tunnels (dev)](docs/ops/dev_tunnels.md)
- [Operations Runbook](docs/ops/runbook.md)

## Лицензия

Proprietary. All rights reserved.
