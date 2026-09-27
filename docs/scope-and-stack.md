# Flawless Skin Care: Scope & Tech Stack

**Status:** Scope agreed with the developer on 2026-09-26 (decisions in section 10). The client questions in section 10 are still open.

This builds on the client proposal in [links.md](links.md). It doesn't replace it. It turns that proposal into a buildable scope, adds features based on research into leading skincare sites, and fixes the tech stack.

---

## 1. What the existing material tells us

**Product photos (`docs/assets-to-upload/`)**: Metis Body Cream, Brightening Face Cream, Dark Spots Corrector Cream, Flawless Multi Face Vitamin (serum), Brightening Body Butter, Brightening Black Soap, 5D Molato Soap, Super Whitening Soap, Turmeric Scrub, an unlabelled orange body butter, and the logo (fuchsia script with a butterfly).

**Old Wix site**: almost all template filler. The testimonials, videos and "$19.99" services are placeholders, so there is nothing to migrate apart from a few real products and prices:

| Product | Price (FCFA) | Note |
|---|---|---|
| Dark knuckle cleanser | 7,000 | |
| Metis Body Lotion | 15,000 | |
| Exfoliating coffee scrub | 5,000 | marked "Best seller" |
| Hot chocolate body set | 30,000 | a **set** |
| Metis Body set | ~~40,000~~ 38,000 | a **set** with a **sale price** |
| Molato Soap Big size | 10,000 | a **size variant** |

Contact details found online, all **unconfirmed**:
- The Wix site lists phone `+237 673 222 029` and email `musingefor25@gmail.com`.
- A search snippet of the Facebook page (facebook.com/Flawlessskin25) mentions **Sokolo, Limbe**, a WhatsApp number and stretch-mark treatments. The page itself couldn't be fetched.

**What this means for the build:**
- The catalogue needs **sizes with their own prices**, **sale prices**, and **sets/bundles**. It isn't just "name + price".
- The shelf labels list concerns: dark spots, hyperpigmentation, stretch marks, rough skin, dark knuckles, glow. **"Shop by concern"** is a natural way to browse.
- The photos vary a lot in background, lighting and angle. The design has to make mixed photos look consistent: fixed-ratio frames and soft tinted backgrounds. The CEO also needs a one-page photo guide for future uploads.
- The shop sign reads **"Flawless Skincare and Spa"** with the slogan **"The secret for a heal…y skin"** (partly hidden), but the proposal says **"Flawless Skin Care"** and **"The secret for a glowing skin"**. The exact name has to match everywhere (site, Google Business Profile, socials) for local SEO, so this needs confirming.

---

## 2. System overview: the three parts in one codebase

```
                ┌──────────────────────── Next.js app (one deploy) ────────────────────────┐
 Customers ───► │  PUBLIC SITE  (/, /shop, /products/…, /services/…, /book, /about, …)     │
                │    static/cached pages → fast + crawlable                                │
                │                                                                          │
 CEO ─────────► │  ADMIN PANEL  (/admin/…)  login required, noindex, mobile-friendly      │
                │                                                                          │
                │  BACKEND  Server Actions + Route Handlers                                │
                │    data layer (Drizzle, server-only) · admin auth (Better Auth)          │
                │    validation (Zod) · cache refresh · email (Resend)                    │
                └───────────────┬──────────────────────────────────┬───────────────────────┘
                                │ Worker binding                   │ Worker binding
                     ┌──────────▼───────────┐          ┌───────────▼────────────┐
                     │  CLOUDFLARE D1       │          │  CLOUDFLARE R2         │
                     │  SQLite database     │          │  product/service/CEO   │
                     │  (no public endpoint)│          │  images, backups       │
                     └──────────────────────┘          └────────────────────────┘
 All hosted on Cloudflare Workers (OpenNext adapter). See section 8 for why.
 Customer ⇄ CEO conversations happen on WhatsApp (wa.me deep links with prefilled messages).
```

**The backend is our own code inside the Next.js app.** It covers:
- Server Actions and Route Handlers
- a server-only data layer using Drizzle ORM on Cloudflare D1
- admin login with Better Auth
- image storage in Cloudflare R2
- notification emails through Resend

