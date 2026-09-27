import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";
import { hashPassword } from "../lib/auth/password.ts";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string", default: "owner" },
    remote: { type: "boolean", default: false },
  },
});

if (!values.email || !values.name || !["owner", "manager"].includes(values.role!)) {
  console.error('Usage: npm run admin:create -- --email you@example.com --name "Full Name" [--role owner|manager] [--remote]');
  process.exit(1);
}

let password = process.env.ADMIN_PASSWORD;
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question("Password (at least 10 characters): ");
  rl.close();
}
if (password.length < 10) {
  console.error("The password must be at least 10 characters.");
  process.exit(1);
}

const sql = (value: string) => `'${value.replaceAll("'", "''")}'`;
const email = values.email.trim().toLowerCase();
const now = Date.now();
const hash = await hashPassword(password);

const statements = `
INSERT INTO user (id, name, email, email_verified, role, created_at, updated_at)
VALUES (${sql(crypto.randomUUID())}, ${sql(values.name)}, ${sql(email)}, 1, ${sql(values.role!)}, ${now}, ${now})
ON CONFLICT(email) DO UPDATE SET name = excluded.name, role = excluded.role, updated_at = excluded.updated_at;
DELETE FROM account WHERE provider_id = 'credential' AND user_id = (SELECT id FROM user WHERE email = ${sql(email)});
INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
SELECT ${sql(crypto.randomUUID())}, id, 'credential', id, ${sql(hash)}, ${now}, ${now} FROM user WHERE email = ${sql(email)};
DELETE FROM session WHERE user_id = (SELECT id FROM user WHERE email = ${sql(email)});
`;

const file = join(tmpdir(), `flawless-admin-${now}.sql`);
writeFileSync(file, statements);
try {
  execFileSync("npx", ["wrangler", "d1", "execute", "DB", values.remote ? "--remote" : "--local", `--file=${file}`], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  console.log(`\n${values.role === "owner" ? "Owner" : "Manager"} account ready for ${email} (${values.remote ? "production" : "local"} database).`);
} finally {
  rmSync(file, { force: true });
}
