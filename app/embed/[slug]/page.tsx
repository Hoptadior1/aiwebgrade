import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmbedRenderer } from "@/lib/embeds";
import { EmbedHeightReporter } from "@/components/Embed";
import { SITE, TOOLS, toolPath } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.filter((t) => t.status === "live").map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = TOOLS.find((x) => x.slug === slug);
  return {
    title: t ? `${t.name} (embed)` : "Calculator",
    robots: { index: false, follow: true },
    alternates: t ? { canonical: toolPath(t) } : undefined,
  };
}

export default async function EmbedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t || t.status !== "live") notFound();
  return (
    <div id="aiwg-embed-root" className="mx-auto max-w-3xl p-2">
      <EmbedRenderer slug={slug} />
      <p className="mt-2 text-center text-xs text-steel">
        <a href={`${SITE.url}${toolPath(t)}`} target="_blank" rel="noopener" className="underline">
          Free {t.name} by AIWebGrade
        </a>
      </p>
      <EmbedHeightReporter slug={slug} />
    </div>
  );
}
