import { sql } from "drizzle-orm";
import { locale } from "next/root-params";
import { getDb } from "@/lib/db";

async function TableCount() {
  "use cache";
  const db = await getDb();
  const rows = await db.all<{ n: number }>(sql`select count(*) as n from sqlite_master where type = 'table'`);
  return <p>tables: {rows[0].n}</p>;
}

export default async function HomePage() {
  return (
    <main>
      <h1>locale: {await locale()}</h1>
      <TableCount />
    </main>
  );
}
