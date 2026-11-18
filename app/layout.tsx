import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import GlobalAds from "@/components/GlobalAds";
import AdSlot from "@/components/AdSlot";
import { SITE } from "@/lib/site";
import MobileAnchor from "@/components/MobileAnchor";
import DensityCheck from "@/components/DensityCheck";
import { HideOnEmbed } from "@/components/Embed";
import { TOOLS, toolPath } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s | ${SITE.shortName}` },
  description: SITE.tagline,
  openGraph: { siteName: SITE.name, locale: SITE.locale, type: "website" },
  robots: { index: true, follow: true },
  twitter: { card: "summary_large_image" },
};

const siteSchema = [
  { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url },
  { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon.svg`, email: SITE.contactEmail },
];

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#16191d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body className="flex min-h-screen flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }} />
        <HideOnEmbed>
        <header className="bg-ink text-white print:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-safety font-mono text-sm text-ink">÷</span>
              <span>
                AIWebGrade <span className="hidden font-normal text-white/60 sm:inline">Calculators</span>
              </span>
            </Link>
            <nav className="flex gap-5 text-sm font-semibold text-white/80">
              <Link href="/home-improvement" className="hover:text-white">
                <span className="sm:hidden">Calculators</span>
                <span className="hidden sm:inline">Home Improvement</span>
              </Link>
              <Link href="/business" className="hover:text-white">Business</Link>
              <Link href="/about" className="hidden hover:text-white sm:inline">About</Link>
            </nav>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[760px] px-4 pt-3">
          <AdSlot id="header" label={false} />
        </div>
        </HideOnEmbed>
        <main className="flex-1">{children}</main>
        <HideOnEmbed>
        <footer className="mt-16 border-t border-line bg-white print:hidden">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-steel sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="font-bold text-ink">{SITE.name}</div>
              <p className="mt-1">{SITE.tagline}.</p>
              <p className="mt-3 text-xs">
                Calculators give planning estimates only. Always follow your local building code and the manufacturer's instructions.
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="mb-2 font-bold text-ink">Home improvement calculators</div>
              <ul className="grid gap-1 sm:grid-cols-2">
                {TOOLS.filter((t) => t.status === "live" && t.section === "home-improvement").map((t) => (
                  <li key={t.slug}><Link href={toolPath(t)} className="hover:text-ink">{t.name}</Link></li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-1">
              <div className="mb-1 font-bold text-ink">Business</div>
              {TOOLS.filter((t) => t.status === "live" && t.section === "business").map((t) => (
                <Link key={t.slug} href={toolPath(t)} className="hover:text-ink">{t.name}</Link>
              ))}
              <div className="mb-1 mt-4 font-bold text-ink">Site</div>
              <Link href="/about" className="hover:text-ink">About & methodology</Link>
              <Link href="/privacy" className="hover:text-ink">Privacy policy</Link>
              <Link href="/privacy-choices" className="hover:text-ink">Your Privacy Choices / Do Not Sell or Share My Info</Link>
            </div>
          </div>
        </footer>
        </HideOnEmbed>
        <HideOnEmbed>
          <MobileAnchor />
          <GlobalAds />
        </HideOnEmbed>
        <DensityCheck />
      </body>
    </html>
  );
}
