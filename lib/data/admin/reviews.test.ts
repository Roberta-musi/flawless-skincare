import { beforeEach, describe, expect, it, vi } from "vitest";
import { products, reviews } from "@/lib/db/schema";
import { resetTestDb } from "@/tests/support/db";

const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/auth", () => auth);

const { addReview, deleteReview, listReviews, moderateReview } = await import("./reviews");
const { getApprovedReviews } = await import("@/lib/data/reviews");

let db: Awaited<ReturnType<typeof resetTestDb>>;

beforeEach(async () => {
  db = await resetTestDb();
  auth.requireAdmin.mockReset().mockResolvedValue({ user: { role: "owner" } });
  await db.insert(products).values({ id: "butter", slug: "body-butter", nameEn: "Body Butter", isPublished: true });
  await db.insert(reviews).values([
    { id: "r1", name: "Ada", body: "Lovely", status: "pending", productId: "butter", createdAt: new Date("2026-09-01") },
    { id: "r2", name: "Bo", body: "Great", status: "approved", createdAt: new Date("2026-09-02") },
  ]);
});

describe("review moderation", () => {
  it("lists with product names and status counts", async () => {
    const { rows, counts } = await listReviews(null);
    expect(rows.map((r) => [r.id, r.product?.nameEn ?? null])).toEqual([
      ["r2", null],
      ["r1", "Body Butter"],
    ]);
    expect(counts).toEqual({ pending: 1, approved: 1 });
  });

  it("only approved reviews reach the public site", async () => {
    expect((await getApprovedReviews()).map((r) => r.id)).toEqual(["r2"]);
    await moderateReview("r1", { status: "approved", isFeatured: true });
    expect((await getApprovedReviews()).map((r) => r.id)).toEqual(["r1", "r2"]);
    await moderateReview("r2", { status: "rejected" });
    expect((await getApprovedReviews()).map((r) => r.id)).toEqual(["r1"]);
  });

  it("publishes reviews added by the owner immediately and deletes on request", async () => {
    const id = await addReview({ name: "Cy", location: "Buea", rating: 5, body: "Sent on WhatsApp", source: "whatsapp", productId: null, serviceId: null, locale: "en" });
    expect(await db.query.reviews.findFirst({ where: (r, { eq }) => eq(r.id, id) })).toMatchObject({ status: "approved", source: "whatsapp" });
    await deleteReview(id);
    expect(await db.query.reviews.findMany()).toHaveLength(2);
  });

  it("is admin only", async () => {
    auth.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(moderateReview("r1", { status: "approved" })).rejects.toThrow("NEXT_REDIRECT");
  });
});
