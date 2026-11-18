import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS, toolPath, SITE, type Tool } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Free Construction & Project Calculators (US) | AIWebGrade" },
  description:
    "Free US construction calculators with a shopping list and PDF report: concrete, gravel, deck boards, deck footings, fences, Sonotubes, French drains, retaining walls, stairs, plus ecommerce profit and ROAS.",
  alternates: { canonical: "/" },
  openGraph: { title: "Free Construction & Project Calculators | AIWebGrade", description: "Concrete, gravel, decks, fences, footings, drainage and more, with shopping lists and PDF reports.", url: "/", type: "website" },
};

const GROUPS: { title: string; slugs: string[] }[] = [
  { title: "Concrete & foundations", slugs: ["concrete-calculator", "concrete-slab-cost-calculator", "concrete-footing-calculator", "sonotube-calculator", "concrete-wall-calculator", "concrete-stairs-calculator", "shed-foundation-calculator"] },
  { title: "Decks", slugs: ["deck-board-calculator", "deck-footing-calculator"] },
  { title: "Fences", slugs: ["fence-estimator", "fence-post-spacing-calculator", "fence-post-depth-calculator"] },
  { title: "Yard, gravel & drainage", slugs: ["gravel-calculator", "french-drain-calculator", "retaining-wall-calculator"] },
  { title: "Business & ecommerce", slugs: ["ecommerce-profit-margin-calculator", "break-even-roas-calculator"] },
];

function Card({ t, big = false }: { t: Tool; big?: boolean }) {
  return (
    <Link href={toolPath(t)} className={`group rounded-lg border bg-white p-5 shadow-sm transition hover:border-safety hover:shadow ${big ? "border-safety/60" : "border-line"}`}>
      <div className={`${big ? "text-xl" : "text-lg"} font-bold group-hover:text-blueprint`}>{t.name} →</div>
      <div className="mt-1 text-sm text-steel">{t.short}</div>
    </Link>
  );
}

export default function Home() {
  const live = TOOLS.filter((t) => t.status === "live");
  const by = (s: string) => live.find((t) => t.slug === s);
  const hubs = live.filter((t) => t.wave === 0);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
        Construction calculators that give you a <span className="bg-safety px-1">shopping list</span>, not just a number.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-steel">
        {SITE.tagline}. US units, real bag yields, code-aware warnings, and a printable PDF report for every estimate. {live.length} free tools, no sign-up.
      </p>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wider text-steel">Most popular</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {hubs.map((t) => <Card key={t.slug} t={t} big />)}
      </div>

      {GROUPS.map((g) => {
        const items = g.slugs.map(by).filter((t): t is Tool => !!t && t.wave !== 0);
        if (!items.length) return null;
        return (
          <section key={g.title}>
            <h2 className="mt-10 text-sm font-bold uppercase tracking-wider text-steel">{g.title}</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((t) => <Card key={t.slug} t={t} />)}
            </div>
          </section>
        );
      })}

      <section className="prose-site mt-14 max-w-3xl">
        <h2>Built for real US projects</h2>
        <p>
          Every calculator uses US customary units, published bag yields (0.30 cu ft for a 40 lb bag up to 0.60 cu ft for 80 lb), and the
          International Residential Code minimums most US towns adopt. It warns you when a design needs a permit or an engineer. Results
          end in a shopping list you can take to the store or download as a PDF, and tools link to each other so one project's numbers
          flow into the next.
        </p>
      </section>
    </div>
  );
}
