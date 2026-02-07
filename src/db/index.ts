import type { Pool } from "pg";
import { getPool as getPoolFromClient, closePool } from "./client.js";
import { runMigrations } from "./migrate-runner.js";
import { runSeed } from "./seed-runner.js";
import { createStoresRepo } from "./stores.js";
import { createProductsRepo } from "./products.js";

let pool: Pool | null = null;

export async function initDb(url: string): Promise<void> {
  await runMigrations(url);
  await runSeed(url);
  pool = getPoolFromClient(url);
}

export function getStoreRepo() {
  if (!pool) throw new Error("DB not initialized: call initDb() first");
  return createStoresRepo(pool);
}

export function getProductRepo() {
  if (!pool) throw new Error("DB not initialized: call initDb() first");
  return createProductsRepo(pool);
}

export { closePool };
