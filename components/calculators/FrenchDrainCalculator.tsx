"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { Advanced, FormError, NumberField, SelectField, n } from "@/components/Fields";
import { HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { calcFrenchDrain, validateFrenchDrain, type FrenchDrainInput, type FrenchDrainResult } from "@/lib/calc/frenchdrain";
import { fmt, money } from "@/lib/calc/concrete";

const STEPS = ["Measuring the trench", "Applying slope to the outlet", "Calculating gravel, fabric & pipe", "Building your shopping list"];

export default function FrenchDrainCalculator() {
  const [len, setLen] = useState("50");
  const [w, setW] = useState("12");
  const [d, setD] = useState("18");
  const [pipe, setPipe] = useState<number>(4);
  const [pipeType, setPipeType] = useState<"rigid" | "corrugated">("rigid");
  const [slope, setSlope] = useState("1");
  const [fabric, setFabric] = useState<"yes" | "no">("yes");
  const [waste, setWaste] = useState("10");
  const [price, setPrice] = useState("40");
  const f = useFunnel<FrenchDrainResult>();

  const input = (): FrenchDrainInput => ({
    lengthFt: n(len), widthIn: n(w), depthIn: n(d), pipeDiaIn: pipe, slopePct: n(slope || "0"), wrapFabric: fabric === "yes",
    pipeType, wastePct: n(waste || "0"), gravelPerTon: n(price || "0") || 0,
  });

  const r = f.result;
  const shopping = (x: FrenchDrainResult): [string, string][] => [
    ["Drain gravel (washed 3/4 in.)", `${fmt(x.gravelTons, 2)} tons / ${fmt(x.gravelYd, 2)} yd`],
    ...(x.pipePieces ? ([[`${pipe} in. perforated pipe`, `${x.pipePieces} × ${pipeType === "rigid" ? "10 ft" : "100 ft roll"}`]] as [string, string][]) : []),
    ...(x.pipePieces && pipeType === "rigid" ? ([["Pipe couplers", `${x.couplers}`]] as [string, string][]) : []),
    ...(x.fabricSqFt ? ([["Non-woven drainage fabric", `${fmt(x.fabricSqFt, 0)} sq ft (${fmt(x.fabricWidthFt, 1)} ft wide roll)`]] as [string, string][]) : []),
    ["Pipe end cap / outlet grate", "1 each"],
    ["Excavated soil to move", `~${fmt(x.spoilYd, 1)} cu yd loose`],
  ];

  return (
    <Funnel
      slug="french-drain-calculator"
      toolName="French Drain Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() => ({
        title: "Water pooling by a shed or patio?",
        text: "Plan a well-drained gravel pad, slab or block base for your shed.",
        href: "/home-improvement/shed-foundation-calculator",
        cta: "Shed foundation calculator",
      })}
      report={() =>
        r && {
          stats: [["Gravel", `${fmt(r.gravelTons, 2)} tons`], ["Pipe", r.pipePieces ? `${fmt(r.pipeLf, 0)} ft` : "none"], ["Fabric", r.fabricSqFt ? `${fmt(r.fabricSqFt, 0)} sq ft` : "none"], ["Outlet depth", `${fmt(r.endDepthIn, 1)} in`]],
          tables: [{ title: "Shopping list", rows: shopping(r) }],
          notes: [`Trench starts ${d} in. deep and ends ${fmt(r.endDepthIn, 1)} in. deep (${fmt(r.dropIn, 1)} in. drop at ${slope}% slope).`, ...(r.gravelCost !== null ? [`Gravel cost ~${money(r.gravelCost)}.`] : []), ...r.warnings],
        }
      }
      inputSummary={[["Trench", `${len} ft long, ${w} in. wide, ${d} in. deep at start`], ["Pipe", pipe ? `${pipe} in. ${pipeType}` : "none (gravel only)"], ["Slope", `${slope}%`], ["Fabric wrap", fabric === "yes" ? "Yes" : "No"]]}
      input={
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); f.run(() => validateFrenchDrain(input()), () => calcFrenchDrain(input())); }}>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField label="Trench length" value={len} onChange={setLen} unit="ft" />
            <NumberField label="Trench width" value={w} onChange={setW} unit="in" hint="6–12 in. typical" />
            <NumberField label="Depth at the start" value={d} onChange={setD} unit="in" hint="18–24 in. typical" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Perforated pipe" value={pipe} onChange={setPipe} options={[{ value: 4, label: "4 in. (most yards)" }, { value: 6, label: "6 in. (heavy water)" }, { value: 3, label: "3 in." }, { value: 0, label: "No pipe (gravel only)" }]} />
            <SelectField label="Pipe type" value={pipeType} onChange={setPipeType} options={[{ value: "rigid", label: "Rigid PVC, 10 ft (cleanable)" }, { value: "corrugated", label: "Corrugated, 100 ft roll (cheaper)" }]} />
            <NumberField label="Slope toward the outlet" value={slope} onChange={setSlope} unit="%" hint="1% = 1/8 in. per ft. 1–2% is typical." />
            <SelectField label="Wrap in drainage fabric?" value={fabric} onChange={setFabric} options={[{ value: "yes", label: "Yes (recommended)" }, { value: "no", label: "No" }]} />
          </div>
          <Advanced>
            <NumberField label="Gravel waste / compaction" value={waste} onChange={setWaste} unit="%" />
            <NumberField label="Gravel price per ton (optional)" value={price} onChange={setPrice} unit="$" />
          </Advanced>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Calculate my French drain →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Gravel", value: `${fmt(r.gravelTons, 2)} t`, sub: `${fmt(r.gravelYd, 2)} cu yd`, accent: true },
                { label: "Pipe", value: r.pipePieces ? `${fmt(r.pipeLf, 0)} ft` : "none", sub: r.pipePieces ? `${r.pipePieces} ${pipeType === "rigid" ? "× 10 ft" : "roll(s)"}` : undefined },
                { label: "Fabric", value: r.fabricSqFt ? `${fmt(r.fabricSqFt, 0)}` : "none", sub: r.fabricSqFt ? "sq ft" : undefined },
                { label: "Outlet depth", value: `${fmt(r.endDepthIn, 1)}"`, sub: `${fmt(r.dropIn, 1)} in. drop` },
              ]}
            />
            <ShoppingList items={shopping(r)} />
            {r.gravelCost !== null && <p className="text-sm text-steel">Gravel cost at ${price}/ton: <strong>{money(r.gravelCost)}</strong></p>}
            <Warnings items={r.warnings} note="Lay 2–3 in. of gravel, set the pipe with holes facing down, fill with gravel to ~3 in. below grade, fold the fabric over the top, then cover with sod, soil or decorative stone." />
          </>
        )
      }
    />
  );
}
