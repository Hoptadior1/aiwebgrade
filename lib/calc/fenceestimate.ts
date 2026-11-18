import { calcFenceSpacing } from "./fencespacing.ts";
import { calcFenceDepth } from "./fencedepth.ts";

export type FenceKind = "chainlink" | "panel" | "wood";

export type FenceEstimateInput = {
  kind: FenceKind;
  sidesFt: number[];
  closed: boolean;
  heightFt: number;
  gates: number;
  gateWidthFt: number;
  // chain link
  lineSpacingFt: number; // max 10
  rollFt: number; // fabric roll length, usually 50
  railStickFt: number; // top rail stick, usually 21 (swaged, ~20.5 ft usable)
  // panel
  panelWidthFt: number; // 6 or 8
  railsPerPanel: number; // brackets per panel side / rails per section (wood)
  // wood privacy / picket (stick-built)
  postSpacingFt?: number; // max 8
  picketWidthIn?: number;
  picketGapIn?: number;
  woodPost?: "4x4" | "6x6";
  pricePerRailBoard?: number;
  pricePerPicket?: number;
  pricePerBag?: number;
  // optional prices (0 = skip)
  pricePerRoll: number;
  pricePerTerminal: number;
  pricePerLinePost: number;
  pricePerRail: number;
  pricePerPanel: number;
  pricePerPost: number;
  pricePerGate: number;
};

export type Item = { name: string; qty: number; unit?: string; price?: number };

export type FenceEstimateResult = {
  kind: FenceKind;
  totalFt: number;
  fencedFt: number;
  items: Item[];
  terminalPosts: number;
  linePosts: number;
  posts: number;
  cost: number | null;
  warnings: string[];
};

export function validateFenceEstimate(i: FenceEstimateInput): string | null {
  if (!i.sidesFt.length || i.sidesFt.some((x) => !(x > 0))) return "Enter each side's length in feet, separated by commas.";
  if (i.closed && i.sidesFt.length < 3) return "A closed fence needs at least 3 sides.";
  if (!(i.heightFt >= 3 && i.heightFt <= 12)) return "Enter a fence height between 3 and 12 ft.";
  if (!(i.gates >= 0) || !Number.isInteger(i.gates)) return "Number of gates must be a whole number.";
  if (i.gates > 0 && !(i.gateWidthFt > 0)) return "Enter the gate width.";
  const total = i.sidesFt.reduce((a, b) => a + b, 0);
  if (i.gates * i.gateWidthFt >= total) return "The gates are wider than the whole fence.";
  if (i.kind === "chainlink" && !(i.lineSpacingFt > 0 && i.lineSpacingFt <= 10)) return "Chain link line posts should be 10 ft apart or less.";
  if (i.kind === "panel" && !(i.panelWidthFt > 0)) return "Enter the panel width.";
  if (i.kind === "wood" && !((i.postSpacingFt ?? 0) >= 4 && (i.postSpacingFt ?? 0) <= 10)) return "Wood fence posts are usually 6–8 ft apart.";
  if (i.kind === "wood" && !((i.picketWidthIn ?? 0) > 0)) return "Enter the picket width.";
  return null;
}

