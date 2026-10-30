import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the right password and rejects the wrong one", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).toMatch(/^pbkdf2:100000:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
    expect(await verifyPassword({ hash, password: "correct horse battery" })).toBe(true);
    expect(await verifyPassword({ hash, password: "correct horse batterY" })).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("rejects malformed hashes", async () => {
    expect(await verifyPassword({ hash: "scrypt:abc", password: "x" })).toBe(false);
    expect(await verifyPassword({ hash: "", password: "x" })).toBe(false);
  });
});
