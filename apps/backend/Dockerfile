FROM node:20-alpine
WORKDIR /app

# Copy workspace root for npm workspaces resolution
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install all workspace dependencies
RUN npm install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Generate Prisma client
RUN cd apps/backend && npx prisma generate

RUN mkdir -p apps/backend/uploads

WORKDIR /app/apps/backend

EXPOSE 3000
CMD ["npx", "tsx", "src/server.ts"]
