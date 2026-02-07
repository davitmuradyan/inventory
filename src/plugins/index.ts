import type { FastifyInstance } from "fastify";
import { corsPlugin } from "./cors.js";
import { sensiblePlugin } from "./sensible.js";

export async function registerPlugins(app: FastifyInstance) {
  await app.register(sensiblePlugin);
  await app.register(corsPlugin);
}
