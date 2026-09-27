"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormAlert } from "@/components/forms/form-extras";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { type AuthState, requestReset, resetPassword, signIn } from "@/lib/actions/auth";

const initial: AuthState = {};

export function LoginForm({ next }: { next: string | null }) {
  const [state, action, pending] = useActionState(signIn, initial);
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state.error && <FormAlert>{state.error}</FormAlert>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <Link href="/admin/reset-password" className="self-center text-sm text-muted underline-offset-4 hover:text-plum hover:underline">
        Forgot your password?
      </Link>
    </form>
  );
}

export function RequestResetForm() {
  const [state, action, pending] = useActionState(requestReset, initial);
  if (state.done) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-2xl bg-success/10 px-5 py-4 text-sm leading-6 text-success">
          If that email belongs to an admin account, a reset link is on its way. It expires in one hour.
        </p>
        <Link href="/admin/login" className="text-sm text-fuchsia underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-5">
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      {state.error && <FormAlert>{state.error}</FormAlert>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <Link href="/admin/login" className="self-center text-sm text-muted underline-offset-4 hover:text-plum hover:underline">
        Back to sign in
      </Link>
    </form>
  );
}

export function NewPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initial);
  if (state.done) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-2xl bg-success/10 px-5 py-4 text-sm leading-6 text-success">Your password has been changed.</p>
        <Link href="/admin/login" className="text-sm text-fuchsia underline underline-offset-4">
          Sign in
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <Field label="New password" htmlFor="password" hint="At least 10 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required autoFocus />
      </Field>
      <Field label="Repeat new password" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      {state.error && <FormAlert>{state.error}</FormAlert>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
