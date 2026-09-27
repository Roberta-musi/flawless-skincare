# Deploying Flawless Skin Care

The whole site runs as one Cloudflare Worker. It uses these Cloudflare resources:

| Resource | Name | Holds |
|---|---|---|
| D1 database | `flawless` | Products, services, bookings, reviews, messages, settings, admin accounts |
| D1 database | `flawless-tag-cache` | Markers that tell the Worker which cached pages an admin edit made stale |
| R2 bucket | `flawless-media` | Product, service and brand photos |
| R2 bucket | `flawless-next-cache` | Pre-rendered pages |
| R2 bucket | `flawless-backups` | Weekly database exports. Not connected to the Worker, so the site can't read or change them |

Commands below run from the project folder in a terminal (PowerShell is fine). Steps 1–7 are needed once; after that, deploying is step 7 again.

## Before you start

- **A Cloudflare account** (free) and **the domain on Cloudflare DNS**. Cloudflare Registrar can't register `.cm` domains, so buy those from a local registrar and change the domain's nameservers to the two Cloudflare gives you when you add the site.
- **A Resend account** (free tier), with the domain added and its DNS records created. Notification emails are sent from this domain.
- **Node.js 22**, then `npm ci`.

## 1. Sign in to Cloudflare

```bash
npx wrangler login
```

## 2. Create the databases and buckets

Western Europe is the closest Cloudflare storage region to Cameroon.

```bash
npx wrangler d1 create flawless --location weur
npx wrangler d1 create flawless-tag-cache --location weur
npx wrangler r2 bucket create flawless-media --location weur
npx wrangler r2 bucket create flawless-next-cache --location weur
npx wrangler r2 bucket create flawless-backups --location weur
npx wrangler r2 bucket lifecycle add flawless-backups expire-old-backups d1/ --expire-days 90
```

Each `d1 create` prints a `database_id`. Put these IDs into `wrangler.jsonc`, replacing the `00000000-…` placeholders:

- The `flawless` ID goes in **two** places: the `DB` binding at the top, and the `DB` binding under `env.prerender`.
- The `flawless-tag-cache` ID goes in the `NEXT_TAG_CACHE_D1` binding.

Commit that change.

## 3. Create the tables

```bash
npm run db:migrate:remote
```

This also adds the default business settings and the privacy, booking-policy and returns pages. The owner edits all of them from the admin panel.

## 4. Create the owner's admin account

```bash
npm run admin:create -- --email owner@example.com --name "Owner Name" --remote
```

It asks for a password of at least 10 characters. There's no public sign-up page: further admin accounts are created with this same command (`--role manager` for staff).

## 5. Set up the spam check (Turnstile)

In the Cloudflare dashboard, open **Turnstile → Add widget**. Add the domain (with and without `www`) as hostnames and choose the **Managed** mode. Keep the site key for step 7 and the secret key for step 6.

