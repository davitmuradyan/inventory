import { getStoreRepo, getProductRepo } from "../db/index.js";
import type { StoreSummary } from "../schemas/store-summary.js";

const DEFAULT_LOW_STOCK_THRESHOLD = 10;

export async function getStoreSummary(
  storeId: string,
  lowStockThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): Promise<StoreSummary | null> {
  const store = await getStoreRepo().getById(storeId);
  if (!store) return null;

  const products = await getProductRepo().getByStoreId(storeId);

  const totalProducts = products.length;
  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.quantityInStock, 0);
  const lowStockCount = products.filter((p) => p.quantityInStock < lowStockThreshold).length;

  const byCategoryMap = new Map<string, { count: number; value: number }>();
  for (const p of products) {
    const existing = byCategoryMap.get(p.category) ?? { count: 0, value: 0 };
    existing.count += 1;
    existing.value += p.price * p.quantityInStock;
    byCategoryMap.set(p.category, existing);
  }
  const byCategory = Array.from(byCategoryMap.entries()).map(([category, { count, value }]) => ({
    category,
    productCount: count,
    totalValue: value,
  }));

  return {
    storeId: store.id,
    storeName: store.name,
    totalProducts,
    totalInventoryValue,
    lowStockCount,
    lowStockThreshold,
    byCategory,
  };
}
