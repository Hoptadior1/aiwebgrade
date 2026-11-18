/** Stripe standard US online card rate (2026): 2.9% + $0.30. Shopify Payments and others are similar. */
export const DEFAULT_PROCESSING_PCT = 2.9;
export const DEFAULT_PROCESSING_FIXED = 0.3;

export type UnitEconomicsInput = {
  price: number; // selling price per order (after discount)
  cogs: number; // product cost
  shipping: number; // shipping & fulfillment you pay
  packaging: number;
  processingPct: number;
  processingFixed: number;
  platformPct: number; // marketplace / app fees as % of price
  returnPct: number; // % of orders refunded (product not resold)
  adCostPerOrder: number; // CAC; 0 for break-even calc
  otherPerOrder: number;
};

export type UnitEconomicsResult = {
  revenue: number;
  processing: number;
  platform: number;
  returnsCost: number;
  variableCosts: number; // everything except ads
  contribution: number; // price − variable costs (before ads)
  contributionMarginPct: number;
  profit: number; // after ads
  marginPct: number;
  markupPct: number;
  breakEvenRoas: number | null;
  breakEvenCpa: number;
  roas: number | null; // at the ad cost entered
  lines: { label: string; amount: number }[];
};

export function validateUnit(i: UnitEconomicsInput): string | null {
  if (!(i.price > 0)) return "Enter the selling price.";
  if (!(i.cogs >= 0)) return "Enter the product cost (0 if none).";
  const nums = [i.shipping, i.packaging, i.processingPct, i.processingFixed, i.platformPct, i.returnPct, i.adCostPerOrder, i.otherPerOrder];
  if (nums.some((x) => !(x >= 0))) return "Costs can't be negative or blank (use 0).";
  if (i.processingPct + i.platformPct >= 100) return "Fees can't be 100% or more of the price.";
  if (i.returnPct >= 100) return "Return rate must be under 100%.";
  return null;
}

export function calcUnit(i: UnitEconomicsInput): UnitEconomicsResult {
  const processing = (i.price * i.processingPct) / 100 + i.processingFixed;
  const platform = (i.price * i.platformPct) / 100;
  // A refunded order loses the price but you still paid product, shipping and fees: model as % of revenue lost.
  const returnsCost = (i.price * i.returnPct) / 100;
  const variableCosts = i.cogs + i.shipping + i.packaging + processing + platform + returnsCost + i.otherPerOrder;
  const contribution = i.price - variableCosts;
  const profit = contribution - i.adCostPerOrder;
  return {
    revenue: i.price,
    processing,
    platform,
    returnsCost,
    variableCosts,
    contribution,
    contributionMarginPct: (contribution / i.price) * 100,
    profit,
    marginPct: (profit / i.price) * 100,
    markupPct: i.cogs > 0 ? ((i.price - i.cogs) / i.cogs) * 100 : 0,
    breakEvenRoas: contribution > 0 ? i.price / contribution : null,
    breakEvenCpa: contribution,
    roas: i.adCostPerOrder > 0 ? i.price / i.adCostPerOrder : null,
    lines: [
      { label: "Product cost (COGS)", amount: i.cogs },
      { label: "Shipping & fulfillment", amount: i.shipping },
      { label: "Packaging", amount: i.packaging },
      { label: `Payment processing (${i.processingPct}% + $${i.processingFixed.toFixed(2)})`, amount: processing },
      { label: `Platform / marketplace fees (${i.platformPct}%)`, amount: platform },
      { label: `Returns & refunds (${i.returnPct}%)`, amount: returnsCost },
      { label: "Other per-order costs", amount: i.otherPerOrder },
      { label: "Ad cost per order", amount: i.adCostPerOrder },
    ].filter((l) => l.amount > 0),
  };
}

/** ROAS needed to hit a target net profit margin (after ads). null = target is above your contribution margin. */
export function targetRoas(price: number, contribution: number, targetMarginPct: number): number | null {
  const adBudget = contribution - (price * targetMarginPct) / 100;
  return adBudget > 0 ? price / adBudget : null;
}
