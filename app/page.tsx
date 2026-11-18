import Link from "next/link";
import { TOOLS, toolPath, SITE } from "@/lib/site";

export default function Home() {
  const live = TOOLS.filter((t) => t.status === "live");
  const soon = TOOLS.filter((t) => t.status === "soon");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
        Construction calculators that give you a <span className="bg-safety px-1">shopping list</span>, not just a number.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-steel">
        {SITE.tagline}. US units, real bag yields, code-aware warnings, and a printable PDF report for every estimate.
      </p>

      <h2 className="mt-12 text-sm font-bold uppercase tracking-wider text-steel">Calculators</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {live.map((t) => (
          <Link
            key={t.slug}
            href={toolPath(t)}
            className="group rounded-lg border border-line bg-white p-5 shadow-sm transition hover:border-safety hover:shadow"
          >
            <div className="text-lg font-bold group-hover:text-blueprint">{t.name} →</div>
            <div className="mt-1 text-sm text-steel">{t.short}</div>
          </Link>
        ))}
      </div>

      {soon.length > 0 && (
        <>
          <h2 className="mt-12 text-sm font-bold uppercase tracking-wider text-steel">Coming soon</h2>
          <ul className="mt-3 grid gap-x-6 gap-y-1 text-steel sm:grid-cols-2 lg:grid-cols-3">
            {soon.map((t) => (
              <li key={t.slug}>{t.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
