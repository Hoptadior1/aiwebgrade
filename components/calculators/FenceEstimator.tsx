"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { FormError, NumberField, Segmented, SelectField, n } from "@/components/Fields";
import { HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { calcFenceEstimate, validateFenceEstimate, type FenceEstimateInput, type FenceEstimateResult, type FenceKind } from "@/lib/calc/fenceestimate";
import { parseSides } from "@/lib/calc/fencespacing";
import { fmt, money } from "@/lib/calc/concrete";

const STEPS = ["Laying out each side", "Placing terminal & line posts", "Counting fabric, rails & fittings", "Pricing your list"];

export default function FenceEstimator() {
  const [kind, setKind] = useState<FenceKind>("chainlink");
  const [sides, setSides] = useState("100, 50, 100");
  const [closed, setClosed] = useState<"open" | "closed">("open");
  const [height, setHeight] = useState("4");
  const [gates, setGates] = useState("1");
  const [gateW, setGateW] = useState("4");
  const [lineSp, setLineSp] = useState("10");
  const [panelW, setPanelW] = useState<number>(8);
  const [rails, setRails] = useState("2");
  const [pRoll, setPRoll] = useState("");
  const [pTerm, setPTerm] = useState("");
  const [pLine, setPLine] = useState("");
  const [pRail, setPRail] = useState("");
  const [pPanel, setPPanel] = useState("");
  const [pPost, setPPost] = useState("");
  const [pGate, setPGate] = useState("");
  const f = useFunnel<FenceEstimateResult>();

  const p = (s: string) => n(s || "0") || 0;
  const input = (): FenceEstimateInput => ({
    kind, sidesFt: parseSides(sides), closed: closed === "closed", heightFt: n(height), gates: n(gates || "0"), gateWidthFt: n(gateW || "0"),
    lineSpacingFt: n(lineSp), rollFt: 50, railStickFt: 21, panelWidthFt: panelW, railsPerPanel: n(rails || "2"),
    pricePerRoll: p(pRoll), pricePerTerminal: p(pTerm), pricePerLinePost: p(pLine), pricePerRail: p(pRail), pricePerPanel: p(pPanel), pricePerPost: p(pPost), pricePerGate: p(pGate),
  });

  const r = f.result;
  const rows = (x: FenceEstimateResult): [string, string][] =>
    x.items.map((it) => [it.name, it.price ? `${it.qty} × $${it.price} = ${money(it.qty * it.price)}` : `${it.qty}`]);

  return (
    <Funnel
      slug="fence-estimator"
      toolName="Chain Link & Panel Fence Estimator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() =>
        r && {
          title: `Set your ${r.posts} posts right`,
          text: "Hole depth, hole size, post length and bags of concrete. Your post count is filled in.",
          href: `/home-improvement/fence-post-depth-calculator?count=${r.posts}`,
          cta: "Fence post depth calculator",
        }
      }
      report={() =>
        r && {
          stats: [["Fence length", `${fmt(r.fencedFt, 0)} ft`], ["Posts", `${r.posts}`], ["Gates", gates || "0"], ["Materials cost", r.cost !== null ? money(r.cost) : "add prices"]],
          tables: [{ title: "Materials list", rows: rows(r) }],
          notes: r.warnings,
        }
      }
      inputSummary={[["Fence type", kind === "chainlink" ? "Chain link" : `Panels (${panelW} ft)`], ["Sides", `${sides} ft`], ["Height", `${height} ft`], ["Gates", n(gates || "0") ? `${gates} × ${gateW} ft` : "none"]]}
      input={
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); f.run(() => validateFenceEstimate(input()), () => calcFenceEstimate(input())); }}>
          <Segmented label="Fence type" value={kind} onChange={setKind} options={[{ value: "chainlink", label: "Chain link" }, { value: "panel", label: "Wood / vinyl panels" }]} />
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">Length of each side (ft)</span>
            <input value={sides} onChange={(e) => setSides(e.target.value)} className="w-full rounded-md border border-line bg-white px-3 py-2.5 font-mono text-base outline-none focus:border-blueprint focus:ring-2 focus:ring-blueprint/20" />
            <span className="mt-1 block text-xs text-steel">Separate sides with commas, e.g. 100, 50, 100.</span>
          </label>
          <Segmented label="Does the fence close on itself?" value={closed} onChange={setClosed} options={[{ value: "open", label: "No: open ends / meets the house" }, { value: "closed", label: "Yes: full loop" }]} />
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField label="Fence height" value={height} onChange={setHeight} unit="ft" />
            <NumberField label="Number of gates" value={gates} onChange={setGates} step="1" />
            <NumberField label="Gate width" value={gateW} onChange={setGateW} unit="ft" />
            {kind === "chainlink" ? (
              <NumberField label="Max line post spacing" value={lineSp} onChange={setLineSp} unit="ft" hint="10 ft max is standard." />
            ) : (
              <>
                <SelectField label="Panel width" value={panelW} onChange={setPanelW} options={[{ value: 8, label: "8 ft (most wood)" }, { value: 6, label: "6 ft (most vinyl)" }]} />
                <NumberField label="Rails per panel" value={rails} onChange={setRails} step="1" hint="2 for ≤5 ft, 3 for 6 ft" />
              </>
            )}
          </div>
          <details className="group rounded-md border border-line bg-concrete/40">
            <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-steel">Add your store prices for a cost estimate (optional)</summary>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              {kind === "chainlink" ? (
                <>
                  <NumberField label="Fabric, per 50 ft roll" value={pRoll} onChange={setPRoll} unit="$" />
                  <NumberField label="Terminal post, each" value={pTerm} onChange={setPTerm} unit="$" />
                  <NumberField label="Line post, each" value={pLine} onChange={setPLine} unit="$" />
                  <NumberField label="Top rail, per 21 ft stick" value={pRail} onChange={setPRail} unit="$" />
                </>
              ) : (
                <>
                  <NumberField label="Panel, each" value={pPanel} onChange={setPPanel} unit="$" />
                  <NumberField label="Post, each" value={pPost} onChange={setPPost} unit="$" />
                </>
              )}
              <NumberField label="Gate, each" value={pGate} onChange={setPGate} unit="$" />
            </div>
          </details>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Build my materials list →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Fence length", value: `${fmt(r.fencedFt, 0)} ft`, sub: r.fencedFt !== r.totalFt ? "after gate openings" : "total", accent: true },
                { label: "Posts", value: `${r.posts}`, sub: `${r.terminalPosts} ${kind === "chainlink" ? "terminal" : "corner/end/gate"} + ${r.linePosts} line` },
                { label: kind === "chainlink" ? "Fabric rolls" : "Panels", value: `${r.items[0].qty}`, sub: kind === "chainlink" ? "50 ft each" : `${panelW} ft each` },
                { label: "Materials cost", value: r.cost !== null ? money(r.cost) : "n/a", sub: r.cost !== null ? "priced items only" : "add prices" },
              ]}
            />
            <ShoppingList title="Materials list" items={rows(r)} />
            <Warnings items={r.warnings} />
          </>
        )
      }
    />
  );
}
