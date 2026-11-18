"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { Advanced, FormError, NumberField, Segmented, SelectField, n } from "@/components/Fields";
import { BagTable, HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { calcShed, validateShed, type ShedFoundation, type ShedInput, type ShedResult } from "@/lib/calc/shed";
import { fmt, type BagSize } from "@/lib/calc/concrete";

const STEPS = ["Measuring the footprint", "Calculating base material", "Converting to tons, yards & bags", "Building your shopping list"];
const LABEL: Record<ShedFoundation, string> = { gravel: "Gravel pad", slab: "Concrete slab", blocks: "Concrete blocks + skids" };

export default function ShedFoundationCalculator() {
  const [w, setW] = useState("8");
  const [l, setL] = useState("10");
  const [type, setType] = useState<ShedFoundation>("gravel");
  const [over, setOver] = useState("12");
  const [gDepth, setGDepth] = useState("4");
  const [slab, setSlab] = useState("4");
  const [base, setBase] = useState("4");
  const [blockSp, setBlockSp] = useState("4");
  const [skidSp, setSkidSp] = useState("4");
  const [waste, setWaste] = useState("10");
  const [bag, setBag] = useState<BagSize>(80);
  const f = useFunnel<ShedResult>();

  const input = (): ShedInput => ({
    widthFt: n(w),
    lengthFt: n(l),
    type,
    overhangIn: n(over || "0"),
    gravelDepthIn: n(gDepth),
    slabIn: n(slab),
    baseIn: n(base || "0"),
    maxBlockSpacingFt: n(blockSp),
    maxSkidSpacingFt: n(skidSp),
    wastePct: n(waste || "0"),
    bagSize: bag,
  });

  const r = f.result;

  const shopping = (x: ShedResult): [string, string][] => {
    const gravel: [string, string] = ["Gravel (crushed stone)", `${fmt(x.gravelTons, 2)} tons / ${fmt(x.gravelYd, 2)} yd or ${x.gravelBags} × 0.5 cu ft bags`];
    if (x.type === "gravel")
      return [
        gravel,
        ["Landscape fabric", `${fmt(x.fabricSqFt, 0)} sq ft`],
        ["4×6 pressure-treated timbers (frame)", `${fmt(x.timberLf, 0)} ft (~${Math.ceil(x.timberLf / 8)} × 8 ft)`],
        ["Rebar stakes / spikes for frame", `~${Math.ceil(x.timberLf / 3)}`],
      ];
    if (x.type === "slab")
      return [
        ["Concrete", `${fmt(x.readyMixYd, 2)} yd or ${x.chosenBags} × ${bag} lb bags`],
        ["Gravel base", `${fmt(x.gravelTons, 2)} tons / ${fmt(x.gravelYd, 2)} yd`],
        ["Welded wire mesh (5×10 ft sheets)", `${x.meshSheets}`],
        ["2×4 or 2×6 form boards", `${fmt(x.formLf, 0)} linear ft`],
        ["Anchor bolts / J-bolts", `~${Math.ceil(x.formLf / 4)}`],
      ];
    return [
      ["Solid concrete blocks (e.g. 4×8×16 in.)", `${x.blocks}`],
      ["4×6 pressure-treated skids", `${x.skids} × ${fmt(n(l), 0)} ft`],
      ["Gravel under blocks", `${x.gravelBags} × 0.5 cu ft bags`],
      ["Composite shims", `~${x.blocks * 2}`],
    ];
  };

  return (
    <Funnel
      slug="shed-foundation-calculator"
      toolName="Shed Foundation Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() => ({
        title: "Building on piers instead?",
        text: "Get bags of concrete and tube lengths for round Sonotube piers under a shed, deck or porch.",
        href: "/home-improvement/sonotube-calculator",
        cta: "Open Sonotube calculator",
      })}
      report={() =>
        r && {
          stats:
            r.type === "slab"
              ? [["Concrete", `${fmt(r.readyMixYd, 2)} yd`], [`${bag} lb bags`, fmt(r.chosenBags, 0)], ["Gravel base", `${fmt(r.gravelTons, 2)} tons`], ["Mesh sheets", `${r.meshSheets}`]]
              : r.type === "gravel"
                ? [["Gravel", `${fmt(r.gravelTons, 2)} tons`], ["Cubic yards", fmt(r.gravelYd, 2)], ["Pad size", `${fmt(r.padWidthFt, 1)} x ${fmt(r.padLengthFt, 1)} ft`], ["Timber frame", `${fmt(r.timberLf, 0)} ft`]]
                : [["Blocks", `${r.blocks}`], ["Skids", `${r.skids}`], ["Per skid", `${r.blocksPerSkid} blocks`], ["Gravel", `${r.gravelBags} bags`]],
          tables: [
            ...(r.type === "slab" ? [{ title: "Bagged concrete needed", head: ["Bag size", "Bags", "Total weight"], rows: r.bags.map((b) => [`${b.size} lb`, fmt(b.bags, 0), `${fmt(b.weightLb, 0)} lb`]) }] : []),
            { title: "Shopping list", rows: shopping(r) },
          ],
          notes: [...(r.advice ? [r.advice] : []), ...r.warnings],
        }
      }
      inputSummary={[
        ["Shed size", `${w} × ${l} ft`],
        ["Foundation", LABEL[type]],
        ...(type === "gravel" ? ([["Pad overhang / depth", `${over} in / ${gDepth} in`]] as [string, string][]) : []),
        ...(type === "slab" ? ([["Slab / gravel base", `${slab} in / ${base} in`]] as [string, string][]) : []),
        ...(type === "blocks" ? ([["Block / skid spacing", `${blockSp} ft / ${skidSp} ft`]] as [string, string][]) : []),
      ]}
      input={
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            f.run(() => validateShed(input()), () => calcShed(input()));
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Shed width" value={w} onChange={setW} unit="ft" />
            <NumberField label="Shed length" value={l} onChange={setL} unit="ft" />
          </div>
          <Segmented
            label="Foundation type"
            value={type}
            onChange={setType}
            options={[
              { value: "gravel", label: "Gravel pad" },
              { value: "slab", label: "Concrete slab" },
              { value: "blocks", label: "Blocks + skids" },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {type === "gravel" && (
              <>
                <NumberField label="Pad extends past shed (each side)" value={over} onChange={setOver} unit="in" hint="12 in. keeps rain splash off the walls." />
                <NumberField label="Gravel depth" value={gDepth} onChange={setGDepth} unit="in" hint="4 in. minimum; 6 in. on soft or wet ground." />
              </>
            )}
            {type === "slab" && (
              <>
                <NumberField label="Slab thickness" value={slab} onChange={setSlab} unit="in" hint="4 in. for storage; 5–6 in. for a riding mower." />
                <NumberField label="Gravel base under slab" value={base} onChange={setBase} unit="in" hint="4 in. of compacted gravel is typical." />
              </>
            )}
            {type === "blocks" && (
              <>
                <NumberField label="Max block spacing along each skid" value={blockSp} onChange={setBlockSp} unit="ft" hint="4 ft is common; 6 ft max for 4×6 skids." />
                <NumberField label="Max skid spacing across the shed" value={skidSp} onChange={setSkidSp} unit="ft" />
              </>
            )}
          </div>
          <Advanced>
            <NumberField label="Waste" value={waste} onChange={setWaste} unit="%" hint="Gravel compacts ~10–15%; 10% covers it." />
            <SelectField label="Concrete bag size" value={bag} onChange={setBag} options={[40, 50, 60, 80].map((s) => ({ value: s as BagSize, label: `${s} lb bags` }))} />
          </Advanced>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Calculate foundation →</button>
        </form>
      }
      result={
        r && (
          <>
            {r.type === "gravel" && (
              <HeadlineStats
                items={[
                  { label: "Gravel", value: `${fmt(r.gravelTons, 2)} t`, sub: `${fmt(r.gravelYd, 2)} cu yd`, accent: true },
                  { label: "0.5 cu ft bags", value: fmt(r.gravelBags, 0), sub: "if buying bagged" },
                  { label: "Pad size", value: `${fmt(r.padWidthFt, 1)}×${fmt(r.padLengthFt, 1)}`, sub: "ft" },
                  { label: "Timber frame", value: `${fmt(r.timberLf, 0)} ft`, sub: "4×6 perimeter" },
                ]}
              />
            )}
            {r.type === "slab" && (
              <HeadlineStats
                items={[
                  { label: "Concrete", value: `${fmt(r.concreteYd, 2)} yd`, sub: `order ${fmt(r.readyMixYd, 2)} yd`, accent: true },
                  { label: `${bag} lb bags`, value: fmt(r.chosenBags, 0), sub: "if mixing yourself" },
                  { label: "Gravel base", value: `${fmt(r.gravelTons, 2)} t`, sub: `${fmt(r.gravelYd, 2)} cu yd` },
                  { label: "Wire mesh", value: `${r.meshSheets}`, sub: "5×10 ft sheets" },
                ]}
              />
            )}
            {r.type === "blocks" && (
              <HeadlineStats
                items={[
                  { label: "Blocks", value: `${r.blocks}`, sub: `${r.skids} rows × ${r.blocksPerSkid}`, accent: true },
                  { label: "Skids", value: `${r.skids}`, sub: `${fmt(n(l), 0)} ft 4×6 each` },
                  { label: "Gravel bags", value: `${r.gravelBags}`, sub: "under blocks" },
                  { label: "Footprint", value: `${fmt(r.shedSqFt, 0)}`, sub: "sq ft" },
                ]}
              />
            )}
            {r.advice && <p className="text-sm text-steel">{r.advice}</p>}
            <div className={`grid gap-6 ${r.type === "slab" ? "md:grid-cols-2" : ""}`}>
              {r.type === "slab" && <BagTable bags={r.bags} chosen={bag} />}
              <ShoppingList items={shopping(r)} />
            </div>
            <Warnings items={r.warnings} note="Gravel weight uses ~1.4 tons per cubic yard for crushed stone. Ask your supplier; it varies by stone type." />
          </>
        )
      }
    />
  );
}
