import { buildApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { initDb, closePool } from "./db/index.js";

async function main() {
  const env = loadEnv();

  await initDb(env.DATABASE_URL);

  const app = await buildApp();
  app.addHook("onClose", async () => {
    await closePool();
  });

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    await closePool();
    process.exit(1);
  }
}

main();
