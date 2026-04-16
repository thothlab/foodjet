FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/mini-app/package.json ./apps/mini-app/
RUN npm install --workspace=apps/mini-app --include-workspace-root

COPY apps/mini-app ./apps/mini-app
RUN cd apps/mini-app && npm run build

FROM nginx:alpine
COPY apps/mini-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/mini-app/dist /usr/share/nginx/html
EXPOSE 80
