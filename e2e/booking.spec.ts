import { expect, test } from "@playwright/test";
import { signIn, whatsappText } from "./support";

function daysFromNow(days: number) {
  const date = new Date(Date.now() + days * 86_400_000);
  return date.toISOString().slice(0, 10);
}

test("a booking request reaches the admin, who confirms it on WhatsApp and deletes it", async ({ page }) => {
  const name = `E2E Client ${Date.now()}`;
  const day = daysFromNow(3);

  await page.goto("/book");
  await page.getByRole("button", { name: "Request appointment" }).click();
  await expect(page.getByText("This field is required.").first()).toBeVisible();
  await expect(page.getByText("Please tick this box to continue.").first()).toBeVisible();

  await page.getByLabel("Service").selectOption({ label: "Skin consultation" });
  await page.locator("#slot-date-0").fill(day);
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("WhatsApp number").fill("670 00 00 01");
  await page.getByRole("radio", { name: "Yes" }).check();
  await page.getByRole("checkbox", { name: /booking and cancellation policy/ }).check();
  await page.getByRole("checkbox", { name: /may use these details/ }).check();
  await page.getByRole("button", { name: "Request appointment" }).click();

  await expect(page.getByRole("heading", { name: "Request received" })).toBeVisible();
  const followUp = await whatsappText(page.getByRole("link", { name: "Send us a WhatsApp message" }));
  expect(followUp).toContain(name);
  expect(followUp).toContain("Skin consultation");

  await signIn(page, "/admin/bookings");
  await page.getByRole("link", { name: new RegExp(name) }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByRole("link", { name: "+237670000001" })).toBeVisible();

  await page.getByLabel(/Appointment date and time/).fill(`${day}T10:30`);
  const confirmation = await whatsappText(page.getByRole("link", { name: "Send confirmation" }));
  expect(new URL((await page.getByRole("link", { name: "Send confirmation" }).getAttribute("href"))!).pathname).toBe("/237670000001");
  expect(confirmation).toContain("10:30");

  await page.getByRole("radio", { name: "Confirmed" }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Booking updated.")).toBeVisible();

  await page.goto("/admin/bookings?status=confirmed");
  await page.getByRole("link", { name: new RegExp(name) }).click();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page).toHaveURL("/admin/bookings");
  await expect(page.getByRole("link", { name: new RegExp(name) })).toHaveCount(0);
});
