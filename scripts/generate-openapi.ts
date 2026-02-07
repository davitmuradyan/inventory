/**
 * Writes the OpenAPI spec to openapi.json.
 * Run: pnpm run openapi:generate
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildOpenApiSpec } from "../src/openapi/spec.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "openapi.json");

const spec = buildOpenApiSpec();
writeFileSync(outPath, JSON.stringify(spec, null, 2), "utf-8");
console.log("Wrote", outPath);
