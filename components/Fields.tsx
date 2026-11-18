"use client";

import type { ReactNode } from "react";

export function NumberField({
  label,
  value,
  onChange,
  unit,
  hint,
  step = "any",
  min = 0,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  hint?: ReactNode;
  step?: string;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      <span className="flex overflow-hidden rounded-md border border-line bg-white focus-within:border-blueprint focus-within:ring-2 focus-within:ring-blueprint/20">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 px-3 py-2.5 font-mono text-base outline-none"
        />
        {unit && <span className="flex items-center border-l border-line bg-concrete px-3 font-mono text-sm text-steel">{unit}</span>}
      </span>
      {hint && <span className="mt-1 block text-xs text-steel">{hint}</span>}
    </label>
  );
}

export function SelectField<T extends string | number>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  hint?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      <select
        value={String(value)}
        onChange={(e) => {
          const o = options.find((x) => String(x.value) === e.target.value)!;
          onChange(o.value);
        }}
        className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs text-steel">{hint}</span>}
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      <div className="grid gap-1 rounded-md bg-concrete p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
        {options.map((o) => (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded px-3 py-2 text-sm font-semibold transition ${
              value === o.value ? "bg-white text-ink shadow-sm" : "text-steel hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
      {error}
    </div>
  );
}

export function Advanced({ children }: { children: ReactNode }) {
  return (
    <details className="group rounded-md border border-line bg-concrete/40">
      <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-steel group-open:border-b group-open:border-line">
        Advanced: waste, bag size & prices
      </summary>
      <div className="grid gap-4 p-4 sm:grid-cols-2">{children}</div>
    </details>
  );
}

export const n = (s: string) => (s.trim() === "" ? NaN : Number(s));
