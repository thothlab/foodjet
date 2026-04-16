FROM node:20-alpine AS build
WORKDIR /app

COPY apps/courier/package.json ./
RUN npm install

COPY apps/courier/ ./
RUN npx vite build

FROM nginx:alpine
COPY apps/courier/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
