import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import fr from "@/lib/i18n/dictionaries/fr";
import { bagMessage, normalizeWhatsAppNumber, productMessage, toInternationalPhone, whatsappUrl } from "./whatsapp";

describe("normalizeWhatsAppNumber", () => {
  it("keeps digits only", () => {
    expect(normalizeWhatsAppNumber("+237 673 222 029")).toBe("237673222029");
    expect(normalizeWhatsAppNumber("  ")).toBeNull();
    expect(normalizeWhatsAppNumber(null)).toBeNull();
  });
});

describe("whatsappUrl", () => {
  it("encodes the message for wa.me", () => {
    expect(whatsappUrl("237673222029", "Hi & bye\nok")).toBe("https://wa.me/237673222029?text=Hi%20%26%20bye%0Aok");
  });
});

describe("toInternationalPhone", () => {
  it("prefixes the chosen dial code", () => {
    expect(toInternationalPhone("237", "6 73 22 20 29")).toBe("+237673222029");
    expect(toInternationalPhone("49", "0151 2345 6789")).toBe("+4915123456789");
    expect(toInternationalPhone("1", "(514) 555-0182")).toBe("+15145550182");
  });

  it("respects a number typed in international form", () => {
    expect(toInternationalPhone("237", "+1 514 555 0182")).toBe("+15145550182");
    expect(toInternationalPhone("237", "00237 673222029")).toBe("+237673222029");
  });

  it("rejects numbers that cannot be valid", () => {
    expect(toInternationalPhone("237", "12345")).toBeNull();
    expect(toInternationalPhone("237", "573222029")).toBeNull();
    expect(toInternationalPhone("44", "1234567890123456")).toBeNull();
  });
});

describe("messages", () => {
  it("builds a product enquiry with or without a price", () => {
    expect(productMessage(en.whatsapp.messages, { product: "Metis Body Lotion", price: "FCFA 15,000", url: "https://x/p" })).toBe(
      "Hello Flawless Skin Care! I'm interested in Metis Body Lotion (FCFA 15,000). Is it available?\nhttps://x/p",
    );
    expect(productMessage(fr.whatsapp.messages, { product: "Savon", price: null, url: "https://x/p" })).toContain(
      "le prix et la disponibilité",
    );
  });

  it("builds a multi-item bag order", () => {
    const text = bagMessage(en.whatsapp.messages, {
      lines: [
        { product: "Molato Soap (Big size)", quantity: 2, price: "FCFA 20,000" },
        { product: "Coffee scrub", quantity: 1, price: "FCFA 5,000" },
      ],
      total: "FCFA 25,000",
      name: " Ada ",
      town: "",
    });
    expect(text).toBe(
      [
        "Hello Flawless Skin Care! I'd like to order:",
        "• 2 × Molato Soap (Big size) – FCFA 20,000",
        "• 1 × Coffee scrub – FCFA 5,000",
        "",
        "Total: FCFA 25,000",
        "",
        "Name: Ada",
        "",
        "Could you confirm availability and delivery?",
      ].join("\n"),
    );
  });
});
