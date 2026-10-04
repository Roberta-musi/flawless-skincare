import "server-only";
import { and, asc, eq, max, ne } from "drizzle-orm";
import { requireOwner } from "@/lib/auth";
import { hashPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db";
import { account, session, user } from "@/lib/db/schema";
import type { TeamMemberInput, TeamMemberUpdate } from "@/lib/validation/admin";

export type TeamResult = { ok: true } | { ok: false; errors: Record<string, string> };

const emailTaken: TeamResult = { ok: false, errors: { email: "Someone on the team already uses this email." } };
const gone: TeamResult = { ok: false, errors: { form: "This person is no longer on the team." } };

export async function listTeam() {
  const { user: me } = await requireOwner();
  const db = await getDb();
  const [members, activity] = await Promise.all([
    db.select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }).from(user).orderBy(asc(user.createdAt)),
    db.select({ userId: session.userId, at: max(session.updatedAt) }).from(session).groupBy(session.userId),
  ]);
  const lastActive = new Map(activity.map((row) => [row.userId, row.at]));
  return members.map((member) => ({ ...member, lastActiveAt: lastActive.get(member.id) ?? null, isYou: member.id === me.id }));
}

export type TeamMember = Awaited<ReturnType<typeof listTeam>>[number];

export async function addTeamMember(input: TeamMemberInput): Promise<TeamResult> {
  await requireOwner();
  const db = await getDb();
  if (await db.query.user.findFirst({ where: eq(user.email, input.email), columns: { id: true } })) return emailTaken;
  const id = crypto.randomUUID();
  const now = new Date();
  const hash = await hashPassword(input.password);
  await db.batch([
    db.insert(user).values({ id, name: input.name, email: input.email, emailVerified: true, role: input.role, createdAt: now, updatedAt: now }),
    db.insert(account).values({ id: crypto.randomUUID(), accountId: id, providerId: "credential", userId: id, password: hash, createdAt: now, updatedAt: now }),
  ]);
  return { ok: true };
}

// Owners can't edit, demote or remove themselves, so the team always keeps at least one owner.
export async function updateTeamMember(id: string, input: TeamMemberUpdate): Promise<TeamResult> {
  const { user: me } = await requireOwner();
  if (id === me.id) return { ok: false, errors: { form: "Change your own details from My account." } };
  const db = await getDb();
  if (!(await db.query.user.findFirst({ where: eq(user.id, id), columns: { id: true } }))) return gone;
  if (await db.query.user.findFirst({ where: and(eq(user.email, input.email), ne(user.id, id)), columns: { id: true } })) return emailTaken;
  await db.update(user).set({ ...input, updatedAt: new Date() }).where(eq(user.id, id));
  return { ok: true };
}

export async function setTeamMemberPassword(id: string, password: string): Promise<TeamResult> {
  const { user: me } = await requireOwner();
  if (id === me.id) return { ok: false, errors: { form: "Change your own password from My account." } };
  const db = await getDb();
  if (!(await db.query.user.findFirst({ where: eq(user.id, id), columns: { id: true } }))) return gone;
  const now = new Date();
  const hash = await hashPassword(password);
  await db.batch([
    db.delete(account).where(and(eq(account.userId, id), eq(account.providerId, "credential"))),
    db.insert(account).values({ id: crypto.randomUUID(), accountId: id, providerId: "credential", userId: id, password: hash, createdAt: now, updatedAt: now }),
    db.delete(session).where(eq(session.userId, id)),
  ]);
  return { ok: true };
}

export async function removeTeamMember(id: string): Promise<TeamResult> {
  const { user: me } = await requireOwner();
  if (id === me.id) return { ok: false, errors: { form: "You can't remove yourself from the team." } };
  const db = await getDb();
  await db.batch([db.delete(session).where(eq(session.userId, id)), db.delete(account).where(eq(account.userId, id)), db.delete(user).where(eq(user.id, id))]);
  return { ok: true };
}
