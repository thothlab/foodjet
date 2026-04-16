FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN npm install --workspace=apps/backend --workspace=packages/shared --include-workspace-root

# Generate Prisma client
FROM deps AS prisma
COPY apps/backend/prisma ./apps/backend/prisma
RUN cd apps/backend && npx prisma generate

# Build shared package
FROM prisma AS build-shared
COPY packages/shared ./packages/shared
COPY apps/backend/tsconfig.json ./apps/backend/
RUN cd packages/shared && npm run build 2>/dev/null || true

# Production image
FROM base AS runner
ENV NODE_ENV=production

COPY --from=prisma /app/node_modules ./node_modules
COPY --from=prisma /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=prisma /app/packages/shared/node_modules ./packages/shared/node_modules 2>/dev/null || true
COPY --from=prisma /app/apps/backend/prisma ./apps/backend/prisma

COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
COPY package.json ./

RUN mkdir -p apps/backend/uploads

WORKDIR /app/apps/backend

EXPOSE 3000
CMD ["npx", "tsx", "src/server.ts"]
