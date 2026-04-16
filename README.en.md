[![ru](https://img.shields.io/badge/lang-Русский-blue)](README.md)

# FoodJet

Multi-store grocery delivery platform powered by Telegram Mini App.

## Overview

FoodJet is a platform for launching grocery and goods delivery services via a Telegram bot and Mini App. It supports multiple stores, each with its own catalog, settings, and staff.

### Key Features

- **Telegram Mini App** for customers — catalog, cart, checkout
- **Admin Panel** — manage stores, catalog, orders, staff
- **Courier Panel** — view and manage deliveries
- **Telegram Bot** — deep link store entry, order status notifications
- **Multi-store** — one bot serves multiple stores
- **RBAC** — 6 roles with granular permissions (SUPER_ADMIN, STORE_MANAGER, STORE_OPERATOR, CATALOG_MANAGER, COURIER, CUSTOMER)
- **Order State Machine** — 9 statuses with role-based transition control

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js + TypeScript + Fastify v5 |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Telegram Bot | grammy |
| Auth | Telegram initData HMAC-SHA256 + JWT |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| State Management | Zustand |
| Monorepo | npm workspaces |
| Containers | Docker + Docker Compose |

## Project Structure

```
foodjet/
├── apps/
│   ├── backend/          # Fastify API + Telegram Bot
│   ├── mini-app/         # Customer Mini App (port 5173)
│   ├── admin/            # Admin Panel (port 5174)
│   └── courier/          # Courier Panel (port 5175)
├── packages/
│   └── shared/           # Shared types, RBAC, state machine
├── docs/                 # Project documentation
└── docker-compose.yml    # Infrastructure
```

## Quick Start

### Prerequisites

- Node.js >= 20
- Docker and Docker Compose
- Telegram Bot Token (via [@BotFather](https://t.me/BotFather))

### Running with Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/thothlab/foodjet.git
cd foodjet

# 2. Create .env file
cp .env.example apps/backend/.env
# Edit apps/backend/.env — set TELEGRAM_BOT_TOKEN and JWT_SECRET

# 3. Start everything
docker compose up -d

# 4. Run migrations and seed demo data
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx tsx prisma/seed.ts
```

Services will be available at:
- **Backend API**: http://localhost:3000
- **Health check**: http://localhost:3000/health
- **Mini App**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Courier Panel**: http://localhost:5175

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker compose up postgres -d

# 3. Configure backend
cp .env.example apps/backend/.env
# Edit apps/backend/.env

# 4. Generate Prisma client and run migrations
cd apps/backend
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
cd ../..

# 5. Start all services
npm run dev
```

## API

The backend provides a REST API under the `/api/v1` prefix:

| Module | Prefix | Description |
|--------|--------|-------------|
| Auth | `/auth` | Telegram authentication |
| Stores | `/stores` | Store management |
| Catalog | `/categories`, `/products` | Product catalog |
| Cart | `/cart` | Customer cart |
| Orders | `/orders` | Orders and statuses |
| Customer | `/profile`, `/addresses` | Profile and addresses |
| Staff | `/staff` | Staff management |
| Courier | `/couriers` | Courier management |
| Media | `/upload` | Image uploads |
| Audit | `/audit` | Audit log |

Detailed API documentation: [docs/api/contracts/README.md](docs/api/contracts/README.md)

## Order State Machine

```
NEW → CONFIRMED → ASSEMBLING → READY_FOR_DELIVERY → ASSIGNED_TO_COURIER → IN_DELIVERY → DELIVERED
                      ↓                                                                     
         AWAITING_SUBSTITUTION_DECISION                                              CANCELLED
```

Each transition is controlled by actor role. Details: [docs/product/order_status_machine.md](docs/product/order_status_machine.md)

## Internet Access (Cloudflare Tunnels)

For development and testing the Mini App via Telegram, use Cloudflare Quick Tunnels:

```bash
# Install
brew install cloudflared

# Start tunnels
cloudflared tunnel --url http://localhost:5173 &  # Mini App
cloudflared tunnel --url http://localhost:5174 &  # Admin Panel
cloudflared tunnel --url http://localhost:5175 &  # Courier Panel
```

Set the HTTPS Mini App URL in `.env` and restart the backend:
```bash
MINI_APP_URL=https://xxx.trycloudflare.com
docker compose up -d backend
```

Details: [docs/ops/dev_tunnels.md](docs/ops/dev_tunnels.md)

## Payment

The MVP supports **cash on delivery only**. Online payments are planned for future iterations.

## Documentation

- [MVP Scope](docs/product/mvp_scope.md)
- [Glossary](docs/product/glossary.md)
- [Backend Architecture](docs/architecture/backend_modules.md)
- [RBAC Matrix](docs/security/rbac_matrix.md)
- [API Standards](docs/api/api_standards.md)
- [Test Strategy](docs/qa/test_strategy.md)
- [Cloudflare Tunnels (dev)](docs/ops/dev_tunnels.md)
- [Operations Runbook](docs/ops/runbook.md)

## License

Proprietary. All rights reserved.
