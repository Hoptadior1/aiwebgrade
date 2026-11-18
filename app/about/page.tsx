import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About & Methodology",
  description: "How AIWebGrade calculators work, where the numbers come from, and their limits.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <div className="prose-site mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight">About & methodology</h1>
      <p>
        {SITE.name} builds free calculators for US homeowners, DIYers and contractors planning concrete, footing, deck and
        fence projects. Each tool shows its formula, its assumptions, and a material list you can take to the store.
      </p>
      <h2>Where the numbers come from</h2>
      <ul>
        <li><strong>Bag yields:</strong> manufacturer-published yields for standard premixed concrete: 0.30 cu ft (40 lb), 0.375 (50 lb), 0.45 (60 lb), 0.60 (80 lb).</li>
        <li><strong>Code minimums and loads:</strong> the International Residential Code (IRC), which most US states and cities adopt with local amendments: 40 psf deck live load, 12 in. minimum footing width, 6 in. minimum footing thickness, and presumptive soil bearing values.</li>
        <li><strong>Ready-mix:</strong> rounded up to quarter-yard increments, the way most US plants sell it.</li>
      </ul>
      <h2>Limits</h2>
      <p>
        These are planning estimates. Local codes differ, especially frost depth, snow load and seismic requirements. Your
        building department and, where needed, a licensed engineer have the final say on any structural element.
      </p>
      <h2>Contact</h2>
      <p>Found an error or want a calculator added? Email {SITE.contactEmail}.</p>
    </div>
  );
}