The database and the image bucket have no public address; only the app can reach them. A separate API server (Express/Nest/Laravel) would mean a second always-on deployment to pay for and maintain, plus cross-site request (CORS) setup and duplicated validation. That's only worth it if a mobile app ever needs the same API, and Route Handlers can provide one then.

**How admin edits reach the public site:** public pages are pre-rendered and cached, which makes them fast and easy for Google to crawl. Every admin save calls `revalidatePath()` on the public site, so the next visitor gets a freshly rendered page and no redeploy is needed. The cached pages live in R2 and the revalidation markers in a second D1 database (the OpenNext incremental and tag caches).

---

## 3. Scope: Public site (MVP)

| Route | Contents | SEO role |
|---|---|---|
| `/` | Hero + slogan, shop-by-concern tiles, bestsellers, services preview, CEO section, brand story teaser, approved reviews, location + hours, socials, WhatsApp CTA | Brand + "skincare Limbe" |
| `/shop` | All products: search, filters for **category, concern, skin type**, sort (bestsellers, newest, price) | Catalogue hub |
| `/shop/[category]` | Category landing page with original intro copy + products (e.g. `/shop/body-butters`) | "body butter Cameroon" etc. |
| `/products/[slug]` | Gallery, FCFA price per size, sale price, stock status, key benefits, how to use (AM/PM), suitable skin types, key ingredients + full ingredient list (INCI), set contents, **pairs well with**, product reviews, **Order on WhatsApp**, **Add to bag** | Product snippet JSON-LD |
| `/services` | Service menu: image, duration, price / "from" price, grouped by type. Includes a **skin consultation** (in the shop or by WhatsApp video, for the diaspora) | "facial Limbe", "spa Limbe" |
| `/services/[slug]` | What it is, duration, price, what to expect, preparation, aftercare, **Book this** | Service semantics |
| `/book` | Booking request (details below). Saved to the DB, then a thank-you screen with **"Confirm on WhatsApp"** | Thank-you page is noindex |
| `/about` | Brand story, 6-year journey, values, CEO portrait + bio + quote | Organization + ProfilePage/Person |
| `/reviews` | Approved reviews (optional rating, city/country), a short note on **how reviews are checked**, submit form | Trust |
| `/contact` | Address + landmark, map embed + "Get directions", shop photo, hours, WhatsApp/phone/email, socials, contact form | LocalBusiness JSON-LD, NAP |
| `/faq` | How to order, delivery & payment (MoMo, Orange Money, cash; "prices are indicative, in FCFA"), booking/cancellation policy, returns. All admin-editable | User value only (FAQ rich results are gone) |
| `/privacy` | What the forms collect and why; how to ask for deletion | Required under Cameroon's data-protection law |
| `/sitemap.xml`, `/robots.txt` | Generated from the database | Indexing |

**Languages:** every route above exists in English and French: English at `/shop`, French at `/fr/shop` (see section 5, Languages).

**Site-wide:** EN/FR language switcher, sticky header with the bag icon, floating WhatsApp button, footer with NAP (name, address, phone), hours and socials, branded 404, and a generated Open Graph image for every product so shared links show a proper preview on WhatsApp and Facebook.

**WhatsApp ordering (no checkout):**
1. Product page → **Order on WhatsApp** opens `wa.me/<number>?text=…` with the product, size, price and page link filled in.
2. Or use the **bag**, which is stored in the browser and needs no account. **Send order on WhatsApp** builds one message with the items, sizes, quantities, total, and optionally the customer's name and delivery town. Diaspora customers typically order several items at once, so this matters.
3. The CEO confirms, collects payment (e.g. Mobile Money) and arranges delivery in the chat, as she does today.

**WhatsApp implementation: the same pattern as the Telnet Cameroon site** (`D:\PROJECTS\web\Telnet`, see `src/utils/whatsapp.js`)
- **One business number.** It's edited in Admin → Business settings and saved as digits only. The form rejects input with no digits and shows the resulting `wa.me/…` link as a hint. A fallback number in code covers the case where settings can't be loaded.
- **One helper builds every link:** `https://wa.me/<digits>?text=<encoded message>`.
- **A catalogue of prefilled messages, one per context:**
  - general enquiry
  - service
  - category ("what's available in body butters?")
  - product ("I'm interested in *X* (*size*) priced at *Y*. Is it still available?")
  - booking
  - a personalised follow-up after a form is submitted ("I've just requested a booking for *service*…")
