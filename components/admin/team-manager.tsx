"use client";

import { KeyRound, Plus, Trash2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/site/sheet";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { addTeamMemberAction, removeTeamMemberAction, setTeamMemberPasswordAction, updateTeamMemberAction } from "@/lib/actions/admin/team";
import { timeAgo } from "@/lib/admin-format";
import type { TeamMember } from "@/lib/data/admin/team";
import type { TeamMemberInput } from "@/lib/validation/admin";
import { SaveBar, TextField } from "./form-kit";
import { Card, StatusPill } from "./ui";

type Role = TeamMember["role"];

const roles: { id: Role; label: string; description: string }[] = [
  { id: "manager", label: "Manager", description: "Runs the shop day to day: products, bookings, reviews and website content." },
  { id: "owner", label: "Owner", description: "Everything a manager can do, plus adding and removing team members." },
];

// Leaves out look-alike characters so the password survives being read out or typed from a phone.
function suggestPassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint32Array(14)), (n) => alphabet[n % alphabet.length]).join("");
}

function PasswordField({ id, label, value, onChange, error }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <Field label={label} htmlFor={id} error={error} hint="At least 10 characters. Share it privately; they can change it from My account.">
      <div className="flex gap-2">
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="new-password" spellCheck={false} aria-invalid={Boolean(error)} className="font-mono" />
        <Button variant="secondary" size="sm" className="h-12" onClick={() => onChange(suggestPassword())}>
          <Wand2 />
          Suggest
        </Button>
      </div>
    </Field>
  );
}

function RoleField({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  return (
    <Field label="Role" htmlFor="member-role" hint={roles.find((r) => r.id === value)?.description}>
      <Select id="member-role" value={value} onChange={(e) => onChange(e.target.value as Role)}>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}

export function TeamManager({ members }: { members: TeamMember[] }) {
  const [editing, setEditing] = useState<TeamMember | "new" | null>(null);
  return (
    <>
      <Card
        title="Members"
        description="Everyone here can sign in to this admin panel."
        actions={
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus />
            Add
          </Button>
        }
      >
        <ul className="-mx-2 flex flex-col">
          {members.map((member) => (
            <li key={member.id}>
              <button
                type="button"
                disabled={member.isYou}
                onClick={() => setEditing(member)}
                className="flex w-full items-center gap-4 rounded-2xl px-2 py-3 text-left transition-colors enabled:hover:bg-cream/70"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush font-display text-xl text-fuchsia-deep">{member.name.charAt(0).toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {member.name}
                    {member.isYou && <span className="font-normal text-muted"> (you)</span>}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {member.email} · {member.lastActiveAt ? `active ${timeAgo(member.lastActiveAt)}` : "not signed in"}
                  </span>
                </span>
                <StatusPill status={member.role === "owner" ? "confirmed" : "draft"}>{member.role}</StatusPill>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Sheet
        open={editing != null}
        onClose={() => setEditing(null)}
        side="right"
        label={editing === "new" ? "Add a team member" : "Edit team member"}
        closeLabel="Close"
        header={<h2 className="text-2xl">{editing === "new" ? "Add a team member" : editing?.name}</h2>}
        className="sm:w-[32rem]"
      >
        {editing === "new" && <NewMemberForm onDone={() => setEditing(null)} />}
        {editing && editing !== "new" && <EditMemberForm key={editing.id} member={editing} onDone={() => setEditing(null)} />}
      </Sheet>
    </>
  );
}

function NewMemberForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [draft, setDraft] = useState<TeamMemberInput>({ name: "", email: "", role: "manager", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 sm:px-6">
        <TextField id="member-name" label="Full name" value={draft.name} onChange={(name) => setDraft((d) => ({ ...d, name }))} error={errors.name} />
        <TextField id="member-email" label="Email" type="email" value={draft.email} onChange={(email) => setDraft((d) => ({ ...d, email }))} error={errors.email} hint="They sign in with this address." />
        <RoleField value={draft.role} onChange={(role) => setDraft((d) => ({ ...d, role }))} />
        <PasswordField id="member-password" label="First password" value={draft.password} onChange={(password) => setDraft((d) => ({ ...d, password }))} error={errors.password} />
      </div>
      <div className="px-5 pb-5 sm:px-6">
        <SaveBar
          saving={saving}
          dirty
          label="Add to team"
          onSave={() =>
            startSaving(async () => {
              const result = await addTeamMemberAction(draft);
              if (!result.ok) {
                setErrors(result.errors);
                toast.error(result.errors.form ?? "Please fix the highlighted fields.");
                return;
              }
              toast.success(`${draft.name} can now sign in at /admin.`);
              onDone();
              router.refresh();
            })
          }
        />
      </div>
    </>
  );
}

function EditMemberForm({ member, onDone }: { member: TeamMember; onDone: () => void }) {
  const router = useRouter();
  const [draft, setDraft] = useState({ name: member.name, email: member.email, role: member.role });
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();

  const run = (action: () => Promise<{ ok: true } | { ok: false; errors: Record<string, string> }>, success: string) =>
    startSaving(async () => {
      const result = await action();
      if (!result.ok) {
        setErrors(result.errors);
        toast.error(result.errors.form ?? "Please fix the highlighted fields.");
        return;
      }
      toast.success(success);
      onDone();
      router.refresh();
    });

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-5">
          <TextField id="member-name" label="Full name" value={draft.name} onChange={(name) => setDraft((d) => ({ ...d, name }))} error={errors.name} />
          <TextField id="member-email" label="Email" type="email" value={draft.email} onChange={(email) => setDraft((d) => ({ ...d, email }))} error={errors.email} />
          <RoleField value={draft.role} onChange={(role) => setDraft((d) => ({ ...d, role }))} />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-cream/70 p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <KeyRound className="size-4" />
            Set a new password
          </p>
          <p className="text-xs leading-5 text-muted">For when they forget it. They are signed out everywhere and use the new password from now on.</p>
          <PasswordField id="member-new-password" label="New password" value={password} onChange={setPassword} error={errors.password} />
          <Button
            variant="secondary"
            size="sm"
            className="self-start"
            disabled={saving || !password}
            onClick={() => run(() => setTeamMemberPasswordAction(member.id, { password }), `New password set for ${member.name}.`)}
          >
            Set password
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="self-start text-danger hover:bg-danger/10"
          disabled={saving}
          onClick={() => confirm(`Remove ${member.name} from the team? They will be signed out and can no longer sign in.`) && run(() => removeTeamMemberAction(member.id), `${member.name} was removed from the team.`)}
        >
          <Trash2 />
          Remove from team
        </Button>
      </div>
      <div className="px-5 pb-5 sm:px-6">
        <SaveBar saving={saving} dirty label="Save" onSave={() => run(() => updateTeamMemberAction(member.id, draft), "Team member updated.")} />
      </div>
    </>
  );
}
