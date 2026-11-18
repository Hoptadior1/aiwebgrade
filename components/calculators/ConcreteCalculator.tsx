"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { Advanced, FormError, NumberField, n } from "@/components/Fields";
import { BagTable, HeadlineStats, ShoppingList } from "@/components/Results";
import { SHAPES, calcProject, validateProject, type Item, type ProjectInput, type ProjectResult, type Shape } from "@/lib/calc/project";
import { fmt, money } from "@/lib/calc/concrete";
import { SLAB_DEFAULTS } from "@/lib/calc/slabcost";

const STEPS = ["Measuring each shape", "Adding up your project", "Converting to bags & yards", "Comparing bags vs ready-mix"];

type Row = { id: number; shape: Shape; qty: string; a: string; b: string; c: string; d: string };
const DEFAULTS: Record<Shape, Omit<Row, "id" | "shape">> = {
  slab: { qty: "1", a: "10", b: "10", c: "4", d: "" },
  circle: { qty: "1", a: "10", b: "", c: "4", d: "" },
  wall: { qty: "1", a: "20", b: "4", c: "8", d: "" },
  footing: { qty: "1", a: "50", b: "16", c: "8", d: "" },
  column: { qty: "6", a: "12", b: "48", c: "", d: "" },
  tube: { qty: "1", a: "12", b: "48", c: "", d: "8" },
};

let nextId = 2;
const LABEL = { bags80: "80 lb bags", bags60: "60 lb bags", readymix: "Ready-mix delivery" } as const;

