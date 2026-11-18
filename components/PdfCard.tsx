"use client";

import { useEffect, useState } from "react";
import AdSlot from "./AdSlot";
import { PDF_OFFER } from "@/lib/ads";

/** Slides in under the PDF button after a download: confirmation + sponsored offer + ad slot. */
export default function PdfCard({ status, onClose }: { status: "working" | "done" | "error"; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const offer = PDF_OFFER && PDF_OFFER.url ? PDF_OFFER : null;

  return (
    <div
      className={`overflow-hidden rounded-lg border border-line bg-white shadow-md transition-all duration-500 ease-out print:hidden ${
        shown ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
      role="region"
      aria-label="Download status and sponsored content"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line bg-concrete/50 px-4 py-2.5 text-sm">
        <span className="font-semibold">
          {status === "working" && "Preparing your PDF…"}
          {status === "done" && "✓ Your report downloaded. Check your Downloads folder."}
          {status === "error" && "Download didn't start, so we opened print instead. Choose “Save as PDF”."}
        </span>
        <button onClick={onClose} aria-label="Close" className="px-1 text-lg leading-none text-steel hover:text-ink">
          ×
        </button>
      </div>
      <div className="space-y-4 p-4">
        {offer && (
          <a
            href={offer.url}
            target="_blank"
            rel="sponsored noopener"
            className="block rounded-md border border-safety bg-safety/10 p-4 transition hover:bg-safety/20"
          >
            <div className="text-[10px] font-semibold uppercase tracking-widest text-steel">Sponsored</div>
            <div className="mt-1 text-lg font-bold text-ink">{offer.title}</div>
            <div className="text-sm text-steel">{offer.text}</div>
            <span className="btn-primary mt-3 px-4 py-2 text-sm">{offer.cta} →</span>
          </a>
        )}
        <AdSlot id="pdf-card" />
      </div>
    </div>
  );
}
