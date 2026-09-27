import { beforeEach, describe, expect, it } from "vitest";
import { products, services } from "@/lib/db/schema";
import { resetTestDb } from "@/tests/support/db";
import { createBooking, createMessage, createReview } from "./submissions";

let db: Awaited<ReturnType<typeof resetTestDb>>;

beforeEach(async () => {
  db = await resetTestDb();
  await db.insert(services).values([
    { id: "consult", slug: "skin-consultation", nameEn: "Skin consultation", isPublished: true },
    { id: "hidden", slug: "hidden", nameEn: "Hidden", isPublished: false },
  ]);
  await db.insert(products).values({ id: "butter", slug: "body-butter", nameEn: "Body Butter", isPublished: true });
});

const booking = {
  locale: "en" as const,
  service: "skin-consultation",
  slots: [{ date: "2026-10-02", window: "morning" as const }],
  name: "Ada",
  phone: "+237673222029",
  email: "",
  firstVisit: true,
  notes: "",
};

describe("createBooking", () => {
  it("stores a pending request with a snapshot of the service name", async () => {
    const result = await createBooking(booking);
    const row = await db.query.bookings.findFirst();
    expect(result?.service.nameEn).toBe("Skin consultation");
    expect(row).toMatchObject({ status: "pending", serviceId: "consult", serviceName: "Skin consultation", email: null, notes: null });
    expect(row?.preferredSlots).toEqual([{ date: "2026-10-02", window: "morning" }]);
    expect(row?.consentAt).toBeInstanceOf(Date);
  });

  it("refuses unknown or unpublished services", async () => {
    expect(await createBooking({ ...booking, service: "hidden" })).toBeNull();
    expect(await db.query.bookings.findMany()).toHaveLength(0);
  });
});

describe("createReview", () => {
  it("keeps website reviews pending and links the product", async () => {
    await createReview({ locale: "fr", name: "Bo", location: "", rating: 5, body: "Très bien", about: "product:body-butter" });
    expect(await db.query.reviews.findFirst()).toMatchObject({ status: "pending", source: "website", productId: "butter", location: null });
  });

  it("drops links to things that are not published", async () => {
    await createReview({ locale: "en", name: "Bo", location: "", rating: null, body: "Nice", about: "service:hidden" });
    expect(await db.query.reviews.findFirst()).toMatchObject({ serviceId: null, productId: null });
  });
});

describe("createMessage", () => {
  it("stores the message unread", async () => {
    await createMessage({ locale: "en", name: "Cy", contact: "cy@example.com", subject: "", body: "Hello" });
    expect(await db.query.messages.findFirst()).toMatchObject({ isRead: false, subject: null });
  });
});
