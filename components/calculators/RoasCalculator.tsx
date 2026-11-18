"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { FormError, NumberField, n } from "@/components/Fields";
import { HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { DEFAULT_PROCESSING_FIXED, DEFAULT_PROCESSING_PCT, calcUnit, targetRoas, validateUnit, type UnitEconomicsResult } from "@/lib/calc/ecommerce";
import { fmt } from "@/lib/calc/concrete";

const STEPS = ["Adding up costs per order", "Finding your contribution margin", "Calculating break-even ROAS", "Building your ROAS targets"];
const m2 = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

type R = UnitEconomicsResult & { targets: { margin: number; roas: number | null; cpa: number }[]; current: number | null; target: number };

export default function RoasCalculator() {
  const [aov, setAov] = useState("60");
  const [cogs, setCogs] = useState("18");
  const [ship, setShip] = useState("7");
  const [fees, setFees] = useState(String(DEFAULT_PROCESSING_PCT));
  const [fixed, setFixed] = useState(String(DEFAULT_PROCESSING_FIXED));
  const [plat, setPlat] = useState("0");
  const [ret, setRet] = useState("3");
  const [tgt, setTgt] = useState("15");
  const [cur, setCur] = useState("");
  const f = useFunnel<R>();

  const base = () => ({ price: n(aov), cogs: n(cogs || "0"), shipping: n(ship || "0"), packaging: 0, processingPct: n(fees || "0"), processingFixed: n(fixed || "0"), platformPct: n(plat || "0"), returnPct: n(ret || "0"), adCostPerOrder: 0, otherPerOrder: 0 });
  const compute = (): R => {
    const b = base();
    const u = calcUnit(b);
    const target = n(tgt || "0") || 0;
    const margins = Array.from(new Set([0, 5, 10, 15, 20, 25, target])).sort((a, c) => a - c);
    return {
      ...u,
      target,
      current: cur ? n(cur) : null,
      targets: margins.map((m) => ({ margin: m, roas: targetRoas(b.price, u.contribution, m), cpa: u.contribution - (b.price * m) / 100 })),
    };
  };

  const r = f.result;
  const currentProfit = r && r.current ? r.contribution - r.revenue / r.current : null;
  const tr = r ? targetRoas(r.revenue, r.contribution, r.target) : null;
  const warnings = (x: R) => [
    ...(x.contribution <= 0 ? ["You lose money on every order even with zero ad spend. Fix pricing or costs before running ads."] : []),
    ...(x.current && currentProfit !== null && currentProfit < 0 ? [`At a ${x.current} ROAS you lose ${m2(-currentProfit)} per order.`] : []),
    ...(x.breakEvenRoas && x.breakEvenRoas > 3 ? ["A break-even ROAS above 3 is hard to sustain on Meta or Google. Raising AOV with bundles or upsells lowers it fastest."] : []),
  ];

  return (
    <Funnel
      slug="break-even-roas-calculator"
      toolName="Break-Even ROAS Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      nextStep={() => ({
        title: "See your full profit per order",
        text: "Add packaging, returns and ad spend to see net margin, markup and monthly profit.",
        href: "/business/ecommerce-profit-margin-calculator",
        cta: "Profit margin calculator",
      })}
      report={() =>
        r && {
          stats: [["Break-even ROAS", r.breakEvenRoas ? r.breakEvenRoas.toFixed(2) : "n/a"], ["Max CPA", m2(r.breakEvenCpa)], [`ROAS for ${r.target}% margin`, tr ? tr.toFixed(2) : "n/a"], ["Contribution", `${fmt(r.contributionMarginPct, 1)}%`]],
          tables: [{ title: "ROAS needed by target net margin", head: ["Target margin", "ROAS needed", "Max CPA"], rows: r.targets.map((t) => [`${t.margin}%`, t.roas ? t.roas.toFixed(2) : "not possible", t.cpa > 0 ? m2(t.cpa) : "n/a"]) }],
          notes: warnings(r),
        }
      }
      inputSummary={[["Average order value", `$${aov}`], ["Product cost", `$${cogs}`], ["Shipping", `$${ship}`], ["Payment fees", `${fees}% + $${fixed}`], ["Platform fee", `${plat}%`], ["Returns", `${ret}%`]]}
      input={
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); f.run(() => validateUnit(base()), compute); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Average order value (AOV)" value={aov} onChange={setAov} unit="$" />
            <NumberField label="Product cost per order" value={cogs} onChange={setCogs} unit="$" />
            <NumberField label="Shipping & fulfillment" value={ship} onChange={setShip} unit="$" />
            <NumberField label="Payment processing %" value={fees} onChange={setFees} unit="%" hint="Stripe's standard US rate: 2.9% + $0.30" />
            <NumberField label="Processing fixed fee" value={fixed} onChange={setFixed} unit="$" />
            <NumberField label="Platform / marketplace fee" value={plat} onChange={setPlat} unit="%" />
            <NumberField label="Returns / refunds" value={ret} onChange={setRet} unit="%" />
            <NumberField label="Target net profit margin" value={tgt} onChange={setTgt} unit="%" />
            <NumberField label="Your current ROAS (optional)" value={cur} onChange={setCur} hint="e.g. 2.5 from Meta or Google Ads" />
          </div>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Find my break-even ROAS →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                { label: "Break-even ROAS", value: r.breakEvenRoas ? r.breakEvenRoas.toFixed(2) : "n/a", sub: r.breakEvenRoas ? `${fmt(100 / r.breakEvenRoas, 1)}% of revenue on ads` : "no margin to spend", accent: true },
                { label: "Max CPA", value: m2(r.breakEvenCpa), sub: "per purchase, break-even" },
                { label: `For ${r.target}% margin`, value: tr ? tr.toFixed(2) : "n/a", sub: "ROAS needed" },
                { label: "At your ROAS", value: currentProfit !== null ? m2(currentProfit) : "n/a", sub: currentProfit !== null ? "profit per order" : "enter current ROAS" },
              ]}
            />
            <div>
              <ShoppingList title="ROAS needed by target net margin" items={r.targets.map((t): [string, string] => [`${t.margin}% net margin${t.margin === r.target ? " (your target)" : ""}`, t.roas ? `ROAS ${t.roas.toFixed(2)} · max CPA ${m2(t.cpa)}` : "not possible at this AOV"])} />
            </div>
            <Warnings items={warnings(r)} note="Break-even ROAS = AOV ÷ (AOV − all costs except ads). Use the ROAS your ad platform reports on the same attribution window you trust." />
          </>
        )
      }
    />
  );
}
