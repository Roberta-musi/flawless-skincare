import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth-shell";
import { NewPasswordForm, RequestResetForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/admin/reset-password">) {
  const { token, error } = await searchParams;
  return (
    <AuthShell title="Reset password" intro="We'll email you a link to choose a new password.">
      {typeof token === "string" && token && !error ? (
        <NewPasswordForm token={token} />
      ) : (
        <>
          {error && (
            <p className="rounded-2xl bg-danger/8 px-5 py-4 text-sm text-danger">
              This reset link has expired or was already used. Request a new one.
            </p>
          )}
          <RequestResetForm />
        </>
      )}
    </AuthShell>
  );
}
