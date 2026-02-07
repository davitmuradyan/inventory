import type { Pool } from "pg";
import type { Product } from "../schemas/product.js";
import type { ProductListQuery } from "../schemas/product.js";
import { productFromRow, type ProductRow } from "./row.js";

export function createProductsRepo(p: Pool) {
  return {
    async list(query: ProductListQuery): Promise<{ items: Product[]; total: number }> {
      const conditions: string[] = ["1=1"];
      const params: unknown[] = [];
      let paramIndex = 1;

      if (query.storeId) {
        conditions.push(`store_id = $${paramIndex++}`);
        params.push(query.storeId);
      }
      if (query.category) {
        conditions.push(`category = $${paramIndex++}`);
        params.push(query.category);
      }
      if (query.priceMin != null) {
        conditions.push(`price >= $${paramIndex++}`);
        params.push(query.priceMin);
      }
      if (query.priceMax != null) {
        conditions.push(`price <= $${paramIndex++}`);
        params.push(query.priceMax);
      }
      if (query.stockMin != null) {
        conditions.push(`quantity_in_stock >= $${paramIndex++}`);
        params.push(query.stockMin);
      }
      if (query.stockMax != null) {
        conditions.push(`quantity_in_stock <= $${paramIndex++}`);
        params.push(query.stockMax);
      }

      const where = conditions.join(" AND ");

      const countResult = await p.query<{ count: string }>(
        `SELECT COUNT(*)::int AS count FROM products WHERE ${where}`,
        params
      );
      const total = parseInt(countResult.rows[0]?.count ?? "0", 10);

      params.push(query.limit, query.offset);
      const limitParam = `$${paramIndex++}`;
      const offsetParam = `$${paramIndex}`;

      const result = await p.query<ProductRow>(
        `SELECT id, store_id, name, category, price, quantity_in_stock, created_at
         FROM products WHERE ${where}
         ORDER BY created_at
         LIMIT ${limitParam} OFFSET ${offsetParam}`,
        params
      );

      return { items: result.rows.map(productFromRow), total };
    },

    async getById(id: string): Promise<Product | undefined> {
      const result = await p.query<ProductRow>(
        "SELECT id, store_id, name, category, price, quantity_in_stock, created_at FROM products WHERE id = $1",
        [id]
      );
      const row = result.rows[0];
      return row ? productFromRow(row) : undefined;
    },

    async getByStoreId(storeId: string): Promise<Product[]> {
      const result = await p.query<ProductRow>(
        "SELECT id, store_id, name, category, price, quantity_in_stock, created_at FROM products WHERE store_id = $1 ORDER BY created_at",
        [storeId]
      );
      return result.rows.map(productFromRow);
    },

    async create(product: Product): Promise<void> {
      await p.query(
        `INSERT INTO products (id, store_id, name, category, price, quantity_in_stock, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz)`,
        [
          product.id,
          product.storeId,
          product.name,
          product.category,
          product.price,
          product.quantityInStock,
          product.createdAt,
        ]
      );
    },

    async update(
      id: string,
      data: Partial<Pick<Product, "name" | "category" | "price" | "quantityInStock">>
    ): Promise<Product | undefined> {
      const updates: string[] = [];
      const values: unknown[] = [];
      let i = 1;
      if (data.name !== undefined) {
        updates.push(`name = $${i++}`);
        values.push(data.name);
      }
      if (data.category !== undefined) {
        updates.push(`category = $${i++}`);
        values.push(data.category);
      }
      if (data.price !== undefined) {
        updates.push(`price = $${i++}`);
        values.push(data.price);
      }
      if (data.quantityInStock !== undefined) {
        updates.push(`quantity_in_stock = $${i++}`);
        values.push(data.quantityInStock);
      }
      if (updates.length === 0) return this.getById(id);
      values.push(id);
      const result = await p.query<ProductRow>(
        `UPDATE products SET ${updates.join(", ")} WHERE id = $${i} RETURNING id, store_id, name, category, price, quantity_in_stock, created_at`,
        values
      );
      const row = result.rows[0];
      return row ? productFromRow(row) : undefined;
    },

    async delete(id: string): Promise<boolean> {
      const result = await p.query("DELETE FROM products WHERE id = $1", [id]);
      return (result.rowCount ?? 0) > 0;
    },
  };
}
