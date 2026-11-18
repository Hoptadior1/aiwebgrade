import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import ConcreteCalculator from "@/components/calculators/ConcreteCalculator";
import { getTool, toolPath } from "@/lib/site";
import { BAG_SIZES, BAG_YIELD_CU_FT, boxCuFt, bagsNeeded, cuFtToYd, fmt } from "@/lib/calc/concrete";

const tool = getTool("concrete-calculator");

const TITLE = "Concrete Calculator: Cubic Yards, Bags & Cost for Any Project";
const DESC =
  "Free concrete calculator. Add slabs, footings, walls, posts and tubes to one project and get cubic yards, 40/50/60/80 lb bags, and a bags-vs-ready-mix cost comparison.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: toolPath(tool) },
  openGraph: { title: TITLE, description: DESC, url: toolPath(tool), type: "website" },
};

const faqs: Faq[] = [
  {
    q: "How do I calculate how much concrete I need?",
    a: "Multiply length × width × thickness, with all three in feet, to get cubic feet, then divide by 27 for cubic yards. For a 10 × 10 ft slab 4 in. thick: 10 × 10 × 0.333 = 33.3 cu ft, or 1.23 cubic yards. Add 5–10% for waste.",
  },
  {
    q: "How many 80 lb bags of concrete make a yard?",
    a: "45. An 80 lb bag yields about 0.60 cu ft, and a cubic yard is 27 cu ft. It takes 60 bags of 60 lb mix (0.45 cu ft each), 72 bags of 50 lb, or 90 bags of 40 lb.",
  },
  {
    q: "How many bags of concrete for a 10×10 slab?",
    a: "At 4 in. thick, a 10 × 10 slab is 33.3 cu ft: 56 bags of 80 lb concrete, or 75 bags of 60 lb, before waste. With 10% extra, plan on 62 bags of 80 lb mix.",
  },
  {
    q: "Is it cheaper to buy bags or order ready-mix?",
    a: "Bags usually win under about 1 cubic yard. Above roughly 1.5 yards, ready-mix delivery is normally cheaper and much less work, even with a short-load fee. The calculator compares both at your local prices.",
  },
  {
    q: "How much does a yard of concrete cost?",
    a: "Ready-mix is commonly quoted around $125 to $200 per cubic yard delivered in 2026, plus a short-load fee for small orders. Bagged concrete works out to roughly $250 to $350 per yard at typical home-center bag prices.",
  },
  {
    q: "How much extra concrete should I order?",
    a: "Add 5% for formed slabs on a flat, well-prepared base and 10% for footings, trenches and post holes, where the ground is never perfectly square. Running short mid-pour is far worse than having a little left over.",
  },
];

const SPECIALISTS = [
  ["sonotube-calculator", "Round piers and form tubes, with tube lengths to buy"],
  ["concrete-footing-calculator", "Wall and pad footings with rebar and forms"],
  ["deck-footing-calculator", "Sizes deck footings from load and soil type"],
  ["fence-post-depth-calculator", "Hole depth, size and bags per fence post"],
  ["concrete-slab-cost-calculator", "Full installed cost: base, mesh, labor, finish"],
  ["shed-foundation-calculator", "Slab vs gravel pad vs blocks for a shed"],
  ["concrete-wall-calculator", "Poured walls and block walls with grout"],
  ["concrete-stairs-calculator", "Steps, rise/run code checks and concrete"],
] as const;

