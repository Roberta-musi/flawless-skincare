import { describe, expect, it } from "vitest";
import { adminEntryUrl, safeAdminPath } from "./admin-links";

describe("safeAdminPath", () => {
  it("keeps admin paths", () => {
    expect(safeAdminPath("/admin/bookings/abc")).toBe("/admin/bookings/abc");
    expect(safeAdminPath("/admin/reviews?highlight=1")).toBe("/admin/reviews?highlight=1");
  });

  it("falls back to the dashboard for anything else", () => {
    for (const value of ["https://evil.example/admin", "//evil.example/admin", "/shop", "", null, undefined, ["/admin"]]) {
      expect(safeAdminPath(value)).toBe("/admin");
    }
  });
});

describe("adminEntryUrl", () => {
  it("sends the link through sign-in with the target encoded", () => {
    expect(adminEntryUrl("/admin/reviews?highlight=1")).toBe("http://localhost:3100/admin/login?next=%2Fadmin%2Freviews%3Fhighlight%3D1");
  });
});
