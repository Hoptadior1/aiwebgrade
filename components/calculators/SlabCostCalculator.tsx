"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { FormError, NumberField, Segmented, SelectField, n } from "@/components/Fields";
import { HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { SLAB_DEFAULTS, calcSlabCost, validateSlabCost, type Finish, type Reinforcement, type SlabCostInput, type SlabCostResult, type Supply } from "@/lib/calc/slabcost";
import { fmt, money } from "@/lib/calc/concrete";

const STEPS = ["Calculating concrete volume", "Adding base & reinforcement", "Applying labor & finish", "Totaling your estimate"];
const D = SLAB_DEFAULTS;

export default function SlabCostCalculator() {
  const [l, setL] = useState("20");
  const [w, setW] = useState("20");
  const [t, setT] = useState("4");
  const [base, setBase] = useState("4");
  const [reinf, setReinf] = useState<Reinforcement>("mesh");
  const [spacing, setSpacing] = useState("18");
  const [finish, setFinish] = useState<Finish>("broom");
  const [supply, setSupply] = useState<Supply>("readymix");
  const [who, setWho] = useState<"pro" | "diy">("pro");
  const [waste, setWaste] = useState("5");
  const [rm, setRm] = useState(String(D.readyMixPerYd));
  const [slf, setSlf] = useState(String(D.shortLoadFee));
  const [bag, setBag] = useState(String(D.bagPrice80));
  const [labor, setLabor] = useState(String(D.laborPerSqFt));
  const [gravel, setGravel] = useState(String(D.gravelPerTon));
  const [mesh, setMesh] = useState(String(D.meshSheetPrice));
  const [rebar, setRebar] = useState(String(D.rebarStickPrice));
  const [stamp, setStamp] = useState(String(D.stampedPerSqFt));
  const [extras, setExtras] = useState("0");
  const f = useFunnel<SlabCostResult>();

  const input = (): SlabCostInput => ({
    lengthFt: n(l), widthFt: n(w), thicknessIn: n(t), baseIn: n(base || "0"), reinforcement: reinf, rebarSpacingIn: n(spacing), finish, supply,
    diy: who === "diy", wastePct: n(waste || "0"), readyMixPerYd: n(rm), shortLoadFee: n(slf || "0"), shortLoadUnderYd: D.shortLoadUnderYd,
    bagPrice80: n(bag), laborPerSqFt: n(labor || "0"), gravelPerTon: n(gravel || "0"), meshSheetPrice: n(mesh || "0"), rebarStickPrice: n(rebar || "0"),
    stampedPerSqFt: n(stamp || "0"), extras: n(extras || "0"),
  });

  const r = f.result;
  return (
    <Funnel
      slug="concrete-slab-cost-calculator"
      toolName="Concrete Slab Cost Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() => ({
        title: "Building a shed on this slab?",
        text: "Compare the slab with a gravel pad or blocks and skids, often a fraction of the cost.",
        href: "/home-improvement/shed-foundation-calculator",
        cta: "Compare shed foundations",
      })}
      report={() =>
        r && {
          stats: [["Total estimate", money(r.total)], ["Per sq ft", `$${r.perSqFt.toFixed(2)}`], ["Concrete", `${fmt(r.orderYd, 2)} yd`], ["Area", `${fmt(r.sqFt, 0)} sq ft`]],
          tables: [{ title: "Cost breakdown", rows: [...r.lines.map((x) => [`${x.label} (${x.detail})`, money(x.amount)]), ["Total", money(r.total)]] }],
          notes: ["Estimate uses the prices shown in your inputs. Get 2–3 local quotes before you commit.", ...r.warnings],
        }
      }
      inputSummary={[
        ["Slab", `${l} × ${w} ft, ${t} in. thick`],
        ["Gravel base", `${base || 0} in`],
        ["Reinforcement", reinf === "none" ? "None" : reinf === "mesh" ? "Wire mesh" : `#4 rebar @ ${spacing} in`],
        ["Finish", finish === "broom" ? "Broom" : "Stamped"],
        ["Concrete", supply === "readymix" ? `Ready-mix @ $${rm}/yd` : `80 lb bags @ $${bag}`],
        ["Labor", who === "diy" ? "DIY" : `$${labor}/sq ft`],
      ]}
      input={
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); f.run(() => validateSlabCost(input()), () => calcSlabCost(input())); }}>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField label="Length" value={l} onChange={setL} unit="ft" />
            <NumberField label="Width" value={w} onChange={setW} unit="ft" />
            <NumberField label="Thickness" value={t} onChange={setT} unit="in" hint="4 in. patio, 5–6 in. driveway" />
          </div>
          <Segmented label="Who's doing the work?" value={who} onChange={setWho} options={[{ value: "pro", label: "Hiring a contractor" }, { value: "diy", label: "DIY" }]} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Reinforcement" value={reinf} onChange={setReinf} options={[{ value: "mesh", label: "Welded wire mesh" }, { value: "rebar", label: "#4 rebar grid" }, { value: "none", label: "None / fiber mix" }]} />
            <SelectField label="Finish" value={finish} onChange={setFinish} options={[{ value: "broom", label: "Broom / smooth (standard)" }, { value: "stamped", label: "Stamped / decorative" }]} />
            <SelectField label="Concrete supply" value={supply} onChange={setSupply} options={[{ value: "readymix", label: "Ready-mix truck" }, { value: "bags", label: "80 lb bags (mix yourself)" }]} />
            <NumberField label="Gravel base" value={base} onChange={setBase} unit="in" hint="4 in. of compacted gravel is typical." />
          </div>
          <details className="group rounded-md border border-line bg-concrete/40" open>
            <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-steel">Your local prices (2026 US averages filled in)</summary>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              {supply === "readymix" ? (
                <>
                  <NumberField label="Ready-mix per cubic yard" value={rm} onChange={setRm} unit="$" hint="Typically $125–$200 delivered." />
                  <NumberField label="Short-load fee (under 5 yd)" value={slf} onChange={setSlf} unit="$" hint="Often $50–$150 per truck." />
                </>
              ) : (
                <NumberField label="Price per 80 lb bag" value={bag} onChange={setBag} unit="$" />
              )}
              {who === "pro" && <NumberField label="Labor: form, pour & finish" value={labor} onChange={setLabor} unit="$/sq ft" hint="Commonly $3–$8 per sq ft." />}
              <NumberField label="Gravel per ton" value={gravel} onChange={setGravel} unit="$" />
              {reinf === "mesh" && <NumberField label="Wire mesh per 5×10 sheet" value={mesh} onChange={setMesh} unit="$" />}
              {reinf === "rebar" && (
                <>
                  <NumberField label="#4 rebar per 20 ft stick" value={rebar} onChange={setRebar} unit="$" />
                  <NumberField label="Rebar grid spacing" value={spacing} onChange={setSpacing} unit="in" />
                </>
              )}
              {finish === "stamped" && <NumberField label="Stamping, extra per sq ft" value={stamp} onChange={setStamp} unit="$" hint="Often $10–$14 extra." />}
              <NumberField label="Permit, excavation, pump etc." value={extras} onChange={setExtras} unit="$" />
              <NumberField label="Concrete waste" value={waste} onChange={setWaste} unit="%" />
            </div>
          </details>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Estimate my slab cost →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Total estimate", value: money(r.total), sub: who === "diy" ? "materials only" : "materials + labor", accent: true },
                { label: "Per sq ft", value: `$${r.perSqFt.toFixed(2)}`, sub: `${fmt(r.sqFt, 0)} sq ft` },
                { label: "Concrete", value: `${fmt(r.orderYd, 2)} yd`, sub: supply === "bags" ? `${r.bags80} × 80 lb bags` : "ready-mix order" },
                { label: "Gravel base", value: `${fmt(r.gravelTons, 1)} t`, sub: "crushed stone" },
              ]}
            />
            <div>
              <ShoppingList title="Cost breakdown" items={[...r.lines.map((x): [string, string] => [`${x.label}: ${x.detail}`, money(x.amount)]), ["Total", money(r.total)]]} />
            </div>
            <Warnings items={r.warnings} note="These are your inputs × quantities. Prices vary a lot by region and season, so get 2–3 local quotes before you commit." />
          </>
        )
      }
    />
  );
}
