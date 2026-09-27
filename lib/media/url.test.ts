import { describe, expect, it } from "vitest";
import { allVariantKeys, mediaUrl, ogImageUrl, variantKey } from "./url";

describe("mediaUrl", () => {
  it("picks the smallest stored size that covers the requested width", () => {
    expect(mediaUrl("products/abc", 320)).toBe("/media/products/abc-400");
    expect(mediaUrl("products/abc", 400)).toBe("/media/products/abc-400");
    expect(mediaUrl("products/abc", 750)).toBe("/media/products/abc-800");
    expect(mediaUrl("products/abc", 1200)).toBe("/media/products/abc-1600");
  });

  it("caps oversized requests at the largest stored size", () => {
    expect(mediaUrl("products/abc", 3840)).toBe("/media/products/abc-1600");
  });

  it("names every stored variant", () => {
    expect(variantKey("services/x", 800)).toBe("services/x-800");
    expect(ogImageUrl("services/x")).toBe("/media/services/x-og");
    expect(allVariantKeys("p/1")).toEqual(["p/1-400", "p/1-800", "p/1-1600", "p/1-og"]);
  });
});
