# Config and Secrets Policy

## Principles

1. **All secrets live in environment variables.** Never hardcode tokens, passwords, or connection strings.
2. **Fail fast.** The application must refuse to start if a required variable is missing or malformed.
3. **No secrets in logs.** Structured logs must never include secret values, even at DEBUG level.

---

## Required Environment Variables

These variables **must** be set. The application will not start without them.

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/foodjet` |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token | `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` |
| `JWT_SECRET` | Secret key for signing JWTs | (random 64-char string) |

---

## Optional Environment Variables

These variables have sensible defaults and may be omitted in development.

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP server port | `3000` |
| `LOG_LEVEL` | Logging verbosity (`debug`, `info`, `warn`, `error`) | `info` |
| `CORS_ORIGIN` | Allowed CORS origin(s) | `*` (dev only) |
| `JWT_EXPIRES_IN` | JWT token lifetime | `7d` |

---

## `.env.example`

The repository must always contain an up-to-date `.env.example` file listing every variable with a placeholder value and a comment. Developers copy it to `.env` and fill in real values.

```
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/foodjet
TELEGRAM_BOT_TOKEN=your-bot-token-here
JWT_SECRET=generate-a-random-secret

# Optional
PORT=3000
LOG_LEVEL=info
CORS_ORIGIN=*
JWT_EXPIRES_IN=7d
```

When adding a new environment variable:
1. Add it to `.env.example` with a comment.
2. Add validation to the startup schema (see below).
3. Document it in this file.

---

## Startup Validation

Use a **Zod schema** to validate all environment variables at application startup.

```typescript
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  CORS_ORIGIN: z.string().default("*"),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

export const env = envSchema.parse(process.env);
```

If validation fails, the process exits with a clear error message listing the missing or invalid variables.

---

## Naming Convention

- All environment variable names use **UPPER_SNAKE_CASE**.
- Prefix service-specific variables when needed (e.g. `TELEGRAM_BOT_TOKEN`, `DATABASE_URL`).

---

## Sensitive Data in Logs

**Prohibited.** The following must never appear in log output:

- `JWT_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `DATABASE_URL` (may log host/port, but never the password)
- User passwords or tokens
- Full credit card numbers (not applicable today, but as a policy)

If a library logs connection strings by default, configure it to redact credentials.

---

## Environment Separation

| Environment | Config source | Notes |
|---|---|---|
| **Development** | `.env` file (gitignored) | Relaxed CORS, debug logging |
| **Staging** | Platform environment variables | Mirrors production settings, separate database |
| **Production** | Platform environment variables (encrypted) | Strict CORS, info/warn logging, real bot token |

Never share secrets between environments. Each environment has its own `JWT_SECRET`, `DATABASE_URL`, and `TELEGRAM_BOT_TOKEN`.
