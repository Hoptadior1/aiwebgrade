import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import GravelCalculator from "@/components/calculators/GravelCalculator";
import { getTool, toolPath } from "@/lib/site";
import { USES, calcGravel } from "@/lib/calc/gravel";
import { fmt } from "@/lib/calc/concrete";

const tool = getTool("gravel-calculator");

export const metadata: Metadata = {
  title: "Gravel Calculator: Tons, Cubic Yards & Bags",
  description:
    "Free gravel calculator. Add driveways, paths and beds with their own depths and get tons, cubic yards and bags of gravel, plus fabric and a bulk vs bagged cost comparison.",
  alternates: { canonical: toolPath(tool) },
};

const faqs: Faq[] = [
  {
    q: "How do I calculate how much gravel I need?",
    a: "Multiply length × width (ft) for square feet, multiply by depth in feet (inches ÷ 12) for cubic feet, and divide by 27 for cubic yards. Multiply cubic yards by about 1.4 for tons. A 12 × 50 ft driveway at 4 in. deep is 200 cu ft, or 7.4 yd, which is about 10.4 tons before compaction.",
  },
  {
    q: "How many tons of gravel do I need for a driveway?",
    a: "For a typical single-car driveway 12 ft wide and 50 ft long at 4 in. deep, plan about 11–12 tons including compaction. Driveways on soft soil need 8–12 in. built up in layers, which can triple that.",
  },
  {
    q: "How much does a cubic yard of gravel weigh?",
    a: "Most gravel weighs about 1.3 to 1.7 tons (2,600–3,400 lb) per cubic yard, depending on stone type and moisture. 1.4 tons is a common figure for crushed stone, but ask your supplier for their number.",
  },
  {
    q: "How much area does a ton of gravel cover?",
    a: "At about 1.4 tons per cubic yard, one ton covers roughly 115 sq ft at 2 in. deep, 77 sq ft at 3 in., or 58 sq ft at 4 in.",
  },
  {
    q: "Is it cheaper to buy gravel in bags or bulk?",
    a: "Bulk is almost always cheaper above a ton or two. A 0.5 cu ft bag holds only about 1/54 of a cubic yard, so a single ton is roughly 40 bags. Bulk suppliers often charge a delivery fee, which the calculator includes.",
  },
  {
    q: "How deep should gravel be?",
    a: "2–3 in. for paths and decorative beds, 3 in. for a pea gravel patio, 4–6 in. compacted for a driveway or a base under pavers or a shed.",
  },
];

export default function Page() {
  const sizes = [100, 200, 500, 1000];
  const depths = [2, 3, 4, 6];
  const t = (sq: number, d: number) => calcGravel({ areas: [{ id: 1, shape: "rect", a: sq, b: 1, depthIn: d }], compactionPct: 0, tonsPerYd: 1.4, pricePerTon: 0, deliveryFee: 0, bagPrice: 0, fabric: false });
  return (
    <ToolPage
      tool={tool}
      h1="Gravel Calculator"
      intro={<>Tons, cubic yards and bags for driveways, paths, pads and beds.</>}
      calculator={<GravelCalculator />}
      faqs={faqs}
      related={["shed-foundation-calculator", "french-drain-calculator", "retaining-wall-calculator", "concrete-calculator"]}
      updated="2026-11-18"
    >
      <h2>How to calculate gravel</h2>
      <ol>
        <li><strong>Area:</strong> length × width for rectangles, 3.1416 × radius² for circles, ½ × base × height for triangles.</li>
        <li><strong>Volume:</strong> area × depth in feet (inches ÷ 12) = cubic feet; ÷ 27 = cubic yards.</li>
        <li><strong>Weight:</strong> cubic yards × about 1.4 = tons (most gravel runs 1.3–1.7).</li>
        <li><strong>Compaction:</strong> add about 10–15% for crushed stone that will be compacted.</li>
      </ol>

      <h2>Tons of gravel by area and depth</h2>
      <p>At 1.4 tons per cubic yard, no compaction allowance:</p>
      <table>
        <thead>
          <tr>
            <th>Area</th>
            {depths.map((d) => <th key={d}>{d} in deep</th>)}
          </tr>
        </thead>
        <tbody>
          {sizes.map((sq) => (
            <tr key={sq}>
              <td>{sq.toLocaleString()} sq ft</td>
              {depths.map((d) => <td key={d}>{fmt(t(sq, d).tons, 1)} t</td>)}
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>How deep should gravel be?</h2>
      <table>
        <thead>
          <tr>
            <th>Use</th>
            <th>Typical depth</th>
          </tr>
        </thead>
        <tbody>
          {USES.map((u) => (
            <tr key={u.label}>
              <td>{u.label}</td>
              <td>{u.depth}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Choosing the right gravel</h2>
      <ul>
        <li><strong>Crusher run / road base:</strong> crushed stone with fines that packs hard. Best for driveway bases and under pavers.</li>
        <li><strong>#57 or 3/4 in. clean crushed stone:</strong> drains well. Good for driveway top layers, shed pads and drainage.</li>
        <li><strong>Pea gravel:</strong> smooth and comfortable underfoot for patios, paths and play areas, but it shifts; edge it well.</li>
        <li><strong>River rock:</strong> decorative beds and dry creek beds.</li>
      </ul>

      <AdSlot id="content-2" className="my-8" />
      <h2>Gravel project calculators</h2>
      <ul>
        <li><Link href="/home-improvement/shed-foundation-calculator"><strong>Shed foundation calculator</strong></Link>: gravel pad with timber frame, or a slab or blocks.</li>
        <li><Link href="/home-improvement/french-drain-calculator"><strong>French drain calculator</strong></Link>: drain rock, pipe and fabric for a trench.</li>
        <li><Link href="/home-improvement/retaining-wall-calculator"><strong>Retaining wall calculator</strong></Link>: base and drainage gravel behind a block wall.</li>
        <li><Link href="/home-improvement/concrete-calculator"><strong>Concrete calculator</strong></Link>: when the job needs concrete instead.</li>
      </ul>
    </ToolPage>
  );
}
