import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ToolPage, { type Faq } from "@/components/ToolPage";
import ProfitMarginCalculator from "@/components/calculators/ProfitMarginCalculator";
import { getTool, toolPath } from "@/lib/site";
import { calcUnit } from "@/lib/calc/ecommerce";

const tool = getTool("ecommerce-profit-margin-calculator");

export const metadata: Metadata = {
  title: "Ecommerce Profit Margin Calculator: Profit per Order After Fees & Ads",
  description:
    "Calculate your real ecommerce profit per order after product cost, shipping, payment processing, marketplace fees, returns and ad spend. Shows net margin, markup and break-even ROAS.",
  alternates: { canonical: toolPath(tool) },
};

const m2 = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const faqs: Faq[] = [
  {
    q: "How do you calculate ecommerce profit margin?",
    a: "Net profit margin = (selling price − all costs per order) ÷ selling price. Costs include product cost, shipping and fulfillment, packaging, payment processing, platform fees, returns and the ad spend it took to get the order.",
  },
  {
    q: "What is a good profit margin for an online store?",
    a: "It varies by category, but many DTC brands target a contribution margin (before ads) of 50% or more, and a net margin after ads of 10–20%. Below about 30% contribution margin, paid advertising becomes very hard to make profitable.",
  },
  {
    q: "What's the difference between margin and markup?",
    a: "Margin is profit as a percentage of the selling price; markup is profit as a percentage of the product cost. A product that costs $12 and sells for $40 has a 233% markup, but its gross margin is 70%, and its net margin is lower once fees, shipping and ads are included.",
  },
  {
    q: "How much are Stripe or Shopify payment fees?",
    a: "Stripe's standard US rate for online card payments is 2.9% + 30¢ per transaction. Shopify Payments and PayPal are in a similar range, varying by plan. Enter your actual rate in the calculator.",
  },
  {
    q: "What is contribution margin?",
    a: "Contribution margin is what's left from each order after every variable cost except advertising. It's the most you could spend on ads to win that order without losing money, which is also your break-even CPA.",
  },
];

export default function Page() {
  const ex = calcUnit({ price: 40, cogs: 12, shipping: 6, packaging: 1, processingPct: 2.9, processingFixed: 0.3, platformPct: 0, returnPct: 5, adCostPerOrder: 10, otherPerOrder: 0 });
  return (
    <ToolPage
      tool={tool}
      h1="Ecommerce Profit Margin Calculator"
      intro={<>Your real profit per order after fees, shipping, returns and ads.</>}
      calculator={<ProfitMarginCalculator />}
      faqs={faqs}
      related={["break-even-roas-calculator"]}
      updated="2026-11-18"
    >
      <h2>What the calculator includes</h2>
      <ul>
        <li><strong>Product cost (COGS):</strong> what you pay your supplier or manufacturer per order.</li>
        <li><strong>Shipping, fulfillment and packaging:</strong> everything it costs to get the order to the customer.</li>
        <li><strong>Payment processing:</strong> a percentage plus a fixed fee per transaction (Stripe's standard US rate is 2.9% + 30¢).</li>
        <li><strong>Platform or marketplace fees:</strong> Etsy, Amazon, TikTok Shop or app fees, as a percentage of the sale.</li>
        <li><strong>Returns:</strong> the share of revenue lost to refunds.</li>
        <li><strong>Ad cost per order:</strong> your CPA from Meta, Google or TikTok ads.</li>
      </ul>

      <h2>Example: a $40 product</h2>
      <p>
        Product cost $12, shipping $6, packaging $1, Stripe fees, 5% returns and $10 of ads per order. Fees come to{" "}
        {m2(ex.processing)} and returns cost {m2(ex.returnsCost)}, leaving <strong>{m2(ex.contribution)}</strong> before ads (a{" "}
        {ex.contributionMarginPct.toFixed(1)}% contribution margin). After the $10 ad cost, profit is{" "}
        <strong>{m2(ex.profit)} per order</strong>, a {ex.marginPct.toFixed(1)}% net margin. The break-even ROAS is{" "}
        {ex.breakEvenRoas!.toFixed(2)}.
      </p>

      <AdSlot id="content-1" className="my-8" />
      <h2>The formulas</h2>
      <ul>
        <li><code>Contribution = price − (COGS + shipping + packaging + fees + returns + other)</code></li>
        <li><code>Profit per order = contribution − ad cost per order</code></li>
        <li><code>Net margin = profit ÷ price</code></li>
        <li><code>Markup = (price − COGS) ÷ COGS</code></li>
        <li><code>Break-even ROAS = price ÷ contribution</code></li>
      </ul>

      <h2>Five ways to raise your margin</h2>
      <ol>
        <li><strong>Raise average order value</strong> with bundles, multi-packs and free-shipping thresholds; fixed costs get spread thinner.</li>
        <li><strong>Negotiate COGS</strong> at higher volumes, or switch to a cheaper but equivalent packaging option.</li>
        <li><strong>Charge for shipping</strong> or build it into the price instead of absorbing it.</li>
        <li><strong>Cut returns</strong> with better photos, size charts and product descriptions.</li>
        <li><strong>Improve conversion rate</strong>: the same ad spend producing more orders lowers your CPA directly.</li>
      </ol>

      <AdSlot id="content-2" className="my-8" />
      <h2>Next: know your ad limit</h2>
      <p>
        Your contribution margin sets how much you can spend on ads. Use the{" "}
        <Link href="/business/break-even-roas-calculator">break-even ROAS calculator</Link> to see the ROAS and CPA you need for any
        target profit margin.
      </p>
    </ToolPage>
  );
}
