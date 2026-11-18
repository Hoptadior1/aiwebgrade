import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import SlabCostCalculator from "@/components/calculators/SlabCostCalculator";
import { getTool, toolPath } from "@/lib/site";
import { SLAB_DEFAULTS, calcSlabCost } from "@/lib/calc/slabcost";
import { fmt, money } from "@/lib/calc/concrete";

const tool = getTool("concrete-slab-cost-calculator");

export const metadata: Metadata = {
  title: "Concrete Slab Cost Calculator (2026): Price per Square Foot",
  description:
    "Estimate what a concrete slab costs in 2026: concrete, gravel base, mesh or rebar, labor and finish. Uses your local prices, with US averages filled in. Patio, driveway, shed or garage.",
  alternates: { canonical: toolPath(tool) },
};

const base = { thicknessIn: 4, baseIn: 4, reinforcement: "mesh" as const, rebarSpacingIn: 18, finish: "broom" as const, supply: "readymix" as const, diy: false, wastePct: 5, extras: 0, ...SLAB_DEFAULTS };

const faqs: Faq[] = [
  {
    q: "How much does a concrete slab cost per square foot?",
    a: "Published 2026 estimates commonly put a standard 4-inch slab at about $6 to $12 per square foot installed, with materials alone around $2 to $5. Thicker slabs, rebar, stamped finishes, hard site access and small jobs push the price up. Use the calculator with your local quotes for a real number.",
  },
  {
    q: "How much does a 20×20 concrete slab cost?",
    a: "A 20×20 slab is 400 sq ft. At 4 in. thick with a gravel base, wire mesh and contractor labor at about $4 per sq ft, the calculator's US-average prices come to roughly $2,800–$3,000, around $7 per sq ft. DIY cuts out the labor, but you'll still pay for about 5 yards of concrete and the base.",
  },
  {
    q: "How much is a yard of concrete in 2026?",
    a: "Ready-mix concrete is commonly quoted around $125 to $200 per cubic yard delivered in 2026, depending on region and mix strength. Small orders under a plant's minimum (often 3 to 5 yards) add a short-load fee, often $50 to $150 per truck.",
  },
  {
    q: "Is it cheaper to pour concrete yourself?",
    a: "Labor is usually 40–60% of a slab's installed cost, so DIY can save a lot on small, simple slabs. But concrete sets fast: a 400 sq ft slab is about 5 yards, which needs several helpers, a screed, bull float and edging tools. Large or structural slabs are usually worth hiring out.",
  },
  {
    q: "Should I use bags or ready-mix for a slab?",
    a: "Under about 1 cubic yard (45 bags of 80 lb mix), bags can make sense. Above that, ready-mix is usually cheaper per yard and far less work, even with a short-load fee.",
  },
  {
    q: "How thick should a concrete slab be?",
    a: "4 inches is standard for patios, walkways and sheds. Driveways and garage floors are usually 5–6 inches, especially for trucks or RVs. Always place it on 4 in. of compacted gravel.",
  },
];

