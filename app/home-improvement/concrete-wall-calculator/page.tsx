import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import WallCalculator from "@/components/calculators/WallCalculator";
import { getTool, toolPath } from "@/lib/site";
import { GROUT_8IN_PER_100SF, calcWall } from "@/lib/calc/wall";
import { fmt } from "@/lib/calc/concrete";

const tool = getTool("concrete-wall-calculator");

const TITLE = "Concrete Wall & Block Calculator: Blocks, Mortar, Grout";
const DESC =
  "Calculate concrete block (CMU) walls: blocks, mortar bags and core-fill grout. Or poured walls: cubic yards, bags and rebar. US units with NCMA grout figures.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: toolPath(tool) },
  openGraph: { title: TITLE, description: DESC, url: toolPath(tool), type: "website" },
};

const faqs: Faq[] = [
  {
    q: "How many concrete blocks do I need?",
    a: "Multiply the wall's area in square feet by 1.125. A standard 8×8×16 block with a 3/8 in. mortar joint covers 0.889 sq ft. A 40 ft × 4 ft wall (160 sq ft) needs 180 blocks, or 189 with 5% extra for breakage and cuts.",
  },
  {
    q: "How much mortar do I need for a block wall?",
    a: "About one 80 lb bag of Type S mortar for every 13 standard 8×8×16 blocks, per manufacturer guidance. Thick joints or full mortar bedding use more.",
  },
  {
    q: "How much grout to fill concrete block cores?",
    a: "For 8 in. hollow block, the NCMA estimating table (TEK 4-2A) gives about 36 cu ft of grout per 100 sq ft of wall when every core is filled, and about 9 cu ft per 100 sq ft when only cores at 32 in. on center are grouted (3% waste included).",
  },
  {
    q: "How much concrete for a poured wall?",
    a: "Multiply length × height × thickness in feet and divide by 27. A 30 ft long, 8 ft high, 8 in. thick foundation wall is 160 cu ft, or about 5.9 cubic yards before waste.",
  },
  {
    q: "Block wall or poured concrete wall, which is better?",
    a: "Poured walls are faster to build and more water-resistant, but need formwork and a ready-mix truck. Block walls need no forms, are easier for DIY, and can be built a little at a time, but take more labor and must be grouted and reinforced for structural use.",
  },
  {
    q: "Do block walls need rebar?",
    a: "Short garden walls often don't. Foundation walls, retaining walls and walls in seismic or high-wind areas usually need vertical rebar in grouted cores, sized by code or an engineer.",
  },
];

export default function Page() {
  const lens = [10, 20, 40, 60, 100];
  const rows = lens.map((L) => ({ L, r: calcWall({ type: "block", lengthFt: L, heightFt: 4, openingsSqFt: 0, thicknessIn: 8, vertSpacingIn: 0, horizSpacingIn: 0, groutSpacing: "32", blockWastePct: 5, wastePct: 0, bagSize: 80 }) }));

  return (
    <ToolPage
      tool={tool}
      h1="Concrete Wall & Block Calculator"
      intro={<>Blocks, mortar and grout, or poured concrete and rebar, for any wall.</>}
      calculator={<WallCalculator />}
      faqs={faqs}
      related={["concrete-calculator", "concrete-footing-calculator", "retaining-wall-calculator", "concrete-slab-cost-calculator"]}
      updated="2026-11-18"
    >
      <h2>Concrete block (CMU) walls</h2>
      <p>
        Standard concrete blocks are 8 × 8 × 16 in. nominal (7-5/8 × 7-5/8 × 15-5/8 in. actual). With a 3/8 in. mortar
        joint each block covers 0.889 sq ft of wall, so you need <strong>1.125 blocks per square foot</strong>. The calculator
        adds your breakage allowance, counts mortar at about 13 blocks per 80 lb bag, and uses the NCMA grout table for the
        cores you fill.
      </p>

      <h2>Blocks, mortar and grout for a 4 ft wall</h2>
      <p>8 in. block, cores grouted at 32 in. on center, 5% extra block:</p>
      <table>
        <thead>
          <tr>
            <th>Wall length</th>
            <th>Blocks</th>
            <th>Mortar (80 lb)</th>
            <th>Grout</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ L, r }) => (
            <tr key={L}>
              <td>{L} ft</td>
              <td>{r.blocks}</td>
              <td>{r.mortarBags} bags</td>
              <td>{fmt(r.groutCuFt, 1)} cu ft ({r.groutBags} bags)</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>Grout per 100 sq ft of 8 in. block wall</h2>
      <p>From the NCMA estimating table (TEK 4-2A), 3% waste included:</p>
      <ul>
        <li>Every core grouted: <strong>{GROUT_8IN_PER_100SF.solid} cu ft</strong></li>
        <li>Cores at 16 in. on center: {GROUT_8IN_PER_100SF["16"]} cu ft</li>
        <li>Cores at 24 in. on center: {GROUT_8IN_PER_100SF["24"]} cu ft</li>
        <li>Cores at 32 in. on center: {GROUT_8IN_PER_100SF["32"]} cu ft</li>
        <li>Cores at 48 in. on center: {GROUT_8IN_PER_100SF["48"]} cu ft</li>
      </ul>

      <h2>Poured concrete walls</h2>
      <p>
        Volume is length × height × thickness. The calculator adds your waste allowance, rounds ready-mix to the next quarter
        yard, and estimates a rebar grid at your vertical and horizontal spacing with about 10% for laps. Foundation walls are
        usually at least 8 in. thick; the IRC tables set thickness and reinforcement by wall height and soil.
      </p>

      <AdSlot id="content-2" className="my-8" />
      <h2>Building tips</h2>
      <ul>
        <li>Every wall needs a footing. Size it with the <Link href="/home-improvement/concrete-footing-calculator">concrete footing calculator</Link>.</li>
        <li>Lay the corners first and run a mason's line between them for each course.</li>
        <li>Grout in lifts of 5 ft or less and consolidate each lift.</li>
        <li>Walls holding back soil behave very differently from free-standing walls. Over 4 ft, get an engineered design.</li>
      </ul>
    </ToolPage>
  );
}