export function calcFenceEstimate(i: FenceEstimateInput): FenceEstimateResult {
  const warnings: string[] = [];
  const totalFt = i.sidesFt.reduce((a, b) => a + b, 0);
  const fencedFt = totalFt - i.gates * i.gateWidthFt;
  const ends = i.closed ? 0 : 2;
  const corners = i.closed ? i.sidesFt.length : i.sidesFt.length - 1;
  const gatePosts = i.gates * 2;
  const items: Item[] = [];
  let terminalPosts = 0;
  let linePosts = 0;

  if (i.kind === "chainlink") {
    const layout = calcFenceSpacing({ sidesFt: i.sidesFt, closed: i.closed, maxSpacingFt: i.lineSpacingFt, gates: 0, gateWidthFt: 0, rails: 0, picketWidthIn: 0, picketGapIn: 0 });
    terminalPosts = ends + corners + gatePosts;
    // Each gate opening replaces roughly one line post's worth of fence.
    linePosts = Math.max(0, layout.linePosts - i.gates);
    const tensionBars = ends + corners * 2 + gatePosts; // fabric terminates at every end/gate post, both directions at corners
    const bandsPerBar = Math.max(2, Math.round(i.heightFt) - 1);
    const railEnds = ends + corners * 2 + gatePosts;
    const rolls = Math.ceil(fencedFt / i.rollFt - 1e-9);
    const rails = Math.ceil(fencedFt / (i.railStickFt - 0.5) - 1e-9);
    const ties = Math.ceil(linePosts * Math.ceil(i.heightFt) + fencedFt / 2);

    items.push({ name: `Chain link fabric, ${i.heightFt} ft × ${i.rollFt} ft rolls`, qty: rolls, price: i.pricePerRoll });
    items.push({ name: "Terminal posts (end, corner & gate)", qty: terminalPosts, price: i.pricePerTerminal });
    items.push({ name: "Line posts", qty: linePosts, price: i.pricePerLinePost });
    items.push({ name: `Top rail, ${i.railStickFt} ft sticks`, qty: rails, price: i.pricePerRail });
    items.push({ name: "Tension bars", qty: tensionBars });
    items.push({ name: "Tension bands", qty: tensionBars * bandsPerBar });
    items.push({ name: "Brace bands", qty: railEnds });
    items.push({ name: "Rail end cups", qty: railEnds });
    items.push({ name: "Carriage bolts & nuts", qty: tensionBars * bandsPerBar + railEnds });
    items.push({ name: "Terminal post caps (dome)", qty: terminalPosts });
    items.push({ name: "Line post loop caps", qty: linePosts });
    items.push({ name: "Fence ties (aluminum)", qty: ties });
    if (i.gates) items.push({ name: `Gates, ${i.gateWidthFt} ft (with hinges & latch)`, qty: i.gates, price: i.pricePerGate });
    if (i.heightFt > 6) warnings.push("Chain link over 6 ft usually needs a bottom tension wire and heavier terminal posts.");
  } else if (i.kind === "wood") {
    const sp = i.postSpacingFt ?? 8;
    const pw = i.picketWidthIn ?? 5.5;
    const pg = i.picketGapIn ?? 0;
    const layout = calcFenceSpacing({ sidesFt: i.sidesFt, closed: i.closed, maxSpacingFt: sp, gates: i.gates, gateWidthFt: i.gateWidthFt, rails: i.railsPerPanel, picketWidthIn: pw, picketGapIn: pg });
    linePosts = layout.linePosts;
    terminalPosts = layout.cornerEndPosts + layout.gatePosts;
    const posts = layout.totalPosts;
    const depth = calcFenceDepth({ heightFt: i.heightFt, postType: i.woodPost ?? "4x4", frostDepthIn: 0, count: posts, gravelIn: 6, windy: pg === 0 && i.heightFt >= 6, wastePct: 10, bagSize: 50 });
    const railBoards = Math.max(0, layout.railBoards8 - i.gates * i.railsPerPanel);
    items.push({ name: `${i.woodPost ?? "4x4"} posts, ${depth.buyLengthFt ?? "special"} ft (set ${depth.embedIn} in. deep)`, qty: posts, price: i.pricePerPost });
    items.push({ name: `2×4 rails, 8 ft (${i.railsPerPanel} per section)`, qty: railBoards, price: i.pricePerRailBoard });
    items.push({ name: `Pickets, ${pw} in. × ${i.heightFt} ft${pg ? ` (${pg} in. gap)` : " (privacy)"}`, qty: layout.pickets, price: i.pricePerPicket });
    items.push({ name: "Exterior screws or ring-shank nails for pickets", qty: layout.pickets * i.railsPerPanel * 2 });
    items.push({ name: "Rail brackets or structural screws", qty: railBoards * 2 });
    items.push({ name: "50 lb fast-setting concrete", qty: depth.chosenBags, price: i.pricePerBag });
    items.push({ name: "Gravel for post holes (0.5 cu ft bags)", qty: depth.gravelBags });
    items.push({ name: "Post caps", qty: posts });
    if (i.gates) items.push({ name: `Gates, ${i.gateWidthFt} ft (with hinges & latch)`, qty: i.gates, price: i.pricePerGate });
    if (sp > 8) warnings.push("Wood rails sag over spans longer than 8 ft. Keep posts at 8 ft or less.");
    if ((i.woodPost ?? "4x4") === "4x4" && i.heightFt >= 6 && pg === 0) warnings.push("Tall solid privacy fences catch a lot of wind; 6×6 or 4×6 posts at gates and corners hold up better.");
  } else {
    const layout = calcFenceSpacing({ sidesFt: i.sidesFt, closed: i.closed, maxSpacingFt: i.panelWidthFt, gates: i.gates, gateWidthFt: i.gateWidthFt, rails: 0, picketWidthIn: 0, picketGapIn: 0 });
    linePosts = layout.linePosts;
    terminalPosts = layout.cornerEndPosts + layout.gatePosts;
    const panels = Math.max(0, layout.sections - i.gates);
    items.push({ name: `Fence panels, ${i.panelWidthFt} ft × ${i.heightFt} ft`, qty: panels, price: i.pricePerPanel });
    items.push({ name: "Posts", qty: layout.totalPosts, price: i.pricePerPost });
    items.push({ name: "Panel brackets", qty: panels * i.railsPerPanel * 2 });
    items.push({ name: "Post caps", qty: layout.totalPosts });
    if (i.gates) items.push({ name: `Gates, ${i.gateWidthFt} ft (with hinges & latch)`, qty: i.gates, price: i.pricePerGate });
    if (layout.sides.some((s) => Math.abs(s.spacingFt - i.panelWidthFt) > 0.01))
      warnings.push(`Some sides aren't an exact multiple of ${i.panelWidthFt} ft, so the last panel on those sides will need to be cut down. Count includes full panels to cut from.`);
  }

  const priced = items.filter((x) => (x.price ?? 0) > 0);
  const cost = priced.length ? priced.reduce((a, x) => a + x.qty * (x.price ?? 0), 0) : null;
  if (i.kind !== "wood") warnings.push("Set posts with the fence post depth calculator for hole size and bags of concrete.");
  if (i.heightFt > 6) warnings.push("Fences over 6 ft often need a permit. Check local height limits and HOA rules.");

  return { kind: i.kind, totalFt, fencedFt, items, terminalPosts, linePosts, posts: terminalPosts + linePosts, cost, warnings };
}
