import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeAdminPath } from "@/lib/admin-links";
import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/auth-forms";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const next = (await searchParams).next;
  if (await getAdminSession()) redirect(safeAdminPath(next));
  return (
    <AuthShell title="Welcome back" intro="Sign in to manage the shop, bookings and reviews.">
      <LoginForm next={typeof next === "string" ? next : null} />
    </AuthShell>
  );
}
