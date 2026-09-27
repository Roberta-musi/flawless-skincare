import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/auth-forms";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };
export const instant = false;

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdminSession()) redirect("/admin");
  const next = (await searchParams).next;
  return (
    <AuthShell title="Welcome back" intro="Sign in to manage the shop, bookings and reviews.">
      <LoginForm next={typeof next === "string" ? next : null} />
    </AuthShell>
  );
}
