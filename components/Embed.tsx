"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";

export const useIsEmbed = () => (usePathname() ?? "").startsWith("/embed");

/** Hides site chrome (header, footer, ads) on /embed pages. */
export function HideOnEmbed({ children }: { children: ReactNode }) {
  return useIsEmbed() ? null : <>{children}</>;
}

/** Runs inside the iframe: reports its height to the host page so the iframe can size itself. */
export function EmbedHeightReporter({ slug }: { slug: string }) {
  useEffect(() => {
    const root = document.getElementById("aiwg-embed-root");
    if (!root) return;
    const send = () => window.parent?.postMessage({ aiwgEmbed: slug, height: Math.ceil(root.getBoundingClientRect().height) + 24 }, "*");
    const ro = new ResizeObserver(send);
    ro.observe(root);
    send();
    return () => ro.disconnect();
  }, [slug]);
  return null;
}

export function embedCode(slug: string, name: string, path: string) {
  const src = `${SITE.url}/embed/${slug}`;
  return [
    `<iframe id="aiwg-${slug}" src="${src}" title="${name}" width="100%" height="900" style="border:0;max-width:820px;" loading="lazy"></iframe>`,
    `<p style="font:13px sans-serif;margin:4px 0 0"><a href="${SITE.url}${path}">${name}</a> by <a href="${SITE.url}">AIWebGrade</a></p>`,
    `<script>addEventListener("message",function(e){if(e.origin==="${SITE.url}"&&e.data&&e.data.aiwgEmbed==="${slug}"){var f=document.getElementById("aiwg-${slug}");if(f)f.style.height=e.data.height+"px";}});</script>`,
  ].join("\n");
}

/** "Embed this calculator" box shown on every tool page. */
export function EmbedBox({ slug, name, path }: { slug: string; name: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const code = embedCode(slug, name, path);
  return (
    <details className="group rounded-lg border border-line bg-white print:hidden">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-ink">
        &lt;/&gt; Embed this calculator on your website: free
      </summary>
      <div className="space-y-3 border-t border-line p-4 text-sm">
        <p className="text-steel">
          Contractors, suppliers and bloggers: paste this code into any page to give your visitors this calculator. It's free, needs no sign-up and stays up to date.
        </p>
        <textarea readOnly value={code} rows={5} className="w-full rounded-md border border-line bg-concrete/40 p-2 font-mono text-[11px]" onFocus={(e) => e.currentTarget.select()} />
        <button
          type="button"
          className="btn-secondary px-4 py-2 text-sm"
          onClick={() => {
            navigator.clipboard?.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied ? "✓ Copied" : "Copy embed code"}
        </button>
      </div>
    </details>
  );
}
