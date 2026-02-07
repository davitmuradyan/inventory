import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import { buildOpenApiSpec } from "../openapi/spec.js";

export async function swaggerPlugin(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    mode: "static",
    specification: {
      document: buildOpenApiSpec(),
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });
}
