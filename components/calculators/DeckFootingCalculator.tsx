"use client";

import { useState } from "react";
import Funnel, { useFunnel } from "@/components/Funnel";
import { FormError, NumberField, Segmented, SelectField, n } from "@/components/Fields";
import { BagTable, HeadlineStats, ShoppingList, Warnings } from "@/components/Results";
import { calcDeck, validateDeck, type DeckAttach, type DeckFootingType, type DeckInput, type DeckResult } from "@/lib/calc/deck";
import { fmt, type BagSize } from "@/lib/calc/concrete";

const STEPS = ["Laying out beams & posts", "Calculating load per footing", "Sizing footings for your soil", "Totaling concrete & tubes"];

const SOILS = [
  { value: 1500, label: "1,500 psf: clay, silt, or unknown" },
  { value: 2000, label: "2,000 psf: sand, silty/clayey sand, silty/clayey gravel" },
  { value: 3000, label: "3,000 psf: sandy gravel, gravel" },
];

export default function DeckFootingCalculator() {
  const [width, setWidth] = useState("16");
  const [proj, setProj] = useState("12");
  const [attach, setAttach] = useState<DeckAttach>("ledger");
  const [cant, setCant] = useState("0");
  const [spacing, setSpacing] = useState("8");
  const [live, setLive] = useState("40");
  const [dead, setDead] = useState("10");
  const [soil, setSoil] = useState<number>(1500);
  const [frost, setFrost] = useState("36");
  const [above, setAbove] = useState("2");
  const [ftype, setFtype] = useState<DeckFootingType>("pier");
  const [padT, setPadT] = useState("8");
  const [pierD, setPierD] = useState<number>(10);
  const [waste, setWaste] = useState("10");
  const [bag, setBag] = useState<BagSize>(80);
  const f = useFunnel<DeckResult>();

  const input = (): DeckInput => ({
    widthFt: n(width),
    projectionFt: n(proj),
    attach,
    cantileverFt: n(cant || "0"),
    maxPostSpacingFt: n(spacing),
    liveLoadPsf: n(live),
    deadLoadPsf: n(dead),
    soilPsf: soil,
    frostDepthIn: n(frost),
    aboveGradeIn: n(above || "0"),
    footingType: ftype,
    padThicknessIn: n(padT),
    pierDiameterIn: pierD,
    wastePct: n(waste || "0"),
    bagSize: bag,
  });

  const r = f.result;
  const tubeText = (x: DeckResult) =>
    x.tubes ? (x.tubes.fourFt !== null ? `${x.tubes.fourFt} x 4 ft` : x.tubes.twelveFt !== null ? `${x.tubes.twelveFt} x 12 ft` : "special order") : "n/a";
  return (
    <Funnel
      slug="deck-footing-calculator"
      nextStep={() =>
        r && {
          title: `Fine-tune your ${r.totalPosts} piers`,
          text: `Try other tube sizes, depths and bag prices. Your ${r.tubeDiameterIn} in. tubes are already filled in.`,
          href: `/home-improvement/sonotube-calculator?d=${r.tubeDiameterIn}&depth=${r.tubeLengthIn - (n(above || "0") || 0)}&above=${n(above || "0") || 0}&count=${r.totalPosts}`,
          cta: "Open Sonotube calculator",
        }
      }
      report={() =>
        r && {
          stats: [
            ["Footing size", r.pierDiameterIn !== null ? `${r.pierDiameterIn} in round` : `${r.padSizeIn} in square`],
            ["Footings", `${r.totalPosts}`],
            [`${bag} lb bags`, fmt(r.chosenBags, 0)],
            ["Load / footing", `${fmt(r.interiorLoadLb, 0)} lb`],
          ],
          tables: [
            {
              title: "How it was sized",
              rows: [
                ["Area carried by interior post", `${fmt(r.interiorTribAreaSqFt, 1)} sq ft`],
                ["Design load", `${n(live) + n(dead)} psf`],
                ["Load on post", `${fmt(r.interiorLoadLb, 0)} lb`],
                ["Footing area needed", `${fmt(r.requiredAreaSqFt, 2)} sq ft`],
                ["Post spacing (actual)", `${fmt(r.actualSpacingFt, 2)} ft`],
              ],
            },
            { title: "Bagged concrete needed", head: ["Bag size", "Bags", "Total weight"], rows: r.bags.map((b) => [`${b.size} lb`, fmt(b.bags, 0), `${fmt(b.weightLb, 0)} lb`]) },
            {
              title: "Shopping list",
              rows: [
                ["Concrete", `${r.chosenBags} x ${bag} lb bags (${fmt(r.yd, 2)} cu yd)`],
                [`${r.tubeDiameterIn} in form tubes`, tubeText(r)],
                ["Cut each tube to", `${fmt(r.tubeLengthIn, 1)} in`],
                ["Post bases", `${r.totalPosts}`],
                ["Anchor bolts / J-bolts", `${r.totalPosts}`],
              ],
            },
          ],
          notes: [
            r.advice,
            ...r.warnings,
            "End posts carry about half the interior load; most builders use one footing size throughout. Local code (IRC R507) and your inspector have final say.",
          ],
        }
      }
      toolName="Deck Footing Calculator"
      steps={STEPS}
      stage={f.stage}
      onFinish={f.finish}
      onReset={f.reset}
      inputSummary={[
        ["Deck size", `${width} ft wide × ${proj} ft out`],
        ["Support", attach === "ledger" ? "Ledger-attached, 1 beam" : "Freestanding, 2 beams"],
        ["Max post spacing", `${spacing} ft`],
        ["Design load", `${live} psf live + ${dead} psf dead`],
        ["Soil bearing", `${soil.toLocaleString()} psf`],
        ["Footing depth", `${frost} in`],
      ]}
      input={
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            f.run(() => validateDeck(input()), () => calcDeck(input()));
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Deck width (along house)" value={width} onChange={setWidth} unit="ft" />
            <NumberField label="Deck projection (out from house)" value={proj} onChange={setProj} unit="ft" />
          </div>
          <Segmented
            label="How is the deck supported?"
            value={attach}
            onChange={setAttach}
            options={[
              { value: "ledger", label: "Attached to house (ledger)" },
              { value: "freestanding", label: "Freestanding (2 beams)" },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Max post spacing along beam" value={spacing} onChange={setSpacing} unit="ft" hint="6–8 ft is typical for doubled/tripled 2×10 or 2×12 beams." />
            <NumberField label="Joist cantilever past beam" value={cant} onChange={setCant} unit="ft" hint="0 if the beam sits at the outer edge." />
            <SelectField label="Soil type (allowable bearing)" value={soil} onChange={setSoil} options={SOILS} hint="Not sure? Keep 1,500 psf, the most conservative." />
            <NumberField label="Footing depth (frost depth)" value={frost} onChange={setFrost} unit="in" hint="Ask your building department. Ranges from ~12 in. in the South to 48 in.+ up north." />
          </div>
          <Segmented
            label="Footing style"
            value={ftype}
            onChange={setFtype}
            options={[
              { value: "pier", label: "Round pier (Sonotube)" },
              { value: "pad", label: "Square pad + pier" },
            ]}
          />
          <details className="group rounded-md border border-line bg-concrete/40">
            <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-steel">Advanced: loads, pad, waste & bags</summary>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <NumberField label="Live load" value={live} onChange={setLive} unit="psf" hint="40 psf per IRC. Use your snow load if higher." />
              <NumberField label="Dead load" value={dead} onChange={setDead} unit="psf" hint="10 psf for wood decks; 15+ for composite or heavy finishes." />
              <NumberField label="Pier height above grade" value={above} onChange={setAbove} unit="in" />
              {ftype === "pad" && (
                <>
                  <NumberField label="Pad thickness" value={padT} onChange={setPadT} unit="in" />
                  <SelectField
                    label="Pier diameter on top of pad"
                    value={pierD}
                    onChange={setPierD}
                    options={[8, 10, 12].map((d) => ({ value: d, label: `${d} in` }))}
                  />
                </>
              )}
              <NumberField label="Waste" value={waste} onChange={setWaste} unit="%" />
              <SelectField
                label="Bag size"
                value={bag}
                onChange={setBag}
                options={[40, 50, 60, 80].map((s) => ({ value: s as BagSize, label: `${s} lb bags` }))}
              />
            </div>
          </details>
          <FormError error={f.error} />
          <button type="submit" className="btn-primary w-full">Size my footings →</button>
        </form>
      }
      result={
        r && (
          <>
            <HeadlineStats
              items={[
                {
                  label: "Footing size",
                  value: r.pierDiameterIn !== null ? `${r.pierDiameterIn}" Ø` : `${r.padSizeIn}" sq`,
                  sub: r.pierDiameterIn !== null ? "round pier" : `${padT} in. thick pad`,
                  accent: true,
                },
                { label: "Footings", value: `${r.totalPosts}`, sub: `${r.postsPerBeam} per beam @ ${fmt(r.actualSpacingFt, 1)} ft` },
                { label: `${bag} lb bags`, value: fmt(r.chosenBags, 0), sub: `${fmt(r.yd, 2)} cu yd` },
                { label: "Load / footing", value: `${fmt(r.interiorLoadLb, 0)} lb`, sub: "interior post (worst case)" },
              ]}
            />
            <div className="rounded-md border border-line bg-concrete/40 p-4 text-sm">
              <div className="mb-1 font-bold">How we sized it</div>
              <ol className="list-decimal space-y-0.5 pl-5 font-mono text-[13px] text-steel">
                <li>Beam carries {fmt(r.tributaryWidthFt, 2)} ft of deck × {fmt(r.actualSpacingFt, 2)} ft post spacing = {fmt(r.interiorTribAreaSqFt, 1)} sq ft</li>
                <li>{fmt(r.interiorTribAreaSqFt, 1)} sq ft × {n(live) + n(dead)} psf = {fmt(r.interiorLoadLb, 0)} lb on the post</li>
                <li>{fmt(r.interiorLoadLb, 0)} lb ÷ {soil.toLocaleString()} psf soil = {fmt(r.requiredAreaSqFt, 2)} sq ft of footing needed</li>
                <li>
                  {r.pierDiameterIn !== null
                    ? `Smallest standard tube with that area: ${r.pierDiameterIn} in. diameter`
                    : `Square pad with that area, rounded up: ${r.padSizeIn} × ${r.padSizeIn} in.`}
                </li>
              </ol>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <BagTable bags={r.bags} chosen={bag} />
              <ShoppingList
                items={[
                  ["Concrete", `${r.chosenBags} × ${bag} lb bags`],
                  [
                    `${r.tubeDiameterIn} in form tubes`,
                    r.tubes
                      ? r.tubes.fourFt !== null
                        ? `${r.tubes.fourFt} × 4 ft`
                        : r.tubes.twelveFt !== null
                          ? `${r.tubes.twelveFt} × 12 ft`
                          : "special order"
                      : "n/a",
                  ],
                  ["Cut each tube to", `${fmt(r.tubeLengthIn, 1)} in`],
                  ["Post bases (e.g. 6×6)", `${r.totalPosts}`],
                  ["Anchor bolts / J-bolts", `${r.totalPosts}`],
                  ["Gravel for hole bottoms", "~4 in. per hole"],
                ]}
              />
            </div>
            <Warnings
              items={r.warnings}
              note="End posts carry roughly half the interior load, but most builders use one size for every footing. Your local code (IRC R507) and inspector have final say. Many jurisdictions publish a deck guide with required footing sizes."
            />
          </>
        )
      }
    />
  );
}
