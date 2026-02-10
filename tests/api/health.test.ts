import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import { initDb, closePool } from "../../src/db/index.js";

const TEST_DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5433/inventory";

describe("API", () => {
  describe("GET /api/health", () => {
    it("returns 200 and health payload (no DB required)", async () => {
      const app = await buildApp();
      const res = await app.inject({
        method: "GET",
        url: "/api/health",
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toMatchObject({
        status: "ok",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });

  describe("GET /api/stores (integration, requires Postgres)", () => {
    let app: Awaited<ReturnType<typeof buildApp>> | null = null;

    beforeAll(async () => {
      try {
        await initDb(TEST_DATABASE_URL);
        app = await buildApp();
      } catch {
        app = null;
      }
    });

    afterAll(async () => {
      await closePool();
    });

    it("returns 200 and array of stores", async () => {
      if (!app) {
        console.warn("Skipping: Postgres not available (start with e.g. docker compose up -d postgres)");
        return;
      }

      const res = await app.inject({
        method: "GET",
        url: "/api/stores",
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          createdAt: expect.any(String),
        });
      }
    });
  });
});
