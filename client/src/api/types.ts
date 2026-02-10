/** API types aligned with backend OpenAPI (stores + products). */

export interface Store {
  id: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  quantityInStock: number;
  createdAt: string;
}

export interface ProductListParams {
  storeId?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
  limit?: number;
  offset?: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
}

export interface StoreSummary {
  storeId: string;
  storeName: string;
  totalProducts: number;
  totalInventoryValue: number;
  lowStockCount: number;
  lowStockThreshold: number;
  byCategory: Array<{
    category: string;
    productCount: number;
    totalValue: number;
  }>;
}

export interface ApiError {
  message: string;
}
