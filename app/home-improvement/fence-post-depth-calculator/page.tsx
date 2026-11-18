import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import FenceDepthCalculator from "@/components/calculators/FenceDepthCalculator";
import { getTool, toolPath } from "@/lib/site";
import { calcFenceDepth } from "@/lib/calc/fencedepth";
import { fmt } from "@/lib/calc/concrete";

const tool = getTool("fence-post-depth-calculator");

const TITLE = "Fence Post Depth Calculator: How Deep to Set Fence Posts";
const DESC =
  "How deep should fence posts be? Enter fence height, post size and frost depth to get hole depth, hole diameter, post length and bags of concrete per post.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: toolPath(tool) },
  openGraph: { title: TITLE, description: DESC, url: toolPath(tool), type: "website" },
};

const faqs: Faq[] = [
  {
    q: "How deep should a fence post be?",
    a: "The common rule is to bury one third of the post's total length, which works out to half the fence height above ground, and never less than 24 in. A 6 ft fence needs posts set about 36 in. deep, so you'd buy 10 ft posts (9 ft needed). In cold climates, go below the frost line.",
  },
  {
    q: "How deep should a 6 foot fence post be?",
    a: "About 3 ft (36 in.) deep, plus about 6 in. of gravel in the bottom of the hole. That means a 10 ft post for a 6 ft fence, or an 8 ft post set 24 in. deep in firm soil where wind exposure is low and there's no frost concern.",
  },
  {
    q: "How wide should a fence post hole be?",
    a: "About three times the width of the post. A 4×4 (3.5 in. actual) needs a 10–12 in. hole, and a 6×6 (5.5 in.) needs a 16–18 in. hole. Steel chain-link posts typically go in 6–12 in. holes.",
  },
  {
    q: "How many bags of concrete per fence post?",
    a: "For a 4×4 set 36 in. deep in an 11 in. hole, you need about 1.7 cu ft of concrete, which is about 5 bags of 50 lb fast-setting mix or 3 bags of 80 lb mix. Use the calculator for your exact post size and depth.",
  },
  {
    q: "Do fence posts need to go below the frost line?",
    a: "Building codes usually don't require it for fences, but posts set above the frost line can be pushed up by frost heave, leaving your fence crooked. In areas with deep frost, setting posts below the frost line, or at least 36–42 in., is the safer choice.",
  },
  {
    q: "Should I put gravel at the bottom of a fence post hole?",
    a: "Yes. Around 6 in. of gravel lets water drain away from the end of a wood post so it doesn't sit in water and rot. Tamp it firm before setting the post.",
  },
];

export default function Page() {
  const rows = [3, 4, 5, 6, 8].map((h) => {
    const r = calcFenceDepth({ heightFt: h, postType: "4x4", frostDepthIn: 0, count: 1, gravelIn: 6, windy: false, wastePct: 0, bagSize: 80 });
    return { h, r };
  });
  const six = calcFenceDepth({ heightFt: 6, postType: "4x4", frostDepthIn: 0, count: 20, gravelIn: 6, windy: false, wastePct: 10, bagSize: 50 });

  return (
    <ToolPage
      tool={tool}
      h1="Fence Post Depth Calculator"
      intro={<>Hole depth, hole size, post length and concrete for every fence post.</>}
      calculator={<FenceDepthCalculator />}
      faqs={faqs}
      related={["fence-estimator", "concrete-calculator", "fence-post-spacing-calculator", "sonotube-calculator"]}
      updated="2026-11-18"
    >
      <h2>How deep to set fence posts</h2>
      <p>
        Fence builders in the US use a simple rule: <strong>bury one third of the post</strong>. Since one third buried means
        two thirds above ground, the depth is half the fence height. The calculator applies that rule, then checks two
        limits:
      </p>
      <ul>
        <li><strong>24 in. minimum.</strong> Short fences still need enough post in the ground to resist leaning.</li>
        <li><strong>Frost line.</strong> If your frost depth is deeper than the rule, the post goes below the frost line so frost heave can't push it up.</li>
      </ul>
      <p>
        Tall privacy fences catch wind like a sail. If yours is solid, on an exposed lot, or in soft soil, choose "set
        posts deeper" and the calculator adds 25%.
      </p>

      <h2>Fence post depth chart</h2>
      <p>For 4×4 posts in firm soil with no frost requirement, and 6 in. of gravel under each post:</p>
      <table>
        <thead>
          <tr>
            <th>Fence height</th>
            <th>Set post</th>
            <th>Dig hole</th>
            <th>Post to buy</th>
            <th>80 lb bags / post</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ h, r }) => (
            <tr key={h}>
              <td>{h} ft</td>
              <td>{r.embedIn} in</td>
              <td>{r.holeDiaIn} × {r.holeDepthIn} in</td>
              <td>{r.buyLengthFt} ft</td>
              <td>{r.chosenBags}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>Example: a 6 ft privacy fence with 20 posts</h2>
      <p>
        Half of 72 in. = <strong>{six.embedIn} in.</strong> deep, plus 6 in. of gravel, so dig each hole{" "}
        <strong>{six.holeDepthIn} in.</strong> deep and {six.holeDiaIn} in. wide. Each post needs{" "}
        {fmt(six.concretePerPostCuFt, 2)} cu ft of concrete (the hole minus the post itself). Twenty posts with 10% extra
        come to <strong>{six.chosenBags} bags of 50 lb fast-setting concrete</strong>, and you'd buy 10 ft posts.
      </p>

      <h2>Hole size by post type</h2>
      <ul>
        <li><strong>4×4 wood</strong> (3.5 in. actual): 10–12 in. hole</li>
        <li><strong>4×6 wood</strong> (3.5 × 5.5 in.): 16 in. hole</li>
        <li><strong>6×6 wood</strong> (5.5 in.): 16–18 in. hole</li>
        <li><strong>Chain-link line post</strong> (1-7/8 to 2-3/8 in.): 8–10 in. hole</li>
        <li><strong>Chain-link terminal post</strong> (2-7/8 in.): 12 in. hole</li>
      </ul>

      <AdSlot id="content-2" className="my-8" />
      <h2>Setting posts in concrete, step by step</h2>
      <ol>
        <li>Call 811 at least a few days before you dig so buried utility lines get marked. It's free and required in every US state.</li>
        <li>Dig to the full hole depth, then add and tamp about 6 in. of gravel.</li>
        <li>Set the post, plumb it on two faces, and brace it with stakes.</li>
        <li>Fill with concrete to just above grade and slope (crown) the top so water runs off.</li>
        <li>With fast-setting mix, pour the dry mix in and add water per the bag. Wait about 4 hours before hanging rails.</li>
      </ol>
      <p>
        Next, figure out how many posts you need and where each one goes with the{" "}
        <Link href="/home-improvement/fence-post-spacing-calculator">fence post spacing calculator</Link>. Pouring larger
        round piers instead? Use the <Link href="/home-improvement/sonotube-calculator">Sonotube calculator</Link>.
      </p>
    </ToolPage>
  );
}
