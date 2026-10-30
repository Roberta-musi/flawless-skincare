import { describe, expect, it } from "vitest";
import { formatDate, formatDuration, formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats whole FCFA amounts per locale", () => {
    expect(formatPrice(15000, "en").replace(/\s/g, " ")).toBe("FCFA 15,000");
    expect(formatPrice(15000, "fr").replace(/\s/g, " ")).toBe("15 000 FCFA");
  });
});

describe("formatDuration", () => {
  it("formats minutes and hours", () => {
    expect(formatDuration(45, "en")).toBe("45 min");
    expect(formatDuration(60, "en")).toBe("1 hr");
    expect(formatDuration(90, "fr")).toBe("1 h 30 min");
  });
});

describe("formatDate", () => {
  it("reads plain dates as the local Cameroon day", () => {
    expect(formatDate("2026-10-02", "fr", { weekday: "long", day: "numeric", month: "long" })).toBe(
      "vendredi 2 octobre",
    );
  });
});