- **Every call-to-action is a plain link that opens in a new tab**, so it works without JavaScript. Placements:
  - header, hero and footer
  - floating "Chat with us" bubble
  - service cards and pages
  - shop pages, including empty categories ("Ask on WhatsApp")
  - product pages
  - 404 page
  - form success screens
- **Admin to customer:** the booking detail page has a WhatsApp button that opens a chat with the customer, prefilled with "Hello *name*, this is Flawless Skin Care about your booking for *service*…".

Changes from Telnet for this site:
- Prefilled messages follow the page language (EN/FR).
- The bag reuses the same helper to send a multi-item order.
- **Customer phone numbers:**
  - The form captures them with a country picker (default +237) and stores them in international format.
  - Telnet's admin helper adds `237` to every number, which would break diaspora numbers (+1, +49).
- **The number is rendered on the server.** Telnet needed a prerender seed to avoid showing the fallback number before the real one loaded; that isn't needed here.
- **No "Publish changes" rebuild step.** Admin edits go live through cache revalidation.

**Booking request form:**
- Service, and 2–3 preferred date + time-window choices
- Name and WhatsApp number (email optional)
- First visit (yes/no) and optional skin notes
- Tick boxes: accept the booking/cancellation policy, and consent to data use

Requests land in the admin as **Pending** and are never auto-confirmed.

---

## 4. Scope: Admin panel (MVP)

The admin panel is designed **for a phone first**, because the CEO will most likely manage the shop from her phone and upload photos straight from the camera.

| Area | Capabilities |
|---|---|
| **Login** | Email + password; public sign-ups disabled; password reset by email. Roles: `owner` (CEO) and optional `manager` |
| **Dashboard** | Counts of pending bookings, pending reviews and unread messages; shortcuts; recent activity |
| **Products** | Create/edit/delete, publish/unpublish; photos (upload from phone, auto-compressed, choose the main photo, reorder, alt text); category; concerns; skin types; sizes with price + sale price; stock status; badges (bestseller, new, featured); benefits; how to use; ingredients; set contents; pairs-well-with; SEO title/description/slug with sensible defaults |
| **Categories, concerns, skin types** | Create/rename/reorder; category intro text + image |
| **Services** | Create/edit/delete, publish; image; duration; price, "from" price, or "on consultation"; in-shop or online; what to expect; preparation; aftercare; SEO fields |
| **Bookings** | List by status/date; detail; status **Pending → Confirmed / Rejected → Completed / Cancelled**; private note; **"Reply on WhatsApp"** button with a prefilled confirmation or decline message |
| **Reviews** | Approve/reject/delete; feature on the homepage; link to a product/service; add genuine reviews received on WhatsApp or in the shop (source recorded, customer consent required) |
| **Messages** | Contact form inbox, read/unread |
| **Brand profile** | CEO name, title, portrait, short bio, full story, quote, socials; brand story |
| **Business settings** | Business name, slogan, WhatsApp, phone, email, address, landmark, map link, hours per day, socials. These feed the whole site and the structured data |
| **FAQ & policies** | Edit FAQ entries, booking/cancellation policy, returns, privacy text |

**Notifications:** new bookings, reviews and messages trigger an email to the CEO and a badge on the dashboard. Automatic WhatsApp alerts need the WhatsApp Business Platform (Meta business verification + approved message templates), so they're planned for Phase 2.

---

## 5. Scope: Backend

### Data model (first draft)

