"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { Advanced, FormError, NumberField, Segmented, SelectField, n } from "@/components/Fields";
import { BagTable, HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { calcWall, validateWall, type WallInput, type WallResult, type WallType } from "@/lib/calc/wall";
import { fmt, type BagSize } from "@/lib/calc/concrete";

const STEPS = ["Measuring the wall", "Counting block or concrete", "Adding rebar & grout", "Building your shopping list"];
const GROUT = [
  { value: "solid", label: "Every core (solid grouted)" },
  { value: "16", label: "Cores at 16 in. on center" },
  { value: "24", label: "Cores at 24 in. on center" },
  { value: "32", label: "Cores at 32 in. on center" },
  { value: "48", label: "Cores at 48 in. on center" },
  { value: "none", label: "No grout" },
] as const;
type G = (typeof GROUT)[number]["value"];

export default function WallCalculator() {
  const [type, setType] = useState<WallType>("block");
  const [l, setL] = useState("40");
  const [h, setH] = useState("4");
  const [open, setOpen] = useState("0");
  const [t, setT] = useState("8");
  const [vs, setVs] = useState("18");
  const [hs, setHs] = useState("18");
  const [grout, setGrout] = useState<G>("32");
  const [bw, setBw] = useState("5");
  const [waste, setWaste] = useState("5");
  const [bag, setBag] = useState<BagSize>(80);
  const f = useFunnel<WallResult>();

  const input = (): WallInput => ({
    type, lengthFt: n(l), heightFt: n(h), openingsSqFt: n(open || "0"), thicknessIn: n(t), vertSpacingIn: n(vs || "0"), horizSpacingIn: n(hs || "0"),
    groutSpacing: grout, blockWastePct: n(bw || "0"), wastePct: n(waste || "0"), bagSize: bag,
  });

  const r = f.result;
  const shopping = (x: WallResult): [string, string][] =>
    x.type === "block"
      ? [
          ["8×8×16 concrete blocks", `${x.blocks}`],
          ["80 lb Type S mortar", `${x.mortarBags} bags`],
          ...(x.groutCuFt > 0 ? ([["Core-fill grout", `${fmt(x.groutCuFt, 1)} cu ft (${x.groutBags} × 80 lb bags or ${fmt(x.readyMixYd, 2)} yd)`]] as [string, string][]) : []),
          ...(x.groutCuFt > 0 ? ([["#4 rebar for grouted cores", "1 bar per grouted core, full height"]] as [string, string][]) : []),
        ]
      : [
          ["Concrete", `${fmt(x.readyMixYd, 2)} yd or ${x.chosenBags} × ${bag} lb bags`],
          ...(x.rebarSticks ? ([["#4 rebar (20 ft sticks)", `${x.rebarSticks}`]] as [string, string][]) : []),
          ["Form face area (both sides)", `${fmt(x.formSqFt, 0)} sq ft`],
          ["Form ties", `~${Math.ceil(x.formSqFt / 2 / 4)}`],
        ];

  return (
    <Funnel
      slug="concrete-wall-calculator"
      toolName="Concrete Wall Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() => ({
        title: "Every wall needs a footing",
        text: "Size the continuous footing under your wall, with concrete, rebar and forms.",
        href: "/home-improvement/concrete-footing-calculator",
        cta: "Concrete footing calculator",
      })}
      report={() =>
        r && {
          stats:
            r.type === "block"
              ? [["Blocks", `${r.blocks}`], ["Mortar", `${r.mortarBags} bags`], ["Grout", `${fmt(r.groutCuFt, 1)} cu ft`], ["Wall area", `${fmt(r.netSqFt, 0)} sq ft`]]
              : [["Concrete", `${fmt(r.concreteYd, 2)} yd`], [`${bag} lb bags`, fmt(r.chosenBags, 0)], ["Rebar", `${r.rebarSticks} sticks`], ["Wall area", `${fmt(r.netSqFt, 0)} sq ft`]],
          tables: [{ title: "Shopping list", rows: shopping(r) }],
          notes: r.warnings,
        }
      }
      inputSummary={[["Wall", `${l} ft long × ${h} ft high${n(open || "0") ? `, minus ${open} sq ft openings` : ""}`], ["Type", type === "block" ? `8 in. CMU, grout: ${GROUT.find((g) => g.value === grout)!.label}` : `Poured, ${t} in. thick`]]}
      input={
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); f.run(() => validateWall(input()), () => calcWall(input())); }}>
          <Segmented label="Wall type" value={type} onChange={setType} options={[{ value: "block", label: "Concrete block (CMU)" }, { value: "poured", label: "Poured concrete" }]} />
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField label="Wall length" value={l} onChange={setL} unit="ft" />
            <NumberField label="Wall height" value={h} onChange={setH} unit="ft" />
            <NumberField label="Doors & windows" value={open} onChange={setOpen} unit="sq ft" hint="Area to subtract" />
          </div>
          {type === "block" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Which cores get grout?" value={grout} onChange={setGrout} options={GROUT.map((g) => ({ value: g.value as G, label: g.label }))} hint="Reinforced cores are often 32–48 in. on center; retaining & seismic walls are often solid." />
              <NumberField label="Block waste / breakage" value={bw} onChange={setBw} unit="%" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField label="Wall thickness" value={t} onChange={setT} unit="in" hint="8 in. minimum for foundations" />
              <NumberField label="Vertical rebar spacing" value={vs} onChange={setVs} unit="in" hint="0 = none" />
              <NumberField label="Horizontal rebar spacing" value={hs} onChange={setHs} unit="in" hint="0 = none" />
            </div>
          )}
          {type === "poured" && (
            <Advanced>
              <NumberField label="Concrete waste" value={waste} onChange={setWaste} unit="%" />
              <SelectField label="Bag size" value={bag} onChange={setBag} options={[40, 50, 60, 80].map((s) => ({ value: s as BagSize, label: `${s} lb bags` }))} />
            </Advanced>
          )}
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Calculate my wall →</button>
        </form>
      }
      result={
        r && (
          <>
            {r.type === "block" ? (
              <HeadlineStats
                items={[
                  { label: "Blocks", value: `${r.blocks}`, sub: `${r.courses} courses × ~${r.blocksPerCourse}`, accent: true },
                  { label: "Mortar", value: `${r.mortarBags}`, sub: "80 lb bags" },
                  { label: "Grout", value: `${fmt(r.groutCuFt, 1)}`, sub: r.groutCuFt ? `cu ft (${r.groutBags} bags)` : "none" },
                  { label: "Wall area", value: `${fmt(r.netSqFt, 0)}`, sub: "sq ft net" },
                ]}
              />
            ) : (
              <HeadlineStats
                items={[
                  { label: "Concrete", value: `${fmt(r.concreteYd, 2)} yd`, sub: `order ${fmt(r.readyMixYd, 2)} yd`, accent: true },
                  { label: `${bag} lb bags`, value: fmt(r.chosenBags, 0), sub: "if mixing yourself" },
                  { label: "Rebar", value: `${r.rebarSticks}`, sub: "20 ft sticks" },
                  { label: "Form area", value: `${fmt(r.formSqFt, 0)}`, sub: "sq ft, both faces" },
                ]}
              />
            )}
            <div className={`grid gap-6 ${r.type === "poured" ? "md:grid-cols-2" : ""}`}>
              {r.type === "poured" && <BagTable bags={r.bags} chosen={bag} />}
              <ShoppingList items={shopping(r)} />
            </div>
            <Warnings items={r.warnings} note={r.type === "block" ? "Block count uses 1.125 blocks per sq ft; grout uses the NCMA TEK 4-2A table for 8 in. hollow units (3% waste included); mortar assumes ~13 blocks per 80 lb bag." : "Rebar includes ~10% for laps."} />
          </>
        )
      }
    />
  );
}
