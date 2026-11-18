"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { FormError, NumberField, n } from "@/components/Fields";
import { HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { DEFAULT_PROCESSING_FIXED, DEFAULT_PROCESSING_PCT, calcUnit, validateUnit, type UnitEconomicsInput, type UnitEconomicsResult } from "@/lib/calc/ecommerce";
import { fmt, money } from "@/lib/calc/concrete";

const STEPS = ["Adding product & shipping costs", "Applying payment & platform fees", "Accounting for returns & ads", "Calculating profit & margin"];
const m2 = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ProfitMarginCalculator() {
  const [price, setPrice] = useState("40");
  const [cogs, setCogs] = useState("12");
  const [ship, setShip] = useState("6");
  const [pack, setPack] = useState("1");
  const [procPct, setProcPct] = useState(String(DEFAULT_PROCESSING_PCT));
  const [procFix, setProcFix] = useState(String(DEFAULT_PROCESSING_FIXED));
  const [plat, setPlat] = useState("0");
  const [ret, setRet] = useState("5");
  const [ads, setAds] = useState("10");
  const [other, setOther] = useState("0");
  const [orders, setOrders] = useState("100");
  const f = useFunnel<UnitEconomicsResult>();

  const input = (): UnitEconomicsInput => ({
    price: n(price), cogs: n(cogs || "0"), shipping: n(ship || "0"), packaging: n(pack || "0"), processingPct: n(procPct || "0"), processingFixed: n(procFix || "0"),
    platformPct: n(plat || "0"), returnPct: n(ret || "0"), adCostPerOrder: n(ads || "0"), otherPerOrder: n(other || "0"),
  });

  const r = f.result;
  const monthly = n(orders || "0") || 0;
  const warnings = (x: UnitEconomicsResult) => [
    ...(x.profit < 0 ? [`You lose ${m2(-x.profit)} on every order at this ad cost. Cut ad cost below ${m2(x.breakEvenCpa)} per order, raise the price, or lower costs.`] : []),
    ...(x.marginPct > 0 && x.marginPct < 10 ? ["Net margin under 10% leaves little room for refunds, chargebacks or rising ad costs."] : []),
    ...(x.contributionMarginPct < 30 ? ["Contribution margin under ~30% makes paid ads hard to scale. Most DTC brands aim for 50%+ before ads."] : []),
  ];

  return (
    <Funnel
      slug="ecommerce-profit-margin-calculator"
      toolName="Ecommerce Profit Margin Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() =>
        r && {
          title: r.breakEvenRoas ? `Your break-even ROAS is ${r.breakEvenRoas.toFixed(2)}` : "Find your break-even ROAS",
          text: "See the ROAS you need for any target profit margin, and your max cost per purchase.",
          href: "/business/break-even-roas-calculator",
          cta: "Break-even ROAS calculator",
        }
      }
      report={() =>
        r && {
          stats: [["Profit / order", m2(r.profit)], ["Net margin", `${fmt(r.marginPct, 1)}%`], ["Break-even ROAS", r.breakEvenRoas ? r.breakEvenRoas.toFixed(2) : "n/a"], ["Max CPA", m2(r.breakEvenCpa)]],
          tables: [{ title: "Per-order breakdown", rows: [["Selling price", m2(r.revenue)], ...r.lines.map((l) => [l.label, `−${m2(l.amount)}`]), ["Profit per order", m2(r.profit)]] }],
          notes: warnings(r),
        }
      }
      inputSummary={[["Price", `$${price}`], ["Product cost", `$${cogs}`], ["Shipping + packaging", `$${ship} + $${pack}`], ["Processing", `${procPct}% + $${procFix}`], ["Platform fee", `${plat}%`], ["Ad cost / order", `$${ads}`]]}
      input={
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); f.run(() => validateUnit(input()), () => calcUnit(input())); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Selling price (per order)" value={price} onChange={setPrice} unit="$" hint="After any discount" />
            <NumberField label="Product cost (COGS)" value={cogs} onChange={setCogs} unit="$" />
            <NumberField label="Shipping & fulfillment you pay" value={ship} onChange={setShip} unit="$" />
            <NumberField label="Packaging" value={pack} onChange={setPack} unit="$" />
            <NumberField label="Payment processing %" value={procPct} onChange={setProcPct} unit="%" hint="Stripe's standard US rate: 2.9% + $0.30" />
            <NumberField label="Processing fixed fee" value={procFix} onChange={setProcFix} unit="$" />
            <NumberField label="Platform / marketplace fee" value={plat} onChange={setPlat} unit="%" hint="Shopify app fees, Etsy, Amazon referral, etc." />
            <NumberField label="Returns / refunds" value={ret} onChange={setRet} unit="% of orders" />
            <NumberField label="Ad cost per order (CPA)" value={ads} onChange={setAds} unit="$" hint="0 if organic" />
            <NumberField label="Other per-order costs" value={other} onChange={setOther} unit="$" />
            <NumberField label="Orders per month (for totals)" value={orders} onChange={setOrders} step="1" />
          </div>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Calculate my margin →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Profit / order", value: m2(r.profit), sub: `${fmt(r.marginPct, 1)}% net margin`, accent: true },
                { label: "Before ads", value: m2(r.contribution), sub: `${fmt(r.contributionMarginPct, 1)}% contribution` },
                { label: "Break-even ROAS", value: r.breakEvenRoas ? r.breakEvenRoas.toFixed(2) : "n/a", sub: `max CPA ${m2(r.breakEvenCpa)}` },
                { label: "Monthly profit", value: money(r.profit * monthly), sub: `at ${fmt(monthly, 0)} orders` },
              ]}
            />
            <ShoppingList title="Per-order breakdown" items={[["Selling price", m2(r.revenue)], ...r.lines.map((l): [string, string] => [l.label, `−${m2(l.amount)}`]), ["Profit per order", m2(r.profit)], ["Markup on product cost", `${fmt(r.markupPct, 0)}%`]]} />
            <Warnings items={warnings(r)} note="Returns are modeled as lost revenue on that share of orders. Product resold after a return would make the real number a bit better." />
          </>
        )
      }
    />
  );
}
