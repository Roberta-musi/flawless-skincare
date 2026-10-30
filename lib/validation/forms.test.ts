import { describe, expect, it } from "vitest";
import { todayInCameroon } from "@/lib/format";
import { isSpam, parseBooking, parseMessage, parseReview } from "./forms";

function form(values: Record<string, string | string[]>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    for (const v of Array.isArray(value) ? value : [value]) data.append(key, v);
  }
  return data;
}

const validBooking = {
  locale: "en",
  service: "skin-consultation",
  slotDate: ["2026-10-02", "2026-10-03"],
  slotWindow: ["morning", "evening"],
  name: "Ada Lovelace",
  dialCode: "237",
  phone: "6 73 22 20 29",
  email: "",
  firstVisit: "no",
  notes: "Dry patches",
  policy: "on",
  consent: "on",
};

describe("parseBooking", () => {
  it("accepts a complete request and normalises the phone", () => {
    const result = parseBooking(form(validBooking), "2026-10-01");
    expect(result).toEqual({
      ok: true,
      data: {
        locale: "en",
        service: "skin-consultation",
        slots: [
          { date: "2026-10-02", window: "morning" },
          { date: "2026-10-03", window: "evening" },
        ],
        name: "Ada Lovelace",
        phone: "+237673222029",
        email: "",
        firstVisit: false,
        notes: "Dry patches",
      },
    });
  });

  it("reports missing fields, unticked boxes and bad emails", () => {
    const result = parseBooking(form({ ...validBooking, name: " ", email: "nope", policy: "", consent: "", slotDate: [] }), "2026-10-01");
    expect(result).toEqual({
      ok: false,
      errors: { name: "required", email: "invalidEmail", policy: "mustAccept", consent: "mustAccept", slots: "required" },
    });
  });

  it("rejects past dates and impossible phone numbers", () => {
    const result = parseBooking(form({ ...validBooking, phone: "12345", slotDate: ["2026-09-30"], slotWindow: ["morning"] }), "2026-10-01");
    expect(result).toEqual({ ok: false, errors: { phone: "invalidPhone", slots: "invalidDate" } });
  });
});

describe("parseReview", () => {
  it("parses optional rating and what the review is about", () => {
    const result = parseReview(
      form({ locale: "fr", name: "Bo", location: "Buea", rating: "5", body: "Très bon produit, merci !", about: "product:body-butter", consent: "on" }),
    );
    expect(result).toEqual({
      ok: true,
      data: { locale: "fr", name: "Bo", location: "Buea", rating: 5, body: "Très bon produit, merci !", about: "product:body-butter" },
    });
  });

  it("rejects short reviews and forged targets", () => {
    const result = parseReview(form({ locale: "en", name: "Bo", location: "", rating: "", body: "ok", about: "product:x;drop", consent: "on" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["about", "body"]);
  });
});

describe("parseMessage", () => {
  it("requires consent", () => {
    const result = parseMessage(form({ locale: "en", name: "Cy", contact: "cy@example.com", subject: "", body: "Hello there", consent: "" }));
    expect(result).toEqual({ ok: false, errors: { consent: "mustAccept" } });
  });
});

describe("helpers", () => {
  it("flags the honeypot and reads the Cameroon date", () => {
    expect(isSpam(form({ company: "Acme" }))).toBe(true);
    expect(isSpam(form({}))).toBe(false);
    expect(todayInCameroon(new Date("2026-10-01T23:30:00Z"))).toBe("2026-10-02");
  });
});
