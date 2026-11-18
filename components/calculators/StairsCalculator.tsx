"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { Advanced, FormError, NumberField, SelectField, n } from "@/components/Fields";
import { BagTable, HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { calcStairs, validateStairs, type StairsInput, type StairsResult } from "@/lib/calc/stairs";
import { fmt, type BagSize } from "@/lib/calc/concrete";

const STEPS = ["Dividing the rise into equal steps", "Checking against IRC limits", "Calculating concrete volume", "Building your form & material list"];

const ftIn = (inches: number) => `${Math.floor(inches / 12)}' ${fmt(inches % 12, 1)}"`;

export default function StairsCalculator() {
  const [rise, setRise] = useState("30");
  const [w, setW] = useState("4");
  const [maxR, setMaxR] = useState("7.5");
  const [tread, setTread] = useState("11");
  const [landing, setLanding] = useState("36");
  const [waste, setWaste] = useState("5");
  const [bag, setBag] = useState<BagSize>(80);
  const f = useFunnel<StairsResult>();

  const input = (): StairsInput => ({ totalRiseIn: n(rise), widthFt: n(w), maxRiserIn: n(maxR), treadIn: n(tread), landingIn: n(landing || "0"), wastePct: n(waste || "0"), bagSize: bag });

  const r = f.result;
  const shopping = (x: StairsResult): [string, string][] => [
    ["Concrete", `${fmt(x.readyMixYd, 2)} yd or ${x.chosenBags} × ${bag} lb bags`],
    ["Side forms (2×10/2×12 or plywood)", `${fmt(x.sideFormSqFt, 1)} sq ft`],
    ["Riser form boards", `${x.risers} × ${fmt(n(w), 1)} ft`],
    ["Compacted gravel base", "4 in. under the footprint"],
    ["#4 rebar dowels / mesh", "per your plans"],
  ];

  return (
    <Funnel
      slug="concrete-stairs-calculator"
      toolName="Concrete Stairs Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() => ({
        title: "Pouring a patio at the bottom?",
        text: "Price the slab: concrete, base, reinforcement, labor and finish.",
        href: "/home-improvement/concrete-slab-cost-calculator",
        cta: "Concrete slab cost calculator",
      })}
      report={() =>
        r && {
          stats: [["Steps", `${r.risers} risers`], ["Riser", `${fmt(r.riserIn, 2)} in`], ["Concrete", `${fmt(r.yd, 2)} yd`], [`${bag} lb bags`, fmt(r.chosenBags, 0)]],
          tables: [
            { title: "Layout", rows: [["Risers (equal)", `${r.risers} × ${fmt(r.riserIn, 2)} in`], ["Treads", `${r.treads} × ${tread} in`], ["Top landing", n(landing || "0") ? `${landing} in` : "none"], ["Total run", ftIn(r.totalRunIn)]] },
            { title: "Code & comfort checks", rows: r.checks.map((c) => [c.label, c.ok ? "OK" : "CHECK"]) },
            { title: "Shopping list", rows: shopping(r) },
          ],
          notes: [r.advice, ...r.warnings],
        }
      }
      inputSummary={[["Total rise", `${rise} in`], ["Width", `${w} ft`], ["Max riser / tread", `${maxR} in / ${tread} in`], ["Top landing", n(landing || "0") ? `${landing} in deep` : "none"]]}
      input={
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); f.run(() => validateStairs(input()), () => calcStairs(input())); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Total rise" value={rise} onChange={setRise} unit="in" hint="Ground (or bottom slab) to the top surface, e.g. door threshold" />
            <NumberField label="Stair width" value={w} onChange={setW} unit="ft" hint="36 in. (3 ft) minimum; 4 ft feels generous" />
            <NumberField label="Max riser height" value={maxR} onChange={setMaxR} unit="in" hint="IRC max 7-3/4 in.; 6–7 in. is easier outdoors" />
            <NumberField label="Tread depth" value={tread} onChange={setTread} unit="in" hint="IRC min 10 in.; 11–14 in. common outdoors" />
            <NumberField label="Top landing depth (0 = none)" value={landing} onChange={setLanding} unit="in" hint="36 in. min outside an exterior door" />
          </div>
          <Advanced>
            <NumberField label="Waste" value={waste} onChange={setWaste} unit="%" />
            <SelectField label="Bag size" value={bag} onChange={setBag} options={[40, 50, 60, 80].map((s) => ({ value: s as BagSize, label: `${s} lb bags` }))} />
          </Advanced>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Calculate my stairs →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Steps", value: `${r.risers}`, sub: `risers @ ${fmt(r.riserIn, 2)} in.`, accent: true },
                { label: "Total run", value: ftIn(r.totalRunIn), sub: `${r.treads} treads${n(landing || "0") ? " + landing" : ""}` },
                { label: "Concrete", value: `${fmt(r.yd, 2)} yd`, sub: `order ${fmt(r.readyMixYd, 2)} yd` },
                { label: `${bag} lb bags`, value: fmt(r.chosenBags, 0), sub: "if mixing yourself" },
              ]}
            />
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-steel">Code & comfort checks</h3>
              <ul className="space-y-1.5">
                {r.checks.map((c) => (
                  <li key={c.label} className={`rounded-md px-3 py-2 text-sm ${c.ok ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
                    {c.ok ? "✓" : "✗"} {c.label}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-steel">{r.advice}</p>
            <div className="grid gap-6 md:grid-cols-2">
              <BagTable bags={r.bags} chosen={bag} />
              <ShoppingList items={shopping(r)} />
            </div>
            <Warnings items={r.warnings} note="Volume assumes solid stairs poured to grade. Filling the core with compacted gravel or rubble can cut concrete noticeably on tall stairs." />
          </>
        )
      }
    />
  );
}
