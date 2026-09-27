"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { siteUrl } from "@/lib/site";

export type AuthState = { error?: string; done?: boolean };

function safeNext(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const auth = await getAuth();
  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError && error.status === "TOO_MANY_REQUESTS") {
      return { error: "Too many attempts. Please wait a minute and try again." };
    }
    return { error: "That email and password don't match. Please try again." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  const auth = await getAuth();
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}

export async function requestReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter your email address." };
  const auth = await getAuth();
  try {
    await auth.api.requestPasswordReset({ body: { email, redirectTo: `${siteUrl()}/admin/reset-password` } });
  } catch (error) {
    if (error instanceof APIError && error.status === "TOO_MANY_REQUESTS") {
      return { error: "Too many requests. Please wait a few minutes." };
    }
  }
  return { done: true };
}

export async function resetPassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 10) return { error: "Use at least 10 characters." };
  if (password !== confirm) return { error: "The two passwords don't match." };
  const auth = await getAuth();
  try {
    await auth.api.resetPassword({ body: { newPassword: password, token } });
  } catch {
    return { error: "This reset link has expired or was already used. Request a new one." };
  }
  return { done: true };
}
