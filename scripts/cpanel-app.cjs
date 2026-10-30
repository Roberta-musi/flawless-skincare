// Startup file for the cPanel Node.js app; `npm run deploy` copies it into the bundle as app.js.
// The database and images live outside the app folder so a new deploy never touches them.
const { homedir } = require("node:os");
const { join, resolve } = require("node:path");
const { migrate } = require("./scripts/migrate.cjs");

// Absolute, because server.js changes into its own folder before the site reads them.
const dataDir = join(homedir(), "flawless-data");
process.env.DATABASE_PATH = resolve(process.env.DATABASE_PATH ?? join(dataDir, "flawless.db"));
process.env.MEDIA_DIR = resolve(process.env.MEDIA_DIR ?? join(dataDir, "media"));
process.env.NODE_ENV = "production";

migrate(process.env.DATABASE_PATH, join(__dirname, "drizzle"))
  .then((applied) => {
    if (applied.length) console.log(`Applied migrations: ${applied.join(", ")}`);
    require("./server.js");
  })
  .catch((error) => {
    console.error("Database migration failed; not starting the site.", error);
    process.exit(1);
  });
