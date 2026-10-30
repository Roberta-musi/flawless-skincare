// Applies the SQL files in drizzle/ that the database hasn't seen yet. Plain CommonJS so the
// server's startup file can run it without a build step. Tracks applied files in the same
// d1_migrations table Wrangler used, so databases exported from D1 carry on where they left off.
const { readdirSync, readFileSync, mkdirSync } = require("node:fs");
const { dirname, join, resolve } = require("node:path");
const { createClient } = require("@libsql/client");

async function migrate(databasePath, migrationsDir) {
  mkdirSync(dirname(resolve(databasePath)), { recursive: true });
  const client = createClient({ url: `file:${databasePath}` });
  try {
    await client.execute("PRAGMA journal_mode = WAL");
    await client.execute("PRAGMA busy_timeout = 5000");
    await client.execute(
      "CREATE TABLE IF NOT EXISTS d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)",
    );
    const tx = await client.transaction("write");
    try {
      const applied = new Set((await tx.execute("SELECT name FROM d1_migrations")).rows.map((row) => row.name));
      const pending = readdirSync(migrationsDir)
        .filter((file) => file.endsWith(".sql") && !applied.has(file))
        .sort();
      for (const file of pending) {
        await tx.executeMultiple(readFileSync(join(migrationsDir, file), "utf8"));
        await tx.execute({ sql: "INSERT INTO d1_migrations (name) VALUES (?)", args: [file] });
      }
      await tx.commit();
      return pending;
    } finally {
      tx.close();
    }
  } finally {
    client.close();
  }
}

module.exports = { migrate };

if (require.main === module) {
  const databasePath = process.env.DATABASE_PATH ?? "data/flawless.db";
  migrate(databasePath, join(__dirname, "..", "drizzle")).then((applied) => {
    console.log(applied.length ? `Applied ${applied.join(", ")} to ${databasePath}` : `${databasePath} is up to date`);
  });
}