| Table | Key fields |
|---|---|
| `settings` (single row) | name, slogan, whatsapp, phone, email, address, landmark, city, geo, map url, opening_hours (json), socials (json), policies, default SEO |
| `brand_profile` (single row) | ceo_name, ceo_title, portrait, short_bio, story, quote, socials, brand_story |
| `categories` | name, slug, intro, image, sort_order, seo fields, is_published |
| `concerns`, `skin_types` + join tables | name, slug, sort_order |
| `products` | name, slug, category_id, short_description, benefits[], how_to_use, key_ingredients, inci, status, is_published, flags (bestseller/new/featured), sort_order, seo fields, timestamps |
| `product_variants` | product_id, label ("250 ml", "Big size"), price_xaf, compare_at_price_xaf, status, sort_order |
| `product_images` | product_id, path, alt, sort_order, is_primary |
| `product_set_items`, `product_pairings` | set contents; "pairs well with" links |
| `services` | name, slug, type, descriptions, duration_min, price_xaf, price_type (fixed/from/consultation), mode (in-shop/online), what_to_expect, preparation, aftercare, image, is_published, sort_order, seo fields |
| `bookings` | service_id, name, phone, email, preferred_slots (json), first_visit, skin_notes, policy_accepted_at, consent_at, status, admin_note, timestamps |
| `reviews` | name, location, rating, body, product_id?, service_id?, source (website/whatsapp/in-store), status, is_featured, timestamps |
| `messages` | name, contact, subject, body, consent_at, is_read, created_at |
| `faqs` | question, answer, sort_order, is_published |
| `user`, `session`, `account`, `verification` | Better Auth's own tables. `user.role` is `owner` or `manager` |

**How the data is stored:**
- The schema lives in Drizzle (`db/schema.ts`). Migrations are generated with `drizzle-kit` and applied with `wrangler d1 migrations apply`.
- Local development uses a local D1 through wrangler.
- SQLite storage conventions:
  - prices are whole FCFA integers
  - booleans are integers
  - lists and JSON fields (benefits, opening hours, preferred slots) are JSON text, checked with Zod
  - enums are text columns with `CHECK` constraints

### Languages (English + French at launch)
- **URLs:**
  - English is the default, at unprefixed paths (`/shop/body-butters`). French lives under `/fr` (`/fr/shop/body-butters`).
  - The route names and slugs are shared across both languages. This is a deliberate simplification; titles, headings, body text and metadata are fully translated.
  - Every page links to its other-language version with `hreflang` and a visible switcher.
  - Visitors are **never redirected automatically** by IP address or browser language.
- **Content in the database:** every customer-facing text field has an English and a French column (e.g. `name_en`, `name_fr`). In the admin panel, each form has EN/FR tabs, and a "French missing" badge flags anything untranslated.
- **Missing French text:** the page falls back to English. That page is left out of the French sitemap and `hreflang` until it's translated, so Google never sees duplicate "French" pages that are really in English.
- **Interface text** (buttons, navigation, form labels, the prefilled WhatsApp message) lives in `en`/`fr` dictionary files. The developer drafts the French and a native speaker reviews it before launch.
- **French content is on the launch checklist.** Launch depends on the client supplying or approving French copy for the key pages: home, about, services, categories, and the products she wants featured.

### Security & privacy
- **The database can't be reached from the internet.** D1 has no public endpoint or API key; only the app's Worker can reach it through its binding.
- **One server-only data layer** (`import 'server-only'`) is the only code that touches the database:
  - **Public functions** return published rows only. On the visitor side they can only *create* bookings, reviews and messages, never read them back.
  - **Admin functions** start with `requireAdmin()`, which checks the Better Auth session and role.
  - Tests check that every admin function rejects visitors who aren't logged in and users who aren't admins.
- **Every Server Action re-checks the session and role**, and the admin layout redirects logged-out visitors.
- **Admin login (Better Auth):**
  - email + password
  - public sign-up disabled; the owner account is created by a one-off seed command
  - sessions in httpOnly cookies
  - login attempts rate-limited
  - password reset by email through Resend
- **There is deliberately no `proxy.ts`.** The Cloudflare adapter doesn't support Next 16's Node-runtime proxy yet, and the Next.js docs say proxy isn't an authorisation layer anyway. Language routing uses `next.config` rewrites instead.
- Public forms get Zod validation, a honeypot field, and **Cloudflare Turnstile** (a free, privacy-friendly CAPTCHA alternative) against spam bots.
- Secrets (the Better Auth secret, the Resend key and the Turnstile secret) are Worker secrets and never reach the browser. D1 and R2 need no keys because the app reaches them through bindings.
- Storage: the browser sends the already-compressed image sizes to an admin-only Route Handler, which writes them to R2 through its binding. Visitors can't upload files in the MVP.
- **Personal data:**
  - Cameroon's Law No. 2024/017 on personal data protection requires explicit consent and treats health data carefully. GDPR applies to customers in Germany.
  - So: consent tick boxes on forms, skin notes optional, admin-only access, and the ability to delete a person's records on request.

