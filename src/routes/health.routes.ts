import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getHealth } from "../services/health.service.js";
import { healthResponseSchema } from "../schemas/health.js";

export async function healthRoutes(app: FastifyInstance) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  fastify.get(
    "/api/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns service status, timestamp, and uptime.",
        operationId: "getHealth",
        response: {
          200: healthResponseSchema,
        },
      },
    },
    async () => {
      return getHealth();
    }
  );
}
