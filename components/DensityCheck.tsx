"use client";

import { useEffect, useState } from "react";

/**
 * DEV ONLY. Estimates ad density the way the Better Ads Standard does for mobile:
 * total height of ad slots ÷ height of the main content. Over 30% = Chrome may filter all ads on the site.
 */
export default function DensityCheck() {
  const [pct, setPct] = useState<number | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const measure = () => {
      if (window.innerWidth >= 640) return setPct(null); // rule applies to mobile
      const main = document.querySelector("main");
      if (!main) return;
      let ads = 0;
      document.querySelectorAll<HTMLElement>("main [data-ad-slot]").forEach((el) => {
        if (el.offsetParent !== null) ads += el.getBoundingClientRect().height;
      });
      const anchor = document.querySelector<HTMLElement>('[data-ad-slot="mobile-anchor"]');
      if (anchor && anchor.offsetParent !== null) ads += anchor.getBoundingClientRect().height; // counts on every screen
      setPct((ads / main.getBoundingClientRect().height) * 100);
    };
    measure();
    const t = setInterval(measure, 1500);
    return () => clearInterval(t);
  }, []);

  if (pct === null) return null;
  const bad = pct > 30;
  const warn = pct > 25;
  return (
    <div
      className={`fixed left-2 top-2 z-50 rounded px-2 py-1 font-mono text-[11px] font-bold shadow print:hidden ${
        bad ? "bg-red-600 text-white" : warn ? "bg-safety text-ink" : "bg-green-600 text-white"
      }`}
      title="Mobile ad density (dev only). Keep under 30%."
    >
      ad density {pct.toFixed(0)}% {bad ? "OVER LIMIT" : ""}
    </div>
  );
}