### Images
- **On upload:** the admin's browser generates three WebP sizes of each photo (about 400, 800 and 1600 px). A 5 MB phone photo becomes roughly 40–250 KB per size.
- **Storage and delivery:** the sizes are stored in Cloudflare R2 and served from Cloudflare's CDN, which charges nothing for downloads.
- **On the page:** a custom `next/image` loader picks the right size, so no paid image-optimisation service is needed.
- **Why it matters:** mobile data in Cameroon is slow and expensive.

---

## 6. Research: what leading skincare sites do, and what fits here

**Sites reviewed:**
- **International brands:** Glow Recipe, Summer Fridays, Typology, The Ordinary, Tatcha, Rhode, Topicals, Aesop, Paula's Choice. Aesop and Paula's Choice pages could not be fetched, so what's noted for them comes from search results.
- **African shops and spas:**
  - The Skincare Eshop, justask237 and BSho Skin Clinic (Cameroon)
  - Kia Beauty Spa and Aura Spa Center
  - BuyBetter (Nigeria) and Skin Gourmet (Ghana)

**Patterns taken into the MVP**

| Feature | Seen at | Why it fits |
|---|---|---|
| Order on WhatsApp per product, prefilled message | The Skincare Eshop, Kia Beauty Spa | Core conversion path |
| **WhatsApp bag** (multi-item enquiry → one message) | Catlog-style social commerce, WhatsApp Business carts | Diaspora customers order several items at once |
| Filters by **concern + skin type + category** | Glow Recipe, The Ordinary, Tatcha, Summer Fridays, The Skincare Eshop, justask237 | Three facets are enough for a small catalogue |
| Product page blocks: benefits, AM/PM use, skin types, key ingredients + full INCI list | Glow Recipe, Summer Fridays, Typology | Answers the questions customers otherwise ask in chat; the main SEO text on each product |
| "Pairs well with" (manual links) | Summer Fridays, Glow Recipe, Typology | Raises order value; cheap to build |
| Founder / practitioner story | Tatcha, Rhode, Skin Gourmet | The CEO is the brand |
| **Skin consultation as a bookable service**, including by WhatsApp video | Aesop (video consults), BuyBetter (paid consult with a skin advisor on WhatsApp) | Uses her expertise; serves the diaspora |
| Service menu with duration, FCFA price, steps, prep/aftercare | Aura Spa (e.g. a 60-min treatment pack at 30,000 FCFA with its steps listed), Aesop | Sets expectations and reduces back-and-forth |
| Booking request with preferred slots + WhatsApp follow-up | Kia Beauty Spa, Aura Spa, BSho | Matches how she already works |
| Cancellation / deposit **policy text** | Fresha norms (24–48h notice) | Cuts no-shows. Deposits are taken by MoMo manually |
| "Prices are indicative, in FCFA" | justask237, BSho | Honest without a checkout |
| **English + French** | The Skincare Eshop (EN/FR) | Cameroon is roughly 80% francophone. Both languages at launch |

**Phase 2**
- Dedicated delivery & payment page with admin-editable zones, fees and payment numbers, as seen at The Skincare Eshop, justask237, BuyBetter and Skin Gourmet. Until then, the FAQ answers these questions.
- "Find Your Flawless" skin quiz, as seen at Glow Recipe, Typology and Summer Fridays. The quiz result becomes a prefilled WhatsApp message.
- Skin Journal + ingredient glossary (as at Typology and The Ordinary), written by the CEO under her name.
- Customer photo reviews and a TikTok/Instagram strip.
- Results/before-after photos, only with written consent and a "results vary" note.
- Approximate EUR/USD/CAD prices.
- Enquiry log in the admin.
- WhatsApp Business Platform alerts.

**Skipped, or only if the business asks later**
- The Ordinary-style regimen builder: too heavy for a small catalogue.
- Loyalty points, subscribe-and-save and gift cards: none of them work without a checkout.
- Press badges, until some are earned.
- Online payments and customer accounts.

---

## 7. Phasing

