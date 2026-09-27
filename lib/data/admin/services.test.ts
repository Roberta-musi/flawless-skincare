import { beforeEach, describe, expect, it, vi } from "vitest";
import { bookings } from "@/lib/db/schema";
import type { ServiceInput } from "@/lib/validation/admin";
import { resetTestDb } from "@/tests/support/db";

const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
const media = vi.hoisted(() => ({ delete: vi.fn() }));
vi.mock("@/lib/auth", () => auth);
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: async () => ({ env: { MEDIA: media } }) }));

const { deleteService, getServiceForEdit, saveService } = await import("./services");

let db: Awaited<ReturnType<typeof resetTestDb>>;

const service: ServiceInput = {
  slug: "acne-facial",
  nameEn: "Acne facial",
  nameFr: null,
  shortDescriptionEn: null,
  shortDescriptionFr: null,
  descriptionEn: null,
  descriptionFr: null,
  whatToExpectEn: null,
  whatToExpectFr: null,
  preparationEn: null,
  preparationFr: null,
  aftercareEn: null,
  aftercareFr: null,
  durationMinutes: 60,
  priceXaf: 20000,
  priceType: "fixed",
  mode: "in_shop",
  imageKey: "services/one",
  isPublished: true,
  isFeatured: false,
  sortOrder: 0,
  seoTitleEn: null,
  seoTitleFr: null,
  seoDescriptionEn: null,
  seoDescriptionFr: null,
};

beforeEach(async () => {
  db = await resetTestDb();
  auth.requireAdmin.mockReset().mockResolvedValue({ user: { role: "owner" } });
  media.delete.mockReset();
});

describe("admin services", () => {
  it("requires an admin", async () => {
    auth.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(saveService(service)).rejects.toThrow("NEXT_REDIRECT");
  });

  it("creates, updates with a new photo and cleans up the old one", async () => {
    const created = await saveService(service);
    if (!created.ok) throw new Error("create failed");
    const updated = await saveService({ ...service, id: created.id, imageKey: "services/two", priceXaf: 25000 });
    expect(updated.ok).toBe(true);
    expect(await getServiceForEdit(created.id)).toMatchObject({ imageKey: "services/two", priceXaf: 25000 });
    expect(media.delete).toHaveBeenCalledWith(["services/one-400", "services/one-800", "services/one-1600", "services/one-og"]);
  });

  it("keeps booking history when a service is deleted", async () => {
    const created = await saveService(service);
    if (!created.ok) throw new Error("create failed");
    const now = new Date();
    await db.insert(bookings).values({
      serviceId: created.id,
      serviceName: "Acne facial",
      name: "Ada",
      phone: "+237673222029",
      preferredSlots: [{ date: "2026-10-02", window: "morning" }],
      policyAcceptedAt: now,
      consentAt: now,
    });
    await deleteService(created.id);
    expect(await db.query.bookings.findFirst()).toMatchObject({ serviceId: null, serviceName: "Acne facial" });
  });

  it("rejects duplicate web addresses", async () => {
    await saveService(service);
    expect(await saveService({ ...service, nameEn: "Other" })).toEqual({ ok: false, errors: { slug: "Another service already uses this web address." } });
  });
});
