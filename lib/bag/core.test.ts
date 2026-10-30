import { describe, expect, it } from "vitest";
import { addLine, bagCount, bagTotal, maxQuantity, parseStoredBag, setQuantity } from "./core";

const butter = {
  productId: "butter",
  variantId: "big",
  slug: "body-butter",
  nameEn: "Body Butter",
  nameFr: null,
  variantEn: "Big size",
  variantFr: null,
  priceXaf: 10000,
  imageKey: null,
};

describe("bag", () => {
  it("adds new lines and merges repeats of the same variant", () => {
    let lines = addLine([], butter, 2);
    lines = addLine(lines, butter);
    lines = addLine(lines, { ...butter, variantId: "small", priceXaf: 6000 });
    expect(lines.map((l) => [l.key, l.quantity])).toEqual([
      ["butter:big", 3],
      ["butter:small", 1],
    ]);
    expect(bagCount(lines)).toBe(4);
    expect(bagTotal(lines)).toBe(36000);
  });

  it("caps quantities and removes lines set to zero", () => {
    const lines = addLine([], butter, 50);
    expect(lines[0].quantity).toBe(maxQuantity);
    expect(setQuantity(lines, "butter:big", 0)).toEqual([]);
  });

  it("has no total when any line is unpriced", () => {
    expect(bagTotal(addLine(addLine([], butter), { ...butter, variantId: null, priceXaf: null }))).toBeNull();
  });

  it("ignores corrupt stored data", () => {
    expect(parseStoredBag("not json")).toEqual([]);
    expect(parseStoredBag('{"a":1}')).toEqual([]);
    expect(parseStoredBag(JSON.stringify([{ key: "x" }, { ...butter, key: "butter:big", quantity: 2 }]))).toHaveLength(1);
  });
});
