import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyPassword } from "@/lib/auth/password";
import { account, session, user } from "@/lib/db/schema";
import { resetTestDb } from "@/tests/support/db";

const auth = vi.hoisted(() => ({ requireOwner: vi.fn() }));
vi.mock("@/lib/auth", () => auth);

const { addTeamMember, listTeam, removeTeamMember, setTeamMemberPassword, updateTeamMember } = await import("./team");

let db: Awaited<ReturnType<typeof resetTestDb>>;
const now = new Date();

beforeEach(async () => {
  db = await resetTestDb();
  await db.insert(user).values({ id: "owner", name: "Musi Owner", email: "owner@flawless.test", role: "owner", createdAt: now, updatedAt: now });
  auth.requireOwner.mockReset().mockResolvedValue({ user: { id: "owner", name: "Musi Owner", email: "owner@flawless.test", role: "owner" } });
});

async function addManager() {
  await addTeamMember({ name: "Shop Manager", email: "manager@flawless.test", role: "manager", password: "first-password" });
  const row = await db.query.user.findFirst({ where: eq(user.email, "manager@flawless.test") });
  await db.insert(session).values({ id: "s1", token: "t1", userId: row!.id, expiresAt: new Date(Date.now() + 86_400_000), createdAt: now, updatedAt: now });
  return row!.id;
}

async function passwordOf(userId: string) {
  return (await db.query.account.findFirst({ where: eq(account.userId, userId) }))!.password!;
}

describe("team", () => {
  it("adds a member who can sign in with their password, and lists the team", async () => {
    const id = await addManager();
    expect(await verifyPassword({ hash: await passwordOf(id), password: "first-password" })).toBe(true);

    const team = await listTeam();
    expect(team.map((m) => [m.email, m.role, m.isYou])).toEqual([
      ["owner@flawless.test", "owner", true],
      ["manager@flawless.test", "manager", false],
    ]);
    expect(team[1].lastActiveAt).toEqual(now);
  });

  it("refuses an email already on the team", async () => {
    await addManager();
    const result = await addTeamMember({ name: "Copy", email: "manager@flawless.test", role: "manager", password: "another-password" });
    expect(result).toEqual({ ok: false, errors: { email: "Someone on the team already uses this email." } });
    const other = await addTeamMember({ name: "Second", email: "second@flawless.test", role: "manager", password: "another-password" });
    const id = (await db.query.user.findFirst({ where: eq(user.email, "second@flawless.test") }))!.id;
    expect(other.ok).toBe(true);
    expect(await updateTeamMember(id, { name: "Second", email: "manager@flawless.test", role: "manager" })).toMatchObject({ ok: false });
  });

  it("changes a member's details and role", async () => {
    const id = await addManager();
    expect(await updateTeamMember(id, { name: "Co-owner", email: "co@flawless.test", role: "owner" })).toEqual({ ok: true });
    expect(await db.query.user.findFirst({ where: eq(user.id, id) })).toMatchObject({ name: "Co-owner", email: "co@flawless.test", role: "owner" });
  });

  it("sets a new password and signs the member out", async () => {
    const id = await addManager();
    expect(await setTeamMemberPassword(id, "second-password")).toEqual({ ok: true });
    expect(await verifyPassword({ hash: await passwordOf(id), password: "second-password" })).toBe(true);
    expect(await db.query.account.findMany({ where: eq(account.userId, id) })).toHaveLength(1);
    expect(await db.query.session.findMany({ where: eq(session.userId, id) })).toHaveLength(0);
  });

  it("removes a member with their sign-in and sessions", async () => {
    const id = await addManager();
    expect(await removeTeamMember(id)).toEqual({ ok: true });
    expect(await db.query.user.findFirst({ where: eq(user.id, id) })).toBeUndefined();
    expect(await db.query.account.findMany({ where: eq(account.userId, id) })).toHaveLength(0);
    expect(await db.query.session.findMany({ where: eq(session.userId, id) })).toHaveLength(0);
  });

  it("never lets owners demote, lock out or remove themselves", async () => {
    expect(await updateTeamMember("owner", { name: "Musi", email: "owner@flawless.test", role: "manager" })).toMatchObject({ ok: false });
    expect(await setTeamMemberPassword("owner", "new-password-1")).toMatchObject({ ok: false });
    expect(await removeTeamMember("owner")).toMatchObject({ ok: false });
    expect(await db.query.user.findFirst({ where: eq(user.id, "owner") })).toMatchObject({ role: "owner" });
  });

  it("is owner only", async () => {
    auth.requireOwner.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(listTeam()).rejects.toThrow("NEXT_REDIRECT");
    await expect(addTeamMember({ name: "X", email: "x@flawless.test", role: "owner", password: "0123456789" })).rejects.toThrow("NEXT_REDIRECT");
    await expect(removeTeamMember("owner")).rejects.toThrow("NEXT_REDIRECT");
  });
});
