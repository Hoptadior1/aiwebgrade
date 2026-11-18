import type { MetadataRoute } from "next";
import { SITE, liveTools, toolPath } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, priority: 1 },
    { url: `${SITE.url}/home-improvement`, lastModified: now, priority: 0.9 },
    ...liveTools().map((t) => ({ url: `${SITE.url}${toolPath(t)}`, lastModified: now, priority: 0.8 })),
    { url: `${SITE.url}/about`, lastModified: now, priority: 0.3 },
    { url: `${SITE.url}/privacy`, lastModified: now, priority: 0.1 },
  ];
}