export default function ConcreteCalculator() {
  const [rows, setRows] = useState<Row[]>([{ id: 1, shape: "slab", ...DEFAULTS.slab }]);
  const [waste, setWaste] = useState("10");
  const [p80, setP80] = useState(String(SLAB_DEFAULTS.bagPrice80));
  const [p60, setP60] = useState("5.25");
  const [rm, setRm] = useState(String(SLAB_DEFAULTS.readyMixPerYd));
  const [slf, setSlf] = useState(String(SLAB_DEFAULTS.shortLoadFee));
  const f = useFunnel<ProjectResult>();

  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const setShape = (id: number, shape: Shape) => update(id, { shape, ...DEFAULTS[shape] });
  const add = () => setRows((rs) => [...rs, { id: nextId++, shape: "column", ...DEFAULTS.column }]);
  const remove = (id: number) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));

  const input = (): ProjectInput => ({
    items: rows.map((r): Item => ({ id: r.id, shape: r.shape, qty: n(r.qty), a: n(r.a), b: n(r.b || "0"), c: n(r.c || "0"), d: n(r.d || "0") })),
    wastePct: n(waste || "0"),
    bagPrice80: n(p80 || "0") || 0,
    bagPrice60: n(p60 || "0") || 0,
    readyMixPerYd: n(rm || "0") || 0,
    shortLoadFee: n(slf || "0") || 0,
    shortLoadUnderYd: SLAB_DEFAULTS.shortLoadUnderYd,
  });

  const r = f.result;
  const costRows = (x: ProjectResult): [string, string][] => [
    ...(x.bags80Cost !== null ? ([[`80 lb bags: ${x.bags.find((b) => b.size === 80)!.bags} × $${p80}`, money(x.bags80Cost) + (x.cheapest === "bags80" ? "  ✓ cheapest" : "")]] as [string, string][]) : []),
    ...(x.bags60Cost !== null ? ([[`60 lb bags: ${x.bags.find((b) => b.size === 60)!.bags} × $${p60}`, money(x.bags60Cost) + (x.cheapest === "bags60" ? "  ✓ cheapest" : "")]] as [string, string][]) : []),
    ...(x.readyMixCost !== null
      ? ([[`Ready-mix: ${x.readyMixYd} yd × $${rm}${x.readyMixYd < SLAB_DEFAULTS.shortLoadUnderYd && n(slf || "0") > 0 ? ` + $${slf} short load` : ""}`, money(x.readyMixCost) + (x.cheapest === "readymix" ? "  ✓ cheapest" : "")]] as [string, string][])
      : []),
  ];

  return (
    <Funnel
      slug="concrete-calculator"
      toolName="Concrete Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() => ({
        title: "Want the full installed cost?",
        text: "Add gravel base, mesh or rebar, labor and finish to price your slab.",
        href: "/home-improvement/concrete-slab-cost-calculator",
        cta: "Concrete slab cost calculator",
      })}
      report={() =>
        r && {
          stats: [["Cubic yards", fmt(r.yd, 2)], ["Cubic feet", fmt(r.cuFt, 2)], ["80 lb bags", fmt(r.bags.find((b) => b.size === 80)!.bags, 0)], ["Ready-mix order", `${r.readyMixYd} yd`]],
          tables: [
            { title: "Project items", head: ["Item", "Cu ft"], rows: r.items.map((x) => [`${x.label}: ${x.detail}`, fmt(x.cuFt, 2)]) },
            { title: "Bagged concrete needed", head: ["Bag size", "Bags", "Total weight"], rows: r.bags.map((b) => [`${b.size} lb`, fmt(b.bags, 0), `${fmt(b.weightLb, 0)} lb`]) },
            ...(costRows(r).length ? [{ title: "Bags vs ready-mix", rows: costRows(r) }] : []),
          ],
          notes: [`Includes ${waste || 0}% waste.`, r.advice],
        }
      }
      inputSummary={rows.map((x, k) => [`Item ${k + 1}`, `${SHAPES[x.shape].label}${n(x.qty) > 1 ? ` × ${x.qty}` : ""}`] as [string, string])}
      input={
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); f.run(() => validateProject(input()), () => calcProject(input())); }}>
          {rows.map((row, k) => (
            <div key={row.id} className="rounded-lg border border-line bg-concrete/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs text-white">{k + 1}</span>
                <select
                  value={row.shape}
                  onChange={(e) => setShape(row.id, e.target.value as Shape)}
                  className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2 text-base font-semibold outline-none focus:border-blueprint"
                  aria-label={`Item ${k + 1} shape`}
                >
                  {(Object.keys(SHAPES) as Shape[]).map((s) => (
                    <option key={s} value={s}>{SHAPES[s].label}</option>
                  ))}
                </select>
                {rows.length > 1 && (
                  <button type="button" onClick={() => remove(row.id)} className="rounded-md px-2 py-1 text-sm text-steel hover:bg-white hover:text-red-700" aria-label={`Remove item ${k + 1}`}>
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SHAPES[row.shape].fields.map((fd) => (
                  <NumberField key={fd.key} label={fd.label} value={row[fd.key as "a" | "b" | "c" | "d"]} onChange={(v) => update(row.id, { [fd.key]: v } as Partial<Row>)} unit={fd.unit} />
                ))}
                <NumberField label="Quantity" value={row.qty} onChange={(v) => update(row.id, { qty: v })} step="1" min={1} />
              </div>
            </div>
          ))}
          <button type="button" onClick={add} className="w-full rounded-md border-2 border-dashed border-line py-2.5 text-sm font-semibold text-steel hover:border-safety hover:text-ink">
            + Add another shape (footings, posts, walls…)
          </button>
          <Advanced>
            <NumberField label="Waste / spillage" value={waste} onChange={setWaste} unit="%" hint="5–10% is typical" />
            <NumberField label="80 lb bag price" value={p80} onChange={setP80} unit="$" />
            <NumberField label="60 lb bag price" value={p60} onChange={setP60} unit="$" />
            <NumberField label="Ready-mix per cubic yard" value={rm} onChange={setRm} unit="$" hint="Typically $125–$200 delivered" />
            <NumberField label="Short-load fee (under 5 yd)" value={slf} onChange={setSlf} unit="$" />
          </Advanced>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Calculate concrete →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Cubic yards", value: fmt(r.yd, 2), sub: `order ${r.readyMixYd} yd ready-mix`, accent: true },
                { label: "80 lb bags", value: fmt(r.bags.find((b) => b.size === 80)!.bags, 0), sub: `${fmt(r.bags.find((b) => b.size === 60)!.bags, 0)} × 60 lb` },
                { label: "Cubic feet", value: fmt(r.cuFt, 2), sub: `incl. ${waste || 0}% waste` },
                { label: "Cheapest", value: r.cheapest ? (r.cheapest === "readymix" ? "Truck" : r.cheapest === "bags80" ? "80 lb" : "60 lb") : "n/a", sub: r.cheapest ? LABEL[r.cheapest] : "add prices" },
              ]}
            />
            {r.items.length > 1 && <ShoppingList title="Your project" items={r.items.map((x): [string, string] => [`${x.label}: ${x.detail}`, `${fmt(x.cuFt, 2)} cu ft`])} />}
            <p className="text-sm text-steel">{r.advice}</p>
            <div className="grid gap-6 md:grid-cols-2">
              <BagTable bags={r.bags} chosen={80} />
              {costRows(r).length > 0 && <ShoppingList title="Bags vs ready-mix cost" items={costRows(r)} />}
            </div>
          </>
        )
      }
    />
  );
}