## 6. Set the secrets

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put EMAIL_FROM
npx wrangler secret put NOTIFY_EMAIL
npx wrangler secret put TURNSTILE_SECRET_KEY
```

| Secret | Value |
|---|---|
| `BETTER_AUTH_SECRET` | A new random value, e.g. from `openssl rand -hex 32`. Don't reuse the one in `.env.local` |
| `RESEND_API_KEY` | From Resend → API keys |
| `EMAIL_FROM` | e.g. `Flawless Skin Care <notifications@your-domain>`, on the domain verified in Resend |
| `NOTIFY_EMAIL` | The inbox that receives booking, review and message alerts |
| `TURNSTILE_SECRET_KEY` | From step 5 |

If Wrangler says the Worker doesn't exist yet and offers to create it, answer yes.

The build copies `.env.local` into the Worker as fallback values, and Worker secrets always take priority over them. So set every secret above, and never put production secrets in `.env.local`.

## 7. Deploy

Fill in `.env.deploy`:

```
NEXT_PUBLIC_SITE_URL=https://www.your-domain
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key from step 5>
```

These are public values, so commit the file. Then:

```bash
npm run deploy
```

`npm run deploy` builds the site with pages pre-rendered from the **live** database (the `prerender` environment in `wrangler.jsonc`), then uploads the Worker and the cached pages.

- Wrangler warns that `env.prerender` lacks the other bindings. That is expected: the build only needs the database.
- The first deploy prints a `*.workers.dev` address to check the site on.

After this, the owner's edits in the admin panel update the site by themselves. A new deploy is only needed for code changes.

## 8. Connect the domain

Add this to `wrangler.jsonc`, with the real domain:

```jsonc
"workers_dev": false,
"preview_urls": false,
"routes": [
  { "pattern": "www.your-domain", "custom_domain": true },
  { "pattern": "your-domain", "custom_domain": true }
]
```

Run `npm run deploy` again. Then, in the dashboard under **Rules → Redirect Rules**, create a rule from the template **Redirect from root to WWW**.

- `workers_dev: false` removes the `workers.dev` copy of the site, so Google only ever sees one address.
- Photos keep loading through the site's own `/media/…` path. A separate public R2 domain (`NEXT_PUBLIC_MEDIA_URL`) is optional.

## 9. Turn on the weekly backup

In the GitHub repository, open **Settings → Secrets and variables → Actions** and add two secrets:

- `CLOUDFLARE_ACCOUNT_ID` — shown on the right of the Cloudflare dashboard's home page.
- `CLOUDFLARE_API_TOKEN` — a token from **My Profile → API Tokens → Create token → Custom token** with these account permissions:
  - D1: Edit
  - Workers R2 Storage: Edit

Then run **Actions → Back up database → Run workflow** once to check it. It then runs every Monday at 02:00 UTC, and stores `d1/flawless-YYYY-MM-DD.sql.gz` in `flawless-backups`. The lifecycle rule from step 2 deletes backups after 90 days.

**Restoring.**

- **A mistake in the last few days:** use D1 Time Travel. It keeps 7 days on the free plan and 30 days on Workers Paid.
  ```bash
  npx wrangler d1 time-travel restore flawless --timestamp 2026-10-01T09:00:00Z
  ```
- **Anything older:** download the backup from R2, unzip it, create a new database, and load it with `npx wrangler d1 execute <new-database> --remote --file flawless-….sql`. Then point `wrangler.jsonc` at the new database and deploy.

## 10. Get found on Google

- **Google Search Console.** Add a *Domain* property and verify it with the TXT record Search Console gives you (add it in Cloudflare DNS). Then submit `https://www.your-domain/sitemap.xml`.
- **Bing Webmaster Tools.** Import the site from Search Console.
- **Google Business Profile.** This is what shows the business on Maps and in "skincare Limbe" searches.
  - Use exactly the same name, address and phone as in the admin panel's business settings.
  - Add the website address, the opening hours and photos.
  - Ask happy customers for Google reviews.
- **Cloudflare Web Analytics** (optional, cookieless): **Analytics & Logs → Web Analytics → Add a site**.

## Plan limits and costs

| Service | Free plan | Enough? |
|---|---|---|
| Workers | 100,000 requests/day, **10 ms CPU per request**, 3 MB compressed Worker (this one is about 2.3 MB) | Requests yes; CPU is tight |
| D1 | 5 GB, 5 million rows read and 100,000 written per day | Yes, many times over |
| R2 | 10 GB stored, 1 million writes and 10 million reads per month | Yes |

Cached pages are served cheaply. Rendering a page after an edit, and every admin page, can take more than 10 ms of CPU, which on the free plan fails with error 1102. **Switch to Workers Paid ($5/month) before launch.** It raises the CPU limit to 30 seconds and the Worker size limit to 10 MB. It also extends D1 Time Travel to 30 days. Development and testing fit on the free plan.
