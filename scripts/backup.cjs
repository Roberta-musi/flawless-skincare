// Copies the live database to ~/flawless-data/backups and keeps the last 90 days.
// Run weekly from a cPanel cron job (see docs/deployment.md).
const { mkdirSync, readdirSync, rmSync, statSync } = require("node:fs");
const { homedir } = require("node:os");
const { join } = require("node:path");
const { createClient } = require("@libsql/client");

const dataDir = join(homedir(), "flawless-data");
const databasePath = process.env.DATABASE_PATH ?? join(dataDir, "flawless.db");
const backupDir = process.env.BACKUP_DIR ?? join(dataDir, "backups");
const keepDays = 90;

async function main() {
  mkdirSync(backupDir, { recursive: true });
  const target = join(backupDir, `flawless-${new Date().toISOString().slice(0, 10)}.db`);
  rmSync(target, { force: true });
  const client = createClient({ url: `file:${databasePath}` });
  // VACUUM INTO writes a consistent copy even while the site is using the database.
  await client.execute({ sql: "VACUUM INTO ?", args: [target] });
  client.close();

  const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;
  for (const file of readdirSync(backupDir)) {
    const path = join(backupDir, file);
    if (file.startsWith("flawless-") && statSync(path).mtimeMs < cutoff) rmSync(path);
  }
  console.log(`Backed up ${databasePath} to ${target}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
