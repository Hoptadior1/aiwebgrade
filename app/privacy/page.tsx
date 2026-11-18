import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy" },
};

// Template only. Review it against the ad networks you actually use and your legal obligations (e.g. US state privacy laws).
export default function Privacy() {
  return (
    <div className="prose-site mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p>Last updated: November 2026</p>
      <h2>What we collect</h2>
      <p>
        The calculators run in your browser. The numbers you type are not sent to or stored on our servers. Like most
        websites, our hosting provider logs standard request data (IP address, browser type, pages visited) for security
        and performance.
      </p>
      <h2>Advertising and cookies</h2>
      <p>
        We show ads from third-party advertising networks. These partners may use cookies, web beacons and similar
        technologies to show ads, limit how often you see them, and measure performance, and may collect information about
        your visits to this and other websites. You can opt out of interest-based advertising from many networks at{" "}
        <a href="https://optout.aboutads.info" className="text-blueprint underline">optout.aboutads.info</a> and{" "}
        <a href="https://www.networkadvertising.org/choices/" className="text-blueprint underline">networkadvertising.org/choices</a>,
        or by blocking cookies in your browser.
      </p>
      <h2>Analytics</h2>
      <p>We may use analytics tools to understand which pages are used. These tools collect aggregated usage data.</p>
      <h2>Your rights</h2>
      <p>
        Depending on your state, you may have rights to know, delete, or opt out of the sale or sharing of personal
        information. Use our <a href="/privacy-choices" className="text-blueprint underline">Your Privacy Choices</a> page to opt out, or contact us at {SITE.contactEmail}. We honor Global Privacy Control signals.
      </p>
      <h2>Children</h2>
      <p>This site is not directed at children under 13, and we do not knowingly collect their information.</p>
      <h2>Contact</h2>
      <p>{SITE.contactEmail}</p>
    </div>
  );
}
