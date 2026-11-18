"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { Advanced, FormError, NumberField, Segmented, SelectField, n } from "@/components/Fields";
import { BagTable, HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { calcFooting, validateFooting, type FootingInput, type FootingMode, type FootingResult } from "@/lib/calc/footing";
import { fmt, money, type BagSize } from "@/lib/calc/concrete";

const STEPS = ["Calculating footing volume", "Estimating rebar & forms", "Converting to bags & yards", "Building your shopping list"];

export default function FootingCalculator() {
  const [mode, setMode] = useState<FootingMode>("strip");
  const [length, setLength] = useState("120");
  const [width, setWidth] = useState("16");
  const [depth, setDepth] = useState("8");
  const [bars, setBars] = useState("2");
  const [padL, setPadL] = useState("24");
  const [padW, setPadW] = useState("24");
  const [padD, setPadD] = useState("12");
  const [padCount, setPadCount] = useState("4");
  const [spacing, setSpacing] = useState("12");
  const [waste, setWaste] = useState("8");
  const [bag, setBag] = useState<BagSize>(80);
  const [pricePerYd, setPricePerYd] = useState("");
  const [pricePerBag, setPricePerBag] = useState("6.50");
  const f = useFunnel<FootingResult>();

  const input = (): FootingInput => ({
    mode,
    lengthFt: n(length),
    widthIn: n(width),
    depthIn: n(depth),
    bars: n(bars || "0"),
    padLengthIn: n(padL),
    padWidthIn: n(padW),
    padDepthIn: n(padD),
    padCount: n(padCount),
    padRebarSpacingIn: n(spacing || "0") || 0,
    wastePct: n(waste || "0"),
    bagSize: bag,
    pricePerYd: n(pricePerYd || "0") || 0,
    pricePerBag: n(pricePerBag || "0") || 0,
  });

  const r = f.result;
  const summary: [string, string][] =
    mode === "strip"
      ? [
          ["Footing type", "Continuous (strip)"],
          ["Total length", `${length} ft`],
          ["Width × depth", `${width} × ${depth} in`],
          ["Continuous bars", bars || "0"],
          ["Waste", `${waste || 0}%`],
        ]
      : [
          ["Footing type", "Pad (spread)"],
          ["Pad size", `${padL} × ${padW} × ${padD} in`],
          ["Number of pads", padCount],
          ["Rebar grid", spacing && n(spacing) > 0 ? `${spacing} in o.c. each way` : "none"],
          ["Waste", `${waste || 0}%`],
        ];

  const shopping = (x: FootingResult): [string, string][] => [
    ["Concrete", `${fmt(x.readyMixYd, 2)} yd or ${x.chosenBags} x ${bag} lb bags`],
    ...(x.rebarLf > 0 ? ([["#4 rebar (20 ft sticks)", `${x.rebarSticks20}`]] as [string, string][]) : []),
    ...(x.rebarLf > 0
      ? ([["Rebar chairs / dobies", mode === "strip" ? `~${Math.ceil(n(length) / 4)}` : `~${4 * n(padCount)}`]] as [string, string][])
      : []),
    ["Form boards (if not trench-poured)", `${fmt(x.formLf, 0)} linear ft`],
    ["Stakes", `~${Math.ceil(x.formLf / 3)}`],
  ];

  return (
    <Funnel
      slug="concrete-footing-calculator"
      nextStep={() => ({
        title: "Pouring round piers too?",
        text: "Get the bag count and tube lengths for Sonotube piers: porch posts, decks, carports.",
        href: "/home-improvement/sonotube-calculator",
        cta: "Open Sonotube calculator",
      })}
      report={() =>
        r && {
          stats: [
            ["Cubic yards", fmt(r.yd, 2)],
            [`${bag} lb bags`, fmt(r.chosenBags, 0)],
            ["Rebar", r.rebarLf > 0 ? `${fmt(r.rebarLf, 0)} ft` : "n/a"],
            ["Ready-mix order", `${fmt(r.readyMixYd, 2)} yd`],
          ],
          tables: [
            { title: "Bagged concrete needed", head: ["Bag size", "Bags", "Total weight"], rows: r.bags.map((b) => [`${b.size} lb`, fmt(b.bags, 0), `${fmt(b.weightLb, 0)} lb`]) },
            { title: "Shopping list", rows: shopping(r) },
          ],
          notes: [
            r.advice,
            ...(r.bagCost !== null ? [`Bagged concrete cost: ~${money(r.bagCost)}.`] : []),
            ...(r.readyMixCost !== null ? [`Ready-mix cost before delivery fees: ~${money(r.readyMixCost)}.`] : []),
            "Rebar figure includes ~10% extra for lap splices.",
            ...r.warnings,
          ],
        }
      }
      toolName="Concrete Footing Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      inputSummary={summary}
      input={
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            f.run(() => validateFooting(input()), () => calcFooting(input()));
          }}
        >
          <Segmented
            label="Footing type"
            value={mode}
            onChange={setMode}
            options={[
              { value: "strip", label: "Continuous / wall footing" },
              { value: "pad", label: "Pad / spread footings" },
            ]}
          />
          {mode === "strip" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="Total footing length" value={length} onChange={setLength} unit="ft" hint="Add up every run, e.g. the perimeter of a garage." />
              <NumberField label="Number of continuous bars" value={bars} onChange={setBars} step="1" hint="Two #4 bars is common for residential footings." />
              <NumberField label="Footing width" value={width} onChange={setWidth} unit="in" hint="Often 16–24 in. for houses; 12 in. minimum." />
              <NumberField label="Footing depth (thickness)" value={depth} onChange={setDepth} unit="in" hint="Often 8–12 in.; 6 in. minimum." />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="Pad length" value={padL} onChange={setPadL} unit="in" />
              <NumberField label="Pad width" value={padW} onChange={setPadW} unit="in" />
              <NumberField label="Pad thickness" value={padD} onChange={setPadD} unit="in" />
              <NumberField label="Number of pads" value={padCount} onChange={setPadCount} step="1" min={1} />
              <NumberField label="Rebar grid spacing (0 = none)" value={spacing} onChange={setSpacing} unit="in" hint="e.g. #4 bars at 12 in. each way, 3 in. cover." />
            </div>
          )}
          <Advanced>
            <NumberField label="Waste / over-dig" value={waste} onChange={setWaste} unit="%" hint="Trenches are never perfectly square. 5–10% is typical." />
            <SelectField
              label="Bag size"
              value={bag}
              onChange={setBag}
              options={[40, 50, 60, 80].map((s) => ({ value: s as BagSize, label: `${s} lb bags` }))}
            />
            <NumberField label="Price per bag (optional)" value={pricePerBag} onChange={setPricePerBag} unit="$" />
            <NumberField label="Ready-mix price per yard (optional)" value={pricePerYd} onChange={setPricePerYd} unit="$/yd" hint="Get a quote from a local supplier." />
          </Advanced>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Calculate footing →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Cubic yards", value: fmt(r.yd, 2), sub: `order ${fmt(r.readyMixYd, 2)} yd ready-mix`, accent: true },
                { label: `${bag} lb bags`, value: fmt(r.chosenBags, 0), sub: r.bagCost !== null ? `≈ ${money(r.bagCost)}` : undefined },
                { label: "Rebar", value: r.rebarLf > 0 ? `${fmt(r.rebarLf, 0)} ft` : "n/a", sub: r.rebarLf > 0 ? `${r.rebarSticks20} × 20 ft sticks` : undefined },
                { label: "Ready-mix cost", value: r.readyMixCost !== null ? money(r.readyMixCost) : "n/a", sub: r.readyMixCost !== null ? "before delivery fees" : "add a $/yd price" },
              ]}
            />
            <p className="text-sm text-steel">{r.advice}</p>
            <div className="grid gap-6 md:grid-cols-2">
              <BagTable bags={r.bags} chosen={bag} />
              <ShoppingList items={shopping(r)} />
            </div>
            <Warnings items={r.warnings} note="Rebar figure includes ~10% extra for lap splices. Your plans or inspector may require a different size, count or spacing." />
          </>
        )
      }
    />
  );
}
