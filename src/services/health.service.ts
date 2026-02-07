import type { HealthResponse } from "../schemas/health.js";

export function getHealth(): HealthResponse {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
