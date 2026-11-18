"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { Advanced, FormError, NumberField, SelectField, n } from "@/components/Fields";
import { HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { AREA_SHAPES, GRAVEL_TONS_PER_YD, calcGravel, validateGravel, type AreaShape, type GravelInput, type GravelResult } from "@/lib/calc/gravel";
import { fmt, money } from "@/lib/calc/concrete";

const STEPS = ["Measuring each area", "Applying depth & compaction", "Converting to tons & yards", "Comparing bulk vs bags"];

type Row = { id: number; shape: AreaShape; a: string; b: string; depth: string };
const DEF: Record<AreaShape, Omit<Row, "id" | "shape">> = {
  rect: { a: "50", b: "12", depth: "4" },
  circle: { a: "12", b: "", depth: "3" },
  triangle: { a: "10", b: "8", depth: "3" },
};
let nextId = 2;

export default function GravelCalculator() {
  const [rows, setRows] = useState<Row[]>([{ id: 1, shape: "rect", ...DEF.rect }]);
  const [comp, setComp] = useState("10");
  const [density, setDensity] = useState(String(GRAVEL_TONS_PER_YD));
  const [ton, setTon] = useState("40");
  const [deliv, setDeliv] = useState("75");
  const [bag, setBag] = useState("");
  const [fabric, setFabric] = useState<"yes" | "no">("yes");
  const f = useFunnel<GravelResult>();

  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const input = (): GravelInput => ({
    areas: rows.map((r) => ({ id: r.id, shape: r.shape, a: n(r.a), b: n(r.b || "0"), depthIn: n(r.depth) })),
    compactionPct: n(comp || "0"),
    tonsPerYd: n(density),
    pricePerTon: n(ton || "0") || 0,
    deliveryFee: n(deliv || "0") || 0,
    bagPrice: n(bag || "0") || 0,
    fabric: fabric === "yes",
  });

  const r = f.result;
  const shopping = (x: GravelResult): [string, string][] => [
    ["Gravel (bulk)", `${fmt(x.tons, 2)} tons / ${fmt(x.yd, 2)} cu yd`],
    ["or bagged (0.5 cu ft bags)", `${x.bags} bags`],
    ...(x.fabricSqFt ? ([["Landscape fabric", `${x.fabricSqFt} sq ft`]] as [string, string][]) : []),
    ...(x.bulkCost !== null ? ([["Bulk cost (incl. delivery)", money(x.bulkCost)]] as [string, string][]) : []),
    ...(x.bagCost !== null ? ([["Bagged cost", money(x.bagCost)]] as [string, string][]) : []),
  ];

  return (
    <Funnel
      slug="gravel-calculator"
      toolName="Gravel Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() => ({
        title: "Putting a shed on gravel?",
        text: "Size the pad, timber frame and fabric, or compare it with a slab or blocks.",
        href: "/home-improvement/shed-foundation-calculator",
        cta: "Shed foundation calculator",
      })}
      report={() =>
        r && {
          stats: [["Tons", fmt(r.tons, 2)], ["Cubic yards", fmt(r.yd, 2)], ["0.5 cu ft bags", `${r.bags}`], ["Area", `${fmt(r.sqFt, 0)} sq ft`]],
          tables: [
            { title: "Areas", head: ["Area", "Sq ft", "Cu ft"], rows: r.areas.map((x, k) => [`${k + 1}. ${x.label} (${rows[k]?.depth} in deep)`, fmt(x.sqFt, 0), fmt(x.cuFt, 1)]) },
            { title: "Shopping list", rows: shopping(r) },
          ],
          notes: [`Includes ${comp || 0}% for compaction; ${density} tons per cubic yard.`, ...r.warnings],
        }
      }
      inputSummary={rows.map((x, k) => [`Area ${k + 1}`, `${AREA_SHAPES[x.shape].label.split(" (")[0]}, ${x.depth} in deep`] as [string, string])}
      input={
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); f.run(() => validateGravel(input()), () => calcGravel(input())); }}>
          {rows.map((row, k) => (
            <div key={row.id} className="rounded-lg border border-line bg-concrete/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs text-white">{k + 1}</span>
                <select
                  value={row.shape}
                  onChange={(e) => update(row.id, { shape: e.target.value as AreaShape, ...DEF[e.target.value as AreaShape] })}
                  className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2 text-base font-semibold outline-none focus:border-blueprint"
                  aria-label={`Area ${k + 1} shape`}
                >
                  {(Object.keys(AREA_SHAPES) as AreaShape[]).map((s) => <option key={s} value={s}>{AREA_SHAPES[s].label}</option>)}
                </select>
                {rows.length > 1 && (
                  <button type="button" onClick={() => setRows((rs) => rs.filter((x) => x.id !== row.id))} className="rounded-md px-2 py-1 text-sm text-steel hover:bg-white hover:text-red-700" aria-label={`Remove area ${k + 1}`}>
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {AREA_SHAPES[row.shape].fields.map((fd) => (
                  <NumberField key={fd.key} label={fd.label} value={row[fd.key]} onChange={(v) => update(row.id, { [fd.key]: v } as Partial<Row>)} unit="ft" />
                ))}
                <NumberField label="Depth" value={row.depth} onChange={(v) => update(row.id, { depth: v })} unit="in" />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setRows((rs) => [...rs, { id: nextId++, shape: "rect", a: "30", b: "3", depth: "2" }])} className="w-full rounded-md border-2 border-dashed border-line py-2.5 text-sm font-semibold text-steel hover:border-safety hover:text-ink">
            + Add another area (path, bed, parking pad…)
          </button>
          <SelectField label="Lay landscape fabric underneath?" value={fabric} onChange={setFabric} options={[{ value: "yes", label: "Yes (recommended)" }, { value: "no", label: "No" }]} />
          <Advanced>
            <NumberField label="Compaction allowance" value={comp} onChange={setComp} unit="%" hint="Crushed stone compacts ~10–15%" />
            <NumberField label="Weight per cubic yard" value={density} onChange={setDensity} unit="tons" hint="Most gravel is 1.3–1.7; ask your supplier" />
            <NumberField label="Price per ton" value={ton} onChange={setTon} unit="$" hint="Common crushed stone often $30–$55" />
            <NumberField label="Delivery fee" value={deliv} onChange={setDeliv} unit="$" />
            <NumberField label="Price per 0.5 cu ft bag (optional)" value={bag} onChange={setBag} unit="$" />
          </Advanced>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Calculate gravel →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Tons", value: fmt(r.tons, 2), sub: `at ${density} t / cu yd`, accent: true },
                { label: "Cubic yards", value: fmt(r.yd, 2), sub: `${fmt(r.cuFt, 1)} cu ft` },
                { label: "Bags", value: `${r.bags}`, sub: "0.5 cu ft each" },
                { label: "Bulk cost", value: r.bulkCost !== null ? money(r.bulkCost) : "n/a", sub: r.bulkCost !== null ? "incl. delivery" : "add price" },
              ]}
            />
            {r.areas.length > 1 && <ShoppingList title="Your areas" items={r.areas.map((x, k): [string, string] => [`${k + 1}. ${x.label}: ${fmt(x.sqFt, 0)} sq ft`, `${fmt(x.cuFt, 1)} cu ft`])} />}
            <ShoppingList items={shopping(r)} />
            <Warnings items={r.warnings} />
          </>
        )
      }
    />
  );
}
