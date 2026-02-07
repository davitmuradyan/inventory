import pg from "pg";
import { randomUUID } from "node:crypto";
import { SEED_PRODUCTS, SEED_STORES } from "./seed-data.js";

export async function runSeed(url: string): Promise<boolean> {
  const pool = new pg.Pool({ connectionString: url, max: 1 });

  try {
    const countResult = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM stores");
    const count = parseInt(countResult.rows[0]?.count ?? "0", 10);
    if (count > 0) {
      return false;
    }

    const now = new Date().toISOString();

    for (const store of SEED_STORES) {
      await pool.query(
        `INSERT INTO stores (id, name, created_at) VALUES ($1, $2, $3::timestamptz)`,
        [store.id, store.name, now]
      );
    }

    for (const product of SEED_PRODUCTS) {
      await pool.query(
        `INSERT INTO products (id, store_id, name, category, price, quantity_in_stock, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz)`,
        [
          randomUUID(),
          product.storeId,
          product.name,
          product.category,
          product.price,
          product.quantityInStock,
          now,
        ]
      );
    }

    console.log(`Seed data loaded: ${SEED_STORES.length} stores, ${SEED_PRODUCTS.length} products`);
    return true;
  } finally {
    await pool.end();
  }
}
