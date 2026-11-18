"use client";

import { useEffect, useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { Advanced, FormError, NumberField, SelectField, n } from "@/components/Fields";
import { BagTable, HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { POST_TYPES, calcFenceDepth, validateFenceDepth, type FenceDepthInput, type FenceDepthResult, type PostType } from "@/lib/calc/fencedepth";
import { fmt, type BagSize } from "@/lib/calc/concrete";

const STEPS = ["Applying the 1/3 burial rule", "Checking frost depth", "Sizing the hole", "Totaling concrete & gravel"];
const GOVERN = { rule: "1/3-of-post rule", minimum: "24 in. minimum", frost: "your frost line" } as const;

export default function FenceDepthCalculator() {
  const [height, setHeight] = useState("6");
  const [post, setPost] = useState<PostType>("4x4");
  const [frost, setFrost] = useState("0");
  const [count, setCount] = useState("10");
  const [gravel, setGravel] = useState("6");
  const [windy, setWindy] = useState<"no" | "yes">("no");
  const [waste, setWaste] = useState("10");
  const [bag, setBag] = useState<BagSize>(50);
  const f = useFunnel<FenceDepthResult>();

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("count")) setCount(q.get("count")!);
  }, []);

  const input = (): FenceDepthInput => ({
    heightFt: n(height),
    postType: post,
    frostDepthIn: n(frost || "0"),
    count: n(count),
    gravelIn: n(gravel || "0"),
    windy: windy === "yes",
    wastePct: n(waste || "0"),
    bagSize: bag,
  });

  const r = f.result;
  const shopping = (x: FenceDepthResult): [string, string][] => [
    [`${POST_TYPES[post].label.split(" (")[0]} posts`, x.buyLengthFt ? `${count} × ${x.buyLengthFt} ft` : `${count} (special order)`],
    [`${bag} lb concrete mix`, `${x.chosenBags} bags`],
    ["Gravel (0.5 cu ft bags)", `${x.gravelBags}`],
    ["Post-hole digger or auger", `${x.holeDiaIn} in. bit`],
  ];

  return (
    <Funnel
      slug="fence-post-depth-calculator"
      toolName="Fence Post Depth Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() => ({
        title: "Now lay out your posts",
        text: "Find how many posts you need and exactly where each one goes, plus rails and pickets.",
        href: "/home-improvement/fence-post-spacing-calculator",
        cta: "Open post spacing calculator",
      })}
      report={() =>
        r && {
          stats: [
            ["Set posts", `${r.embedIn} in deep`],
            ["Hole", `${r.holeDiaIn} in x ${r.holeDepthIn} in`],
            ["Post length", r.buyLengthFt ? `${r.buyLengthFt} ft` : "special"],
            [`${bag} lb bags`, fmt(r.chosenBags, 0)],
          ],
          tables: [
            { title: "Bagged concrete needed", head: ["Bag size", "Bags", "Total weight"], rows: r.bags.map((b) => [`${b.size} lb`, fmt(b.bags, 0), `${fmt(b.weightLb, 0)} lb`]) },
            { title: "Shopping list", rows: shopping(r) },
          ],
          notes: [`Depth set by ${GOVERN[r.governing]}.`, ...r.warnings],
        }
      }
      inputSummary={[
        ["Fence height", `${height} ft`],
        ["Post", POST_TYPES[post].label],
        ["Frost depth", n(frost || "0") > 0 ? `${frost} in` : "not set"],
        ["Number of posts", count],
        ["Exposed / windy", windy === "yes" ? "Yes" : "No"],
      ]}
      input={
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            f.run(() => validateFenceDepth(input()), () => calcFenceDepth(input()));
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Fence height (above ground)" value={height} onChange={setHeight} unit="ft" />
            <SelectField label="Post type" value={post} onChange={setPost} options={(Object.keys(POST_TYPES) as PostType[]).map((k) => ({ value: k, label: POST_TYPES[k].label }))} />
            <NumberField label="Frost depth (0 if none)" value={frost} onChange={setFrost} unit="in" hint="From your building department. ~0–12 in. in the South, 30–48 in.+ up north." />
            <NumberField label="Number of posts" value={count} onChange={setCount} step="1" min={1} />
            <SelectField
              label="Privacy fence, windy site or soft soil?"
              value={windy}
              onChange={setWindy}
              options={[
                { value: "no", label: "No: open fence, firm soil" },
                { value: "yes", label: "Yes: set posts deeper" },
              ]}
            />
            <NumberField label="Gravel under each post" value={gravel} onChange={setGravel} unit="in" hint="6 in. of gravel helps drainage so wood posts don't rot." />
          </div>
          <Advanced>
            <NumberField label="Waste" value={waste} onChange={setWaste} unit="%" />
            <SelectField label="Bag size" value={bag} onChange={setBag} options={[40, 50, 60, 80].map((s) => ({ value: s as BagSize, label: `${s} lb bags${s === 50 ? " (fast-setting size)" : ""}` }))} />
          </Advanced>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Calculate post depth →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Set posts", value: `${r.embedIn}"`, sub: `deep (${GOVERN[r.governing]})`, accent: true },
                { label: "Hole", value: `${r.holeDiaIn}" Ø`, sub: `dig ${r.holeDepthIn} in. deep` },
                { label: "Post length", value: r.buyLengthFt ? `${r.buyLengthFt} ft` : "special", sub: `need ${fmt(r.postLengthFt, 1)} ft` },
                { label: `${bag} lb bags`, value: fmt(r.chosenBags, 0), sub: `${fmt(r.bagsPerPost, 1)} per post` },
              ]}
            />
            <div className="grid gap-6 md:grid-cols-2">
              <BagTable bags={r.bags} chosen={bag} />
              <ShoppingList items={shopping(r)} />
            </div>
            <Warnings items={r.warnings} note="Crown the concrete at the top so water runs away from the post. Fast-setting mix is poured dry into the hole and then watered, per the bag directions." />
          </>
        )
      }
    />
  );
}