**Phase 0: Foundations**
Design tokens (fuchsia, lilac, white, gold), typography, base components · D1 database + Drizzle schema (EN/FR columns) + seed data · Better Auth + owner-account seed · server-only data layer with `requireAdmin()` · EN/FR routing + dictionaries · layouts · SEO plumbing (metadata, JSON-LD helpers, sitemap, robots) · Cloudflare Workers deploy pipeline + R2 bucket · weekly backup export · CI lint/typecheck.

**Phase 1: MVP launch** (everything in sections 3–5)
Public site + WhatsApp ordering + bag + booking requests + reviews + admin panel + email notifications + deploy to domain + Search Console + Google Business Profile link-up.

**Phase 2: Growth**
Items listed in section 6.

**Later (only if the business asks)**
Online payment via a local aggregator (MTN MoMo / Orange Money / card) · customer accounts · order management + stock counts · newsletter.

---

## 8. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16.3** (App Router, React 19.2, TypeScript), already scaffolded | Server rendering + static caching for SEO; site, admin and server logic in one codebase |
| Caching | **Pre-rendered pages + `revalidatePath`**, stored in R2 with a D1 tag cache (OpenNext) | Pages stay static-fast, and admin edits refresh them on the next visit. Cache Components (`'use cache'`) was tried and dropped: it hangs on the Workers runtime in Next 16.3 |
| Styling | **Tailwind CSS v4**, **shadcn/ui** for admin and form primitives | Already set up; accessible components without a heavy UI kit |
| Database | **Cloudflare D1** (SQLite) | Free, never pauses, built-in point-in-time restore (Time Travel), no public endpoint |
| ORM + migrations | **Drizzle ORM** + `drizzle-kit`, applied with `wrangler d1 migrations` | Type-safe queries from one schema file; portable to Postgres later if ever needed |
| Auth | **Better Auth** (Drizzle adapter) | Mature email/password auth with sessions, rate limiting and password reset; documented setup for Next.js on Cloudflare with D1 |
| File storage | **Cloudflare R2** | 10 GB free, no charge for downloads |
| Validation | **Zod** | One schema shared by forms and Server Actions |
| Email | **Resend** (free tier) | Booking/review/message notifications |
| Anti-spam | **Cloudflare Turnstile** | Free, no puzzle for real users |
| Maps | Google Maps **embed** + "Get directions" link | No API key or billing needed |
| Analytics | **Cloudflare Web Analytics** (free, cookieless) + **Google Search Console** | Traffic stats + search performance. WhatsApp-button clicks are counted with a tiny first-party beacon |
| Testing | **Playwright** smoke tests on critical flows (booking, WhatsApp link, bag, admin login, product edit) | Catches regressions on what earns money |
| Hosting | **Cloudflare Workers** via the OpenNext adapter (`@opennextjs/cloudflare`) + custom domain on Cloudflare DNS | Free plan allows commercial use; supports Next.js 16 and on-demand revalidation |
| Scheduled jobs | **GitHub Actions** (free) | Weekly `wrangler d1 export` of the database to R2 |
| Source control | GitHub | |

### Running costs: low-cost setup

| Item | Plan | Cost | Limits that matter |
|---|---|---|---|
| Cloudflare Workers | Free | $0 | 100,000 requests/day and 10 ms CPU per request. Static files don't count. Commercial use allowed |
| Cloudflare D1 | Free | $0 | 500 MB per database, 10 databases, 5 GB total; 5M rows read and 100k rows written per day; 50 queries per request; Time Travel restore for the last 7 days; never pauses |
| Cloudflare R2 | Free | $0 | 10 GB storage, no download fees |
| Resend, Turnstile, Web Analytics, Search Console | Free | $0 | Resend: 3,000 emails/month |
| Domain (`.com` via Cloudflare Registrar, sold at cost) | | about **$10–15/year** | |
| **Total** | | **about $1/month** | |

**Backups:**
- D1 Time Travel can restore the database to any minute in the last 7 days.
- A weekly GitHub Actions job exports a full SQL dump to R2 and keeps it for 90 days.
- Images already live in R2.

**Portability:**
- Everything Cloudflare-specific sits behind two small modules: the database/storage bindings and the image loader.
- Data exports as standard SQL.
- Moving to another host or to Postgres later is a contained job, not a rewrite.

**When to pay:** Workers Paid (**+$5/month**), if the site ever hits the 10 ms CPU or daily request caps. It also raises the D1 limits (10 GB per database, 30-day Time Travel). No code changes needed.

