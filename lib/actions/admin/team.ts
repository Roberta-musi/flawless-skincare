"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { getAuth, requireAdmin } from "@/lib/auth";
import { addTeamMember, removeTeamMember, setTeamMemberPassword, type TeamResult, updateTeamMember } from "@/lib/data/admin/team";
import { fieldErrors, nameSchema, passwordChangeSchema, passwordSchema, teamMemberSchema, teamMemberUpdateSchema } from "@/lib/validation/admin";

export async function addTeamMemberAction(payload: unknown): Promise<TeamResult> {
  const parsed = teamMemberSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return addTeamMember(parsed.data);
}

export async function updateTeamMemberAction(id: string, payload: unknown): Promise<TeamResult> {
  const parsed = teamMemberUpdateSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return updateTeamMember(id, parsed.data);
}

export async function setTeamMemberPasswordAction(id: string, payload: unknown): Promise<TeamResult> {
  const parsed = passwordSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return setTeamMemberPassword(id, parsed.data.password);
}

export async function removeTeamMemberAction(id: string): Promise<TeamResult> {
  return removeTeamMember(id);
}

export async function updateMyNameAction(payload: unknown): Promise<TeamResult> {
  await requireAdmin();
  const parsed = nameSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const auth = await getAuth();
  await auth.api.updateUser({ body: { name: parsed.data.name }, headers: await headers() });
  return { ok: true };
}

export async function changeMyPasswordAction(payload: unknown): Promise<TeamResult> {
  await requireAdmin();
  const parsed = passwordChangeSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const auth = await getAuth();
  try {
    await auth.api.changePassword({
      body: { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError && error.status === "BAD_REQUEST") return { ok: false, errors: { currentPassword: "That isn't your current password." } };
    throw error;
  }
  return { ok: true };
}
