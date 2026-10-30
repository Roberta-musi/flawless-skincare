# Deploying Flawless Skin Care

The site runs as a Node.js app on the UniBHost **StartUp** plan (cPanel, server `s10701.lon1.stableserver.net`, user `musirobe`), at `flawless-skincare.com`. Everything lives in the hosting account's home folder:

| Folder | Holds | Replaced on deploy? |
|---|---|---|
| `~/flawlessskincarewebsite` | The built site (`app.js`, `server.js`, `node_modules`, …) | Yes, every time |
| `~/flawless-data/flawless.db` | The database: products, services, bookings, reviews, messages, settings, admin accounts | Never |
| `~/flawless-data/media` | Product, service and brand photos uploaded from the admin panel | Never |
| `~/flawless-data/backups` | Weekly copies of the database (step 7) | Never |

`app.js` brings the database up to date (it applies any new files in `drizzle/`) and then starts the site. Pages are rendered on each visit straight from the database, so the owner's edits show immediately and the build never needs the live data.

Commands below run from the project folder on your computer, in PowerShell. Steps 1–6 are needed once. After that, deploying is step 5 again.

## Before you start

- **Node.js 22** on your computer, then `npm ci`.
- **A Resend account** (free tier), with `flawless-skincare.com` added and its DNS records created in cPanel → **Zone Editor**. Notification and password-reset emails are sent from this domain.
- **A Cloudflare account** (free) for the Turnstile spam check only. The site itself does not run on Cloudflare.

## 1. Set up the spam check (Turnstile)

In the Cloudflare dashboard, open **Turnstile → Add widget**. Add `flawless-skincare.com` and `www.flawless-skincare.com` as hostnames and choose the **Managed** mode. Put the site key in `.env.deploy` (step 5). Keep the secret key for step 2.

## 2. Configure the Node.js app

