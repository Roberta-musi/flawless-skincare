import { beforeEach, describe, expect, it, vi } from "vitest";
import { bookings, messages } from "@/lib/db/schema";
import { resetTestDb } from "@/tests/support/db";

const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/auth", () => auth);

const { deleteBooking, getBooking, listBookings, listMessages, setMessageRead, updateBooking } = await import("./inbox");

let db: Awaited<ReturnType<typeof resetTestDb>>;
const now = new Date();
const booking = (id: string, status: "pending" | "confirmed", createdAt: Date) => ({
  id,
  serviceName: "Facial",
  name: id,
  phone: "+237673222029",
  preferredSlots: [{ date: "2026-10-02", window: "morning" as const }],
  status,
  policyAcceptedAt: now,
  consentAt: now,
  createdAt,
});

beforeEach(async () => {
  db = await resetTestDb();
  auth.requireAdmin.mockReset().mockResolvedValue({ user: { role: "owner" } });
  await db.insert(bookings).values([
    booking("a", "pending", new Date("2026-09-01")),
    booking("b", "confirmed", new Date("2026-09-02")),
    booking("c", "pending", new Date("2026-09-03")),
  ]);
});

describe("bookings", () => {
  it("lists newest first, filters by status and counts each status", async () => {
    const all = await listBookings(null);
    expect(all.rows.map((r) => r.id)).toEqual(["c", "b", "a"]);
    expect(all.counts).toEqual({ pending: 2, confirmed: 1 });
    expect((await listBookings("pending")).rows.map((r) => r.id)).toEqual(["c", "a"]);
  });

  it("updates status, appointment and note, and deletes on request", async () => {
    const when = new Date("2026-10-02T09:00:00Z");
    await updateBooking("a", { status: "confirmed", scheduledAt: when, adminNote: "Bring photos" });
    expect(await getBooking("a")).toMatchObject({ status: "confirmed", scheduledAt: when, adminNote: "Bring photos" });
    await deleteBooking("a");
    expect(await getBooking("a")).toBeNull();
  });

  it("is admin only", async () => {
    auth.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(listBookings(null)).rejects.toThrow("NEXT_REDIRECT");
    await expect(updateBooking("a", { status: "rejected", scheduledAt: null, adminNote: null })).rejects.toThrow("NEXT_REDIRECT");
  });
});

describe("messages", () => {
  it("marks messages read and unread", async () => {
    await db.insert(messages).values({ id: "m", name: "Cy", contact: "cy@x.com", body: "Hi", consentAt: now });
    await setMessageRead("m", true);
    expect((await listMessages())[0].isRead).toBe(true);
  });
});