**Alternatives considered:**

| Option | Cost | Why not chosen |
|---|---|---|
| Vercel Hobby | $0 | Its terms restrict it to non-commercial use, and a shop counts as commercial |
| Vercel Pro + Supabase Pro | about $45/month | The simplest to run, but 45× the cost |
| Netlify Free | $0 | Commercial use is allowed, but the site **goes offline** for the rest of the month once the 300-credit cap is hit |
| Supabase Free | $0 | Pauses after 7 days with no database activity and has no backups, so it needs keep-alive and backup jobs. It also allows only 2 active free projects, and the developer's account already has 3 of its 4 paused, so the next client would need Pro at $25/month |
| Self-hosted Supabase on a VPS | about $6–12/month | Needs a 4–8 GB RAM server running 11 containers; updates, SSL, backups and monitoring are on us; one server is a single point of failure |
| Separate API server (Express/Nest/Laravel) | about $5+/month | Second always-on deployment, cross-site request (CORS) setup, duplicated validation; Next.js already has a server side |
| A small VPS (e.g. Hetzner) running `next start` | about $5–7/month | Full Next.js compatibility, but someone has to patch and monitor the server |

---

## 9. SEO plan (built in from day one)

**Technical (in code)**
- Every public page is pre-rendered HTML, so crawlers never have to wait for JavaScript data loading.
- Next.js Metadata API: a unique title and description per page, with admin-editable overrides and sensible defaults built from the name, category and city.
- Clean slugs, canonical URLs, filter/sort query strings canonicalised to the base page. Dynamic `sitemap.xml` with `lastModified`; `robots.txt` blocks `/admin`; `noindex` on admin and thank-you pages.
- **JSON-LD, following Google's current rules:**
  - `LocalBusiness`: use the most specific subtype (`HealthAndBeautyBusiness`, or `BeautySalon` if facials dominate) with address, `geo` to 5+ decimal places, phone, `openingHoursSpecification`, `priceRange`, image and `sameAs`. **No `aggregateRating`/`review` on it**: reviews a business collects about itself are not eligible for stars.
  - `Organization` (logo, `founder`) → `Person`, plus `ProfilePage` on the CEO bio.
  - `Product` as a **product snippet**, not a merchant listing, because there is no checkout. It carries `offers` with `priceCurrency: "XAF"`, price and availability, and only goes on single-product pages. Reviews shown on a product page may be marked up there.
  - `BreadcrumbList` on every page. `Service` is added for meaning only; Google doesn't show a rich result for it.
  - **No `FAQPage` markup.** Google stopped showing FAQ rich results in May 2026. FAQ content stays because it helps visitors.
- Schema prices are generated from the same data as the page, so they can never go stale.
- Per-product Open Graph images; semantic headings; required alt text on uploads; self-hosted subset fonts; minimal client JS; responsive images.

**Bilingual**
- English at unprefixed paths, French under `/fr`. Each page has `hreflang` for `en`, `fr` and `x-default` (pointing to English), plus a visible language switcher.
- **No automatic redirects by IP address or browser language.**
- Separate EN and FR sitemaps. Untranslated pages are left out of the French sitemap.
- Localised metadata, e.g. "soins de la peau Limbe", "beurre corporel Cameroun", "institut de beauté Limbe".

**Local (off-site, done with the client at launch)**
- Claim and complete the **Google Business Profile**. This is the biggest single factor for "skincare Limbe" searches in the map results.
  - Use the real business name with no added keywords, the real address, and accurate hours.
  - Primary category "Skin care clinic", secondary "Cosmetics store".
- Use the same name, address and phone everywhere: site, Google profile, Facebook, TikTok.
- Submit the sitemap to Google Search Console and Bing Webmaster Tools.
- Unpublish the old Wix site once the new one is indexed. It's on a `wixsite.com` subdomain, so we can't set up 301 redirects from it.

**Content**
- Original intro copy on category and service pages (no keyword stuffing, no near-duplicate pages for each city).
- Phase 2 journal articles by the CEO under her name, on topics people search for: hyperpigmentation, stretch marks, and body care for melanin-rich skin in a hot, humid climate.

---

## 10. Open decisions & information needed

