import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import FrenchDrainCalculator from "@/components/calculators/FrenchDrainCalculator";
import { getTool, toolPath } from "@/lib/site";
import { calcFrenchDrain } from "@/lib/calc/frenchdrain";
import { fmt } from "@/lib/calc/concrete";

const tool = getTool("french-drain-calculator");

const TITLE = "French Drain Calculator: Gravel, Pipe & Fabric";
const DESC =
  "How much gravel for a French drain? Get tons of gravel, perforated pipe, drainage fabric and the slope to your outlet from trench size.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: toolPath(tool) },
  openGraph: { title: TITLE, description: DESC, url: toolPath(tool), type: "website" },
};

const faqs: Faq[] = [
  {
    q: "How much gravel do I need for a French drain?",
    a: "Multiply trench length × width × depth (in feet) for cubic feet, subtract the space the pipe takes, and divide by 27 for cubic yards. A 50 ft trench 12 in. wide and 18–24 in. deep with a 4 in. pipe needs about 2.9 cubic yards, or roughly 4 tons of washed stone.",
  },
  {
    q: "How deep and wide should a French drain be?",
    a: "Most yard French drains are 6–12 in. wide and 18–24 in. deep. Foundation drains go deeper, down to the footing. The trench should get deeper toward the outlet so the water runs downhill.",
  },
  {
    q: "How much slope does a French drain need?",
    a: "At least 1% (1/8 in. drop per foot), and 1–2% is typical. Over 100 ft that's 1 to 2 ft of drop, so check that your outlet is low enough before you dig.",
  },
  {
    q: "What size gravel is best for a French drain?",
    a: "Clean, washed 3/4 to 1-1/2 in. crushed stone or drain rock. Avoid pea gravel with fines or crusher run (it packs solid and clogs), and avoid limestone screenings.",
  },
  {
    q: "Should the holes in French drain pipe face up or down?",
    a: "Down. Water rises from below into the gravel and enters the pipe through the bottom holes, which keeps the pipe from filling with sediment from above.",
  },
  {
    q: "Do I need landscape fabric for a French drain?",
    a: "Yes, use non-woven geotextile (not plastic weed barrier). Line the trench and fold it over the gravel to keep soil from washing in and clogging the drain.",
  },
];

export default function Page() {
  const lens = [25, 50, 75, 100, 150];
  const rows = lens.map((L) => ({ L, r: calcFrenchDrain({ lengthFt: L, widthIn: 12, depthIn: 18, pipeDiaIn: 4, slopePct: 1, wrapFabric: true, pipeType: "rigid", wastePct: 10, gravelPerTon: 0 }) }));
  const ex = rows[1].r;

  return (
    <ToolPage
      tool={tool}
      h1="French Drain Calculator"
      intro={<>Gravel, perforated pipe, fabric and slope for your drainage trench.</>}
      calculator={<FrenchDrainCalculator />}
      faqs={faqs}
      related={["gravel-calculator", "shed-foundation-calculator", "concrete-slab-cost-calculator", "fence-post-depth-calculator"]}
      updated="2026-11-18"
    >
      <h2>How a French drain works</h2>
      <p>
        A French drain is a gravel-filled trench, usually with a perforated pipe in the bottom, that gives ground water an easy
        path away from a soggy lawn, a basement wall or a driveway. Water seeps into the gravel, drops into the pipe and runs
        downhill to an outlet: a dry well, a daylight point lower on your lot, or a storm drain where your city allows it.
      </p>

      <h2>Gravel needed for a French drain (12 × 18 in. trench, 4 in. pipe, 1% slope)</h2>
      <table>
        <thead>
          <tr>
            <th>Trench length</th>
            <th>Gravel</th>
            <th>Tons (approx.)</th>
            <th>Fabric</th>
            <th>Outlet depth</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ L, r }) => (
            <tr key={L}>
              <td>{L} ft</td>
              <td>{fmt(r.gravelYd, 2)} yd</td>
              <td>{fmt(r.gravelTons, 1)} t</td>
              <td>{fmt(r.fabricSqFt, 0)} sq ft</td>
              <td>{fmt(r.endDepthIn, 1)} in</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>How the calculator works</h2>
      <ol>
        <li><strong>Slope:</strong> length × slope % gives the drop, so the trench deepens toward the outlet. The average depth is used for volume.</li>
        <li><strong>Gravel:</strong> trench volume to about 3 in. below grade, minus the pipe, plus waste. Washed stone is figured at about 1.4 tons per cubic yard; ask your supplier, as it varies.</li>
        <li><strong>Fabric:</strong> enough to line both sides and the bottom and fold over the top with a 12 in. overlap.</li>
        <li><strong>Pipe:</strong> trench length + 5%, in 10 ft rigid lengths or 100 ft corrugated rolls.</li>
      </ol>

      <h2>Example: a 50 ft yard drain</h2>
      <p>
        12 in. wide, starting 18 in. deep with 1% slope, the trench ends <strong>{fmt(ex.endDepthIn, 0)} in.</strong> deep. You need about{" "}
        <strong>{fmt(ex.gravelTons, 1)} tons</strong> ({fmt(ex.gravelYd, 2)} yd) of drain rock, {ex.pipePieces} ten-foot lengths of 4 in.
        perforated pipe and {fmt(ex.fabricSqFt, 0)} sq ft of fabric, and you'll dig out about {fmt(ex.spoilYd, 1)} cubic yards of soil.
      </p>

      <AdSlot id="content-2" className="my-8" />
      <h2>Building it, step by step</h2>
      <ol>
        <li>Call 811 at least a few days before digging. It's free and required.</li>
        <li>Mark the route from the wet area to the outlet and check the fall with a string line and level.</li>
        <li>Dig the trench, keeping the bottom sloped evenly. A rented trencher saves a lot of time on long runs.</li>
        <li>Line it with non-woven fabric, add 2–3 in. of gravel, and lay the pipe with the holes down.</li>
        <li>Fill with gravel to about 3 in. below grade, fold the fabric over, and top with soil and sod or decorative stone.</li>
      </ol>
      <p>
        Wet ground around a shed or patio? Plan a well-drained base with the{" "}
        <Link href="/home-improvement/shed-foundation-calculator">shed foundation calculator</Link>.
      </p>
    </ToolPage>
  );
}
