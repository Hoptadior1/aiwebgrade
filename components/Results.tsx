import type { ReactNode } from "react";
import { fmt } from "@/lib/calc/concrete";

export function HeadlineStats({ items }: { items: { label: string; value: string; sub?: string; accent?: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((s) => (
        <div
          key={s.label}
          className={`rounded-md border p-3 ${s.accent ? "border-safety bg-safety/10" : "border-line bg-concrete/40"}`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-steel">{s.label}</div>
          <div className="mt-1 font-mono text-2xl font-bold text-ink">{s.value}</div>
          {s.sub && <div className="text-xs text-steel">{s.sub}</div>}
        </div>
      ))}
    </div>
  );
}

export function BagTable({ bags, chosen }: { bags: { size: number; bags: number; weightLb: number }[]; chosen: number }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-steel">Bagged concrete needed</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-steel">
            <th className="py-1.5 font-semibold">Bag size</th>
            <th className="py-1.5 text-right font-semibold">Bags</th>
            <th className="py-1.5 text-right font-semibold">Total weight</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {bags.map((b) => (
            <tr key={b.size} className={`border-b border-line/60 ${b.size === chosen ? "bg-safety/10 font-bold" : ""}`}>
              <td className="py-1.5">{b.size} lb</td>
              <td className="py-1.5 text-right">{fmt(b.bags, 0)}</td>
              <td className="py-1.5 text-right">{fmt(b.weightLb, 0)} lb</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ShoppingList({ items }: { items: [string, string][] }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-steel">Shopping list</h3>
      <ul className="divide-y divide-line/60 rounded-md border border-line">
        {items.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-4 px-3 py-2 text-sm">
            <span>{k}</span>
            <span className="text-right font-mono font-semibold">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Warnings({ items, note }: { items: string[]; note?: ReactNode }) {
  if (!items.length && !note) return null;
  return (
    <div className="space-y-2">
      {items.map((w) => (
        <div key={w} className="rounded-md border-l-4 border-safety bg-safety/10 px-3 py-2 text-sm">
          ⚠ {w}
        </div>
      ))}
      {note && <div className="rounded-md bg-concrete/60 px-3 py-2 text-sm text-steel">{note}</div>}
    </div>
  );
}
