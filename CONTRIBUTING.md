# Contributing to FoodJet

## Branch Naming

All branches must follow this pattern:

```
feature/TASK-ID-short-description   # New features
fix/TASK-ID-short-description       # Bug fixes
docs/TASK-ID-short-description      # Documentation only
chore/TASK-ID-short-description     # Maintenance, deps, config
```

Examples:
- `feature/FJ-42-store-menu-crud`
- `fix/FJ-58-order-status-race-condition`
- `docs/FJ-60-api-contracts`

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add menu item CRUD endpoints
fix: prevent duplicate order creation on retry
docs: document order status state machine
chore: upgrade prisma to 5.x
refactor: extract payment logic into service
test: add integration tests for delivery assignment
```

Scope is optional but encouraged:

```
feat(order): add cancellation flow
fix(bot): handle callback query timeout
```

## Pull Request Rules

1. **Description required** -- every PR must explain what it does and why.
2. **Link task ID** -- include the task identifier (e.g., `FJ-42`) in the PR title or description.
3. **Tests must pass** -- CI must be green before merge.
4. **One approval minimum** -- at least one code owner must approve.
5. **No direct pushes to main** -- all changes go through PRs.

## Code Guidelines

### Shared Contracts

All types, API contracts, and validation schemas shared between apps live in:

```
packages/shared/src/
```

Never duplicate type definitions across `apps/`. Import from `@foodjet/shared` instead.

### Business Logic

All business logic, authorization checks, and data validation must live in `apps/backend/`. Frontend apps are thin clients -- they render UI and call the API. No business rules in React components.

### Environment Variables

- **Never commit `.env` files.** They are gitignored.
- Use `.env.example` as a template. Keep it up to date when adding new variables.
- All env vars must be validated at startup (fail fast if missing).

### Database

- Prisma schema lives in `apps/backend/prisma/schema.prisma`.
- Always create a migration when changing the schema (`npx prisma migrate dev`).
- Never edit migration files after they have been committed.

## Getting Started

```bash
# Install dependencies (from repo root)
npm install

# Copy env template
cp .env.example apps/backend/.env

# Run database migrations
npm run -w apps/backend prisma:migrate

# Start all apps in dev mode
npm run dev
```
