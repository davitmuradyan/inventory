import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  createStoreBodySchema,
  storeSchema,
  updateStoreBodySchema,
} from "../schemas/store.js";
import { storeSummarySchema } from "../schemas/store-summary.js";
import { idParamSchema } from "../schemas/common.js";
import {
  createStore,
  deleteStore,
  getStoreById,
  listStores,
  updateStore,
} from "../services/store.service.js";
import { getStoreSummary } from "../services/store-summary.service.js";
import { listProducts } from "../services/product.service.js";
import { productListQuerySchema, productListResponseSchema } from "../schemas/product.js";
import { z } from "zod";

const storeIdParamSchema = z.object({ storeId: z.string().uuid() });
const storeProductsQuerySchema = productListQuerySchema.omit({ storeId: true });
const summaryQuerySchema = z.object({
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
});

export async function storesRoutes(app: FastifyInstance) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  fastify.get(
    "/api/stores",
    {
      schema: {
        tags: ["Stores"],
        summary: "List stores",
        description: "List all stores",
        operationId: "listStores",
        response: { 200: z.array(storeSchema) },
      },
    },
    async () => await listStores()
  );

  fastify.get(
    "/api/stores/:id",
    {
      schema: {
        tags: ["Stores"],
        summary: "Get store",
        description: "Get store by ID",
        operationId: "getStoreById",
        params: idParamSchema,
        response: { 200: storeSchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const store = await getStoreById(id);
      if (!store) return reply.notFound("Store not found");
      return store;
    }
  );

  fastify.get(
    "/api/stores/:storeId/products",
    {
      schema: {
        tags: ["Stores"],
        summary: "List store products",
        description: "List products for a store with optional filters and pagination",
        operationId: "listStoreProducts",
        params: storeIdParamSchema,
        querystring: storeProductsQuerySchema,
        response: { 200: productListResponseSchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (request, reply) => {
      const { storeId } = request.params;
      const store = await getStoreById(storeId);
      if (!store) return reply.notFound("Store not found");
      const query = { ...request.query, storeId };
      return listProducts(query);
    }
  );

  fastify.get(
    "/api/stores/:storeId/summary",
    {
      schema: {
        tags: ["Stores"],
        summary: "Store summary",
        description: "Get store inventory summary: total products, value, low-stock count, breakdown by category",
        operationId: "getStoreSummary",
        params: storeIdParamSchema,
        querystring: summaryQuerySchema,
        response: { 200: storeSummarySchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (request, reply) => {
      const { storeId } = request.params;
      const { lowStockThreshold } = request.query ?? {};
      const summary = await getStoreSummary(storeId, lowStockThreshold);
      if (!summary) return reply.notFound("Store not found");
      return summary;
    }
  );

  fastify.post(
    "/api/stores",
    {
      schema: {
        tags: ["Stores"],
        summary: "Create store",
        description: "Create a store",
        operationId: "createStore",
        body: createStoreBodySchema,
        response: { 201: storeSchema },
      },
    },
    async (request, reply) => {
      const store = await createStore(request.body);
      return reply.code(201).send(store);
    }
  );

  fastify.put(
    "/api/stores/:id",
    {
      schema: {
        tags: ["Stores"],
        summary: "Update store",
        description: "Update a store",
        operationId: "updateStore",
        params: idParamSchema,
        body: updateStoreBodySchema,
        response: { 200: storeSchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updated = await updateStore(id, request.body);
      if (!updated) return reply.notFound("Store not found");
      return updated;
    }
  );

  fastify.delete(
    "/api/stores/:id",
    {
      schema: {
        tags: ["Stores"],
        summary: "Delete store",
        description: "Delete a store and its products",
        operationId: "deleteStore",
        params: idParamSchema,
        response: { 204: z.undefined(), 404: z.object({ message: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const deleted = await deleteStore(id);
      if (!deleted) return reply.notFound("Store not found");
      return reply.code(204).send();
    }
  );
}
