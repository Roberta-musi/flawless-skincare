# Flawless Skin Care

Website for Flawless Skin Care, a skincare shop and treatment studio in Limbe, Cameroon.

- **Public site (English and French):** shop with concern and skin-type filters, product pages, a bag that sends the order on WhatsApp, services and bookings, reviews, the founder's story, contact, FAQ and policies.
- **Admin panel** (`/admin`, owner and staff only):
  - products, categories and filters, and services
  - bookings, messages and review moderation
  - brand profile, business settings, FAQ and policies

  Every save updates the public site; no redeploy is needed.
- **Built for search engines:** server-rendered pages, structured data, sitemap with language alternates, and a canonical URL for each language.

Scope and decisions: [docs/scope-and-stack.md](docs/scope-and-stack.md) · Build plan: [docs/implementation-plan.md](docs/implementation-plan.md) · Going live: [docs/deployment.md](docs/deployment.md)

## Stack

- Next.js 16 (App Router, React 19) and TypeScript, styled with Tailwind CSS v4
- A Node.js app on cPanel shared hosting (UniBHost), with a SQLite database file (libSQL, via Drizzle ORM) and photos on disk
- Better Auth for admin sign-in, Resend for notification emails, Cloudflare Turnstile against spam

## Running it locally

```bash
npm ci
cp .env.example .env.local    # then set BETTER_AUTH_SECRET
npm run db:migrate            # create the local database in data/
npm run db:seed               # demo categories, products and services
ADMIN_PASSWORD=<at least 10 characters> npm run admin:create -- --email owner@flawless.test --name "Local Owner"
npm run dev -- --port 3100
```

Open http://localhost:3100 for the site and http://localhost:3100/admin for the admin panel. Without Resend or Turnstile keys, emails are printed to the terminal and the spam check is skipped.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run check` | Lint, typecheck and unit tests. Run before every commit |
| `npm run test:e2e` | Browser tests (Playwright). Starts the dev server on port 3100 if it isn't running |
| `npm run deploy` | Builds `deploy.zip` for the cPanel Node.js app, and uploads it over SSH if set up (see the deployment guide) |
| `npm run db:generate` | Creates a migration after changing `lib/db/schema.ts` |
| `npm run db:migrate` | Applies migrations to the local database. The server applies them itself when it starts |

## Tests

- **Unit tests** (`*.test.ts`, Vitest): helpers and the data layer, against an in-memory SQLite database built from the real migrations.
- **Browser tests** (`e2e/`, Playwright), run on desktop and a mobile viewport:
  - shop filters, the WhatsApp order and bag
  - both languages, 404s, sitemap and robots
  - a booking from request through admin confirmation to deletion
  - admin sign-in, and a product edit reaching the public page
  - axe accessibility checks on every public and admin page

  The browser tests expect the local test admin from `.env.example`; use `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` for another account. To run them against the production build, run `npm run deploy` with `NEXT_PUBLIC_SITE_URL=http://localhost:3200`, copy `node_modules/@libsql/win32-x64-msvc` into `deploy/node_modules/@libsql/`, start `node deploy/app.js` with `PORT=3200` and the local `DATABASE_PATH` and `MEDIA_DIR`, and set `E2E_BASE_URL=http://localhost:3200`.

## Project layout

```
app/[locale]/     public pages (English at /, French at /fr)
app/admin/        admin panel
components/       UI, grouped by area (site, shop, product, booking, admin…)
lib/data/         all database access; admin functions check the session first
lib/actions/      form and admin Server Actions
lib/i18n/         locales and the English and French UI text
drizzle/          database migrations
e2e/              Playwright tests
scripts/          seed, admin account, migration, backup and deploy scripts
```
