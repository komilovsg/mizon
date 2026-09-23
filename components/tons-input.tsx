"use client";

import { useState } from "react";

const PRESETS = [10, 15, 20, 25, 30, 40];

/** Дилеры заказывают круглыми числами. Одно нажатие вместо клавиатуры. */
export function TonsInput({ label, unit }: { label: string; unit: string }) {
  const [tons, setTons] = useState("30");
  return (
    <div>
      <span className="label mb-1.5 block">{label}</span>
      <div className="flex items-stretch gap-2">
        <input
          name="tons"
          type="number"
          min={1}
          max={500}
          required
          inputMode="numeric"
          value={tons}
          onChange={(e) => setTons(e.target.value)}
          style={{ width: "7rem" }}
          className="field num text-2xl font-bold"
          aria-label={label}
        />
        <span className="self-center text-lg text-muted">{unit}</span>
      </div>
      <div className="mt-2 grid grid-cols-6 gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setTons(String(p))}
            aria-pressed={tons === String(p)}
            className="chip"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
