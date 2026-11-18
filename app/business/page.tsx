import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS, toolPath } from "@/lib/site";

export const metadata: Metadata = {
  title: "Business & Ecommerce Calculators: Profit Margin, ROAS & Fees",
  description: "Free calculators for online sellers: profit margin after fees and ads, break-even ROAS, max CPA and marketplace fees.",
  alternates: { canonical: "/business" },
};

export default function BusinessHub() {
  const tools = TOOLS.filter((t) => t.section === "business");
  const live = tools.filter((t) => t.status === "live");
  const soon = tools.filter((t) => t.status === "soon");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-3 text-xs text-steel">
        <Link href="/" className="hover:underline">Home</Link> / <span className="text-ink">Business</span>
      </nav>
      <h1 className="text-4xl font-extrabold tracking-tight">Business & Ecommerce Calculators</h1>
      <p className="mt-3 max-w-2xl text-lg text-steel">
        Know your numbers before you spend on ads: real profit per order, the ROAS you need to break even, and the most you
        can pay to win a customer.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {live.map((t) => (
          <Link key={t.slug} href={toolPath(t)} className="group rounded-lg border border-line bg-white p-5 shadow-sm transition hover:border-safety">
            <div className="text-lg font-bold group-hover:text-blueprint">{t.name} →</div>
            <div className="mt-1 text-sm text-steel">{t.short}</div>
          </Link>
        ))}
      </div>
      {soon.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-steel">Coming soon</h2>
          <ul className="mt-2 grid gap-x-6 gap-y-1 text-steel sm:grid-cols-2 lg:grid-cols-3">
            {soon.map((t) => <li key={t.slug}>{t.name}</li>)}
          </ul>
        </div>
      )}
      <section className="prose-site mt-12 max-w-3xl">
        <h2>Which calculator do I need?</h2>
        <ul>
          <li><strong>Pricing a product or checking if it's worth selling?</strong> Start with the profit margin calculator.</li>
          <li><strong>Running Meta, Google or TikTok ads?</strong> The break-even ROAS calculator tells you the minimum ROAS and maximum CPA that still make money.</li>
        </ul>
      </section>
    </div>
  );
}
