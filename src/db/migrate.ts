#!/usr/bin/env node
/**
 * Run migrations standalone: pnpm run migrate
 * Requires DATABASE_URL in env (or .env in development).
 */
import { config as loadDotenv } from "dotenv";
import { runMigrations } from "./migrate-runner.js";

if (process.env.NODE_ENV !== "production") {
  loadDotenv();
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

runMigrations(url)
  .then(() => {
    console.log("Migrations complete");
  })
  .catch((err) => {
    console.error("Migrations failed:", err);
    process.exit(1);
  });
