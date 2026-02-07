import { z } from "zod";

export const createStoreBodySchema = z.object({
  name: z.string().min(1).max(200),
});

export const updateStoreBodySchema = createStoreBodySchema.partial();

export const storeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime(),
});

export type CreateStoreBody = z.infer<typeof createStoreBodySchema>;
export type UpdateStoreBody = z.infer<typeof updateStoreBodySchema>;
export type Store = z.infer<typeof storeSchema>;
