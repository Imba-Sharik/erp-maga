FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

# git нужен, чтобы vite взял commit sha из .git при ручной сборке на сервере
# (в CI sha приходит build-arg'ом VITE_APP_SHA и git не используется).
RUN apk add --no-cache git

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_URL
ARG VITE_USE_MOCKS=false
ARG VITE_APP_SHA
ARG VITE_APP_BUILD_DATE
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_USE_MOCKS=$VITE_USE_MOCKS
# Штамп: в CI VITE_APP_SHA приходит build-arg'ом; при ручной серверной сборке он
# не задан — тогда vite берёт sha из .git (он в контексте, git установлен выше).
ENV VITE_APP_SHA=$VITE_APP_SHA
ENV VITE_APP_BUILD_DATE=$VITE_APP_BUILD_DATE

RUN test -n "$VITE_API_URL"

RUN pnpm build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
