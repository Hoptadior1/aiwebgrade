"use client";

import { useEffect } from "react";
import { GLOBAL_AD_SCRIPTS } from "@/lib/ads";
import { isOptedOut } from "@/lib/privacy";
import { injectTag } from "./AdSlot";

export default function GlobalAds() {
  useEffect(() => {
    const optedOut = isOptedOut();
    GLOBAL_AD_SCRIPTS.forEach((tag, i) => {
      if (!tag || (tag.personalized && optedOut)) return;
      const id = `global-ad-${i}`;
      if (document.getElementById(id)) return;
      const host = document.createElement("div");
      host.id = id;
      document.body.appendChild(host);
      injectTag(host, tag);
    });
  }, []);
  return null;
}
