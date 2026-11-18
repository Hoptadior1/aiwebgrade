"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { FormError, NumberField, Segmented, n } from "@/components/Fields";
import { HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { calcFenceSpacing, parseSides, validateFenceSpacing, type FenceSpacingInput, type FenceSpacingResult } from "@/lib/calc/fencespacing";
import { fmt } from "@/lib/calc/concrete";

const STEPS = ["Splitting each side evenly", "Placing corner & gate posts", "Counting rails & pickets", "Building your layout"];

const ftIn = (ft: number) => {
  const totalIn = Math.round(ft * 12 * 4) / 4; // nearest 1/4 in.
  const f = Math.floor(totalIn / 12);
  const i = totalIn - f * 12;
  return `${f}' ${fmt(i, 2)}"`;
};

export default function FenceSpacingCalculator() {
  const [sides, setSides] = useState("100, 50, 100");
  const [closed, setClosed] = useState<"open" | "closed">("open");
  const [spacing, setSpacing] = useState("8");
  const [gates, setGates] = useState("1");
  const [gateW, setGateW] = useState("4");
  const [rails, setRails] = useState("2");
  const [picketW, setPicketW] = useState("5.5");
  const [gap, setGap] = useState("0");
  const f = useFunnel<FenceSpacingResult>();

  const input = (): FenceSpacingInput => ({
    sidesFt: parseSides(sides),
    closed: closed === "closed",
    maxSpacingFt: n(spacing),
    gates: n(gates || "0"),
    gateWidthFt: n(gateW || "0"),
    rails: n(rails || "0"),
    picketWidthIn: n(picketW || "0"),
    picketGapIn: n(gap || "0"),
  });

  const r = f.result;
  const shopping = (x: FenceSpacingResult): [string, string][] => [
    ["Posts (total)", `${x.totalPosts}`],
    ["  Corner / end posts", `${x.cornerEndPosts}`],
    ["  Line posts", `${x.linePosts}`],
    ...(x.gatePosts ? ([["  Extra gate posts", `${x.gatePosts}`]] as [string, string][]) : []),
    ...(x.rails ? ([["Rails (8 ft boards)", `${x.railBoards8}`]] as [string, string][]) : []),
    ...(x.pickets ? ([["Pickets", `${x.pickets}`]] as [string, string][]) : []),
    ...(n(gates || "0") > 0 ? ([["Gate kits / hardware", gates]] as [string, string][]) : []),
  ];

  return (
    <Funnel
      slug="fence-post-spacing-calculator"
      toolName="Fence Post Spacing Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() =>
        r && {
          title: `How deep should your ${r.totalPosts} posts go?`,
          text: "Get hole depth, hole size, post length and bags of concrete. Your post count is already filled in.",
          href: `/home-improvement/fence-post-depth-calculator?count=${r.totalPosts}`,
          cta: "Open post depth calculator",
        }
      }
      report={() =>
        r && {
          stats: [
            ["Posts", `${r.totalPosts}`],
            ["Sections", `${r.sections}`],
            ["Fence length", `${fmt(r.fencedFt, 1)} ft`],
            ["Pickets", r.pickets ? `${r.pickets}` : "n/a"],
          ],
          tables: [
            { title: "Spacing per side (center to center)", head: ["Side", "Sections", "Spacing"], rows: r.sides.map((s, k) => [`Side ${k + 1}: ${fmt(s.lengthFt, 1)} ft`, `${s.sections}`, ftIn(s.spacingFt)]) },
            { title: "Shopping list", rows: shopping(r).map(([a, b]) => [a.trim(), b]) },
          ],
          notes: r.warnings,
        }
      }
      inputSummary={[
        ["Sides", `${sides} ft`],
        ["Layout", closed === "closed" ? "Closed loop" : "Open (ends don't meet)"],
        ["Max post spacing", `${spacing} ft`],
        ["Gates", n(gates || "0") > 0 ? `${gates} × ${gateW} ft` : "none"],
      ]}
      input={
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            f.run(() => validateFenceSpacing(input()), () => calcFenceSpacing(input()));
          }}
        >
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">Length of each side (ft)</span>
            <input
              value={sides}
              onChange={(e) => setSides(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 font-mono text-base outline-none focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
            />
            <span className="mt-1 block text-xs text-steel">Separate sides with commas. One number = a single straight run. Example: a backyard U-shape is 100, 50, 100.</span>
          </label>
          <Segmented
            label="Does the fence close on itself?"
            value={closed}
            onChange={setClosed}
            options={[
              { value: "open", label: "No: ends are open / meet the house" },
              { value: "closed", label: "Yes: full loop" },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Max post spacing" value={spacing} onChange={setSpacing} unit="ft" hint="8 ft for most wood fences, 6 ft for vinyl panels, up to 10 ft for chain link." />
            <NumberField label="Number of gates" value={gates} onChange={setGates} step="1" />
            <NumberField label="Gate width" value={gateW} onChange={setGateW} unit="ft" hint="Walk gate ~4 ft; drive gate 10–12 ft." />
            <NumberField label="Rails per section (0 = none)" value={rails} onChange={setRails} step="1" hint="2 rails up to 5 ft tall, 3 rails for 6 ft." />
            <NumberField label="Picket width (0 = none)" value={picketW} onChange={setPicketW} unit="in" hint="A nominal 1×6 picket is 5.5 in. wide." />
            <NumberField label="Gap between pickets" value={gap} onChange={setGap} unit="in" hint="0 for privacy; 2–3 in. for a spaced picket fence." />
          </div>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Lay out my fence →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Posts", value: `${r.totalPosts}`, sub: `${r.linePosts} line + ${r.cornerEndPosts} corner/end${r.gatePosts ? ` + ${r.gatePosts} gate` : ""}`, accent: true },
                { label: "Sections", value: `${r.sections}`, sub: "panels / bays" },
                { label: "Fence length", value: `${fmt(r.fencedFt, 0)} ft`, sub: r.gatePosts ? "after gate openings" : "total" },
                { label: "Pickets", value: r.pickets ? fmt(r.pickets, 0) : "n/a", sub: r.pickets ? `${picketW} in. + ${gap || 0} in. gap` : undefined },
              ]}
            />
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-steel">Post layout (center to center)</h3>
              <div className="space-y-3">
                {r.sides.map((s, k) => (
                  <div key={k} className="rounded-md border border-line p-3">
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                      <span className="font-semibold">Side {k + 1}: {fmt(s.lengthFt, 1)} ft</span>
                      <span className="font-mono">{s.sections} sections @ {ftIn(s.spacingFt)}</span>
                    </div>
                    <div className="relative mt-3 h-6">
                      <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-line" />
                      {s.positionsFt.map((p, j) => (
                        <span
                          key={j}
                          className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm ${j === 0 || j === s.sections ? "bg-ink" : "bg-safety"}`}
                          style={{ left: `${(p / s.lengthFt) * 100}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-1 break-words font-mono text-[11px] leading-relaxed text-steel">
                      Mark posts at: {s.positionsFt.map((p) => ftIn(p)).join(" · ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <ShoppingList items={shopping(r)} />
            <Warnings items={r.warnings} note="Measure from the center of one post to the center of the next. Set the corner and end posts first, run a string line between them, then mark the line posts." />
          </>
        )
      }
    />
  );
}
