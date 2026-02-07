#!/usr/bin/env node
/**
 * Run seed data: pnpm run seed
 * Inserts example stores and products only if the DB has no stores.
 * Requires DATABASE_URL in env (or .env in development).
 */
import { config as loadDotenv } from "dotenv";
import { runSeed } from "./seed-runner.js";

if (process.env.NODE_ENV !== "production") {
  loadDotenv();
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

runSeed(url)
  .then((seeded) => {
    if (seeded) {
      console.log("Done.");
    } else {
      console.log("Stores already exist; skipping seed. Use a fresh DB to re-seed.");
    }
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
