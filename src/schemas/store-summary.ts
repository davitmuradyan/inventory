import { z } from "zod";

export const storeSummarySchema = z.object({
  storeId: z.string().uuid(),
  storeName: z.string(),
  totalProducts: z.number().int().min(0),
  totalInventoryValue: z.number().min(0),
  lowStockCount: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0),
  byCategory: z.array(
    z.object({
      category: z.string(),
      productCount: z.number().int().min(0),
      totalValue: z.number().min(0),
    })
  ),
});

export type StoreSummary = z.infer<typeof storeSummarySchema>;
