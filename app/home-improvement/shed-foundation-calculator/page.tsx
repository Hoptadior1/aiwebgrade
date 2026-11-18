import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import ShedFoundationCalculator from "@/components/calculators/ShedFoundationCalculator";
import { getTool, toolPath } from "@/lib/site";
import { calcShed } from "@/lib/calc/shed";
import { fmt } from "@/lib/calc/concrete";

const tool = getTool("shed-foundation-calculator");

export const metadata: Metadata = {
  title: "Shed Foundation Calculator: Gravel Pad, Slab or Blocks",
  description:
    "Calculate a shed foundation: tons of gravel for a gravel pad, concrete for a slab, or blocks and skids. Works for 8×10, 10×12, 12×16 and any size shed.",
  alternates: { canonical: toolPath(tool) },
};

const faqs: Faq[] = [
  {
    q: "How much gravel do I need for a shed base?",
    a: "For an 8×10 shed with a pad extending 12 in. past each wall and 4 in. deep, you need about 40 cu ft, which is about 1.5 cubic yards or 2.1 tons of crushed stone. A 10×12 shed needs about 2.9 tons. Add 10% for compaction.",
  },
  {
    q: "What is the best foundation for a shed?",
    a: "For most backyard sheds up to about 12×16, a compacted gravel pad inside a timber frame is the best value. It drains well, is forgiving of slight slopes, and is DIY-friendly. A concrete slab is better for heavy loads like riding mowers or workshops. Blocks with skids are fastest for small sheds on firm, level ground.",
  },
  {
    q: "How thick should a shed slab be?",
    a: "4 in. of concrete over 4 in. of compacted gravel is standard for storage sheds. Go to 5–6 in. if you'll park a riding mower, ATV or other vehicle inside. Add welded wire mesh or fiber reinforcement to control cracking.",
  },
  {
    q: "How much concrete do I need for a 10×12 shed slab?",
    a: "At 4 in. thick, a 10×12 slab is 40 cu ft, or 1.48 cubic yards. Order 1.5 yards of ready-mix, or about 74 bags of 80 lb concrete (67 bags plus 10% waste).",
  },
  {
    q: "How many blocks do I need for a shed foundation?",
    a: "For an 8×10 shed with skids no more than 4 ft apart and blocks every 4 ft along each skid, you need 3 skids with 4 blocks each, or 12 blocks. Larger sheds or heavier contents need closer spacing.",
  },
  {
    q: "Do I need a permit for a shed?",
    a: "The International Residential Code exempts one-story accessory buildings up to 200 sq ft from a building permit, but many towns set a lower limit (often 100–120 sq ft) and almost all have setback rules. Check with your local building or zoning office first.",
  },
];

const SIZES: [number, number][] = [
  [8, 8],
  [8, 10],
  [10, 10],
  [10, 12],
  [12, 12],
  [12, 16],
];

export default function Page() {
  const base = { overhangIn: 12, gravelDepthIn: 4, slabIn: 4, baseIn: 4, maxBlockSpacingFt: 4, maxSkidSpacingFt: 4, wastePct: 0, bagSize: 80 as const };
  const rows = SIZES.map(([w, l]) => ({
    w,
    l,
    g: calcShed({ ...base, widthFt: w, lengthFt: l, type: "gravel" }),
    s: calcShed({ ...base, widthFt: w, lengthFt: l, type: "slab" }),
    b: calcShed({ ...base, widthFt: w, lengthFt: l, type: "blocks" }),
  }));

  return (
    <ToolPage
      tool={tool}
      h1="Shed Foundation Calculator"
      intro={<>Gravel, concrete or blocks for any size shed, with a shopping list.</>}
      calculator={<ShedFoundationCalculator />}
      faqs={faqs}
      related={["gravel-calculator", "concrete-calculator", "concrete-slab-cost-calculator", "sonotube-calculator"]}
      updated="2026-11-18"
    >
      <h2>Three ways to build a shed foundation</h2>
      <ul>
        <li>
          <strong>Gravel pad.</strong> 4–6 in. of compacted crushed stone inside a pressure-treated timber frame, extending
          about 12 in. past the shed on every side. It drains well and is the most popular DIY base.
        </li>
        <li>
          <strong>Concrete slab.</strong> 4 in. of concrete over 4 in. of gravel, reinforced with wire mesh. It's the
          strongest and the best choice for heavy equipment or a workshop, but costs the most.
        </li>
        <li>
          <strong>Blocks and skids.</strong> Solid concrete blocks on small gravel pads support 4×6 skids running the length
          of the shed. It's fast and cheap, best on firm, fairly level ground.
        </li>
      </ul>

      <h2>Material by shed size</h2>
      <p>Gravel pad 4 in. deep with 12 in. overhang · slab 4 in. thick · blocks at 4 ft spacing. No waste added.</p>
      <table>
        <thead>
          <tr>
            <th>Shed</th>
            <th>Gravel pad</th>
            <th>Slab concrete</th>
            <th>Blocks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ w, l, g, s, b }) => (
            <tr key={`${w}x${l}`}>
              <td>{w} × {l} ft</td>
              <td>{fmt(g.gravelTons, 1)} tons ({fmt(g.gravelYd, 2)} yd)</td>
              <td>{fmt(s.concreteYd, 2)} yd ({s.chosenBags} × 80 lb)</td>
              <td>{b.blocks} ({b.skids} skids)</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>How the calculator works</h2>
      <p>
        <strong>Gravel:</strong> pad width × pad length × depth gives cubic feet. Divide by 27 for cubic yards and multiply
        by about 1.4 for tons of crushed stone. Bagged gravel usually comes in 0.5 cu ft bags.
      </p>
      <p>
        <strong>Slab:</strong> width × length × thickness for the concrete, the same footprint at your base depth for the
        gravel, plus about 10% extra mesh for overlaps. Ready-mix is rounded up to the next quarter yard.
      </p>
      <p>
        <strong>Blocks:</strong> skids are spaced across the width (never more than your max spacing), and blocks are
        spaced along each skid with one at each end. Each block sits on a 16 × 16 in. pad of 4 in. gravel.
      </p>

      <h2>Building a gravel shed pad</h2>
      <ol>
        <li>Mark the pad 12 in. bigger than the shed on every side and remove the sod and topsoil.</li>
        <li>Build a level frame of 4×6 pressure-treated timbers and pin it with rebar stakes.</li>
        <li>Lay landscape fabric to stop weeds and keep the gravel from sinking into the soil.</li>
        <li>Add gravel in 2 in. layers, compacting each with a plate compactor or hand tamper.</li>
        <li>Screed the surface level and check it in both directions before setting the shed.</li>
      </ol>

      <AdSlot id="content-2" className="my-8" />
      <h2>Which foundation should you choose?</h2>
      <p>
        On sloped lots, a gravel pad needs a taller timber frame on the low side; past about 8 in. of slope, blocks or
        piers are usually easier. In freeze-thaw climates, gravel pads and skids move slightly but evenly, which most
        sheds tolerate. For a large shed, a garage-style building, or anything attached to utilities, consider frost-depth
        piers with the <Link href="/home-improvement/sonotube-calculator">Sonotube calculator</Link> or a footing from the{" "}
        <Link href="/home-improvement/concrete-footing-calculator">concrete footing calculator</Link>.
      </p>
    </ToolPage>
  );
}
