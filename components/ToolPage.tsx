import Link from "next/link";
import type { ReactNode } from "react";
import AdSlot from "./AdSlot";
import { EmbedBox } from "./Embed";
import { SITE, TOOLS, toolPath, type Tool } from "@/lib/site";

export type Faq = { q: string; a: string };

export default function ToolPage({
  tool,
  h1,
  intro,
  calculator,
  children,
  faqs,
  related,
  updated,
}: {
  tool: Tool;
  h1: string;
  intro: ReactNode;
  calculator: ReactNode;
  children: ReactNode; // article content
  faqs: Faq[];
  related: string[]; // tool slugs
  updated: string; // ISO date
}) {
  const url = `${SITE.url}${toolPath(tool)}`;
  const sectionName = tool.section === "home-improvement" ? "Home Improvement" : "Business";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.name,
      url,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: tool.short,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: sectionName, item: `${SITE.url}/${tool.section}` },
        { "@type": "ListItem", position: 3, name: tool.name, item: url },
      ],
    },
  ];

  const relatedTools = related.map((s) => TOOLS.find((t) => t.slug === s)!).filter(Boolean);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="min-w-0">
        <nav className="mb-2 text-xs text-steel print:hidden" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link> /{" "}
          <Link href={`/${tool.section}`} className="hover:underline">{sectionName}</Link> /{" "}
          <span className="text-ink">{tool.name}</span>
        </nav>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl print:hidden">{h1}</h1>
        <div className="mt-1 max-w-2xl text-steel print:hidden">{intro}</div>

        <div className="mt-4">{calculator}</div>
        <div className="mt-4"><EmbedBox slug={tool.slug} name={tool.name} path={toolPath(tool)} /></div>

        <div className="prose-site mt-10 print:hidden">{children}</div>

        <AdSlot id="content-3" className="my-8" />

        <section className="mt-10 print:hidden">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-line rounded-lg border border-line bg-white">
            {faqs.map((f) => (
              <details key={f.q} className="group p-4">
                <summary className="cursor-pointer list-none font-semibold text-ink">
                  <span className="mr-2 inline-block text-safety-dark transition group-open:rotate-90">▸</span>
                  {f.q}
                </summary>
                <p className="mt-2 text-steel">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-8 text-xs text-steel print:hidden">
          Last updated {new Date(updated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}. Results are
          estimates for planning and budgeting. Footing sizes, depths and reinforcement must meet your local building code.
          Check with your building department, and use a licensed engineer for anything structural you're unsure about.
        </p>
      </article>

      <aside className="space-y-6 print:hidden">
        <div className="hidden lg:block">
          <AdSlot id="sidebar" />
        </div>
        {relatedTools.length > 0 && (
          <div className="rounded-lg border border-line bg-white p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-steel">Related calculators</h2>
            <ul className="space-y-2">
              {relatedTools.map((t) =>
                t.status === "live" ? (
                  <li key={t.slug}>
                    <Link href={toolPath(t)} className="font-semibold text-blueprint hover:underline">{t.name}</Link>
                    <div className="text-xs text-steel">{t.short}</div>
                  </li>
                ) : (
                  <li key={t.slug} className="text-steel">
                    {t.name} <span className="text-[10px] uppercase">(coming soon)</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        )}
        <div className="sticky top-4 hidden lg:block">
          <AdSlot id="sidebar-2" />
        </div>
      </aside>
    </div>
  );
}
