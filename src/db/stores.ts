import type { Pool } from "pg";
import type { Store } from "../schemas/store.js";
import { storeFromRow, type StoreRow } from "./row.js";

export function createStoresRepo(p: Pool) {
  return {
    async getAll(): Promise<Store[]> {
      const result = await p.query<StoreRow>("SELECT id, name, created_at FROM stores ORDER BY created_at");
      return result.rows.map(storeFromRow);
    },

    async getById(id: string): Promise<Store | undefined> {
      const result = await p.query<StoreRow>("SELECT id, name, created_at FROM stores WHERE id = $1", [id]);
      const row = result.rows[0];
      return row ? storeFromRow(row) : undefined;
    },

    async create(store: Store): Promise<void> {
      await p.query(
        "INSERT INTO stores (id, name, created_at) VALUES ($1, $2, $3::timestamptz)",
        [store.id, store.name, store.createdAt]
      );
    },

    async update(id: string, name?: string): Promise<Store | undefined> {
      if (name !== undefined) {
        const result = await p.query<StoreRow>(
          "UPDATE stores SET name = $1 WHERE id = $2 RETURNING id, name, created_at",
          [name, id]
        );
        const row = result.rows[0];
        return row ? storeFromRow(row) : undefined;
      }
      return this.getById(id);
    },

    async delete(id: string): Promise<boolean> {
      const result = await p.query("DELETE FROM stores WHERE id = $1", [id]);
      return (result.rowCount ?? 0) > 0;
    },
  };
}
