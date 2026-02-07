import pg from "pg";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export async function runMigrations(url: string): Promise<void> {
  const migrationsDir = join(process.cwd(), "migrations");
  if (!existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir} (cwd: ${process.cwd()})`);
  }

  const pool = new pg.Pool({ connectionString: url, max: 1 });
  let applied = 0;

  try {
    await pool.query(MIGRATIONS_TABLE);

    const files = readdirSync(migrationsDir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".sql"))
      .map((e) => e.name)
      .sort();

    for (const file of files) {
      const name = file;
      const result = await pool.query("SELECT 1 FROM schema_migrations WHERE name = $1", [name]);
      if (result.rows.length > 0) continue;

      const sql = readFileSync(join(migrationsDir, file), "utf-8");
      await pool.query(sql);
      await pool.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
      applied++;
      console.log(`Migration applied: ${name}`);
    }

    if (applied === 0) {
      console.log("Migrations: up to date");
    }
  } finally {
    await pool.end();
  }
}
