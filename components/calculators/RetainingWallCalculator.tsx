"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { Advanced, FormError, NumberField, SelectField, n } from "@/components/Fields";
import { HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { SRW_BLOCKS, calcRetaining, validateRetaining, type BlockKey, type RetainingInput, type RetainingResult } from "@/lib/calc/retaining";
import { fmt } from "@/lib/calc/concrete";

const STEPS = ["Counting courses & buried depth", "Counting blocks & caps", "Sizing base & drainage gravel", "Building your shopping list"];

export default function RetainingWallCalculator() {
  const [len, setLen] = useState("30");
  const [h, setH] = useState("3");
  const [block, setBlock] = useState<BlockKey>("medium");
  const [ch, setCh] = useState("6");
  const [cl, setCl] = useState("16");
  const [cd, setCd] = useState("10");
  const [caps, setCaps] = useState<"yes" | "no">("yes");
  const [load, setLoad] = useState<"no" | "yes">("no");
  const [base, setBase] = useState("6");
  const [drain, setDrain] = useState("12");
  const [pipe, setPipe] = useState<"yes" | "no">("yes");
  const [waste, setWaste] = useState("5");
  const f = useFunnel<RetainingResult>();

  const input = (): RetainingInput => ({
    lengthFt: n(len), exposedHeightFt: n(h), block, customH: n(ch), customL: n(cl), customD: n(cd), caps: caps === "yes", baseIn: n(base || "0"),
    drainZoneIn: n(drain || "0"), drainPipe: pipe === "yes", wastePct: n(waste || "0"), surcharge: load === "yes",
  });

  const r = f.result;
  const shopping = (x: RetainingResult): [string, string][] => [
    [`Wall blocks (${x.blockH}×${x.blockL}×${x.blockD} in.)`, `${x.blocks}`],
    ...(x.capBlocks ? ([["Cap blocks", `${x.capBlocks}`], ["Masonry/landscape block adhesive", "for caps"]] as [string, string][]) : []),
    ["Gravel: base + drainage zone", `${fmt(x.gravelTons, 2)} tons / ${fmt(x.gravelYd, 2)} yd`],
    ["Non-woven landscape fabric", `${x.fabricSqFt} sq ft`],
    ...(x.pipeFt ? ([["4 in. perforated drain pipe", `${x.pipeFt} ft`]] as [string, string][]) : []),
    ["Trench to dig", `${x.trenchWidthIn} in. wide × ${x.trenchDepthIn} in. deep`],
  ];

  return (
    <Funnel
      slug="retaining-wall-calculator"
      toolName="Retaining Wall Block Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() => ({
        title: "Water building up behind the wall?",
        text: "Plan a French drain to carry it away: gravel, pipe, fabric and slope.",
        href: "/home-improvement/french-drain-calculator",
        cta: "French drain calculator",
      })}
      report={() =>
        r && {
          stats: [["Wall blocks", `${r.blocks}`], ["Cap blocks", r.capBlocks ? `${r.capBlocks}` : "none"], ["Courses", `${r.courses} (${r.buriedCourses} buried)`], ["Gravel", `${fmt(r.gravelTons, 2)} tons`]],
          tables: [{ title: "Shopping list", rows: shopping(r) }],
          notes: r.warnings,
        }
      }
      inputSummary={[["Wall", `${len} ft long, ${h} ft above ground`], ["Block", block === "custom" ? `${ch}×${cl}×${cd} in.` : SRW_BLOCKS[block].label], ["Base / drainage zone", `${base} in. / ${drain} in.`], ["Load above wall", load === "yes" ? "Yes" : "No"]]}
      input={
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); f.run(() => validateRetaining(input()), () => calcRetaining(input())); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Wall length" value={len} onChange={setLen} unit="ft" />
            <NumberField label="Height above ground" value={h} onChange={setH} unit="ft" hint="Visible height, including the cap" />
            <SelectField
              label="Block size"
              value={block}
              onChange={setBlock}
              options={[...(Object.keys(SRW_BLOCKS) as (keyof typeof SRW_BLOCKS)[]).map((k) => ({ value: k as BlockKey, label: SRW_BLOCKS[k].label })), { value: "custom" as BlockKey, label: "Custom size…" }]}
            />
            <SelectField label="Cap blocks on top?" value={caps} onChange={setCaps} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
            <SelectField label="Driveway, slope or structure above the wall?" value={load} onChange={setLoad} options={[{ value: "no", label: "No: flat lawn or garden" }, { value: "yes", label: "Yes" }]} />
            <SelectField label="Drain pipe behind the wall?" value={pipe} onChange={setPipe} options={[{ value: "yes", label: "Yes (recommended 2 ft+)" }, { value: "no", label: "No" }]} />
          </div>
          {block === "custom" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField label="Block height" value={ch} onChange={setCh} unit="in" />
              <NumberField label="Block face length" value={cl} onChange={setCl} unit="in" />
              <NumberField label="Block depth" value={cd} onChange={setCd} unit="in" />
            </div>
          )}
          <Advanced>
            <NumberField label="Gravel leveling pad" value={base} onChange={setBase} unit="in" hint="6 in. compacted is standard" />
            <NumberField label="Drainage gravel behind wall" value={drain} onChange={setDrain} unit="in" hint="12 in. is standard" />
            <NumberField label="Block waste" value={waste} onChange={setWaste} unit="%" />
          </Advanced>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Calculate my wall →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Wall blocks", value: `${r.blocks}`, sub: `${r.courses} courses × ${r.blocksPerCourse}`, accent: true },
                { label: "Cap blocks", value: r.capBlocks ? `${r.capBlocks}` : "none" },
                { label: "Buried", value: `${r.buriedIn}"`, sub: `${r.buriedCourses} course${r.buriedCourses > 1 ? "s" : ""} below grade` },
                { label: "Gravel", value: `${fmt(r.gravelTons, 2)} t`, sub: `${fmt(r.gravelYd, 2)} cu yd` },
              ]}
            />
            {r.needsEngineer && (
              <div className="rounded-md border-2 border-red-300 bg-red-50 p-3 text-sm text-red-900">
                <strong>Engineering likely required.</strong> This wall is over the height or load where most codes and block makers require an engineered design, geogrid and a permit.
              </div>
            )}
            <ShoppingList items={shopping(r)} />
            <Warnings items={r.warnings} note="Set the first course level and fully buried on the compacted pad, backfill with gravel as you go, and compact soil behind the gravel zone in 6–8 in. lifts." />
          </>
        )
      }
    />
  );
}
