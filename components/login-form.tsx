"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";
import { Field } from "./ui";

export function LoginForm({ labels }: { labels: { phone: string; pin: string; submit: string; error: string } }) {
  const [state, action, pending] = useActionState(login, null as { error?: boolean } | null);
  return (
    <form action={action} className="space-y-4">
      <Field label={labels.phone}>
        <input name="phone" type="tel" autoComplete="username" required className="field field-mono" placeholder="+992 90 000 00 00" />
      </Field>
      <Field label={labels.pin}>
        <input name="pin" type="password" inputMode="numeric" autoComplete="current-password" required className="field field-mono" placeholder="••••" />
      </Field>
      {state?.error && (
        <p role="alert" className="note note-warn text-sm">
          {labels.error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={pending}>
        {labels.submit}
      </button>
    </form>
  );
}
