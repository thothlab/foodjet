FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/courier/package.json ./apps/courier/
RUN npm install --workspace=apps/courier --include-workspace-root

COPY apps/courier ./apps/courier
RUN cd apps/courier && npm run build

FROM nginx:alpine
COPY apps/courier/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/courier/dist /usr/share/nginx/html
EXPOSE 80
