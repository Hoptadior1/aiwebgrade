import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import RetainingWallCalculator from "@/components/calculators/RetainingWallCalculator";
import { getTool, toolPath } from "@/lib/site";
import { calcRetaining } from "@/lib/calc/retaining";
import { fmt } from "@/lib/calc/concrete";

const tool = getTool("retaining-wall-calculator");

export const metadata: Metadata = {
  title: "Retaining Wall Block Calculator: Blocks, Caps & Gravel",
  description:
    "How many retaining wall blocks do you need? Enter length and height to get wall blocks, cap blocks, buried courses, base and drainage gravel, fabric and drain pipe.",
  alternates: { canonical: toolPath(tool) },
};

const faqs: Faq[] = [
  {
    q: "How many retaining wall blocks do I need?",
    a: "Divide the wall length by the block's face length to get blocks per course, and the total wall height (including the buried course) by the block height to get courses. Multiply and add 5% for cuts. A 30 ft wall, 3 ft tall, with 6 × 16 in. blocks needs 7 courses of 23 blocks, about 170 blocks with waste, plus 24 caps.",
  },
  {
    q: "How deep should the first course of a retaining wall be buried?",
    a: "Most block makers recommend burying about 1 in. for every 8 in. of wall height, with a minimum of about 6 in., and at least one full course. Taller walls and walls on slopes need more.",
  },
  {
    q: "How much gravel do I need behind a retaining wall?",
    a: "Plan a 6 in. compacted gravel base about 12 in. wider than the block, plus 12 in. of clean drainage gravel behind the wall for its full height. For a 30 ft, 3 ft wall that's about 5 cubic yards, or roughly 7 tons.",
  },
  {
    q: "How tall can a retaining wall be without an engineer?",
    a: "Under the IRC, retaining walls up to 4 ft measured from the bottom of the footing to the top are generally exempt from a permit, as long as they don't hold up a surcharge such as a driveway, slope or building. Taller walls usually need an engineered design and geogrid. Local rules can be stricter.",
  },
  {
    q: "Do retaining walls need drainage?",
    a: "Yes. Water pressure behind the wall is the most common reason walls bulge or collapse. Use clean gravel behind the blocks, a perforated drain pipe at the base that outlets downhill, and fabric between the gravel and the soil.",
  },
];

export default function Page() {
  const base = { exposedHeightFt: 3, block: "medium" as const, customH: 0, customL: 0, customD: 0, caps: true, baseIn: 6, drainZoneIn: 12, drainPipe: true, wastePct: 5, surcharge: false };
  const rows = [10, 20, 30, 50, 75].map((L) => ({ L, r: calcRetaining({ ...base, lengthFt: L }) }));
  const ex = rows[2].r;
  return (
    <ToolPage
      tool={tool}
      h1="Retaining Wall Block Calculator"
      intro={<>Blocks, caps, base and drainage gravel for a segmental block wall.</>}
      calculator={<RetainingWallCalculator />}
      faqs={faqs}
      related={["french-drain-calculator", "concrete-wall-calculator", "concrete-footing-calculator", "concrete-stairs-calculator"]}
      updated="2026-11-18"
    >
      <h2>How the calculator works</h2>
      <ol>
        <li><strong>Buried course:</strong> about 1 in. per 8 in. of visible height, at least 6 in. and one full course.</li>
        <li><strong>Courses:</strong> buried + visible height (minus the cap), divided by block height and rounded up.</li>
        <li><strong>Blocks:</strong> wall length ÷ block face length per course × courses, plus waste.</li>
        <li><strong>Gravel:</strong> a 6 in. leveling pad 12 in. wider than the block, plus a 12 in. drainage zone behind the wall.</li>
        <li><strong>Fabric and pipe:</strong> fabric between the gravel and the soil, and a perforated pipe at the base.</li>
      </ol>

      <h2>Blocks for a 3 ft wall (6 × 16 × 10 in. block, with caps)</h2>
      <table>
        <thead>
          <tr>
            <th>Wall length</th>
            <th>Wall blocks</th>
            <th>Caps</th>
            <th>Gravel</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ L, r }) => (
            <tr key={L}>
              <td>{L} ft</td>
              <td>{r.blocks}</td>
              <td>{r.capBlocks}</td>
              <td>{fmt(r.gravelTons, 1)} t</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>Example: a 30 ft garden wall</h2>
      <p>
        3 ft visible with 6 in. blocks: 1 buried course plus 6 visible courses and a cap, for {ex.courses} courses of {ex.blocksPerCourse} blocks:{" "}
        <strong>{ex.blocks} wall blocks</strong> and {ex.capBlocks} caps. Dig a {ex.trenchWidthIn} in. wide, {ex.trenchDepthIn} in. deep trench, and order
        about <strong>{fmt(ex.gravelTons, 1)} tons</strong> of gravel for the base and drainage zone, {ex.fabricSqFt} sq ft of fabric and {ex.pipeFt} ft of
        drain pipe.
      </p>

      <h2>Choosing a block</h2>
      <ul>
        <li><strong>Small garden blocks (≈4 in. tall):</strong> flower beds and borders up to about 2 ft.</li>
        <li><strong>Standard wall blocks (≈6 in. tall):</strong> most DIY walls from 2 to 3 ft.</li>
        <li><strong>Large wall blocks (≈8 in. tall, 12 in. deep):</strong> taller walls and those that need more weight; check the maker's maximum height without geogrid.</li>
      </ul>

      <AdSlot id="content-2" className="my-8" />
      <h2>Building it right</h2>
      <ol>
        <li>Call 811, then dig the trench and compact the native soil.</li>
        <li>Add the gravel pad in 2–3 in. lifts, compact each, and screed it level.</li>
        <li>Set the first course perfectly level; it controls the whole wall.</li>
        <li>Backfill with drainage gravel as you build each course, and lay the drain pipe at the base behind the blocks.</li>
        <li>Glue the caps with masonry adhesive and cap the gravel zone with soil.</li>
      </ol>
      <p>
        Lots of runoff? Pair the wall with a <Link href="/home-improvement/french-drain-calculator">French drain</Link>. Building
        a mortared wall instead? Use the <Link href="/home-improvement/concrete-wall-calculator">concrete wall & block calculator</Link>.
      </p>
    </ToolPage>
  );
}
