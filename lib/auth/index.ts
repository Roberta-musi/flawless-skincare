import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { account, rateLimit, session, user, verification } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/site";
import { hashPassword, verifyPassword } from "./password";

async function createAuth() {
  const db = await getDb();
  return betterAuth({
    appName: "Flawless Skin Care",
    baseURL: siteUrl(),
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "sqlite", schema: { user, session, account, verification, rateLimit } }),
    user: {
      additionalFields: {
        role: { type: "string", required: false, defaultValue: "manager", input: false },
      },
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 10,
      revokeSessionsOnPasswordReset: true,
      password: { hash: hashPassword, verify: verifyPassword },
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Reset your Flawless Skin Care admin password",
          text: `Hello ${user.name},\n\nUse this link to choose a new password. It expires in one hour.\n\n${url}\n\nIf you did not ask for this, you can ignore this email.`,
        });
      },
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: process.env.NODE_ENV === "production",
      storage: "database",
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/request-password-reset": { window: 300, max: 3 },
      },
    },
    plugins: [nextCookies()],
  });
}

export const getAuth = cache(createAuth);

export type AdminRole = (typeof user.role.enumValues)[number];

export const getAdminSession = cache(async () => {
  // Request headers first: Better Auth's setup uses randomness, which Next.js refuses during prerendering.
  const requestHeaders = await headers();
  const auth = await getAuth();
  const result = await auth.api.getSession({ headers: requestHeaders });
  if (!result) return null;
  const role = (result.user as { role?: string }).role;
  if (role !== "owner" && role !== "manager") return null;
  return { user: { id: result.user.id, name: result.user.name, email: result.user.email, role: role as AdminRole } };
});

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requireOwner() {
  const session = await requireAdmin();
  if (session.user.role !== "owner") redirect("/admin");
  return session;
}
