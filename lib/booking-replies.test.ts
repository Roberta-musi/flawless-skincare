import { describe, expect, it } from "vitest";
import { appointmentLabel, bookingReplyUrl, describeSlot } from "./booking-replies";

const booking = {
  name: "Ada Lovelace",
  phone: "+4915123456789",
  serviceName: "Skin consultation",
  locale: "en" as const,
  scheduledAt: null,
  preferredSlots: [{ date: "2026-10-02", window: "morning" as const }],
};

describe("booking replies", () => {
  it("describes preferred slots in the customer's language", () => {
    expect(describeSlot(booking.preferredSlots[0], "en")).toBe("Friday, 2 October in the morning");
    expect(describeSlot(booking.preferredSlots[0], "fr")).toBe("vendredi 2 octobre le matin");
  });

  it("prefers the confirmed appointment time when there is one", () => {
    expect(appointmentLabel({ ...booking, scheduledAt: new Date("2026-10-02T09:30:00Z") })).toBe("Friday, 2 October at 10:30");
  });

  it("builds a WhatsApp link to the customer with the first name", () => {
    const url = bookingReplyUrl(booking, "confirm");
    expect(url?.startsWith("https://wa.me/4915123456789?text=")).toBe(true);
    expect(decodeURIComponent(url!.split("text=")[1])).toBe(
      "Hello Ada, this is Flawless Skin Care. Your appointment for Skin consultation is confirmed for Friday, 2 October in the morning. We look forward to seeing you!",
    );
    expect(decodeURIComponent(bookingReplyUrl({ ...booking, locale: "fr" }, "decline")!.split("text=")[1])).toContain("Un autre jour");
  });
});
