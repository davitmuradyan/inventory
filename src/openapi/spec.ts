import { zodToJsonSchema } from "zod-to-json-schema";
import type { OpenAPIV3 } from "openapi-types";
import { healthResponseSchema } from "../schemas/health.js";
import {
  createStoreBodySchema,
  storeSchema,
  updateStoreBodySchema,
} from "../schemas/store.js";
import {
  createProductBodySchema,
  productListResponseSchema,
  productSchema,
  updateProductBodySchema,
} from "../schemas/product.js";
import { storeSummarySchema } from "../schemas/store-summary.js";
import { z } from "zod";

const zodToSchema = (schema: z.ZodType): Record<string, unknown> =>
  zodToJsonSchema(schema, { $refStrategy: "none" }) as Record<string, unknown>;

const errorMessageSchema = zodToJsonSchema(
  z.object({ message: z.string() }),
  { $refStrategy: "none" }
) as Record<string, unknown>;

export function buildOpenApiSpec(): OpenAPIV3.Document {
  return {
    openapi: "3.0.3",
    info: {
      title: "Tiny Inventory API",
      description: "Stores and products with filtering, pagination, and store summary.",
      version: "1.0.0",
    },
    servers: [{ url: "/", description: "API base" }],
    tags: [
      { name: "Health", description: "Health check" },
      { name: "Stores", description: "Store management" },
      { name: "Products", description: "Product management" },
    ],
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          description: "Returns service status, timestamp, and uptime.",
          operationId: "getHealth",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: zodToSchema(healthResponseSchema),
                },
              },
            },
          },
        },
      },
      "/api/stores": {
        get: {
          tags: ["Stores"],
          summary: "List stores",
          description: "List all stores",
          operationId: "listStores",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: zodToSchema(storeSchema),
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Stores"],
          summary: "Create store",
          description: "Create a store",
          operationId: "createStore",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: zodToSchema(createStoreBodySchema) },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": { schema: zodToSchema(storeSchema) },
              },
            },
          },
        },
      },
      "/api/stores/{id}": {
        get: {
          tags: ["Stores"],
          summary: "Get store",
          description: "Get store by ID",
          operationId: "getStoreById",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: zodToSchema(storeSchema) },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": { schema: errorMessageSchema },
              },
            },
          },
        },
        put: {
          tags: ["Stores"],
          summary: "Update store",
          description: "Update a store",
          operationId: "updateStore",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          requestBody: {
            content: {
              "application/json": { schema: zodToSchema(updateStoreBodySchema) },
            },
          },
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: zodToSchema(storeSchema) },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": { schema: errorMessageSchema },
              },
            },
          },
        },
        delete: {
          tags: ["Stores"],
          summary: "Delete store",
          description: "Delete a store and its products",
          operationId: "deleteStore",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            "204": { description: "No content" },
            "404": {
              description: "Not found",
              content: {
                "application/json": { schema: errorMessageSchema },
              },
            },
          },
        },
      },
      "/api/stores/{storeId}/products": {
        get: {
          tags: ["Stores"],
          summary: "List store products",
          description: "List products for a store with optional filters and pagination",
          operationId: "listStoreProducts",
          parameters: [
            { name: "storeId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "priceMin", in: "query", schema: { type: "number" } },
            { name: "priceMax", in: "query", schema: { type: "number" } },
            { name: "stockMin", in: "query", schema: { type: "integer" } },
            { name: "stockMax", in: "query", schema: { type: "integer" } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
            { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: zodToSchema(productListResponseSchema) },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": { schema: errorMessageSchema },
              },
            },
          },
        },
      },
      "/api/stores/{storeId}/summary": {
        get: {
          tags: ["Stores"],
          summary: "Store summary",
          description:
            "Get store inventory summary: total products, value, low-stock count, breakdown by category",
          operationId: "getStoreSummary",
          parameters: [
            { name: "storeId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "lowStockThreshold", in: "query", schema: { type: "integer" } },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: zodToSchema(storeSummarySchema) },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": { schema: errorMessageSchema },
              },
            },
          },
        },
      },
      "/api/products": {
        get: {
          tags: ["Products"],
          summary: "List products",
          description:
            "List products with optional filters (store, category, price, stock) and pagination",
          operationId: "listProducts",
          parameters: [
            { name: "storeId", in: "query", schema: { type: "string", format: "uuid" } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "priceMin", in: "query", schema: { type: "number" } },
            { name: "priceMax", in: "query", schema: { type: "number" } },
            { name: "stockMin", in: "query", schema: { type: "integer" } },
            { name: "stockMax", in: "query", schema: { type: "integer" } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
            { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: zodToSchema(productListResponseSchema) },
              },
            },
          },
        },
        post: {
          tags: ["Products"],
          summary: "Create product",
          description: "Create a product in a store",
          operationId: "createProduct",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: zodToSchema(createProductBodySchema) },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": { schema: zodToSchema(productSchema) },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": { schema: errorMessageSchema },
              },
            },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Get product",
          description: "Get product by ID",
          operationId: "getProductById",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: zodToSchema(productSchema) },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": { schema: errorMessageSchema },
              },
            },
          },
        },
        put: {
          tags: ["Products"],
          summary: "Update product",
          description: "Update a product",
          operationId: "updateProduct",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          requestBody: {
            content: {
              "application/json": { schema: zodToSchema(updateProductBodySchema) },
            },
          },
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": { schema: zodToSchema(productSchema) },
              },
            },
            "404": {
              description: "Not found",
              content: {
                "application/json": { schema: errorMessageSchema },
              },
            },
          },
        },
        delete: {
          tags: ["Products"],
          summary: "Delete product",
          description: "Delete a product",
          operationId: "deleteProduct",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            "204": { description: "No content" },
            "404": {
              description: "Not found",
              content: {
                "application/json": { schema: errorMessageSchema },
              },
            },
          },
        },
      },
    },
  };
}
