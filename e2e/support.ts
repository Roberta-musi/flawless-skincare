import { expect, type Locator, type Page } from "@playwright/test";

// The local test admin from .env.example; override for other databases.
export const admin = {
  email: process.env.E2E_ADMIN_EMAIL ?? "owner@flawless.test",
  password: process.env.E2E_ADMIN_PASSWORD ?? "flawless-dev-2026",
};

export async function signIn(page: Page, next = "/admin") {
  await page.goto(`/admin/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(admin.email);
  await page.getByLabel("Password").fill(admin.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(next);
}

export async function whatsappText(link: Locator) {
  const href = await link.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  return new URL(href!).searchParams.get("text")!;
}

export const amount = (digits: string) => new RegExp(digits.replace(/(\d)(?=(\d{3})+$)/g, "$1[\\s,.  ]?"));