**Decisions (settled 2026-09-26)**
1. **Research additions in the MVP:** WhatsApp bag, concern + skin-type filters, and a skin consultation service. The dedicated delivery & payment page moves to Phase 2; the FAQ covers those questions until then.
2. **Languages:** English + French at launch.
3. **Hosting and backend (revised 2026-09-27 to lower running costs):** everything on Cloudflare.
   - The website runs on Workers.
   - The backend is our own code inside Next.js: D1 + Drizzle for data, Better Auth for admin login, R2 for images.
   - Cost is about $1/month including the domain.
   - Supabase, both hosted and self-hosted, and a separate API server were considered and rejected (see section 8).
4. **Notifications:** email + dashboard badge at launch; WhatsApp alerts in Phase 2.
5. **WhatsApp:** the same implementation pattern as the Telnet Cameroon site (section 3).

**Questions for the client**
6. **Exact brand name and slogan**: "Flawless Skin Care" or "Flawless Skincare and Spa"; "glowing skin" or "healthy skin"?
7. **CEO title**: the notes say "skin doctor". "Doctor" is only published if she holds a medical qualification. Otherwise use "skincare specialist" or "aesthetician".
8. **Lightening products (important):**
   - Cameroon has banned cosmetics containing **hydroquinone or mercury** since August 2022, and so has the EU. Canada classifies skin lighteners as drugs, and the US FDA says there are no legally marketed over-the-counter skin-lightening products.
   - Before listing the "whitening/lightening" products, the client should confirm what's in them, especially anything shipped abroad.
   - On the site, benefit copy uses **"brightening / even tone / reduces the look of dark spots"** wording and avoids medical claims ("treats eczema", "removes stretch marks"). She may want to consider renaming "Super Whitening Soap" for the web.
9. **Reviews:** only genuine ones; no incentives; no asking only happy customers. The site states how reviews are checked, as EU rules for German customers require.

**Content to collect** (from [links.md](links.md) §12, still outstanding)
CEO bio + portrait · confirmed phone/WhatsApp/email · exact address + landmark (Sokolo?) · opening hours · confirmed product list with sizes, prices, descriptions, ingredients, categories · service list with prices, durations, photos · payment methods + MoMo/Orange numbers · delivery zones, fees, and whether she ships abroad · cancellation/returns policy · social URLs · genuine reviews (with consent) · shop photo · domain · **French copy (or approval of drafted French) for the key pages**.

**Guardrails (unchanged from the proposal)**
No invented ingredients, claims, certifications, reviews, prices, policies, hours or contact details. Missing content shows as a clearly marked placeholder until the client approves the real text.

---

## Sources (research)
Glow Recipe glowrecipe.com · Summer Fridays summerfridays.com · Typology us.typology.com (product pages, /library) · The Ordinary theordinary.com · Tatcha tatcha.com · Rhode rhodeskin.com · Topicals mytopicals.com · Aesop aesop.com/video-consultation.html (search-result summary only) · The Skincare Eshop theskincareeshop.com · justask237.com · bshoskinclinic.com · kiabeautyspa.com · auraspacenter.com · buybetter.ng · intl.skingourmet.com · Google Search Central: [local business](https://developers.google.com/search/docs/appearance/structured-data/local-business), [review snippets](https://developers.google.com/search/docs/appearance/structured-data/review-snippet), [product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), [search gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery), [multi-regional sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) · [GBP guidelines](https://support.google.com/business/answer/3038177) · [Google review policy](https://support.google.com/contributionpolicy/answer/7400114) · [FAQ rich results dropped (SEJ)](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/) · [Cameroon hydroquinone/mercury ban (Africanews)](https://www.africanews.com/2022/09/29/in-cameroon-skin-lightening-products-remain-popular-despite-risks-and-ban/) · [FDA on mercury/hydroquinone](https://www.fda.gov/consumers/health-fraud-scams/fda-warns-consumers-skin-products-containing-mercury-andor-hydroquinone) · [Health Canada: not cosmetics](https://www.canada.ca/en/health-canada/services/consumer-product-safety/cosmetics/notification-cosmetics/examples-not-considered.html) · [Cameroon Law 2024/017](https://prc.cm/en/multimedia/documents/10271-law-n-2024-017-of-23-12-2024-web)
