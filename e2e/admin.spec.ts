import { expect, test, type Page } from "@playwright/test";
import { admin, signIn } from "./support";

test("admin pages need a signed-in admin", async ({ page }) => {
  await page.goto("/admin/products");
  await expect(page).toHaveURL("/admin/login");
  expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");

  await page.getByLabel("Email").fill(admin.email);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "That email and password don't match. Please try again." })).toBeVisible();

  await page.getByLabel("Password").fill(admin.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/admin");

  await page.getByRole("button", { name: "Sign out" }).filter({ visible: true }).click();
  await expect(page).toHaveURL("/admin/login");
  await page.goto("/admin");
  await expect(page).toHaveURL("/admin/login");
});

test("links from notification emails open the right admin page, before and after sign-in", async ({ page }) => {
  await signIn(page, "/admin/reviews?highlight=none");
  await page.goto("/admin/login?next=%2Fadmin%2Fbookings");
  await expect(page).toHaveURL("/admin/bookings");
  await page.goto("/admin/login?next=https%3A%2F%2Fevil.example%2F");
  await expect(page).toHaveURL("/admin");
});

async function setShortDescription(page: Page, value: string) {
  await page.goto("/admin/products/metis-body-lotion");
  const field = page.getByLabel(/^Short description/);
  const previous = await field.inputValue();
  // Before React hydrates, typing loses Playwright's select-all and clicks do nothing. The save bar only reports
  // unsaved changes once React is running, so retry until it does and the field holds exactly this value.
  await expect(async () => {
    await field.fill(value);
    await expect(field).toHaveValue(value, { timeout: 1_000 });
    await expect(page.getByText("You have unsaved changes")).toBeVisible({ timeout: 1_000 });
  }).toPass();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved. The website is updated.")).toBeVisible();
  return previous;
}

test("a product edit shows on the public site", async ({ page }) => {
  await signIn(page);
  const marker = `Edited by the end-to-end test ${Date.now()}.`;
  const original = await setShortDescription(page, marker);

  try {
    await page.goto("/products/metis-body-lotion");
    await expect(page.getByText(marker)).toBeVisible();
  } finally {
    await setShortDescription(page, original);
  }

  await page.goto("/products/metis-body-lotion");
  await expect(page.getByText(original)).toBeVisible();
  await expect(page.getByText(marker)).toHaveCount(0);
});

test("the owner manages the team and a manager runs their own account", async ({ browser, page }) => {
  const manager = { name: "E2E Manager", email: `manager-${Date.now()}@flawless.test`, password: "manager-pass-1", next: "manager-pass-2" };
  await signIn(page, "/admin/team");

  await expect(async () => {
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByRole("dialog", { name: "Add a team member" })).toBeVisible({ timeout: 1_000 });
  }).toPass();
  const form = page.getByRole("dialog", { name: "Add a team member" });
  await form.getByLabel("Full name").fill(manager.name);
  await form.getByLabel("Email").fill(manager.email);
  await form.getByLabel("First password").fill(manager.password);
  await form.getByRole("button", { name: "Add to team" }).click();
  await expect(page.getByText(`${manager.name} can now sign in at /admin.`)).toBeVisible();
  await expect(page.getByRole("button", { name: new RegExp(manager.email) })).toContainText("manager");

  const staff = await (await browser.newContext()).newPage();
  await staff.goto("/admin/login");
  await staff.getByLabel("Email").fill(manager.email);
  await staff.getByLabel("Password").fill(manager.password);
  await staff.getByRole("button", { name: "Sign in" }).click();
  await expect(staff).toHaveURL("/admin");
  await expect(staff.getByRole("link", { name: "Team" })).toHaveCount(0);
  await staff.goto("/admin/team");
  await expect(staff).toHaveURL("/admin");

  await staff.goto("/admin/account");
  await expect(async () => {
    await staff.getByLabel("Current password").fill("wrong-password");
    await staff.getByLabel("New password", { exact: true }).fill(manager.next);
    await staff.getByLabel("New password again").fill(manager.next);
    await staff.getByRole("button", { name: "Change password" }).click();
    await expect(staff.getByText("That isn't your current password.")).toBeVisible({ timeout: 2_000 });
  }).toPass();
  await staff.getByLabel("Current password").fill(manager.password);
  await staff.getByRole("button", { name: "Change password" }).click();
  await expect(staff.getByText("Password changed. Any other devices were signed out.")).toBeVisible();
  await staff.reload();
  await expect(staff).toHaveURL("/admin/account");

  await page.getByRole("button", { name: new RegExp(manager.email) }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Remove from team" }).click();
  await expect(page.getByText(`${manager.name} was removed from the team.`)).toBeVisible();
  await expect(page.getByRole("button", { name: new RegExp(manager.email) })).toHaveCount(0);

  await staff.goto("/admin");
  await expect(staff).toHaveURL("/admin/login");
});
