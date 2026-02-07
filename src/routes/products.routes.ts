import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  createProductBodySchema,
  productListQuerySchema,
  productListResponseSchema,
  productSchema,
  updateProductBodySchema,
} from "../schemas/product.js";
import { idParamSchema } from "../schemas/common.js";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../services/product.service.js";
import { z } from "zod";

export async function productsRoutes(app: FastifyInstance) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  fastify.get(
    "/api/products",
    {
      schema: {
        tags: ["Products"],
        summary: "List products",
        description: "List products with optional filters (store, category, price, stock) and pagination",
        operationId: "listProducts",
        querystring: productListQuerySchema,
        response: { 200: productListResponseSchema },
      },
    },
    async (request) => await listProducts(request.query)
  );

  fastify.get(
    "/api/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Get product",
        description: "Get product by ID",
        operationId: "getProductById",
        params: idParamSchema,
        response: { 200: productSchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const product = await getProductById(id);
      if (!product) return reply.notFound("Product not found");
      return product;
    }
  );

  fastify.post(
    "/api/products",
    {
      schema: {
        tags: ["Products"],
        summary: "Create product",
        description: "Create a product in a store",
        operationId: "createProduct",
        body: createProductBodySchema,
        response: { 201: productSchema, 400: z.object({ message: z.string() }) },
      },
    },
    async (request, reply) => {
      const product = await createProduct(request.body);
      if (!product) return reply.badRequest("Store not found");
      return reply.code(201).send(product);
    }
  );

  fastify.put(
    "/api/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Update product",
        description: "Update a product",
        operationId: "updateProduct",
        params: idParamSchema,
        body: updateProductBodySchema,
        response: { 200: productSchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updated = await updateProduct(id, request.body);
      if (!updated) return reply.notFound("Product not found");
      return updated;
    }
  );

  fastify.delete(
    "/api/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Delete product",
        description: "Delete a product",
        operationId: "deleteProduct",
        params: idParamSchema,
        response: { 204: z.undefined(), 404: z.object({ message: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const deleted = await deleteProduct(id);
      if (!deleted) return reply.notFound("Product not found");
      return reply.code(204).send();
    }
  );
}
