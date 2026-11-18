import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import StairsCalculator from "@/components/calculators/StairsCalculator";
import { getTool, toolPath } from "@/lib/site";
import { calcStairs } from "@/lib/calc/stairs";
import { fmt } from "@/lib/calc/concrete";

const tool = getTool("concrete-stairs-calculator");

const TITLE = "Concrete Stairs Calculator: Steps, Rise/Run & Concrete";
const DESC =
  "Calculate concrete steps: number of steps, equal riser height, total run, IRC code checks, and cubic yards or bags of concrete, with or without a landing.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: toolPath(tool) },
  openGraph: { title: TITLE, description: DESC, url: toolPath(tool), type: "website" },
};

const faqs: Faq[] = [
  {
    q: "How much concrete do I need for steps?",
    a: "Add up the side profile of the steps (each step is a column from the ground up) and multiply by the width. A 4 ft wide set of 4 steps rising 30 in., with 11 in. treads and a 36 in. landing, takes about 46 cu ft with waste: about 1.7 cubic yards or 77 bags of 80 lb concrete.",
  },
  {
    q: "How many steps do I need?",
    a: "Divide the total rise by your maximum riser height and round up. For a 30 in. rise with a 7-3/4 in. maximum, you need 4 risers of 7.5 in. each. With a top landing, there is one fewer tread than risers.",
  },
  {
    q: "What are the code requirements for exterior stairs?",
    a: "Under the IRC, risers can be at most 7-3/4 in. and treads at least 10 in. deep, with no more than 3/8 in. variation between steps. Stairs must be at least 36 in. wide, an exterior door needs a landing at least 36 in. deep, and 4 or more risers require a handrail.",
  },
  {
    q: "What is a comfortable rise and run for outdoor steps?",
    a: "A common rule of thumb is that two risers plus one tread should add up to about 24–26 in. Outdoors, lower risers (6–7 in.) with deeper treads (12–14 in.) feel more natural.",
  },
  {
    q: "Can I fill concrete steps with gravel to save concrete?",
    a: "Yes. On larger stairs, builders often fill the core with compacted gravel or broken concrete and pour a 4–6 in. shell over it. That can cut the concrete needed substantially; this calculator assumes solid stairs, so it's a safe upper estimate.",
  },
];

export default function Page() {
  const rises = [14, 21, 30, 36, 48];
  const rows = rises.map((R) => ({ R, r: calcStairs({ totalRiseIn: R, widthFt: 4, maxRiserIn: 7.75, treadIn: 11, landingIn: 36, wastePct: 5, bagSize: 80 }) }));
  const ex = rows[2].r;
  return (
    <ToolPage
      tool={tool}
      h1="Concrete Stairs Calculator"
      intro={<>Steps, rise and run, code checks and concrete for poured steps.</>}
      calculator={<StairsCalculator />}
      faqs={faqs}
      related={["concrete-calculator", "concrete-slab-cost-calculator", "concrete-footing-calculator", "retaining-wall-calculator"]}
      updated="2026-11-18"
    >
      <h2>How the stairs are laid out</h2>
      <ol>
        <li><strong>Risers:</strong> total rise ÷ max riser, rounded up, so every step is equal and under the limit.</li>
        <li><strong>Treads:</strong> one per riser, or one fewer when the top step is a landing.</li>
        <li><strong>Total run:</strong> treads × tread depth + landing depth. Make sure you have that much room in front of the door.</li>
        <li><strong>Concrete:</strong> each tread is a column from the ground to its height; the landing is full height. Add them, multiply by width, and add waste.</li>
      </ol>

      <h2>Concrete steps by height (4 ft wide, 11 in. treads, 36 in. landing)</h2>
      <table>
        <thead>
          <tr>
            <th>Total rise</th>
            <th>Steps</th>
            <th>Riser</th>
            <th>Concrete</th>
            <th>80 lb bags</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ R, r }) => (
            <tr key={R}>
              <td>{R} in</td>
              <td>{r.risers}</td>
              <td>{fmt(r.riserIn, 2)} in</td>
              <td>{fmt(r.yd, 2)} yd</td>
              <td>{r.chosenBags}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>Example: steps to a back door 30 in. up</h2>
      <p>
        30 ÷ 7.75 rounds up to <strong>{ex.risers} risers of {fmt(ex.riserIn, 2)} in.</strong> With 11 in. treads and a 36 in. landing at the door,
        there are {ex.treads} treads and the steps run {Math.floor(ex.totalRunIn / 12)} ft {ex.totalRunIn % 12} in. out from the house. At 4 ft wide that's{" "}
        <strong>{fmt(ex.yd, 2)} cubic yards</strong> ({ex.chosenBags} bags of 80 lb mix), and since there are 4 risers, you'll need a handrail.
      </p>

      <h2>IRC stair rules at a glance</h2>
      <ul>
        <li>Riser height: 7-3/4 in. maximum; all risers within 3/8 in. of each other.</li>
        <li>Tread depth: 10 in. minimum.</li>
        <li>Width: 36 in. minimum.</li>
        <li>Landing at an exterior door: at least 36 in. deep and as wide as the door.</li>
        <li>Handrail on at least one side when there are 4 or more risers; guards where open sides are over 30 in. above grade.</li>
      </ul>

      <AdSlot id="content-2" className="my-8" />
      <h2>Forming and pouring</h2>
      <ol>
        <li>Excavate and compact a 4 in. gravel base; tie into the foundation with dowels if your inspector requires it.</li>
        <li>Cut side forms to the stair profile from plywood or 2× lumber and brace them well.</li>
        <li>Bevel the bottom of each riser board so you can finish the tread edge; slope treads about 1/8 in. per foot to shed water.</li>
        <li>Pour from the bottom step up, consolidate, and finish with a broom for grip.</li>
      </ol>
      <p>
        Pouring a patio or walkway at the bottom? Price it with the{" "}
        <Link href="/home-improvement/concrete-slab-cost-calculator">concrete slab cost calculator</Link>.
      </p>
    </ToolPage>
  );
}
