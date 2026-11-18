"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { Advanced, FormError, NumberField, Segmented, SelectField, n } from "@/components/Fields";
import { HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { BOARD_WIDTHS, STOCK_LENGTHS_FT, calcDeckBoards, validateDeckBoards, type DeckBoardInput, type DeckBoardResult } from "@/lib/calc/deckboards";
import { fmt, money } from "@/lib/calc/concrete";

const STEPS = ["Counting rows of boards", "Finding the least-waste board length", "Adding waste & fasteners", "Building your shopping list"];

export default function DeckBoardCalculator() {
  const [len, setLen] = useState("16");
  const [wid, setWid] = useState("12");
  const [bw, setBw] = useState<number>(5.5);
  const [gap, setGap] = useState<number>(0.125);
  const [joist, setJoist] = useState<number>(16);
  const [pattern, setPattern] = useState<"straight" | "diagonal">("straight");
  const [stock, setStock] = useState<number | "auto">("auto");
  const [fast, setFast] = useState<"screws" | "hidden">("screws");
  const [waste, setWaste] = useState("10");
  const [price, setPrice] = useState("");
  const f = useFunnel<DeckBoardResult>();

  const input = (): DeckBoardInput => ({
    lengthFt: n(len), widthFt: n(wid), boardWidthIn: bw, gapIn: gap, joistSpacingIn: joist, pattern, stockFt: stock, wastePct: n(waste || "0"), fastener: fast, pricePerBoard: n(price || "0") || 0,
  });

  const r = f.result;
  const shopping = (x: DeckBoardResult): [string, string][] => [
    [`Deck boards, ${x.chosen.lengthFt} ft`, `${x.boards}`],
    ...(fast === "screws" ? ([["Deck screws (2 per joist per board)", `~${x.screws.toLocaleString()}`]] as [string, string][]) : ([["Hidden fastener clips", `~${x.clips.toLocaleString()}`], ["Starter / end clips", `~${2 * x.rows}`]] as [string, string][])),
    ["Joists the boards cross", `${x.joists} @ ${joist} in. o.c.`],
    ...(x.cost !== null ? ([["Boards cost", money(x.cost)]] as [string, string][]) : []),
  ];

  return (
    <Funnel
      slug="deck-board-calculator"
      toolName="Deck Board Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() => ({
        title: "Now size your deck footings",
        text: "Post count, footing size from your soil, and the concrete and tubes to buy.",
        href: "/home-improvement/deck-footing-calculator",
        cta: "Deck footing calculator",
      })}
      report={() =>
        r && {
          stats: [["Boards", `${r.boards} × ${r.chosen.lengthFt} ft`], ["Linear feet", fmt(r.linearFt, 0)], ["Rows", `${r.rows}`], [fast === "screws" ? "Screws" : "Clips", `~${(fast === "screws" ? r.screws : r.clips).toLocaleString()}`]],
          tables: [
            { title: "Board length options (before waste)", head: ["Stock length", "Boards", "Linear ft"], rows: r.options.map((o) => [`${o.lengthFt} ft${o.lengthFt === r.chosen.lengthFt ? " (chosen)" : ""}`, `${o.boards}`, `${o.linearFt}`]) },
            { title: "Shopping list", rows: shopping(r) },
          ],
          notes: r.warnings,
        }
      }
      inputSummary={[["Deck", `${len} ft (board direction) × ${wid} ft`], ["Boards", `${bw} in. wide, ${gap} in. gap`], ["Pattern", pattern], ["Joists", `${joist} in. o.c.`]]}
      input={
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); f.run(() => validateDeckBoards(input()), () => calcDeckBoards(input())); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Length (direction boards run)" value={len} onChange={setLen} unit="ft" hint="Boards usually run parallel to the house" />
            <NumberField label="Width (across the boards)" value={wid} onChange={setWid} unit="ft" />
            <SelectField label="Board width" value={bw} onChange={setBw} options={BOARD_WIDTHS} />
            <SelectField label="Gap between boards" value={gap} onChange={setGap} options={[{ value: 0.125, label: "1/8 in. (wood, typical)" }, { value: 0.1875, label: "3/16 in. (composite, typical)" }, { value: 0.25, label: "1/4 in." }, { value: 0, label: "None (green lumber that will shrink)" }]} />
            <SelectField label="Joist spacing" value={joist} onChange={setJoist} options={[{ value: 16, label: "16 in. on center" }, { value: 12, label: "12 in. on center" }, { value: 24, label: "24 in. on center" }]} />
            <SelectField label="Board length to buy" value={stock} onChange={setStock} options={[{ value: "auto" as const, label: "Auto: least waste" }, ...STOCK_LENGTHS_FT.map((s) => ({ value: s, label: `${s} ft` }))]} />
          </div>
          <Segmented label="Pattern" value={pattern} onChange={setPattern} options={[{ value: "straight", label: "Straight" }, { value: "diagonal", label: "Diagonal (45°)" }]} />
          <Segmented label="Fasteners" value={fast} onChange={setFast} options={[{ value: "screws", label: "Face screws" }, { value: "hidden", label: "Hidden clips" }]} />
          <Advanced>
            <NumberField label="Waste" value={waste} onChange={setWaste} unit="%" hint="10% straight; diagonal adds 15% more" />
            <NumberField label="Price per board (optional)" value={price} onChange={setPrice} unit="$" />
          </Advanced>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Calculate deck boards →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Deck boards", value: `${r.boards}`, sub: `${r.chosen.lengthFt} ft long`, accent: true },
                { label: "Linear feet", value: fmt(r.linearFt, 0), sub: `${fmt(r.sqFt, 0)} sq ft deck` },
                { label: "Rows", value: `${r.rows}`, sub: r.chosen.perRow > 1 ? `${r.chosen.perRow} boards per row` : "1 board per row" },
                { label: fast === "screws" ? "Screws" : "Clips", value: `~${(fast === "screws" ? r.screws : r.clips).toLocaleString()}`, sub: r.cost !== null ? money(r.cost) + " boards" : undefined },
              ]}
            />
            <ShoppingList title="Board length options (before waste)" items={r.options.map((o): [string, string] => [`${o.lengthFt} ft boards${o.lengthFt === r.chosen.lengthFt ? "  ✓ chosen" : ""}`, `${o.boards} boards · ${o.linearFt} lin ft`])} />
            <ShoppingList items={shopping(r)} />
            <Warnings items={r.warnings} />
          </>
        )
      }
    />
  );
}
