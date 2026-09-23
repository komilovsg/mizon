"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerDealer } from "@/app/actions";
import { Field } from "./ui";

type Labels = Record<
  "company" | "inn" | "contact" | "phone" | "pin" | "submit" | "done" | "doneBody" | "taken" | "invalid" | "login",
  string
>;

export function RegisterForm({ labels }: { labels: Labels }) {
  const [state, action, pending] = useActionState(registerDealer, null as Awaited<ReturnType<typeof registerDealer>> | null);

  if (state && "ok" in state) {
    return (
      <div className="card p-6">
        <p className="title text-xl text-go">{labels.done}</p>
        <p className="mt-3 text-muted">{labels.doneBody}</p>
        <Link href="/" className="btn btn-primary mt-6 block text-center">
          {labels.login}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-5 p-6">
      <Field label={labels.company}>
        <input name="name" required maxLength={200} autoComplete="organization" className="field" />
      </Field>
      <Field label={labels.inn}>
        <input name="inn" maxLength={30} inputMode="numeric" className="field field-mono" />
      </Field>
      <Field label={labels.contact}>
        <input name="contact" required maxLength={120} autoComplete="name" className="field" />
      </Field>
      <Field label={labels.phone}>
        <input name="phone" type="tel" required autoComplete="tel" className="field field-mono" placeholder="+992 90 000 00 00" />
      </Field>
      <Field label={labels.pin}>
        <input
          name="pin"
          required
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          autoComplete="new-password"
          className="field field-mono text-2xl"
          placeholder="0000"
        />
      </Field>

      {state && "error" in state && (
        <p role="alert" className="note note-warn text-sm">
          {state.error === "taken" ? labels.taken : labels.invalid}
        </p>
      )}

      <button className="btn btn-primary w-full text-lg" disabled={pending}>
        {labels.submit}
      </button>
    </form>
  );
}
