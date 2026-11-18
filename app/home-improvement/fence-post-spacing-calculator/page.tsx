import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import FenceSpacingCalculator from "@/components/calculators/FenceSpacingCalculator";
import { getTool, toolPath } from "@/lib/site";
import { calcFenceSpacing } from "@/lib/calc/fencespacing";
import { fmt } from "@/lib/calc/concrete";

const tool = getTool("fence-post-spacing-calculator");

const TITLE = "Fence Post Spacing Calculator: How Many Posts & Where";
const DESC =
  "Find how many fence posts you need and exactly where to set each one. Even spacing per side, corners, gates, rails and pickets for wood, vinyl and chain link.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: toolPath(tool) },
  openGraph: { title: TITLE, description: DESC, url: toolPath(tool), type: "website" },
};

const faqs: Faq[] = [
  {
    q: "How far apart should fence posts be?",
    a: "Most wood fences use posts 6 to 8 ft apart, center to center. 8 ft is standard because rails come in 8 ft lengths. Vinyl panel fences are usually 6 or 8 ft, set by the panel width. Chain link line posts can go up to 10 ft apart.",
  },
  {
    q: "How many fence posts do I need for 100 feet?",
    a: "At 8 ft spacing, a straight 100 ft fence has 13 sections and needs 14 posts (sections + 1), spaced 7 ft 8-1/4 in. apart. Each corner, gate or extra side adds posts. Enter your sides in the calculator for the exact count.",
  },
  {
    q: "How do you calculate fence post spacing?",
    a: "Divide the length of each straight side by your maximum spacing and round up to get the number of sections. Then divide the side length by that number for the actual spacing. A 50 ft side at 8 ft max is 7 sections of 7 ft 1-3/4 in. each.",
  },
  {
    q: "Do I measure fence post spacing center to center?",
    a: "Yes. Spacing is measured from the center of one post to the center of the next. For pre-built vinyl or metal panels, follow the panel maker's spacing exactly, which is usually given center to center as well.",
  },
  {
    q: "How many pickets do I need per 8 foot section?",
    a: "For a privacy fence with 5.5 in. pickets and no gap, an 8 ft section needs about 18 pickets (96 ÷ 5.5 = 17.5). With a 2.5 in. gap, it needs 12.",
  },
  {
    q: "How many posts do I need for a gate?",
    a: "A gate needs a post on each side of the opening. One is usually a regular line post; the calculator adds one extra post per gate. Use heavier posts (6×6 wood or terminal-grade steel) for gates, and set them deeper.",
  },
];

export default function Page() {
  const ex = calcFenceSpacing({ sidesFt: [100, 50, 100], closed: false, maxSpacingFt: 8, gates: 1, gateWidthFt: 4, rails: 2, picketWidthIn: 5.5, picketGapIn: 0 });
  const runs = [50, 75, 100, 150, 200].map((L) => ({ L, r: calcFenceSpacing({ sidesFt: [L], closed: false, maxSpacingFt: 8, gates: 0, gateWidthFt: 0, rails: 0, picketWidthIn: 0, picketGapIn: 0 }) }));

  return (
    <ToolPage
      tool={tool}
      h1="Fence Post Spacing Calculator"
      intro={<>How many posts you need and exactly where each one goes.</>}
      calculator={<FenceSpacingCalculator />}
      faqs={faqs}
      related={["fence-estimator", "fence-post-depth-calculator", "concrete-footing-calculator", "shed-foundation-calculator"]}
      updated="2026-11-18"
    >
      <h2>How the spacing is calculated</h2>
      <p>
        Every straight side of the fence is split into equal sections no wider than your maximum spacing. Equal sections
        look better than seven full 8 ft bays and one odd 3 ft bay at the end, and every rail can be cut the same length.
      </p>
      <ol>
        <li><strong>Sections per side</strong> = side length ÷ max spacing, rounded up.</li>
        <li><strong>Actual spacing</strong> = side length ÷ sections.</li>
        <li><strong>Posts</strong> = line posts on each side + one post at every corner and end + one extra per gate.</li>
      </ol>
      <p>
        A fence that closes on itself (a full loop) has one post per section, because the last side meets the first. An
        open fence, like a backyard U-shape that meets the house, has one more.
      </p>

      <h2>Posts needed for a straight fence (8 ft max spacing)</h2>
      <table>
        <thead>
          <tr>
            <th>Fence length</th>
            <th>Sections</th>
            <th>Actual spacing</th>
            <th>Posts</th>
          </tr>
        </thead>
        <tbody>
          {runs.map(({ L, r }) => (
            <tr key={L}>
              <td>{L} ft</td>
              <td>{r.sections}</td>
              <td>{fmt(r.sides[0].spacingFt, 2)} ft</td>
              <td>{r.totalPosts}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>Example: a U-shaped backyard fence</h2>
      <p>
        Sides of 100, 50 and 100 ft, with the open side against the house, one 4 ft gate, 8 ft max spacing, two rails and
        5.5 in. privacy pickets. The 100 ft sides get {ex.sides[0].sections} sections of {fmt(ex.sides[0].spacingFt, 2)} ft, and the 50
        ft side gets {ex.sides[1].sections} sections of {fmt(ex.sides[1].spacingFt, 2)} ft. That's <strong>{ex.totalPosts} posts</strong> (
        {ex.linePosts} line, {ex.cornerEndPosts} corner/end, {ex.gatePosts} gate), {ex.railBoards8} rails and about{" "}
        <strong>{ex.pickets} pickets</strong>.
      </p>

      <h2>Typical spacing by fence type</h2>
      <ul>
        <li><strong>Wood privacy or picket:</strong> 8 ft max (6 ft on windy sites or for heavy boards)</li>
        <li><strong>Vinyl:</strong> set by the panel, usually 6 or 8 ft</li>
        <li><strong>Chain link:</strong> 10 ft max between line posts</li>
        <li><strong>Split rail:</strong> set by rail length, usually 10 or 11 ft</li>
        <li><strong>Welded wire or farm fence:</strong> 8–12 ft, with braced corners</li>
      </ul>

      <AdSlot id="content-2" className="my-8" />
      <h2>Laying out the posts</h2>
      <ol>
        <li>Check your property line and any HOA or city height rules before you start.</li>
        <li>Set the corner and end posts first, and pull a tight string line between them.</li>
        <li>Mark each line post along the string, measuring center to center from the corner post, using the distances the calculator lists.</li>
        <li>Call 811 before digging, then set posts at the depth from the <Link href="/home-improvement/fence-post-depth-calculator">fence post depth calculator</Link>.</li>
      </ol>
    </ToolPage>
  );
}
