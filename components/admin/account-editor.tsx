"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { changeMyPasswordAction, updateMyNameAction } from "@/lib/actions/admin/team";
import { TextField } from "./form-kit";
import { Card } from "./ui";

export function AccountEditor({ user }: { user: { name: string; email: string; role: string } }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();

  function saveName() {
    startSaving(async () => {
      const result = await updateMyNameAction({ name });
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setErrors({});
      toast.success("Name updated.");
      router.refresh();
    });
  }

  function changePassword() {
    startSaving(async () => {
      const result = await changeMyPasswordAction(passwords);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setErrors({});
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Password changed. Any other devices were signed out.");
    });
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
      <Card title="Your details" description={`You sign in as ${user.email} (${user.role}).`}>
        <div className="flex flex-col gap-5">
          <TextField id="account-name" label="Name" value={name} onChange={setName} error={errors.name} />
          <Button size="sm" className="self-start" disabled={saving || !name.trim() || name === user.name} onClick={saveName}>
            Save name
          </Button>
        </div>
      </Card>

      <Card title="Change password" description="You stay signed in here; any other phone or computer is signed out.">
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            changePassword();
          }}
        >
          <input type="email" name="username" autoComplete="username" value={user.email} readOnly hidden />
          <TextField id="current-password" label="Current password" type="password" value={passwords.currentPassword} onChange={(currentPassword) => setPasswords((p) => ({ ...p, currentPassword }))} error={errors.currentPassword} />
          <TextField id="new-password" label="New password" type="password" value={passwords.newPassword} onChange={(newPassword) => setPasswords((p) => ({ ...p, newPassword }))} error={errors.newPassword} hint="At least 10 characters." />
          <TextField id="confirm-password" label="New password again" type="password" value={passwords.confirm} onChange={(confirm) => setPasswords((p) => ({ ...p, confirm }))} error={errors.confirm} />
          <Button type="submit" size="sm" className="self-start" disabled={saving || !passwords.currentPassword || !passwords.newPassword}>
            Change password
          </Button>
        </form>
      </Card>
    </div>
  );
}
