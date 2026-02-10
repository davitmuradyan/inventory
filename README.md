# Inventory

Inventory management system: **stores** and **products** (name, category, price, quantity). REST API with filtering, pagination, and a store summary aggregation; React client in `client/`.

## Stack

**Backend (root)**

- **Runtime:** Node.js (ESM)
- **Framework:** Fastify 5
- **Validation:** Zod + `fastify-type-provider-zod` for type-safe schemas
- **Persistence:** PostgreSQL (`pg` driver)
- **Language:** TypeScript (strict mode)

**Client (`client/`)**

- React, Vite, TanStack Query, React Hook Form + Zod, Radix UI, Tailwind

## Project structure

- **Root** — Backend API (Fastify, Postgres).
- **`client/`** — Frontend app (React, Vite); separate `package.json` and scripts.

Backend source:

```
src/
├── config/          # Env config (dotenv in dev)
├── db/              # PostgreSQL client, schema, stores/products repos
├── plugins/         # Fastify plugins (cors, sensible)
├── routes/          # REST route handlers
├── schemas/         # Zod schemas and types
├── services/        # Business logic (CRUD, list, summary)
├── app.ts           # App factory
└── server.ts        # Entry point
```

## Setup

1. Create a PostgreSQL database and set `DATABASE_URL` in `.env` (see `.env.example`).
2. Install and run:

```bash
pnpm install
cp .env.example .env
# Edit .env and set DATABASE_URL (e.g. postgresql://user:password@localhost:5432/inventory)
pnpm dev
```

Schema is applied via **migrations** on startup (see `migrations/`). You can also run them manually: `pnpm run migrate`.

**Seed data:** On first start (when no stores exist), the app loads example data: 3 stores and 9 products across categories (Electronics, Produce, Bakery, Home, Office, Travel, Grocery). Reviewers can call the API immediately. To re-seed a fresh DB: `pnpm run seed`.

### Client

The React UI lives in **`client/`**. Run it alongside the API:

```bash
cd client
pnpm install
pnpm dev
```

The app will be at **http://localhost:3000**.

### Docker (single command)

Runs PostgreSQL, the API, no local Node or Postgres needed:

```bash
docker compose up --build
```

- **API:** http://localhost:8080
- **Postgres:** `localhost:5433` (user `postgres`, password `postgres`, db `inventory`)

Stop with `Ctrl+C` or `docker compose down`.

## Scripts

| Command           | Description                    |
|-------------------|--------------------------------|
| `pnpm dev`        | Start with hot reload (tsx)     |
| `pnpm build`      | Compile TypeScript to `dist/`  |
| `pnpm start`      | Run production build           |
| `pnpm migrate`    | Run pending DB migrations      |
| `pnpm seed`       | Load seed data (if DB has no stores) |
| `pnpm test`       | Run tests (Vitest)              |
| `pnpm openapi:generate` | Write OpenAPI spec to `openapi.json` |
| `pnpm typecheck`  | Type-check only (no emit)      |

## API

**OpenAPI docs (Swagger UI):** When running locally use [http://localhost:8080/documentation](http://localhost:8080/documentation); with Docker use [http://localhost:8080/documentation](http://localhost:8080/documentation). The spec is built statically from `src/openapi/spec.ts`. To dump it to a file: `pnpm run openapi:generate` (writes `openapi.json`).

Base prefix: **`/api`**

### Health
- **GET /api/health** — `{ status, timestamp, uptime }`

### Stores
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/stores | List all stores |
| GET | /api/stores/:id | Get store by ID |
| GET | /api/stores/:storeId/products | List products for a store (supports same query params as GET /api/products) |
| GET | /api/stores/:storeId/summary | **Aggregation:** total products, total inventory value, low-stock count, breakdown by category. Query: `lowStockThreshold` (default 10) |
| POST | /api/stores | Create store. Body: `{ name }` |
| PUT | /api/stores/:id | Update store. Body: `{ name? }` |
| DELETE | /api/stores/:id | Delete store (and its products) |

### Products
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/products | List products with **filtering** and **pagination**. Query: `storeId`, `category`, `priceMin`, `priceMax`, `stockMin`, `stockMax`, `limit` (default 20), `offset` (default 0). Response: `{ items, total }` |
| GET | /api/products/:id | Get product by ID |
| POST | /api/products | Create product. Body: `{ storeId, name, category, price, quantityInStock }` |
| PUT | /api/products/:id | Update product. Body: `{ name?, category?, price?, quantityInStock? }` |
| DELETE | /api/products/:id | Delete product |

## Adding new features

1. **Schemas** — Define Zod schemas in `src/schemas/` and export from `index.ts`.
2. **Services** — Put business logic in `src/services/`; keep routes thin.
3. **Routes** — Register routes in `src/routes/` and add them in `src/routes/index.ts` with a prefix (e.g. `/api`).
4. **Plugins** — Add shared behavior in `src/plugins/` and register in `src/plugins/index.ts`.

Validator and serializer compilers for Zod are set once in `app.ts`, so route handlers get automatic validation and typed responses when using the Zod type provider.

## Decisions & trade-offs

- **Fastify + Zod** — Fastify is fast and plugin-based; Zod gives a single source of truth for validation and types and integrates with Fastify via `fastify-type-provider-zod`. Validation errors are automatic and type-safe.
- **PostgreSQL + raw `pg`** — No ORM to keep the scope small and SQL explicit; migrations handle schema changes. Repos encapsulate queries so switching to an ORM later would be localized.
- **Static OpenAPI spec** — The spec is generated in code (`src/openapi/spec.ts`) and served in static mode so Swagger UI always has a full document.
- **Migrations on startup** — Pending migrations run in `initDb()` so `docker compose up` and local dev stay in sync without a separate migrate step.
- **Seed only when empty** — Seed runs on startup only when there are no stores, so reviewers get data on first run and existing data is never overwritten.

**Not included (production would add):** rate limiting, request IDs, health check that hits the DB, structured error codes in a single JSON shape, E2E tests against a real DB.

## Migrations

Migrations live in **`migrations/`** as numbered SQL files (e.g. `000001_initial.sql`, `000002_add_foo.sql`). They run in order; applied migrations are stored in `schema_migrations`. The app runs pending migrations on startup. To add one: create a new file, then run `pnpm run migrate` or restart the app.

## Seed data

Example data is in **`src/db/seed-data.ts`** (stores and products). It is loaded automatically on **first startup** when the `stores` table is empty.