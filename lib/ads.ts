// ─────────────────────────────────────────────────────────────────────────────
// AD CONFIG. Paste each network's tag here. Nothing else in the codebase needs to change.
//
// `html` = the exact snippet the network gives you (script tags included). It is injected
// client-side and its <script> tags are re-created so they execute.
// Leave a slot as null to render nothing (in development a dashed placeholder shows instead).
// Most networks want a separate zone/placement per slot, so create one zone for each.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * html: the network's snippet.
 * personalized: true for tags that track users / do interest-based targeting.
 *   These are skipped for visitors who opt out on /privacy-choices or send a Global Privacy Control signal.
 *   Most networks also offer a "non-personalized" tag; put that in a second slot entry if you have one.
 */
export type AdTag = { html: string; personalized?: boolean } | null;

export type SlotId =
  | "header" // compact leaderboard under the site header: 728x90 desktop / 320x50 mobile
  | "input-below" // under the calculator form
  | "processing" // on the processing screen
  | "result-top" // above the results
  | "result-pdf" // under the PDF button; re-rendered (new impression) when PDF is clicked
  | "pdf-card" // inside the card that slides in after "Download PDF Report" (banner / native only)
  | "content-1" // in-article, after section 2
  | "content-2" // in-article, after section 4
  | "content-3" // in-article, before the FAQ
  | "sidebar" // desktop sidebar, top (300x250 or 300x600)
  | "sidebar-2" // desktop sidebar, sticky while scrolling the article (300x600)
  | "mobile-anchor"; // sticky 320x50 bar at the bottom of phone screens, closable

export const AD_SLOTS: Record<SlotId, AdTag> = {
  header: null,
  "input-below": null,
  processing: null,
  "result-top": null,
  "result-pdf": null,
  "pdf-card": null,
  "content-1": null,
  "content-2": null,
  "content-3": null,
  sidebar: null,
  "sidebar-2": null,
  "mobile-anchor": null,
};

/**
 * Reserved heights [mobile, desktop] in px so ads don't shift the layout (CLS hurts rankings).
 * Match these to the ad sizes you request from the network.
 */
export const SLOT_HEIGHT: Record<SlotId, [number, number]> = {
  header: [50, 90],
  "input-below": [250, 250],
  processing: [250, 250],
  "result-top": [100, 90],
  "result-pdf": [250, 250],
  "pdf-card": [250, 250],
  "content-1": [250, 250],
  "content-2": [250, 250],
  "content-3": [250, 250],
  sidebar: [250, 250],
  "sidebar-2": [600, 600],
  "mobile-anchor": [50, 50],
};

/**
 * Optional sponsored offer shown in the post-download card (e.g. a contractor-quote affiliate link).
 * Set to null to show only the ad slot.
 */
export type SponsoredOffer = { title: string; text: string; cta: string; url: string } | null;

export const PDF_OFFER: SponsoredOffer = {
  title: "Need it poured? Get free local quotes",
  text: "Compare prices from licensed concrete contractors near you. Free, no obligation.",
  cta: "Get free quotes",
  url: "", // ← paste your affiliate / lead-gen link. Empty = offer hidden.
};

/**
 * Site-wide scripts loaded once per page view (e.g. a social bar, or a network's auto-ads loader).
 * Pop-unders go here too if you choose to run them. See README "Ad risks" first.
 */
export const GLOBAL_AD_SCRIPTS: AdTag[] = [];

/**
 * ads.txt lines, served at https://aiwebgrade.com/ads.txt. Every network gives you its line(s) when you sign up.
 * Without them, many advertisers refuse to bid on your inventory. One string per line.
 */
export const ADS_TXT: string[] = [
  // "example-network.com, 1234567, DIRECT, abc123def456",
];

/**
 * Viewable refresh for sticky slots: the ad is reloaded every REFRESH_SECONDS while it is on screen
 * and the tab is active. OFF by default: only add slots here if your network's policy allows refresh,
 * since undeclared refresh can get an account banned. Minimum enforced: 30 seconds.
 */
export const REFRESH_SLOTS: SlotId[] = []; // e.g. ["mobile-anchor", "sidebar-2"]
export const REFRESH_SECONDS = 30;

/** Load each ad this far before it scrolls into view (lazy loading). Higher viewability = higher bids. */
export const LAZY_MARGIN_PX = 300;

/** Length of the processing screen between input and result. Set to 0 to skip it. */
export const PROCESSING_MS = 3000;
