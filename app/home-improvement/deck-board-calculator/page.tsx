import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import DeckBoardCalculator from "@/components/calculators/DeckBoardCalculator";
import { getTool, toolPath } from "@/lib/site";
import { calcDeckBoards } from "@/lib/calc/deckboards";

const tool = getTool("deck-board-calculator");

const TITLE = "Deck Board Calculator: Boards, Linear Feet & Screws";
const DESC =
  "How many deck boards do you need? Enter your deck size to get boards by length (with the least-waste option), linear feet, screws or hidden clips. Wood and composite.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: toolPath(tool) },
  openGraph: { title: TITLE, description: DESC, url: toolPath(tool), type: "website" },
};

const faqs: Faq[] = [
  {
    q: "How many deck boards do I need?",
    a: "Divide the width across the boards (in inches) by the board width plus the gap to get the number of rows, then multiply by the boards needed per row. A 16 × 12 ft deck with 5.5 in. boards and 1/8 in. gaps needs 26 rows of 16 ft boards, or 29 boards with 10% waste.",
  },
  {
    q: "How many deck boards per square foot?",
    a: "With 5.5 in. boards and a 1/8 in. gap, each square foot of deck takes about 2.13 linear feet of board. Divide your linear feet by the board length to get the board count.",
  },
  {
    q: "How many screws do I need for decking?",
    a: "Two screws at every joist each board crosses. A 16 × 12 ft deck with joists at 16 in. on center has 13 joists × 26 rows × 2, about 680 screws, or roughly 750 with spares.",
  },
  {
    q: "What length deck boards should I buy?",
    a: "Ideally one board that spans the full run. Otherwise, choose the length that leaves the least waste and lands butt joints on joists. The calculator compares 8, 10, 12, 16 and 20 ft boards and picks the one with the fewest linear feet.",
  },
  {
    q: "What gap should I leave between deck boards?",
    a: "About 1/8 in. for kiln-dried wood, 3/16 in. for most composites (check the manufacturer), and no gap for wet pressure-treated boards that will shrink as they dry.",
  },
  {
    q: "How much extra decking should I buy?",
    a: "10% for straight decking. Diagonal or herringbone patterns waste much more on angled cuts. Plan on 15% or more on top of that.",
  },
];

export default function Page() {
  const sizes: [number, number][] = [[10, 10], [12, 12], [16, 12], [16, 16], [20, 12], [20, 16], [24, 16]];
  return (
    <ToolPage
      tool={tool}
      h1="Deck Board Calculator"
      intro={<>Deck boards by length, linear feet and fasteners for any deck.</>}
      calculator={<DeckBoardCalculator />}
      faqs={faqs}
      related={["deck-footing-calculator", "sonotube-calculator", "concrete-stairs-calculator", "fence-estimator"]}
      updated="2026-11-18"
    >
      <h2>How the deck board count works</h2>
      <ol>
        <li><strong>Rows:</strong> width across the boards ÷ (board width + gap), rounded up.</li>
        <li><strong>Boards per row:</strong> the run length ÷ the stock length, rounded up. Joints must land on joists.</li>
        <li><strong>Best length:</strong> the calculator checks 8–20 ft boards and picks the one that buys the fewest linear feet.</li>
        <li><strong>Waste:</strong> 10% by default, plus 15% for diagonal patterns.</li>
        <li><strong>Fasteners:</strong> 2 screws, or 1 hidden clip, per board at every joist.</li>
      </ol>

      <h2>Deck boards needed by deck size</h2>
      <p>5.5 in. boards, 1/8 in. gap, joists at 16 in., straight pattern, 10% waste. The first number is the length the boards run.</p>
      <table>
        <thead>
          <tr>
            <th>Deck</th>
            <th>Rows</th>
            <th>Boards to buy</th>
            <th>Linear ft</th>
            <th>Screws</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map(([l, w]) => {
            const r = calcDeckBoards({ lengthFt: l, widthFt: w, boardWidthIn: 5.5, gapIn: 0.125, joistSpacingIn: 16, pattern: "straight", stockFt: "auto", wastePct: 10, fastener: "screws", pricePerBoard: 0 });
            return (
              <tr key={`${l}x${w}`}>
                <td>{l} × {w} ft</td>
                <td>{r.rows}</td>
                <td>{r.boards} × {r.chosen.lengthFt} ft</td>
                <td>{r.linearFt}</td>
                <td>~{r.screws}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>Wood vs composite decking</h2>
      <ul>
        <li><strong>Pressure-treated pine:</strong> the cheapest; install tight if wet and expect it to shrink; needs sealing.</li>
        <li><strong>Cedar or redwood:</strong> naturally rot-resistant and lighter; softer surface.</li>
        <li><strong>Composite and PVC:</strong> costs more up front but needs no staining; follow the maker's gap, joist spacing and fastener rules or the warranty can be void.</li>
      </ul>

      <h2>Layout tips</h2>
      <ul>
        <li>Start with a full board at the house side, or the most visible edge, and rip the last board if needed.</li>
        <li>Stagger butt joints so they never line up on neighboring rows; on composite, many builders add a "breaker board" instead of butt joints.</li>
        <li>For a picture-frame border, add one board around the perimeter and blocking under it.</li>
        <li>Check that joist spacing matches the board's rated span: usually 16 in. for straight runs and 12 in. for diagonal.</li>
      </ul>

      <AdSlot id="content-2" className="my-8" />
      <h2>The rest of your deck</h2>
      <p>
        Size the footings with the <Link href="/home-improvement/deck-footing-calculator">deck footing calculator</Link>, get the
        concrete for the piers with the <Link href="/home-improvement/sonotube-calculator">Sonotube calculator</Link>, and plan
        steps down to the yard with the <Link href="/home-improvement/concrete-stairs-calculator">concrete stairs calculator</Link>.
      </p>
    </ToolPage>
  );
}
