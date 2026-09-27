import { describe, expect, it } from "vitest";
import { mediaUrl, variantKey } from "./url";

describe("mediaUrl", () => {
  it("picks the smallest stored size that covers the requested width", () => {
    expect(mediaUrl("products/abc", 320)).toBe("/media/products/abc-400.webp");
    expect(mediaUrl("products/abc", 400)).toBe("/media/products/abc-400.webp");
    expect(mediaUrl("products/abc", 750)).toBe("/media/products/abc-800.webp");
    expect(mediaUrl("products/abc", 1200)).toBe("/media/products/abc-1600.webp");
  });

  it("caps oversized requests at the largest stored size", () => {
    expect(mediaUrl("products/abc", 3840)).toBe("/media/products/abc-1600.webp");
  });

  it("builds variant keys", () => {
    expect(variantKey("services/x", 800)).toBe("services/x-800.webp");
  });
});
