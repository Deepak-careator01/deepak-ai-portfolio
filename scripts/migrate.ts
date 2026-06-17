/**
 * Database migration runner.
 *
 * Usage:
 *   bun scripts/migrate.ts
 *
 * Requires:
 *   DATABASE_URL
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import pg from "pg";

const LOG_PREFIX = "[migrate]";
const MIGRATIONS_DIR = join(process.cwd(), "migrations");
const MIGRATIONS_TABLE = "schema_migrations";

function log(message: string): void {
  console.info(`${LOG_PREFIX} ${message}`);
}

function fail(message: string): never {
  console.error(`${LOG_PREFIX} ${message}`);
  process.exit(1);
}

async function discoverMigrationFiles(): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIR);
  return entries.filter((name) => name.endsWith(".sql")).sort();
}

async function ensureMigrationsTable(client: pg.PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrationIds(client: pg.PoolClient): Promise<Set<string>> {
  const result = await client.query<{ id: string }>(
    `SELECT id FROM ${MIGRATIONS_TABLE} ORDER BY id`,
  );
  return new Set(result.rows.map((row) => row.id));
}

async function applyMigration(
  client: pg.PoolClient,
  migrationId: string,
  sql: string,
): Promise<void> {
  await client.query("BEGIN");

  try {
    await client.query(sql);
    await client.query(`INSERT INTO ${MIGRATIONS_TABLE} (id) VALUES ($1)`, [migrationId]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    fail("DATABASE_URL is not set. Cannot run migrations.");
  }

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: 10_000,
  });

  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const migrationFiles = await discoverMigrationFiles();
    const applied = await getAppliedMigrationIds(client);
    const pending = migrationFiles.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      log("No pending migrations.");
      return;
    }

    log(`Found ${pending.length} pending migration(s).`);

    for (const file of pending) {
      const filePath = join(MIGRATIONS_DIR, file);
      const sql = await readFile(filePath, "utf8");
      log(`Applying ${file}...`);
      await applyMigration(client, file, sql);
      log(`Applied ${file}.`);
    }

    log("All pending migrations applied successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`${LOG_PREFIX} Migration failed:`, error);
  process.exit(1);
});
