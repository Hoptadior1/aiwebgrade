"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { AD_SLOTS, LAZY_MARGIN_PX, REFRESH_SECONDS, REFRESH_SLOTS, SLOT_HEIGHT, type AdTag, type SlotId } from "@/lib/ads";
import { isOptedOut } from "@/lib/privacy";
import { usePathname } from "next/navigation";

/** Injects a raw ad snippet and re-creates its <script> tags so the browser runs them. */
export function injectTag(container: HTMLElement, tag: NonNullable<AdTag>) {
  container.innerHTML = tag.html;
  container.querySelectorAll("script").forEach((old) => {
    const s = document.createElement("script");
    for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value);
    s.text = old.text;
    old.replaceWith(s);
  });
}

export const hasAd = (id: SlotId) => !!AD_SLOTS[id] || process.env.NODE_ENV !== "production";

/**
 * Lazy-loads when within LAZY_MARGIN_PX of the viewport.
 * Optional viewable refresh (REFRESH_SLOTS): only while ≥50% visible and the tab is active.
 */
export default function AdSlot({ id, className = "", label = true }: { id: SlotId; className?: string; label?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const embed = (usePathname() ?? "").startsWith("/embed");
  const tag = embed ? null : AD_SLOTS[id];
  const [hm, hd] = SLOT_HEIGHT[id];
  const style = { "--hm": `${hm}px`, "--hd": `${hd}px` } as CSSProperties;
  const sized = "min-h-[var(--hm)] sm:min-h-[var(--hd)]";

  useEffect(() => {
    const el = ref.current;
    if (!el || !tag) return;
    if (tag.personalized && isOptedOut()) return;
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    if ((tag.show === "desktop" && !desktop) || (tag.show === "mobile" && desktop)) return;

    let loaded = false;
    let visible = false;
    let visibleSince = 0;
    let timer: ReturnType<typeof setInterval> | undefined;

    const load = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !loaded) {
          loaded = true;
          injectTag(el, tag);
          load.disconnect();
        }
      },
      { rootMargin: `${LAZY_MARGIN_PX}px 0px` },
    );
    load.observe(el);

    let view: IntersectionObserver | undefined;
    if (REFRESH_SLOTS.includes(id)) {
      const every = Math.max(30, REFRESH_SECONDS) * 1000;
      view = new IntersectionObserver(
        (entries) => {
          const v = entries.some((e) => e.intersectionRatio >= 0.5);
          if (v && !visible) visibleSince = Date.now();
          visible = v;
        },
        { threshold: [0, 0.5] },
      );
      view.observe(el);
      timer = setInterval(() => {
        if (loaded && visible && document.visibilityState === "visible" && Date.now() - visibleSince >= every) {
          injectTag(el, tag);
          visibleSince = Date.now();
        }
      }, 1000);
    }

    return () => {
      load.disconnect();
      view?.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [id, tag]);

  if (!tag) {
    if (process.env.NODE_ENV !== "production" && !embed) {
      return (
        <div
          data-ad-slot={id}
          className={`flex items-center justify-center rounded border-2 border-dashed border-line text-xs font-mono uppercase tracking-wider text-steel/70 print:hidden ${sized} ${className}`}
          style={style}
        >
          ad slot: {id}
        </div>
      );
    }
    return null;
  }

  const vis = tag.show === "desktop" ? "hidden md:block" : tag.show === "mobile" ? "md:hidden" : "";
  return (
    <div data-ad-slot={id} className={`print:hidden ${vis} ${className}`}>
      {label && <div className="mb-1 text-center text-[10px] uppercase tracking-widest text-steel/60">Advertisement</div>}
      <div ref={ref} className={`flex justify-center ${sized}`} style={style} />
    </div>
  );
}
