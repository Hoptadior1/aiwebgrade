import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS, toolPath } from "@/lib/site";

export const metadata: Metadata = {
  title: "Home Improvement Calculators: Concrete, Footings, Decks & Fences",
  description: "Free calculators for concrete footings, Sonotubes, deck footings, fences, drainage and more. US units with printable material lists.",
  alternates: { canonical: "/home-improvement" },
};

export default function HomeImprovementHub() {
  const tools = TOOLS.filter((t) => t.section === "home-improvement");
  const live = tools.filter((t) => t.status === "live");
  const soon = tools.filter((t) => t.status === "soon");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-3 text-xs text-steel">
        <Link href="/" className="hover:underline">Home</Link> / <span className="text-ink">Home Improvement</span>
      </nav>
      <h1 className="text-4xl font-extrabold tracking-tight">Home Improvement Calculators</h1>
      <p className="mt-3 max-w-2xl text-lg text-steel">
        Plan footings, piers and foundations with real bag yields and code-aware checks. Every calculator ends with a
        shopping list you can print or save as a PDF.
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
          <li><strong>Just need cubic yards or bags?</strong> The concrete calculator handles any mix of slabs, footings, walls and posts in one project.</li>
          <li><strong>Need gravel for a driveway, path or base?</strong> The gravel calculator gives tons, yards and bags for any mix of areas.</li>
          <li><strong>Decking a deck?</strong> The deck board calculator counts boards by length, linear feet and screws.</li>
          <li><strong>Building a deck?</strong> Start with the deck footing calculator. It sizes the footing from your deck's load and soil.</li>
          <li><strong>Already know the tube size?</strong> The Sonotube calculator turns diameter, depth and count into bags and tubes.</li>
          <li><strong>Pouring under a wall, garage or addition?</strong> The concrete footing calculator handles continuous and pad footings with rebar.</li>
          <li><strong>Putting up a fence?</strong> The fence calculator gives the full materials list for wood, chain link or panels; the post spacing and depth calculators handle layout and holes.</li>
          <li><strong>Setting a shed?</strong> The shed foundation calculator covers gravel pads, slabs and blocks.</li>
        </ul>
      </section>
    </div>
  );
}
