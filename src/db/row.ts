import type { Store } from "../schemas/store.js";
import type { Product } from "../schemas/product.js";

export interface StoreRow {
  id: string;
  name: string;
  created_at: Date;
}

export interface ProductRow {
  id: string;
  store_id: string;
  name: string;
  category: string;
  price: string;
  quantity_in_stock: number;
  created_at: Date;
}

export function storeFromRow(row: StoreRow): Store {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at.toISOString(),
  };
}

export function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    category: row.category,
    price: parseFloat(row.price),
    quantityInStock: Number(row.quantity_in_stock),
    createdAt: row.created_at.toISOString(),
  };
}
