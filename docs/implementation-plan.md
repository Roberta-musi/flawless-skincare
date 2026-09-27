# Implementation plan

Working checklist for building the scope in [scope-and-stack.md](scope-and-stack.md). Each unit is built, tested, and committed on `feat/mvp` before the next one starts. A unit is **done** only when:
- `npm run lint`, `npm run typecheck` and `npm test` pass
- its own checks (listed per unit) have been run
- it has been looked at in a browser, where it has UI

## Conventions
- Code style: double quotes, semicolons, `@/` imports, no comments unless they state a constraint.
- Server data access lives only in `lib/data/*` (`import "server-only"`). Public reads are wrapped in React `cache()` and pages are pre-rendered; admin mutations call `requireAdmin()` first and `revalidatePublicSite()` after.
- Localised DB text: `<field>_en` / `<field>_fr` columns, read through `localized(row, "field", locale)`, which falls back to English.
- UI text: `lib/i18n/dictionaries/{en,fr}.ts`.
- Tests:
  - **Unit:** Vitest, for pure helpers and data functions against in-memory SQLite (libsql) with the real migrations.
  - **End-to-end:** Playwright, for critical flows against the dev server.

## Units

| # | Unit | Key checks | Status |
|---|---|---|---|
| 1 | Tooling: OpenNext/wrangler config, D1 + R2 bindings, Drizzle, Vitest, scripts, env types | dev server boots with bindings; `next build` passes; Vitest runs | ✅ |
| 2 | Design system: tokens, fonts, logo asset, UI primitives, icons | primitives page visually reviewed at mobile + desktop widths | ✅ |
| 3 | Database: schema, migrations, seed (settings, profile, taxonomy, products, services, reviews, FAQ, images) | migration tests; seed runs on local D1 | ✅ |
| 4 | i18n: locales, dictionaries, `/fr` routing via rewrites, `/en` redirect, localized field helper | unit tests for paths and fallbacks | ✅ |
| 5 | WhatsApp: number normalising, customer phone (country picker → E.164), message builders EN/FR | unit tests | ✅ |
| 6 | Public shell: announcement bar, header (desktop/mobile), footer, WhatsApp bubble, 404 | browser check, keyboard nav | ✅ |
| 7 | Home page | browser check | ✅ |
| 8 | Shop: listing, client-side filters (category/concern/skin type/search/sort), category pages | unit tests for filtering; browser check | ✅ |
| 9 | Product page: gallery, sizes, price, set contents, pairs-with, reviews, WhatsApp order | browser check | ✅ |
| 10 | Bag: store, drawer, multi-item WhatsApp message | unit tests for bag + message | ✅ |
| 11 | Services list + service detail | browser check | ✅ |
| 12 | Booking: form, server action, validation, Turnstile, email, success + WhatsApp follow-up | unit tests (schema, insert); end-to-end | ✅ |
| 13 | About, Reviews (list + submit), Contact (map, hours, form), FAQ, Privacy | unit tests for submit actions; browser check | ✅ |
| 14 | SEO: metadata + hreflang, JSON-LD, sitemap, robots, OG images | unit tests for JSON-LD + sitemap; view source | ✅ |
| 15 | Media: R2 route, image loader, browser-side resizing | unit test for loader; upload works in dev | ✅ |
| 16 | Auth: Better Auth (PBKDF2 hashing), login, reset, `requireAdmin`, owner seed command | guard tests; login end-to-end | ✅ |
| 17 | Admin shell + dashboard | browser check at phone width | ✅ |
| 18 | Admin: products (variants, images, taxonomy, pairings, sets, EN/FR, SEO) + categories/concerns/skin types | data tests; end-to-end edit → public page updates | ✅ |
| 19 | Admin: services | data tests | ✅ |
| 20 | Admin: bookings + messages | data tests; WhatsApp reply link | ✅ |
| 21 | Admin: reviews moderation | data tests | ✅ |
| 22 | Admin: brand profile, business settings, FAQ & policies | data tests | ✅ |
| 23 | Cloudflare: OpenNext build + local preview, cache revalidation check, backup workflow, deploy guide | `opennextjs-cloudflare preview` smoke test | ☐ |
| 24 | Final pass: accessibility, performance, end-to-end suite, docs | all green | ☐ |
