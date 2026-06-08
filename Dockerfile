FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV CHOKIDAR_USEPOLLING=true

EXPOSE 5173

CMD ["sh", "-c", "pnpm exec kubb generate && pnpm exec vite --host 0.0.0.0 --port 5173"]
