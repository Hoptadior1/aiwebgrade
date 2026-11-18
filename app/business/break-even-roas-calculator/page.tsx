import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import RoasCalculator from "@/components/calculators/RoasCalculator";
import { getTool, toolPath } from "@/lib/site";

const tool = getTool("break-even-roas-calculator");

export const metadata: Metadata = {
  title: "Break-Even ROAS Calculator: Minimum ROAS & Max CPA",
  description:
    "Find the minimum ROAS your ads need to break even, your max cost per purchase, and the ROAS needed for any target profit margin. Includes shipping, payment fees and returns.",
  alternates: { canonical: toolPath(tool) },
};

const faqs: Faq[] = [
  {
    q: "How do you calculate break-even ROAS?",
    a: "Break-even ROAS = average order value ÷ (average order value − all costs except ads). If an order is $60 and costs $30 to make, ship and process, you have $30 left for ads, so the break-even ROAS is 60 ÷ 30 = 2.0.",
  },
  {
    q: "What is a good ROAS?",
    a: "There's no universal number. A good ROAS is one above your break-even ROAS by enough to hit your profit target. A brand with 70% margins can profit at a 2 ROAS; one with 30% margins needs more than 3.3 just to break even.",
  },
  {
    q: "What's the difference between ROAS and ROI?",
    a: "ROAS is revenue divided by ad spend. It ignores product cost and fees. ROI (or POAS) looks at profit. A 3 ROAS can still lose money if your margins are thin, which is why break-even ROAS matters.",
  },
  {
    q: "What is break-even CPA?",
    a: "The most you can pay in ad spend to win one order without losing money: your contribution margin per order. Divide your AOV by it to get break-even ROAS.",
  },
  {
    q: "How can I lower my break-even ROAS?",
    a: "Increase margin per order. Raise prices or average order value with bundles, negotiate product and shipping costs, and cut returns. Every dollar of extra margin directly lowers the ROAS you need.",
  },
];

export default function Page() {
  const margins = [30, 40, 50, 60, 70, 80];
  return (
    <ToolPage
      tool={tool}
      h1="Break-Even ROAS Calculator"
      intro={<>The minimum ROAS your ads need, and the ROAS for real profit.</>}
      calculator={<RoasCalculator />}
      faqs={faqs}
      related={["ecommerce-profit-margin-calculator"]}
      updated="2026-11-18"
    >
      <h2>What break-even ROAS means</h2>
      <p>
        ROAS (return on ad spend) is revenue ÷ ad spend. Your <strong>break-even ROAS</strong> is the point where an order's
        ad cost eats exactly the margin it brings in: below it, every sale loses money; above it, you profit. It depends
        entirely on your margin after product cost, shipping, payment fees and returns.
      </p>

      <h2>Break-even ROAS by contribution margin</h2>
      <table>
        <thead>
          <tr>
            <th>Margin before ads</th>
            <th>Break-even ROAS</th>
            <th>Ads as % of revenue</th>
          </tr>
        </thead>
        <tbody>
          {margins.map((m) => (
            <tr key={m}>
              <td>{m}%</td>
              <td>{(100 / m).toFixed(2)}</td>
              <td>{m}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AdSlot id="content-1" className="my-8" />
      <h2>Target ROAS for profit</h2>
      <p>
        Break-even isn't the goal. To keep a target net margin after ads, the calculator subtracts that profit from your
        contribution and finds the ROAS that leaves it intact: <code>target ROAS = AOV ÷ (contribution − AOV × target margin)</code>.
        For a $60 order with $30 of contribution, a 15% net margin leaves $21 for ads, so you need a ROAS of 2.86.
      </p>

      <h2>Using it with Meta, Google and TikTok ads</h2>
      <ul>
        <li>Compare against the ROAS your platform reports, but know that platforms often over-credit themselves; many brands check blended ROAS (total revenue ÷ total ad spend) too.</li>
        <li>Set campaign ROAS targets (or tROAS bids) at your target ROAS, not your break-even.</li>
        <li>First orders often break even while repeat purchases bring the profit. If you track lifetime value, you can accept a lower first-order ROAS.</li>
      </ul>

      <AdSlot id="content-2" className="my-8" />
      <h2>Next: see your full profit picture</h2>
      <p>
        The <Link href="/business/ecommerce-profit-margin-calculator">ecommerce profit margin calculator</Link> adds packaging, other
        costs and your actual ad cost per order to show net margin, markup and monthly profit.
      </p>
    </ToolPage>
  );
}
