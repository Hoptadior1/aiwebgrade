import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import SonotubeCalculator from "@/components/calculators/SonotubeCalculator";
import { getTool, toolPath } from "@/lib/site";
import { BAG_YIELD_CU_FT, TUBE_DIAMETERS_IN, cylinderCuFt, fmt } from "@/lib/calc/concrete";

const tool = getTool("sonotube-calculator");

export const metadata: Metadata = {
  title: "Sonotube Calculator: How Many Bags of Concrete per Tube?",
  description:
    "Free Sonotube calculator. Enter tube diameter, depth and count to get 40, 50, 60 or 80 lb bags, cubic yards, tube lengths and a printable shopping list.",
  alternates: { canonical: toolPath(tool) },
};

const faqs: Faq[] = [
  {
    q: "How many bags of concrete do I need for a 12 inch Sonotube?",
    a: "A 12 in. tube holds about 0.785 cubic feet per foot of depth. That's about 1.3 bags of 80 lb concrete per foot. A 4 ft deep, 12 in. pier needs about 3.14 cu ft, or 6 bags of 80 lb mix with a little waste.",
  },
  {
    q: "How many 80 lb bags of concrete are in a cubic yard?",
    a: "An 80 lb bag yields about 0.60 cubic feet, so it takes 45 bags to make one cubic yard (27 cu ft). With 60 lb bags (0.45 cu ft) it takes 60 bags.",
  },
  {
    q: "How deep should a Sonotube be?",
    a: "The bottom of the footing must be below your local frost line and at least 12 in. below undisturbed soil. Frost depths range from about 12 in. in the Gulf states to 48 in. or more in Minnesota, Maine and the northern Plains. Your building department sets the number.",
  },
  {
    q: "What size Sonotube do I need for a deck?",
    a: "It depends on the load each post carries and your soil. 8 in. tubes are often too small for deck posts; 10 to 12 in. is common for small decks and 16 to 24 in. for larger spans on weak soil. Use our deck footing calculator to size it from your deck dimensions.",
  },
  {
    q: "Should the Sonotube stick out of the ground?",
    a: "Usually yes, 2 to 6 in. above grade so wood posts and post bases stay dry and water drains away. Include that height in the calculator; it adds concrete.",
  },
  {
    q: "Do I need to remove the Sonotube after the concrete cures?",
    a: "No. Below grade the cardboard can stay and will rot away. Above grade, peel it off after 24–48 hours for a cleaner look.",
  },
];

export default function Page() {
  const rows = TUBE_DIAMETERS_IN.filter((d) => d >= 6 && d <= 24).map((d) => {
    const perFt = cylinderCuFt(d, 12);
    return { d, perFt, bags80: perFt / BAG_YIELD_CU_FT[80], bags60: perFt / BAG_YIELD_CU_FT[60], fourFtBags80: Math.ceil((perFt * 4) / BAG_YIELD_CU_FT[80]) };
  });

  return (
    <ToolPage
      tool={tool}
      h1="Sonotube Calculator"
      intro={<>Bags of concrete, cubic yards and tubes to buy for round pier forms.</>}
      calculator={<SonotubeCalculator />}
      faqs={faqs}
      related={["concrete-calculator", "deck-footing-calculator", "concrete-footing-calculator", "fence-post-depth-calculator"]}
      updated="2026-11-18"
    >
      <h2>How the Sonotube calculator works</h2>
      <p>
        A form tube is a cylinder, so the concrete it holds is the area of the circle times the height of the pour.
        The calculator uses the full tube length: the depth of the hole <em>plus</em> the part that sticks
        above ground.
      </p>
      <p>
        <code>Volume (cu ft) = π × (diameter ÷ 2)² × length ÷ 1,728</code>, with diameter and length in inches.
      </p>
      <p>
        It then adds your waste allowance (10% default covers spills, an uneven hole bottom and concrete left in the
        wheelbarrow), and divides by each bag's published yield: <strong>0.30 cu ft</strong> for a 40 lb bag,{" "}
        <strong>0.375</strong> for 50 lb, <strong>0.45</strong> for 60 lb and <strong>0.60</strong> for 80 lb.
      </p>

      <h2>Concrete per foot of Sonotube (quick reference)</h2>
      <p>Multiply by the depth of your tube in feet. Figures below have no waste added.</p>
      <table>
        <thead>
          <tr>
            <th>Tube diameter</th>
            <th>Cu ft per foot</th>
            <th>80 lb bags per foot</th>
            <th>60 lb bags per foot</th>
            <th>80 lb bags, 4 ft tube</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.d}>
              <td>{r.d} in</td>
              <td>{fmt(r.perFt, 3)}</td>
              <td>{fmt(r.bags80, 2)}</td>
              <td>{fmt(r.bags60, 2)}</td>
              <td>{r.fourFtBags80}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>Example: six piers for a small deck</h2>
      <p>
        Six 12 in. tubes set 42 in. deep with 6 in. above grade are 48 in. long each. Each holds π × 6² × 48 ÷ 1,728 ={" "}
        <strong>3.14 cu ft</strong>. Six of them total 18.85 cu ft, or 20.73 cu ft with 10% waste. Divided by 0.60, that's{" "}
        <strong>35 bags of 80 lb concrete</strong> (about 0.77 cubic yards). One 4 ft tube per pier, cut to length.
      </p>

      <h2>Bags or ready-mix?</h2>
      <p>
        Under about one cubic yard, bagged concrete mixed in a wheelbarrow or small mixer is usually cheaper and easier.
        Most supply yards charge a short-load fee for small ready-mix orders. Above roughly 1.5 yards (around 70
        80-lb bags), a truck usually wins on cost and saves your back, especially if the truck can chute straight into the
        tubes.
      </p>

      <AdSlot id="content-2" className="my-8" />
      <h2>Tips for pouring form tubes</h2>
      <ul>
        <li>Dig the hole 3–4 in. wider than the tube and tamp 4 in. of gravel in the bottom for drainage.</li>
        <li>Check the tube for plumb on two sides and brace it with stakes and screws so it can't drift during the pour.</li>
        <li>Pour in 12 in. lifts and rod each lift with a piece of rebar to remove air pockets.</li>
        <li>Set the post base or J-bolt while the concrete is wet, using a string line so they all align.</li>
        <li>Bell-shaped footing bases (sold as plastic forms) can replace a wider tube where code requires a larger bearing area.</li>
      </ul>
      <p>
        Building a deck? Size the piers from the actual load with the{" "}
        <Link href="/home-improvement/deck-footing-calculator">deck footing calculator</Link>. Pouring wall or pad
        footings instead? Use the <Link href="/home-improvement/concrete-footing-calculator">concrete footing calculator</Link>.
      </p>
      <p className="text-xs text-steel">Sonotube® is a registered trademark of Sonoco Products Company. This site is not affiliated with Sonoco. The calculator works for any round fiber form tube.</p>
    </ToolPage>
  );
}
