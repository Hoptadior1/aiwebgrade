import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import DeckFootingCalculator from "@/components/calculators/DeckFootingCalculator";
import { getTool, toolPath } from "@/lib/site";

const tool = getTool("deck-footing-calculator");

export const metadata: Metadata = {
  title: "Deck Footing Calculator: Size, Spacing & Concrete",
  description:
    "Size deck footings from your deck dimensions, post spacing and soil type. Get footing diameter, number of footings, concrete bags and Sonotube lengths.",
  alternates: { canonical: toolPath(tool) },
};

const faqs: Faq[] = [
  {
    q: "How big do deck footings need to be?",
    a: "Big enough that the load on each post divided by the footing area stays under your soil's allowable bearing pressure. For example, a post carrying 2,400 lb on 1,500 psf clay needs 1.6 sq ft of footing, an 18 in. round pier or a 16 × 16 in. pad. Larger post spacing or deeper decks need bigger footings.",
  },
  {
    q: "How far apart should deck footings be?",
    a: "Usually 6 to 8 ft along the beam for typical doubled or tripled 2×10 and 2×12 beams. Wider spacing means fewer holes but bigger beams and bigger footings. Check the beam span tables in IRC R507 or your local deck guide.",
  },
  {
    q: "How deep should deck footings be?",
    a: "Below the frost line and at least 12 in. below undisturbed soil. That's roughly 12 in. in the Deep South, 30 to 36 in. in much of the mid-Atlantic and Midwest, and 42 to 60 in. in northern states. Some jurisdictions allow freestanding decks on shallower footings. Ask your building department.",
  },
  {
    q: "What load should I use for a deck?",
    a: "The IRC requires decks to support a 40 psf live load. Wood decks are typically designed for 10 psf dead load. Use a higher live load where the ground snow load exceeds 40 psf, and a higher dead load for composite decking, stone, or a hot tub (which needs its own engineered support).",
  },
  {
    q: "Do I need a permit for deck footings?",
    a: "Most US jurisdictions require a permit for decks attached to a house or more than 30 in. above grade, and an inspection of the footing holes before concrete is poured.",
  },
  {
    q: "Can I use deck blocks instead of footings?",
    a: "Precast deck blocks sitting on the surface are generally only accepted for low, freestanding decks where local code allows. Attached decks almost always need frost-protected footings.",
  },
];

export default function Page() {
  return (
    <ToolPage
      tool={tool}
      h1="Deck Footing Calculator"
      intro={<>Footing size, number of footings and concrete for your deck.</>}
      calculator={<DeckFootingCalculator />}
      faqs={faqs}
      related={["concrete-calculator", "sonotube-calculator", "concrete-footing-calculator", "fence-post-depth-calculator"]}
      updated="2026-11-18"
    >
      <h2>How deck footings are sized</h2>
      <p>
        Every deck footing does one job: spread the weight on a post over enough soil that the soil doesn't compress. The
        calculator follows the same load path an inspector or engineer uses:
      </p>
      <ol>
        <li>
          <strong>Tributary width.</strong> On a ledger-attached deck, the house carries half the joist span and the beam
          carries the other half, plus any cantilever past the beam.
        </li>
        <li>
          <strong>Tributary area.</strong> Multiply by the post spacing along the beam to get the square feet of deck
          each interior post holds up.
        </li>
        <li>
          <strong>Load.</strong> Multiply by the design load: 40 psf live (IRC) + 10 psf dead for a typical wood deck.
        </li>
        <li>
          <strong>Footing area.</strong> Divide by the soil's allowable bearing pressure (1,500 psf is the IRC
          presumptive value for clay and silt, and the safe default when you don't know).
        </li>
        <li>
          <strong>Round up</strong> to the next standard tube diameter, or to a square pad in 2 in. steps.
        </li>
      </ol>

      <h2>Soil bearing values</h2>
      <p>These are the IRC presumptive values (Table R401.4.1) used when no soil test has been done:</p>
      <table>
        <thead>
          <tr>
            <th>Soil</th>
            <th>Allowable bearing</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Clay, sandy clay, silty clay, silt (CL, ML, MH, CH)</td><td>1,500 psf</td></tr>
          <tr><td>Sand, silty sand, clayey sand, silty or clayey gravel (SW, SP, SM, SC, GM, GC)</td><td>2,000 psf</td></tr>
          <tr><td>Sandy gravel and gravel (GW, GP)</td><td>3,000 psf</td></tr>
        </tbody>
      </table>
      <p>If you aren't sure, use 1,500 psf. It's the most conservative and the one most inspectors expect.</p>

      <AdSlot id="content-1" className="my-8" />
      <h2>Example: a 16 × 12 ft deck attached to the house</h2>
      <p>
        One beam at the outside edge, posts at 8 ft max → 3 posts at 8 ft. The beam carries half of the 12 ft joist span =
        6 ft. An interior post supports 6 × 8 = 48 sq ft × 50 psf = <strong>2,400 lb</strong>. On 1,500 psf soil that
        needs 1.6 sq ft of footing: an <strong>18 in. round pier</strong> or a <strong>16 × 16 in. pad</strong>. Tightening the
        post spacing to 5.33 ft (4 posts) drops the load to 1,600 lb and the pier to 14 in.
      </p>

      <h2>Round pier or pad-and-pier?</h2>
      <p>
        A <strong>full-depth round pier</strong> (one Sonotube from the hole bottom to above grade) is simple but uses a
        lot of concrete when you need a big diameter. A <strong>square pad with a narrower pier</strong> on top puts the
        wide part only at the bottom where it's needed, which often uses far less concrete for big footings. Plastic
        bell-shaped footing forms do the same job in one piece.
      </p>

      <AdSlot id="content-2" className="my-8" />
      <h2>Things this calculator doesn't cover</h2>
      <ul>
        <li>Hot tubs, roofs over the deck, or second-story decks with stairs landing on them. These need engineered footings.</li>
        <li>Expansive clay, fill soil, or slopes, where a soils report may be required.</li>
        <li>Beam and joist sizing. Check IRC R507 span tables or your local deck guide.</li>
      </ul>
      <p>
        Have your footing size? Get the exact concrete for a different tube setup with the{" "}
        <Link href="/home-improvement/sonotube-calculator">Sonotube calculator</Link>, or price a continuous footing with the{" "}
        <Link href="/home-improvement/concrete-footing-calculator">concrete footing calculator</Link>.
      </p>
    </ToolPage>
  );
}
