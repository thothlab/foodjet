FROM node:20-alpine AS build
WORKDIR /app

COPY apps/mini-app/package.json ./
RUN npm install

COPY apps/mini-app/ ./
RUN npx vite build

FROM nginx:alpine
COPY apps/mini-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
