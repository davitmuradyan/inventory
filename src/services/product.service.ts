import { randomUUID } from "node:crypto";
import { getStoreRepo, getProductRepo } from "../db/index.js";
import type {
  CreateProductBody,
  Product,
  ProductListQuery,
  UpdateProductBody,
} from "../schemas/product.js";

export function listProducts(query: ProductListQuery): Promise<{ items: Product[]; total: number }> {
  return getProductRepo().list(query);
}

export function getProductById(id: string): Promise<Product | undefined> {
  return getProductRepo().getById(id);
}

export async function createProduct(body: CreateProductBody): Promise<Product | null> {
  const store = await getStoreRepo().getById(body.storeId);
  if (!store) return null;
  const product: Product = {
    id: randomUUID(),
    storeId: body.storeId,
    name: body.name,
    category: body.category,
    price: body.price,
    quantityInStock: body.quantityInStock,
    createdAt: new Date().toISOString(),
  };
  await getProductRepo().create(product);
  return product;
}

export function updateProduct(id: string, body: UpdateProductBody): Promise<Product | undefined> {
  return getProductRepo().update(id, body);
}

export function deleteProduct(id: string): Promise<boolean> {
  return getProductRepo().delete(id);
}
