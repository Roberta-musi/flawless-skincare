import { describe, expect, it } from "vitest";
import { greeting, timeAgo } from "./admin-format";

describe("timeAgo", () => {
  const now = new Date("2026-09-27T12:00:00Z");
  it("describes recent and older moments", () => {
    expect(timeAgo(new Date("2026-09-27T11:59:30Z"), now)).toBe("just now");
    expect(timeAgo(new Date("2026-09-27T09:00:00Z"), now)).toBe("3 hours ago");
    expect(timeAgo(new Date("2026-09-26T12:00:00Z"), now)).toBe("yesterday");
    expect(timeAgo(new Date("2026-09-06T12:00:00Z"), now)).toBe("3 weeks ago");
  });
});

describe("greeting", () => {
  it("uses Cameroon time", () => {
    expect(greeting(new Date("2026-09-27T06:30:00Z"))).toBe("Good morning");
    expect(greeting(new Date("2026-09-27T12:30:00Z"))).toBe("Good afternoon");
    expect(greeting(new Date("2026-09-27T18:30:00Z"))).toBe("Good evening");
  });
});
