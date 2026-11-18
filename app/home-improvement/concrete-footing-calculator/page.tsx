import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import FootingCalculator from "@/components/calculators/FootingCalculator";
import { getTool, toolPath } from "@/lib/site";
import { boxCuFt, fmt } from "@/lib/calc/concrete";

const tool = getTool("concrete-footing-calculator");

const TITLE = "Concrete Footing Calculator: Yards, Bags & Rebar";
const DESC =
  "Calculate concrete for continuous wall footings and square pad footings. Get cubic yards, 80 lb bag counts, rebar footage and form boards, with a printable report.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: toolPath(tool) },
  openGraph: { title: TITLE, description: DESC, url: toolPath(tool), type: "website" },
};

const faqs: Faq[] = [
  {
    q: "How do you calculate concrete for a footing?",
    a: "Multiply length × width × depth in feet to get cubic feet, then divide by 27 for cubic yards. A 100 ft footing that is 16 in. wide and 8 in. deep is 100 × 1.333 × 0.667 = 88.9 cu ft, or 3.29 cubic yards before waste.",
  },
  {
    q: "How big should a footing be for a house?",
    a: "Under the IRC, footings must be at least 12 in. wide and 6 in. thick, and wider for heavier homes or weaker soil (IRC Table R403.1). 16 to 24 in. wide by 8 to 12 in. thick is common. Your plans or local building department set the final size.",
  },
  {
    q: "How much rebar goes in a footing?",
    a: "Residential continuous footings commonly get two #4 bars running the full length, lapped about 24 in. at splices and kept 3 in. off the soil. Seismic zones and engineered plans often require more.",
  },
  {
    q: "How much does a yard of concrete cost?",
    a: "Ready-mix pricing varies by region and season, and small loads usually carry a short-load fee. Call two local suppliers for a delivered price and enter it in the calculator to estimate your cost.",
  },
  {
    q: "How much extra concrete should I order for footings?",
    a: "Add 5 to 10%. Trench-poured footings vary in width and depth more than forms do, so lean toward 10% when pouring straight into dug trenches.",
  },
  {
    q: "How deep do footings need to be?",
    a: "The bottom of the footing must be below the frost line, which ranges from about 12 in. in the warmest parts of the US to 48 in. or more in northern states. Your local building department publishes the required depth.",
  },
];

export default function Page() {
  const sizes = [
    [12, 6],
    [16, 8],
    [20, 8],
    [20, 10],
    [24, 10],
    [24, 12],
  ].map(([w, d]) => {
    const cuFtPerFt = boxCuFt(12, w, d);
    return { w, d, cuFtPerFt, ftPerYd: 27 / cuFtPerFt };
  });

  return (
    <ToolPage
      tool={tool}
      h1="Concrete Footing Calculator"
      intro={<>Concrete, rebar and forms for wall and pad footings.</>}
      calculator={<FootingCalculator />}
      faqs={faqs}
      related={["concrete-calculator", "sonotube-calculator", "deck-footing-calculator", "concrete-wall-calculator"]}
      updated="2026-11-18"
    >
      <h2>Continuous vs. pad footings</h2>
      <p>
        <strong>Continuous (strip) footings</strong> run under walls such as a house foundation, garage, addition or
        block wall. Enter the total length of every run added together, plus the width and depth of the trench or form.
      </p>
      <p>
        <strong>Pad (spread) footings</strong> are square or rectangular blocks under individual columns or posts:
        porch columns, carport posts, beam supports in a crawlspace. Enter one pad's size and how many you need.
      </p>

      <h2>The formula</h2>
      <p>
        <code>Cubic yards = length (ft) × width (ft) × depth (ft) ÷ 27</code>. Convert inches to feet by dividing by
        12. The calculator then adds your waste percentage, rounds up to the next quarter-yard for ready-mix (how most US
        plants sell it), and converts to 40, 50, 60 and 80 lb bags.
      </p>

      <AdSlot id="content-1" className="my-8" />
      <h2>Concrete per linear foot of footing</h2>
      <table>
        <thead>
          <tr>
            <th>Footing (W × D)</th>
            <th>Cu ft per foot</th>
            <th>Feet per cubic yard</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((s) => (
            <tr key={`${s.w}x${s.d}`}>
              <td>{s.w} × {s.d} in</td>
              <td>{fmt(s.cuFtPerFt, 3)}</td>
              <td>{fmt(s.ftPerYd, 1)} ft</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Example: a 24 × 30 ft garage</h2>
      <p>
        Perimeter = 2 × (24 + 30) = <strong>108 ft</strong>. A 16 × 8 in. footing holds 0.889 cu ft per foot, so 108 ft is 96
        cu ft or 3.56 yd. With 8% waste that's 3.84 yd, so you'd <strong>order 4 yards</strong>. Two #4 bars the full
        length with 10% for laps = 238 ft, or 12 twenty-foot sticks.
      </p>

      <AdSlot id="content-2" className="my-8" />
      <h2>How rebar and forms are estimated</h2>
      <ul>
        <li>Continuous footings: number of bars × length, plus 10% for lap splices at joints and corners.</li>
        <li>Pad footings: a grid each way at your spacing, held 3 in. in from every edge (standard cover against soil).</li>
        <li>Form boards: both sides of a strip footing, or the perimeter of each pad. Skip them if you pour straight into a clean, firm trench and your inspector allows it.</li>
      </ul>

      <h2>Before you pour</h2>
      <ul>
        <li>Get the footing inspection. Most jurisdictions require it before concrete is placed.</li>
        <li>Remove loose soil and standing water from the bottom of the trench; footings must bear on undisturbed soil.</li>
        <li>Support rebar on chairs or concrete dobies so it ends up inside the concrete, not lying on the dirt.</li>
        <li>Set anchor bolts or vertical dowels while the concrete is wet if a wall goes on top.</li>
      </ul>
      <p>
        Pouring round piers instead? Use the <Link href="/home-improvement/sonotube-calculator">Sonotube calculator</Link>.
        For deck posts, the <Link href="/home-improvement/deck-footing-calculator">deck footing calculator</Link> sizes the
        footing from the deck's load.
      </p>
    </ToolPage>
  );
}
