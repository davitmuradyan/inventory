import { z } from "zod";

export const createProductBodySchema = z.object({
  storeId: z.string().uuid(),
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  price: z.number().positive(),
  quantityInStock: z.number().int().min(0),
});

export const updateProductBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  quantityInStock: z.number().int().min(0).optional(),
});

export const productSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  price: z.number(),
  quantityInStock: z.number(),
  createdAt: z.string().datetime(),
});

export const productListQuerySchema = z.object({
  storeId: z.string().uuid().optional(),
  category: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  stockMin: z.coerce.number().int().min(0).optional(),
  stockMax: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const productListResponseSchema = z.object({
  items: z.array(productSchema),
  total: z.number().int().min(0),
});

export type CreateProductBody = z.infer<typeof createProductBodySchema>;
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;
