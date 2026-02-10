# Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# Serve static files (no proxy; client calls API directly)
FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
RUN echo '{"name":"inventory-client-serve","private":true,"dependencies":{"serve":"^14.2.4"}}' > package.json && pnpm install
COPY --from=builder /app/dist ./dist
EXPOSE 80
CMD ["pnpm", "exec", "serve", "-s", "dist", "-l", "80"]