export default function Page() {
  const sizes: [number, number, string][] = [[10, 10, "small patio / shed"], [12, 16, "patio / shed"], [20, 20, "patio / 1-car pad"], [24, 24, "2-car garage"], [30, 40, "workshop / pole barn"]];
  const rows = sizes.map(([l, w, use]) => ({ l, w, use, pro: calcSlabCost({ ...base, lengthFt: l, widthFt: w }), diy: calcSlabCost({ ...base, lengthFt: l, widthFt: w, diy: true }) }));
  const ex = rows[2].pro;

  return (
    <ToolPage
      tool={tool}
      h1="Concrete Slab Cost Calculator"
      intro={<>What your slab will cost: concrete, base, reinforcement, labor and finish.</>}
      calculator={<SlabCostCalculator />}
      faqs={faqs}
      related={["shed-foundation-calculator", "concrete-footing-calculator", "concrete-wall-calculator", "sonotube-calculator"]}
      updated="2026-11-18"
    >
      <h2>What goes into the cost of a concrete slab</h2>
      <ul>
        <li><strong>Concrete.</strong> Length × width × thickness, converted to cubic yards and rounded up to the next quarter yard, the way ready-mix plants sell it.</li>
        <li><strong>Short-load fee.</strong> Plants charge extra when you order less than their minimum, often under 3 to 5 yards. Small slabs feel this the most.</li>
        <li><strong>Gravel base.</strong> 4 in. of compacted crushed stone under the slab, plus about 10% for compaction.</li>
        <li><strong>Reinforcement.</strong> Welded wire mesh for patios and walks; a #4 rebar grid for driveways and garages.</li>
        <li><strong>Labor.</strong> Forming, placing, screeding and finishing, usually priced per square foot.</li>
        <li><strong>Finish and extras.</strong> Stamping or coloring, permits, excavation, a pump truck if the truck can't reach.</li>
      </ul>

      <h2>Concrete slab cost by size</h2>
      <p>
        4 in. thick on 4 in. of gravel, wire mesh, broom finish, at the calculator's 2026 US-average prices (ready-mix ${SLAB_DEFAULTS.readyMixPerYd}/yd,
        labor ${SLAB_DEFAULTS.laborPerSqFt}/sq ft, gravel ${SLAB_DEFAULTS.gravelPerTon}/ton). Your area can be 25% higher or lower.
      </p>
      <table>
        <thead>
          <tr>
            <th>Slab</th>
            <th>Use</th>
            <th>Concrete</th>
            <th>Contractor</th>
            <th>DIY materials</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ l, w, use, pro, diy }) => (
            <tr key={`${l}x${w}`}>
              <td>{l} × {w} ft</td>
              <td>{use}</td>
              <td>{fmt(pro.orderYd, 2)} yd</td>
              <td>{money(pro.total)} (${pro.perSqFt.toFixed(2)}/sf)</td>
              <td>{money(diy.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>Example: a 20 × 20 ft patio</h2>
      <p>
        400 sq ft at 4 in. is 4.94 cubic yards; with 5% waste you'd order <strong>{fmt(ex.orderYd, 2)} yards</strong>. Add about{" "}
        {fmt(ex.gravelTons, 1)} tons of gravel base, {ex.meshSheets} sheets of wire mesh and 400 sq ft of labor, and the estimate comes to{" "}
        <strong>{money(ex.total)}</strong>, about ${ex.perSqFt.toFixed(2)} per square foot. That sits inside the ~$6–$12 range most 2026 cost guides quote for a
        standard slab.
      </p>

      <h2>How to lower the cost of a slab</h2>
      <ul>
        <li><strong>Pour more at once.</strong> Combining a patio and walkway into one pour can get you over the short-load minimum.</li>
        <li><strong>Do the prep yourself.</strong> Excavating, building forms and laying gravel are the easiest parts to DIY; leave the pour and finish to a crew.</li>
        <li><strong>Pick the right thickness.</strong> 4 in. is enough for a patio; going to 6 in. adds about 50% more concrete.</li>
        <li><strong>Get three quotes.</strong> Ready-mix prices can differ 15–30% between suppliers in the same town.</li>
      </ul>

      <AdSlot id="content-2" className="my-8" />
      <h2>Before you pour</h2>
      <p>
        Check whether your city needs a permit (most driveways and garage slabs do), call 811 to mark buried utilities, and
        slope the slab about 1/8 in. per foot away from buildings. Need only the materials list? The{" "}
        <Link href="/home-improvement/shed-foundation-calculator">shed foundation calculator</Link> covers slab, gravel pad and
        block bases, and the <Link href="/home-improvement/concrete-footing-calculator">concrete footing calculator</Link> handles
        thickened edges and footings.
      </p>
    </ToolPage>
  );
}