In cPanel, open **Setup Node.js App** and edit the `flawless-skincare.com` app (create it if it's missing):

| Setting | Value |
|---|---|
| Node.js version | 20 or newer (the highest offered) |
| Application mode | Production |
| Application root | `flawlessskincarewebsite` |
| Application URL | `flawless-skincare.com` |
| Application startup file | `app.js` |

Under **Environment variables**, add:

| Name | Value |
|---|---|
| `BETTER_AUTH_SECRET` | A new random value of 64 characters, e.g. from `openssl rand -hex 32`. Don't reuse the one in `.env.local` |
| `RESEND_API_KEY` | From Resend → API keys |
| `EMAIL_FROM` | e.g. `Flawless Skin Care <notifications@flawless-skincare.com>` |
| `NOTIFY_EMAIL` | The inbox that receives booking, review and message alerts |
| `TURNSTILE_SECRET_KEY` | From step 1 |

Save. Don't press **Run NPM Install**: the uploaded bundle already contains everything it needs.

`DATABASE_PATH` and `MEDIA_DIR` are optional; they default to the `~/flawless-data` paths above.

## 3. Prepare the starting data

`initial-data/flawless-data` (not in git) holds the shop as it is today: the 14 products, 5 categories, 3 services, FAQs, policies, business settings, brand profile and all their photos. The test admin, test booking and test review from local development are not in it.

Create the owner's admin account in it. You'll be asked for a password of at least 10 characters:

```powershell
$env:DATABASE_PATH = "initial-data/flawless-data/flawless.db"; npm run admin:create -- --email owner@example.com --name "Owner Name"; Remove-Item Env:DATABASE_PATH
```

Then zip it:

```powershell
Compress-Archive -Path initial-data/flawless-data -DestinationPath initial-data.zip -Force
```

There's no public sign-up page. After this first account, the owner adds staff, changes roles, sets new passwords and removes people from **Team** in the admin panel, and everyone changes their own password under **My account**.

## 4. Upload the starting data (once only)

In cPanel → **File Manager**, open your home folder (`/home/musirobe`), **Upload** `initial-data.zip`, then right-click it → **Extract** into `/home/musirobe`. You should now have `/home/musirobe/flawless-data/flawless.db` and `/home/musirobe/flawless-data/media`. Delete `initial-data.zip`.

Never do this again once the site is live: it would overwrite the live database with the starting copy.

## 5. Deploy

`.env.deploy` holds the public values baked into the build (commit it):

```
NEXT_PUBLIC_SITE_URL=https://flawless-skincare.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key from step 1>
```

Then:

```bash
npm run deploy
```

This builds the site and writes `deploy.zip` (about 15 MB). It already contains the Linux build of the database engine the server needs.

**Uploading with File Manager:**

1. Open `/home/musirobe/flawlessskincarewebsite` and delete everything in it, including the hidden `.next` folder (turn on **Settings → Show Hidden Files**).
2. **Upload** `deploy.zip`, right-click it → **Extract** into that folder, then delete `deploy.zip`.
3. In **Setup Node.js App**, press **Restart** on the app.

**Or over SSH**, which does all of that for you: in cPanel → **SSH Access → Manage SSH Keys**, import your computer's public key (`~/.ssh/id_ed25519.pub`) and authorise it. Then uncomment the `DEPLOY_SSH…` lines in `.env.deploy`. From then on `npm run deploy` uploads, unpacks and restarts the app itself.

Open https://flawless-skincare.com and sign in at `/admin`. If the site shows an error page, open **Setup Node.js App**: the app's log file (`stderr.log` in the app folder) says why.

After this, the owner's edits in the admin panel update the site immediately. A new deploy is only needed for code changes.

## 6. Use one address

In cPanel → **Domains**, turn on **Force HTTPS Redirect** for `flawless-skincare.com`. Search engines should only see `https://flawless-skincare.com`; if `www.` also loads the site, add a redirect from `www.flawless-skincare.com` to it under **Redirects**.

## 7. Turn on the weekly backup

In cPanel → **Cron Jobs**, add a job that runs once a week (e.g. **Once Per Week**) with this command. The path to `node` is the one shown at the top of the Node.js app page, in the "Enter to the virtual environment" line; `20` is the Node.js version.

```bash
/home/musirobe/nodevenv/flawlessskincarewebsite/20/bin/node /home/musirobe/flawlessskincarewebsite/scripts/backup.cjs
```

It saves `~/flawless-data/backups/flawless-YYYY-MM-DD.db` and deletes copies older than 90 days. Photos are covered by the hosting plan's own backups (cPanel → **Backup**); download a full backup every few months as well.

**Restoring:** in **Setup Node.js App**, stop the app. In File Manager, copy the backup over `~/flawless-data/flawless.db` and delete `flawless.db-wal` and `flawless.db-shm` next to it if they exist. Start the app again.

**Locked-out owner:** use **Forgot password** on the sign-in page (needs Resend set up). Otherwise stop the app, download `flawless.db`, run step 3's `admin:create` command against the downloaded file, upload it back and start the app.

## 8. Get found on Google

- **Google Search Console.** Add a *Domain* property and verify it with the TXT record Search Console gives you (add it in cPanel → **Zone Editor**). Then submit `https://flawless-skincare.com/sitemap.xml`.
- **Bing Webmaster Tools.** Import the site from Search Console.
- **Google Business Profile.** This is what shows the business on Maps and in "skincare Limbe" searches.
  - Use exactly the same name, address and phone as in the admin panel's business settings.
  - Add the website address, the opening hours and photos.
  - Ask happy customers for Google reviews.

## Plan limits

The StartUp plan is shared hosting: one website, 15 GB of disk, and CPU and memory limits shared with other customers on the server. The site needs roughly 150–250 MB of memory while running. cPanel → **Resource Usage** shows whether the account hits its limits; if pages get slow or the app is stopped for using too much memory, move to the **Grow** plan or a VPS. The deploy works the same way on either.
