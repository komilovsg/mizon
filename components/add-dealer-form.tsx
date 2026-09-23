"use client";

import { useActionState } from "react";
import { addDealer } from "@/app/actions";
import { Field } from "./ui";

type Labels = Record<"company" | "inn" | "contact" | "phone" | "submit" | "added" | "taken" | "invalid", string>;

export function AddDealerForm({ labels }: { labels: Labels }) {
  const [state, action, pending] = useActionState(addDealer, null as Awaited<ReturnType<typeof addDealer>> | null);

  return (
    <details className="card p-5">
      <summary className="title cursor-pointer">{labels.submit}</summary>

      {state && "ok" in state && (
        // PIN показывается один раз: диспетчер диктует его дилеру по телефону.
        <div className="mt-5 note note-ok">
          <p className="text-sm">{labels.added}</p>
          <p className="mono mt-2 text-xl font-bold">
            {state.phone} · PIN {state.pin}
          </p>
        </div>
      )}

      <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label={labels.company}>
          <input name="name" required maxLength={200} className="field" />
        </Field>
        <Field label={labels.inn}>
          <input name="inn" maxLength={30} inputMode="numeric" className="field field-mono" />
        </Field>
        <Field label={labels.contact}>
          <input name="contact" required maxLength={120} className="field" />
        </Field>
        <Field label={labels.phone}>
          <input name="phone" type="tel" required className="field field-mono" placeholder="+992 90 000 00 00" />
        </Field>

        {state && "error" in state && (
          <p role="alert" className="note note-warn text-sm sm:col-span-2">
            {state.error === "taken" ? labels.taken : labels.invalid}
          </p>
        )}

        <button className="btn btn-primary text-lg sm:col-span-2" disabled={pending}>
          {labels.submit}
        </button>
      </form>
    </details>
  );
}
