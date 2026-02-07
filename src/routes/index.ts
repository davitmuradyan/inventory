import type { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes.js";
import { storesRoutes } from "./stores.routes.js";
import { productsRoutes } from "./products.routes.js";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoutes);
  await app.register(storesRoutes);
  await app.register(productsRoutes);
}
