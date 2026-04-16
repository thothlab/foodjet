FROM node:20-alpine AS build
WORKDIR /app

COPY apps/admin/package.json ./
RUN npm install

COPY apps/admin/ ./
RUN npx vite build

FROM nginx:alpine
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