export default function Page() {
  const slabs: [number, number][] = [[4, 4], [8, 8], [10, 10], [10, 12], [12, 12], [16, 16], [20, 20], [24, 24]];
  const thick = [3, 4, 5, 6, 8];
  return (
    <ToolPage
      tool={tool}
      h1="Concrete Calculator"
      intro={<>Yards, bags and cost for any project. Add every slab, footing and post.</>}
      calculator={<ConcreteCalculator />}
      faqs={faqs}
      related={["concrete-slab-cost-calculator", "sonotube-calculator", "concrete-footing-calculator", "concrete-wall-calculator", "concrete-stairs-calculator", "deck-footing-calculator"]}
      updated="2026-11-18"
    >
      <h2>How to calculate concrete</h2>
      <p>
        Every concrete job is one or more simple shapes. Work out each one in cubic feet, add them up, add waste, then divide
        by 27 for cubic yards or by the bag's yield for a bag count.
      </p>
      <ul>
        <li><strong>Slab, wall or footing (box):</strong> <code>length × width × thickness</code>, all in feet.</li>
        <li><strong>Round slab, column or post hole (cylinder):</strong> <code>3.1416 × radius² × height</code>.</li>
        <li><strong>Tube or ring:</strong> outer cylinder minus inner cylinder.</li>
        <li><strong>Bags:</strong> cubic feet ÷ {BAG_YIELD_CU_FT[80]} for 80 lb, ÷ {BAG_YIELD_CU_FT[60]} for 60 lb, ÷ {BAG_YIELD_CU_FT[50]} for 50 lb, ÷ {BAG_YIELD_CU_FT[40]} for 40 lb.</li>
      </ul>
      <p>
        Inches to feet: divide by 12. A 4 in. slab is 0.333 ft thick, 5 in. is 0.417 ft and 6 in. is 0.5 ft.
      </p>

      <h2>Concrete for common slab sizes (4 in. thick)</h2>
      <p>No waste added. Add 5–10% when you order.</p>
      <table>
        <thead>
          <tr>
            <th>Slab</th>
            <th>Cubic yards</th>
            <th>80 lb bags</th>
            <th>60 lb bags</th>
          </tr>
        </thead>
        <tbody>
          {slabs.map(([a, b]) => {
            const cf = boxCuFt(a * 12, b * 12, 4);
            return (
              <tr key={`${a}x${b}`}>
                <td>{a} × {b} ft</td>
                <td>{fmt(cuFtToYd(cf), 2)}</td>
                <td>{bagsNeeded(cf, 80)}</td>
                <td>{bagsNeeded(cf, 60)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>Cubic yards per 100 sq ft by thickness</h2>
      <table>
        <thead>
          <tr>
            <th>Thickness</th>
            <th>Yards / 100 sq ft</th>
            <th>Sq ft per yard</th>
            <th>Typical use</th>
          </tr>
        </thead>
        <tbody>
          {thick.map((t) => {
            const yd = cuFtToYd(boxCuFt(120, 120, t));
            const use = { 3: "thin overlays, light walks", 4: "patios, walks, sheds", 5: "driveways (cars)", 6: "driveways, garages, trucks", 8: "heavy loads, RV pads" }[t];
            return (
              <tr key={t}>
                <td>{t} in</td>
                <td>{fmt(yd, 2)}</td>
                <td>{fmt(1 / yd * 100, 0)}</td>
                <td>{use}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2>Bags per cubic yard</h2>
      <ul>
        {BAG_SIZES.slice().reverse().map((s) => (
          <li key={s}><strong>{s} lb bags:</strong> {Math.ceil(27 / BAG_YIELD_CU_FT[s])} per cubic yard ({BAG_YIELD_CU_FT[s]} cu ft each)</li>
        ))}
      </ul>

      <AdSlot id="content-2" className="my-8" />
      <h2>Specialist concrete calculators</h2>
      <p>For jobs with their own rules, such as code minimums, rebar, forms or load-based sizing, use the dedicated tool:</p>
      <ul>
        {SPECIALISTS.map(([slug, text]) => {
          const t = getTool(slug);
          return (
            <li key={slug}>
              <Link href={toolPath(t)}><strong>{t.name}</strong></Link>: {text}
            </li>
          );
        })}
      </ul>

      <h2>Tips for ordering and pouring</h2>
      <ul>
        <li>Measure the actual depth of your forms or trench in several spots and use the average; dug footings always run deeper than planned.</li>
        <li>Ask the ready-mix plant about their minimum order, short-load fee and how many minutes of unloading time are included.</li>
        <li>Have enough helpers and tools ready before the truck arrives. Concrete starts setting in about 60–90 minutes on a warm day.</li>
        <li>Keep new concrete damp for the first several days, and avoid pouring when frost is expected without blankets or accelerators.</li>
      </ul>
    </ToolPage>
  );
}
