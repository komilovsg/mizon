"use client";

import { useActionState, useRef, useState } from "react";
import { login } from "@/app/actions";
import { Field } from "./ui";

export type DemoAccount = { label: string; phone: string; pin: string };

type Labels = { phone: string; pin: string; submit: string; error: string; demo: string };

export function LoginForm({ labels, demo }: { labels: Labels; demo: DemoAccount[] }) {
  const [state, action, pending] = useActionState(login, null as { error?: boolean } | null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const form = useRef<HTMLFormElement>(null);

  // На телефоне набирать +992900000001 и PIN — мучение. Одно касание заполняет и входит.
  const enter = (account: DemoAccount) => {
    setPhone(account.phone);
    setPin(account.pin);
    requestAnimationFrame(() => form.current?.requestSubmit());
  };

  return (
    <>
      <form ref={form} action={action} className="space-y-4">
        <Field label={labels.phone}>
          <input
            name="phone"
            type="tel"
            autoComplete="username"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="field field-mono"
            placeholder="+992 90 000 00 00"
          />
        </Field>
        <Field label={labels.pin}>
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            required
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="field field-mono"
            placeholder="••••"
          />
        </Field>
        {state?.error && (
          <p role="alert" className="note note-warn text-sm">
            {labels.error}
          </p>
        )}
        <button className="btn btn-primary w-full text-lg" disabled={pending}>
          {labels.submit}
        </button>
      </form>

      {demo.length > 0 && (
        <div className="mt-7 border-t border-line pt-5">
          <p className="label mb-3">{labels.demo}</p>
          <div className="grid grid-cols-2 gap-2">
            {demo.map((account) => (
              <button
                key={account.phone}
                type="button"
                onClick={() => enter(account)}
                disabled={pending}
                className="btn justify-start text-left"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
