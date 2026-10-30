import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function connect() {
  const client = createClient({ url: `file:${process.env.DATABASE_PATH ?? "data/flawless.db"}` });
  // D1 enforced foreign keys (the catalog relies on cascading deletes); plain SQLite needs asking.
  const ready = client.executeMultiple("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  return { db: drizzle(client, { schema }), ready };
}

const globalForDb = globalThis as unknown as { flawlessDb?: ReturnType<typeof connect> };

export async function getDb() {
  globalForDb.flawlessDb ??= connect();
  await globalForDb.flawlessDb.ready;
  return globalForDb.flawlessDb.db;
}

export type Db = Awaited<ReturnType<typeof getDb>>;
