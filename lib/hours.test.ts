import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import { dayRange, groupOpeningHours, openingHoursSpecification } from "./hours";

const weekday = { opens: "09:00", closes: "21:00" };

describe("groupOpeningHours", () => {
  it("merges consecutive days with the same hours", () => {
    const groups = groupOpeningHours([weekday, weekday, weekday, weekday, weekday, { opens: "10:00", closes: "16:00" }, null]);
    expect(groups).toEqual([
      { from: 0, to: 4, opens: "09:00", closes: "21:00" },
      { from: 5, to: 5, opens: "10:00", closes: "16:00" },
      { from: 6, to: 6, closed: true },
    ]);
    expect(groups.map((g) => dayRange(g, en.days))).toEqual(["Mon – Fri", "Sat", "Sun"]);
  });

  it("merges consecutive closed days and handles missing hours", () => {
    expect(groupOpeningHours([weekday, weekday, weekday, weekday, weekday, null, null]).at(-1)).toEqual({ from: 5, to: 6, closed: true });
    expect(groupOpeningHours(null)).toEqual([]);
  });
});

describe("openingHoursSpecification", () => {
  it("lists open days for schema.org", () => {
    expect(openingHoursSpecification([weekday, null, null, null, null, null, null])).toEqual([
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "09:00", closes: "21:00" },
    ]);
  });
});
