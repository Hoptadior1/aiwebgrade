import type { Metadata } from "next";
import Link from "next/link";
import PrivacyToggle from "@/components/PrivacyToggle";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your Privacy Choices",
  alternates: { canonical: "/privacy-choices" },
  robots: { index: false, follow: true },
};

export default function PrivacyChoices() {
  return (
    <div className="prose-site mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight">Your Privacy Choices</h1>
      <p>
        Residents of California and several other US states have the right to opt out of the "sale" or "sharing" of
        personal information, which can include the use of cookies for interest-based advertising.
      </p>
      <div className="not-prose my-6">
        <PrivacyToggle />
      </div>
      <h2>Global Privacy Control</h2>
      <p>
        If your browser or extension sends a Global Privacy Control (GPC) signal, we treat it as a valid opt-out request
        automatically.
      </p>
      <h2>Other requests</h2>
      <p>
        To ask what information we hold, or to request deletion, email {SITE.contactEmail}. See our{" "}
        <Link href="/privacy" className="text-blueprint underline">privacy policy</Link> for details.
      </p>
    </div>
  );
}
