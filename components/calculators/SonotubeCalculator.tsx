"use client";

import { useEffect, useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { Advanced, FormError, NumberField, SelectField, n } from "@/components/Fields";
import { BagTable, HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { calcSonotube, validateSonotube, type SonotubeInput, type SonotubeResult } from "@/lib/calc/sonotube";
import { TUBE_DIAMETERS_IN, fmt, money, type BagSize } from "@/lib/calc/concrete";

const STEPS = ["Calculating tube volume", "Adding waste allowance", "Converting to bags & yards", "Building your shopping list"];

export default function SonotubeCalculator() {
  const [diameter, setDiameter] = useState<number>(12);
  const [depth, setDepth] = useState("42");
  const [above, setAbove] = useState("6");
  const [count, setCount] = useState("6");
  const [waste, setWaste] = useState("10");
  const [bag, setBag] = useState<BagSize>(80);
  const [price, setPrice] = useState("6.50");
  const f = useFunnel<SonotubeResult>();

  // Prefill from links like ?d=18&depth=36&above=2&count=3 (used by the deck footing "Next step" box)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const d = Number(q.get("d"));
    if ((TUBE_DIAMETERS_IN as readonly number[]).includes(d)) setDiameter(d);
    if (q.get("depth")) setDepth(q.get("depth")!);
    if (q.get("above")) setAbove(q.get("above")!);
    if (q.get("count")) setCount(q.get("count")!);
  }, []);

  const input = (): SonotubeInput => ({
    diameterIn: diameter,
    depthIn: n(depth),
    aboveGradeIn: n(above || "0"),
    count: n(count),
    wastePct: n(waste || "0"),
    bagSize: bag,
    pricePerBag: n(price || "0") || 0,
  });

  const r = f.result;
  const tubeText = (x: SonotubeResult) =>
    x.tubes.fourFt !== null ? `${x.tubes.fourFt} x 4 ft` : x.tubes.twelveFt !== null ? `${x.tubes.twelveFt} x 12 ft` : "special order";
  return (
    <Funnel
      slug="sonotube-calculator"
      nextStep={() => ({
        title: `Is a ${diameter} in. tube big enough?`,
        text: "Check the footing size your deck actually needs from its size, post spacing and soil.",
        href: "/home-improvement/deck-footing-calculator",
        cta: "Size my deck footings",
      })}
      report={() =>
        r && {
          stats: [
            [`${bag} lb bags`, fmt(r.chosenBags, 0)],
            ["Cubic yards", fmt(r.totalYd, 2)],
            ["Cubic feet", fmt(r.totalCuFtWithWaste, 2)],
            ["Est. cost", r.cost !== null ? money(r.cost) : "n/a"],
          ],
          tables: [
            { title: "Bagged concrete needed", head: ["Bag size", "Bags", "Total weight"], rows: r.bags.map((b) => [`${b.size} lb`, fmt(b.bags, 0), `${fmt(b.weightLb, 0)} lb`]) },
            {
              title: "Shopping list",
              rows: [
                [`${bag} lb concrete mix`, `${r.chosenBags} bags`],
                [`${diameter} in form tubes`, tubeText(r)],
                ["Each tube cut to", `${fmt(r.pieceLengthIn, 1)} in`],
                ["Post anchors / J-bolts", count],
                ["Gravel for hole bottoms", "~4 in. per hole"],
              ],
            },
          ],
          notes: [r.advice, `Ready-mix order: ${fmt(r.readyMixYd, 2)} yd.`, ...r.warnings],
        }
      }
      toolName="Sonotube Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      inputSummary={[
        ["Tube diameter", `${diameter} in`],
        ["Depth below grade", `${depth} in`],
        ["Height above grade", `${above || 0} in`],
        ["Number of tubes", count],
        ["Waste allowance", `${waste || 0}%`],
      ]}
      input={
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            f.run(() => validateSonotube(input()), () => calcSonotube(input()));
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Tube diameter"
              value={diameter}
              onChange={setDiameter}
              options={TUBE_DIAMETERS_IN.map((d) => ({ value: d, label: `${d} in` }))}
            />
            <NumberField label="Number of tubes" value={count} onChange={setCount} step="1" min={1} />
            <NumberField label="Hole depth (below grade)" value={depth} onChange={setDepth} unit="in" hint="Bottom of hole to ground level. Must reach below your frost line." />
            <NumberField label="Tube height above grade" value={above} onChange={setAbove} unit="in" hint="Typically 2–6 in. so wood posts stay off the dirt." />
          </div>
          <Advanced>
            <NumberField label="Waste / spillage" value={waste} onChange={setWaste} unit="%" hint="10% is typical for piers." />
            <SelectField
              label="Bag size you'll buy"
              value={bag}
              onChange={setBag}
              options={[40, 50, 60, 80].map((s) => ({ value: s as BagSize, label: `${s} lb bags` }))}
            />
            <NumberField label="Price per bag (optional)" value={price} onChange={setPrice} unit="$" hint="Check your local Home Depot or Lowe's price." />
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
                { label: `${bag} lb bags`, value: fmt(r.chosenBags, 0), sub: r.cost !== null ? `≈ ${money(r.cost)}` : undefined, accent: true },
                { label: "Cubic yards", value: fmt(r.totalYd, 2), sub: `ready-mix: order ${fmt(r.readyMixYd, 2)} yd` },
                { label: "Cubic feet", value: fmt(r.totalCuFtWithWaste, 2), sub: `incl. ${waste || 0}% waste` },
                { label: "Per tube", value: `${fmt(r.bagsPerTube, 1)}`, sub: `${bag} lb bags each` },
              ]}
            />
            <p className="text-sm text-steel">{r.advice}</p>
            <div className="grid gap-6 md:grid-cols-2">
              <BagTable bags={r.bags} chosen={bag} />
              <ShoppingList
                items={[
                  [`${bag} lb concrete mix`, `${r.chosenBags} bags`],
                  [
                    `${diameter} in form tubes`,
                    r.tubes.fourFt !== null
                      ? `${r.tubes.fourFt} × 4 ft${r.tubes.twelveFt !== null && r.tubes.twelveFt < r.tubes.fourFt / 2 ? ` (or ${r.tubes.twelveFt} × 12 ft)` : ""}`
                      : r.tubes.twelveFt !== null
                        ? `${r.tubes.twelveFt} × 12 ft`
                        : "special order",
                  ],
                  ["Each tube cut to", `${fmt(r.pieceLengthIn, 1)} in`],
                  ["Post anchors / J-bolts", `${count}`],
                  ["Gravel for hole bottoms", "~4 in. per hole"],
                ]}
              />
            </div>
            <Warnings items={r.warnings} />
          </>
        )
      }
    />
  );
}
