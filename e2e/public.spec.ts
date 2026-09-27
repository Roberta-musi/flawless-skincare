import { expect, test, type Page } from "@playwright/test";
import { amount, whatsappText } from "./support";

const bagButton = (page: Page, count: number) => page.getByRole("button", { name: `Open bag, ${count} items` });

test("home page leads to the shop, in English and French", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute("href", /\/fr$/);

  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Shop" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  } else {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Shop" }).click();
  }
  await expect(page).toHaveURL("/shop");
  await expect(page.getByRole("heading", { level: 1, name: "Shop" })).toBeVisible();

  await page.getByRole("link", { name: "Français" }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL("/fr/shop");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("heading", { level: 1, name: "Boutique" })).toBeVisible();
});

test("shop filters by concern and search, and keeps filters in the address", async ({ page, isMobile }) => {
  await page.goto("/shop");
  const cards = page.locator("main article");
  await expect(cards.first()).toBeVisible();
  const total = await cards.count();

  if (isMobile) await page.getByRole("button", { name: "Filters" }).click();
  await page.getByRole("button", { name: "Stretch marks" }).click();
  await expect(page).toHaveURL(/concern=stretch-marks/);
  if (isMobile) await page.getByRole("button", { name: /^Show \d+ results?$/ }).click();
  await expect.poll(() => cards.count()).toBeLessThan(total);
  const filtered = await cards.count();
  expect(filtered).toBeGreaterThan(0);

  await page.reload();
  await expect(cards).toHaveCount(filtered);

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(cards).toHaveCount(total);

  await page.getByRole("searchbox", { name: "Search products" }).fill("soap");
  await expect(page).toHaveURL(/q=soap/);
  await expect.poll(() => cards.count()).toBeLessThan(total);
  for (const title of await cards.locator("h3").allTextContents()) expect(title.toLowerCase()).toContain("soap");
});

test("product page offers a WhatsApp order with the product, price and link", async ({ page }) => {
  await page.goto("/products/metis-body-lotion");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Metis Body Lotion");

  const text = await whatsappText(page.getByRole("link", { name: "Order on WhatsApp" }));
  expect(text).toContain("Metis Body Lotion");
  expect(text).toMatch(amount("16500"));
  expect(text).toContain("/products/metis-body-lotion");

  const graphs = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
  const product = graphs.flatMap((g) => g["@graph"] ?? [g]).find((node) => node["@type"] === "Product");
  expect(product).toMatchObject({ name: "Metis Body Lotion", offers: { priceCurrency: "XAF", price: 16500 } });
});

test("bag collects several products into one WhatsApp order and survives a reload", async ({ page }) => {
  await page.goto("/products/metis-body-lotion");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Add to bag" }).click();
  await expect(bagButton(page, 2)).toBeVisible();

  await page.goto("/products/coffee-scrub");
  await page.getByRole("button", { name: "Add to bag" }).click();
  await bagButton(page, 3).click();

  const bag = page.getByRole("dialog", { name: "Your bag" });
  await bag.getByLabel(/Your name/).fill("Test Customer");
  await bag.getByLabel(/Delivery town/).fill("Buea");
  const text = await whatsappText(bag.getByRole("link", { name: "Send order on WhatsApp" }));
  expect(text).toContain("2 × Metis Body Lotion");
  expect(text).toContain("1 × Exfoliating Coffee Scrub");
  expect(text).toMatch(amount("38000"));
  expect(text).toContain("Name: Test Customer");
  expect(text).toContain("Delivery town: Buea");

  await page.reload();
  await bagButton(page, 3).click();
  await bag.getByRole("button", { name: "Remove Exfoliating Coffee Scrub" }).click();
  await bag.getByRole("button", { name: "Decrease quantity" }).click();
  await expect(bag.getByText("1 item")).toBeVisible();
  await bag.getByRole("button", { name: "Remove Metis Body Lotion" }).click();
  await expect(bag.getByText("Your bag is empty.")).toBeVisible();
});

test("unknown pages answer 404 in both languages", async ({ page }) => {
  for (const [path, title] of [
    ["/no-such-page", "Page not found"],
    ["/products/no-such-product", "Page not found"],
    ["/fr/no-such-page", "Page introuvable"],
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page).toHaveTitle(`${title} · Flawless Skin Care`);
  }
});

test("sitemap and robots describe the public site only", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/products/metis-body-lotion</loc>");
  expect(sitemap).toContain('hreflang="fr"');
  expect(sitemap).not.toContain("/admin");

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin");
  expect(robots).toContain("Sitemap:");
});
