# AIWebGrade Calculators

Next.js (App Router) + Tailwind. Every page is statically generated. US units throughout.

Live tools (Wave 1, part 1):
- `/home-improvement/sonotube-calculator`
- `/home-improvement/concrete-footing-calculator`
- `/home-improvement/deck-footing-calculator`

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000  (ad slots show as dashed placeholders)
npm test         # calculation unit tests
npm run build    # production build
```

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. vercel.com → Add New Project → import the repo. Framework preset: Next.js. No settings needed.
3. Project → Settings → Domains → add `aiwebgrade.com` and `www.aiwebgrade.com`, then update DNS at your registrar to the records Vercel shows.
4. Google Search Console → Sitemaps → submit `https://aiwebgrade.com/sitemap.xml`.
   Old aiwebgrade URLs will return 404, which is fine; Google drops them over a few weeks.

## Hook up ads

Everything lives in **`lib/ads.ts`**. Paste the snippet each network gives you into a slot:

```ts
"result-top": { html: `<script async src="https://example-network.com/tag.js" data-zone="12345"></script>` },
```

| Slot | Where | Size to request |
|---|---|---|
| `header` | Under the site header, all pages | 728×90 desktop / 320×50 mobile |
| `input-below` | Under the calculator form | 300×250 |
| `processing` | On the 3-second processing screen | 300×250 |
| `result-top` | Above the results | 728×90 / 320×100 |
| `result-pdf` | Under the PDF button; refreshes on each PDF click | 300×250 |
| `pdf-card` | Inside the card that slides in after "Download PDF Report" | 300×250 / native |
| `content-1` | In the article, after section 2 | 300×250 / native |
| `content-2` | In the article, after section 4 | 300×250 / native |
| `content-3` | In the article, before the FAQ | 300×250 / native |
| `sidebar` | Desktop sidebar, top | 300×250 |
| `sidebar-2` | Desktop sidebar, sticky while scrolling | 300×600 |
| `mobile-anchor` | Sticky bar at the bottom of phones, closable | 320×50 |

Create a separate zone in your ad network for each slot. Reserved heights live in `SLOT_HEIGHT`; match them to the sizes you request.

**Next step box:** every result screen links to a related calculator (deck footing → Sonotube with the numbers prefilled). Each click = a new page of ads.

**Post-download sponsored offer:** `PDF_OFFER` in `lib/ads.ts`. Paste your affiliate or lead-gen link into `url`
(e.g. a contractor-quote program). While `url` is empty the offer stays hidden and only the `pdf-card` ad shows.
Links are tagged `rel="sponsored"` as Google requires for paid links.

**PDF:** generated in the browser with jsPDF (US Letter, branded, your URL in the footer), loaded only on click.
If it fails for any reason, the browser's print → "Save as PDF" opens instead.

`GLOBAL_AD_SCRIPTS` = site-wide tags (social bar, pop-under, auto-ads loader).
`PROCESSING_MS` = length of the processing screen (default 3000; set 0 to skip it).

Heights are reserved per slot (`SLOT_MIN_HEIGHT`) so ads don't shift the layout.

### Ad yield & safety features (all in `lib/ads.ts`)

- **ads.txt:** paste each network's line(s) into `ADS_TXT`. Served at `/ads.txt`. Do this first; without it many buyers won't bid.
- **Lazy loading:** each ad loads ~300 px before it scrolls into view (`LAZY_MARGIN_PX`). Better viewability, faster pages.
- **Viewable refresh:** add slots to `REFRESH_SLOTS` (e.g. `["mobile-anchor", "sidebar-2"]`) ONLY if your network allows refresh.
  Refreshes only while ≥50% on screen and the tab is active, never faster than every 30 s.
- **Privacy opt-out:** mark tracking tags `personalized: true`. They're skipped for visitors who opt out at `/privacy-choices`
  (linked in the footer as "Do Not Sell or Share") or whose browser sends Global Privacy Control.
  Premium networks usually require their own consent tool (CMP) as well; add its script to `GLOBAL_AD_SCRIPTS` when they give it to you.
- **Ad density check:** in `npm run dev`, a badge top-left shows mobile ad density (resize the window narrower than 640 px). Keep it green/under 30%.
  Current pages measure 19–23% at every funnel step.
- **Contact email:** change `contactEmail` in `lib/site.ts` to a real inbox; privacy requests go there.

### Ad risks (read before enabling pop-unders / interstitials)

- **Chrome's built-in ad filter** blocks *all* ads on sites that fail the Better Ads Standards. "Prestitial ads with countdown" and pop-ups are on that list. A full-screen ad during the 3-second screen is the riskiest setup here. A normal display unit in the `processing` slot is safe.
- **Google Search** demotes pages with intrusive interstitials on mobile. This site depends on organic US traffic, so test aggressive formats on a small share of traffic first and watch Search Console.

## Add the next tool

1. Write the math in `lib/calc/<tool>.ts` (pure functions + a `validate` fn) and add tests in `tests/`.
2. Build the form/result UI in `components/calculators/<Tool>Calculator.tsx`, copying any existing calculator. `useFunnel` + `<Funnel>` give you the 3 steps, ad slots and PDF for free.
3. Create `app/<section>/<slug>/page.tsx` with metadata, content, FAQs (copy an existing page).
4. Set the tool's `status: "live"` in `lib/site.ts`. Nav, hub, related links and sitemap update automatically.

## Files

```
app/                      routes (home, hub, 3 tools, about, privacy, sitemap, robots)
components/Funnel.tsx     3-step funnel: input → processing → result + PDF
components/AdSlot.tsx     ad slot renderer (executes pasted <script> tags)
components/ToolPage.tsx   page shell: breadcrumbs, JSON-LD (WebApplication, FAQPage, Breadcrumb), FAQ, sidebar
components/calculators/   one UI component per tool
lib/calc/                 calculation engines (pure TS, unit-tested)
lib/ads.ts                ALL ad configuration
lib/site.ts               site info + 15-tool catalog
```
