import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { signIn } from "./support";

test.use({ reducedMotion: "reduce" });

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  const violations = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
  expect(violations).toEqual([]);
}

const publicPages = [
  "/",
  "/shop",
  "/shop/body-care",
  "/products/metis-body-lotion",
  "/services",
  "/services/skin-consultation",
  "/book",
  "/about",
  "/reviews",
  "/contact",
  "/faq",
  "/privacy",
  "/fr",
  "/fr/book",
  "/no-such-page",
];

for (const path of publicPages) {
  test(`public page ${path} passes axe`, async ({ page }) => {
    await page.goto(path);
    await expectNoViolations(page);
  });
}

test("open bag and menu dialogs pass axe", async ({ page }) => {
  await page.goto("/products/metis-body-lotion");
  await page.getByRole("button", { name: "Add to bag" }).click();
  await page.getByRole("button", { name: "Open bag, 1 items" }).click();
  await expect(page.getByRole("dialog", { name: "Your bag" })).toBeVisible();
  await expectNoViolations(page);
});

test("admin sign-in page passes axe", async ({ page }) => {
  await page.goto("/admin/login");
  await expectNoViolations(page);
});

const adminPages = [
  "/admin",
  "/admin/products",
  "/admin/products/metis-body-lotion",
  "/admin/taxonomy",
  "/admin/services",
  "/admin/bookings",
  "/admin/messages",
  "/admin/reviews",
  "/admin/settings",
  "/admin/profile",
  "/admin/content",
];

test.describe("admin", () => {
  test.beforeEach(async ({ page }) => signIn(page));

  for (const path of adminPages) {
    test(`admin page ${path} passes axe`, async ({ page }) => {
      await page.goto(path);
      await expectNoViolations(page);
    });
  }
});
