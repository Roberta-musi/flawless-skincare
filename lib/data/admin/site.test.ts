import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SettingsInput } from "@/lib/validation/admin";
import { resetTestDb } from "@/tests/support/db";

const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
const media = vi.hoisted(() => ({ delete: vi.fn() }));
vi.mock("@/lib/auth", () => auth);
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: async () => ({ env: { MEDIA: media } }) }));

const { getBrandForEdit, listContentForEdit, saveBrand, saveContentPage, saveFaq, saveSettings } = await import("./site");
const { getSettings } = await import("@/lib/data/site");

beforeEach(async () => {
  await resetTestDb();
  auth.requireAdmin.mockReset().mockResolvedValue({ user: { role: "owner" } });
  media.delete.mockReset();
});

const settings: SettingsInput = {
  businessName: "Flawless Skin Care",
  sloganEn: "The secret for a glowing skin",
  sloganFr: null,
  announcementEn: null,
  announcementFr: null,
  whatsapp: "237673222029",
  phone: "+237 673 222 029",
  email: "hello@flawless.test",
  streetAddress: "Sokolo",
  landmarkEn: "Near the roundabout",
  landmarkFr: null,
  city: "Limbe",
  region: "South West",
  latitude: 4.0186,
  longitude: 9.2043,
  mapUrl: null,
  shopPhotoKey: "site/one",
  openingHours: [{ opens: "09:00", closes: "18:00" }, null, null, null, null, null, null],
  socials: { facebook: "https://facebook.com/x", tiktok: "" },
  seoTitleEn: null,
  seoTitleFr: null,
  seoDescriptionEn: null,
  seoDescriptionFr: null,
};

describe("site settings", () => {
  it("saves business details, drops empty social links and cleans up the old shop photo", async () => {
    await saveSettings(settings);
    await saveSettings({ ...settings, shopPhotoKey: "site/two" });
    const saved = await getSettings();
    expect(saved).toMatchObject({ whatsapp: "237673222029", streetAddress: "Sokolo", socials: { facebook: "https://facebook.com/x" } });
    expect(media.delete).toHaveBeenCalledWith(["site/one-400", "site/one-800", "site/one-1600", "site/one-og"]);
  });

  it("is admin only", async () => {
    auth.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(saveSettings(settings)).rejects.toThrow("NEXT_REDIRECT");
  });
});

describe("brand and content", () => {
  it("updates the brand profile", async () => {
    await saveBrand({
      ceoName: "Musi",
      ceoTitleEn: "Founder",
      ceoTitleFr: null,
      portraitKey: null,
      shortBioEn: "Bio",
      shortBioFr: null,
      storyEn: null,
      storyFr: null,
      quoteEn: null,
      quoteFr: null,
      brandStoryEn: null,
      brandStoryFr: null,
      foundedYear: 2020,
      ceoSocials: { instagram: "" },
    });
    expect(await getBrandForEdit()).toMatchObject({ ceoName: "Musi", foundedYear: 2020, ceoSocials: {} });
  });

  it("adds FAQs and edits policy pages", async () => {
    await saveFaq({ topic: "delivery", questionEn: "Do you deliver?", questionFr: null, answerEn: "Yes, ask us.", answerFr: null, sortOrder: 1, isPublished: true });
    await saveContentPage({ slug: "returns", titleEn: "Returns", titleFr: "Retours", bodyEn: "Unopened items within 7 days.", bodyFr: null });
    const { faqs, pages } = await listContentForEdit();
    expect(faqs.map((f) => f.questionEn)).toEqual(["Do you deliver?"]);
    expect(pages.find((p) => p.slug === "returns")?.bodyEn).toBe("Unopened items within 7 days.");
  });
});
