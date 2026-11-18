import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import FenceEstimator from "@/components/calculators/FenceEstimator";
import { getTool, toolPath } from "@/lib/site";
import { calcFenceEstimate } from "@/lib/calc/fenceestimate";

const tool = getTool("fence-estimator");

export const metadata: Metadata = {
  title: "Chain Link & Panel Fence Estimator: Full Materials List",
  description:
    "Get a complete chain link fence materials list (fabric, terminal & line posts, top rail, tension bars, bands, ties) or a wood/vinyl panel fence list, with optional cost.",
  alternates: { canonical: toolPath(tool) },
};

const faqs: Faq[] = [
  {
    q: "What materials do I need for a chain link fence?",
    a: "Fabric (sold in 50 ft rolls), terminal posts at every end, corner and gate, line posts about every 10 ft, top rail, and the fittings: a tension bar at every place the fabric ends, tension bands to hold each bar, brace bands and rail end cups for the top rail, post caps, carriage bolts and aluminum ties.",
  },
  {
    q: "How many tension bands do I need?",
    a: "About one less than the fence height in feet for each tension bar: 3 for a 4 ft fence, 5 for a 6 ft fence. Corner posts get two tension bars (one each direction), end and gate posts get one.",
  },
  {
    q: "How far apart are chain link line posts?",
    a: "No more than 10 ft apart, center to center. The calculator spaces them evenly on each side so you don't end up with one short bay.",
  },
  {
    q: "How many fence panels do I need?",
    a: "Divide each side's length by the panel width (usually 8 ft for wood, 6 ft for vinyl) and round up, then subtract one panel's worth for each gate. You need one post per panel plus one at each end, corner and gate.",
  },
  {
    q: "How many ties for a chain link fence?",
    a: "Roughly one tie per foot of height on each line post, plus one every 2 ft along the top rail. A 4 ft fence with 20 line posts and 200 ft of rail needs about 180 ties.",
  },
];

export default function Page() {
  const base = { sidesFt: [100, 50, 100], closed: false, gates: 1, gateWidthFt: 4, lineSpacingFt: 10, rollFt: 50, railStickFt: 21, panelWidthFt: 8, railsPerPanel: 2, pricePerRoll: 0, pricePerTerminal: 0, pricePerLinePost: 0, pricePerRail: 0, pricePerPanel: 0, pricePerPost: 0, pricePerGate: 0 };
  const cl = calcFenceEstimate({ ...base, kind: "chainlink", heightFt: 4 });

  return (
    <ToolPage
      tool={tool}
      h1="Chain Link & Panel Fence Estimator"
      intro={<>A complete fence materials list, down to the last tension band.</>}
      calculator={<FenceEstimator />}
      faqs={faqs}
      related={["fence-post-spacing-calculator", "fence-post-depth-calculator", "concrete-footing-calculator", "shed-foundation-calculator"]}
      updated="2026-11-18"
    >
      <h2>Chain link fence parts explained</h2>
      <ul>
        <li><strong>Terminal posts:</strong> the heavier posts at ends, corners and gates, where the fabric is stretched from.</li>
        <li><strong>Line posts:</strong> lighter posts between terminals, no more than 10 ft apart.</li>
        <li><strong>Top rail:</strong> runs along the top through loop caps on the line posts; swaged sticks slide into each other.</li>
        <li><strong>Tension bar + tension bands:</strong> the flat bar is woven through the fabric's end and clamped to the terminal post with bands.</li>
        <li><strong>Brace bands + rail end cups:</strong> hold the top rail to each terminal post.</li>
        <li><strong>Ties:</strong> aluminum wires that fasten the fabric to line posts and top rail.</li>
      </ul>

      <h2>Example: a U-shaped 4 ft chain link fence</h2>
      <p>Sides of 100, 50 and 100 ft against the house, with one 4 ft walk gate:</p>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {cl.items.map((it) => (
            <tr key={it.name}>
              <td>{it.name}</td>
              <td>{it.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>How the estimate is calculated</h2>
      <ol>
        <li>Each side is split evenly with line posts no more than 10 ft apart (or one post per panel for panel fences).</li>
        <li>Terminal posts go at both ends of an open fence, every corner, and both sides of every gate.</li>
        <li>Fabric and top rail cover the fence length minus gate openings; rail allows ~6 in. overlap per swaged joint.</li>
        <li>Fittings are counted per terminal: corners need two tension bars and two rail ends, ends and gate posts need one.</li>
      </ol>

      <h2>Wood and vinyl panel fences</h2>
      <p>
        Pre-built panels set the post spacing for you, so the count is mostly panels and posts, plus brackets (two per rail per
        panel) and post caps. When a side isn't an exact multiple of the panel width, the last panel gets cut down, so the
        estimate includes full panels to cut from.
      </p>

      <AdSlot id="content-2" className="my-8" />
      <h2>Next steps</h2>
      <p>
        Mark each post location with the <Link href="/home-improvement/fence-post-spacing-calculator">fence post spacing calculator</Link>,
        then get hole depth, hole size and bags of concrete from the{" "}
        <Link href="/home-improvement/fence-post-depth-calculator">fence post depth calculator</Link>. Check your property line, HOA
        rules and local height limits before ordering, and call 811 before you dig.
      </p>
    </ToolPage>
  );
}
