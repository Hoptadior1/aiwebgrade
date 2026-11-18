"use client";

import { useEffect, useState } from "react";
import AdSlot, { hasAd } from "./AdSlot";

/** Sticky 320x50 ad at the bottom of phone screens. Closable; stays closed for the browser session. */
export default function MobileAnchor() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let closed = false;
    try {
      closed = sessionStorage.getItem("anchor-closed") === "1";
    } catch {}
    setOpen(!closed && hasAd("mobile-anchor") && !window.matchMedia("(min-width: 768px)").matches);
  }, []);

  useEffect(() => {
    document.body.style.paddingBottom = open ? "64px" : "";
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 py-1.5 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] backdrop-blur md:hidden print:hidden">
      <button
        onClick={() => {
          setOpen(false);
          try {
            sessionStorage.setItem("anchor-closed", "1");
          } catch {}
        }}
        aria-label="Close ad"
        className="absolute -top-6 right-2 rounded-t-md border border-b-0 border-line bg-white px-2 text-sm leading-6 text-steel"
      >
        ×
      </button>
      <AdSlot id="mobile-anchor" label={false} />
    </div>
  );
}
