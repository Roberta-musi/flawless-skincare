import { execSync } from "node:child_process";

process.loadEnvFile(".env.deploy");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
if (!/^https:\/\/[^/]+$/.test(siteUrl)) {
  console.error("Set NEXT_PUBLIC_SITE_URL in .env.deploy to the live address, e.g. https://www.example.com (see docs/deployment.md).");
  process.exit(1);
}
if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
  console.warn("NEXT_PUBLIC_TURNSTILE_SITE_KEY is empty: public forms will have no spam check.");
}

execSync("npx opennextjs-cloudflare build", {
  stdio: "inherit",
  env: { ...process.env, NEXT_DEV_WRANGLER_ENV: "prerender" },
});
execSync("npx opennextjs-cloudflare deploy", { stdio: "inherit" });
