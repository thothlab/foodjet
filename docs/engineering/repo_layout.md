# Repository Layout

```
foodjet/
├── apps/
│   ├── backend/          # Fastify API + Telegram bot (grammy)
│   │   ├── src/
│   │   │   ├── modules/        # Domain modules (auth, order, store, menu, delivery, payment, notification)
│   │   │   ├── bot/            # Telegram bot handlers and scenes
│   │   │   ├── plugins/        # Fastify plugins (auth, cors, error-handler)
│   │   │   ├── lib/            # Shared utilities, helpers, logger
│   │   │   └── index.ts        # Entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   └── migrations/     # Prisma migrations
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mini-app/         # Customer Mini App (React + Vite + Tailwind CSS)
│   │   ├── src/
│   │   │   ├── pages/          # Route-level components
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── stores/         # State management
│   │   │   ├── api/            # API client and request functions
│   │   │   ├── lib/            # Utilities, constants
│   │   │   └── main.tsx        # Entry point
│   │   ├── public/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.ts
│   │
│   ├── admin/            # Admin Panel (React + Vite + Tailwind CSS + shadcn/ui)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── api/
│   │   │   ├── lib/
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.ts
│   │
│   └── courier/          # Courier Panel (React + Vite + Tailwind CSS)
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── stores/
│       │   ├── api/
│       │   ├── lib/
│       │   └── main.tsx
│       ├── public/
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── tailwind.config.ts
│
├── packages/
│   └── shared/           # Shared types, contracts, utilities
│       ├── src/
│       │   ├── types/          # TypeScript types and interfaces
│       │   ├── contracts/      # API request/response contracts
│       │   ├── constants/      # Shared constants (order statuses, roles, etc.)
│       │   ├── validation/     # Shared validation schemas (zod)
│       │   └── index.ts        # Public API barrel export
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   ├── product/          # MVP scope, backlog, glossary, order status machine
│   ├── engineering/      # Naming, repo layout, config policy
│   ├── architecture/     # Module boundaries, notification triggers
│   ├── api/              # API standards, contracts
│   ├── security/         # RBAC matrix
│   ├── qa/               # Test strategy, manual checklist
│   ├── release/          # Release process
│   └── ops/              # Runbook, store onboarding
│
├── .env.example          # Environment variables template
├── .gitignore
├── package.json          # Root workspace (npm workspaces)
├── CONTRIBUTING.md       # Contribution guidelines
└── CODEOWNERS            # Code ownership rules
```

## Key Principles

- **Monorepo with npm workspaces** -- all apps and packages live in one repository, managed via the root `package.json` workspaces field.
- **Shared contracts** -- types, API contracts, and validation schemas shared between frontend and backend live in `packages/shared/`. Never duplicate type definitions across apps.
- **Business logic on backend only** -- frontend apps are thin clients; all business rules, authorization, and data validation happen in `apps/backend/`.
- **One database, one schema** -- Prisma schema lives in `apps/backend/prisma/`. Migrations are managed there.
- **Documentation co-located** -- all project docs live under `docs/` in the repo, organized by domain (product, engineering, architecture, etc.).
