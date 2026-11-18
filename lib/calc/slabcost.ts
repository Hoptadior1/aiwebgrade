import { bagsNeeded, boxCuFt, cuFtToYd, readyMixOrderYd, withWaste } from "./concrete.ts";
import { GRAVEL_TONS_PER_YD, MESH_SHEET_SQFT } from "./shed.ts";

/**
 * Default prices: 2026 US national ballparks. Every one is editable in the UI.
 * - Ready-mix ~$160/yd delivered (published 2026 ranges ~$125–$200), short-load fee ~$100 under ~5 yd
 * - Labor to form, place & finish ~$4/sq ft (published ranges ~$3–$8)
 * - Crushed stone base ~$40/ton delivered (common crushed stone ~$30–$55)
 * - #4 rebar ~$13 per 20 ft stick (home-center shelf price)
 */
export const SLAB_DEFAULTS = {
  readyMixPerYd: 160,
  shortLoadFee: 100,
  shortLoadUnderYd: 5,
  bagPrice80: 6.5,
  laborPerSqFt: 4,
  gravelPerTon: 40,
  meshSheetPrice: 12,
  rebarStickPrice: 13,
  stampedPerSqFt: 12,
};

export type Reinforcement = "none" | "mesh" | "rebar";
export type Finish = "broom" | "stamped";
export type Supply = "readymix" | "bags";

export type SlabCostInput = {
  lengthFt: number;
  widthFt: number;
  thicknessIn: number;
  baseIn: number;
  reinforcement: Reinforcement;
  rebarSpacingIn: number;
  finish: Finish;
  supply: Supply;
  diy: boolean;
  wastePct: number;
  readyMixPerYd: number;
  shortLoadFee: number;
  shortLoadUnderYd: number;
  bagPrice80: number;
  laborPerSqFt: number;
  gravelPerTon: number;
  meshSheetPrice: number;
  rebarStickPrice: number;
  stampedPerSqFt: number;
  extras: number; // permit, excavation, pump, etc.
};

export type CostLine = { label: string; amount: number; detail: string };

export type SlabCostResult = {
  sqFt: number;
  concreteCuFt: number;
  concreteYd: number;
  orderYd: number;
  bags80: number;
  gravelTons: number;
  meshSheets: number;
  rebarSticks: number;
  lines: CostLine[];
  total: number;
  perSqFt: number;
  warnings: string[];
};

export function validateSlabCost(i: SlabCostInput): string | null {
  if (!(i.lengthFt > 0) || !(i.widthFt > 0)) return "Enter the slab length and width.";
  if (!(i.thicknessIn > 0)) return "Enter the slab thickness.";
  if (i.reinforcement === "rebar" && !(i.rebarSpacingIn >= 6)) return "Rebar spacing should be at least 6 in.";
  const prices = [i.readyMixPerYd, i.shortLoadFee, i.bagPrice80, i.laborPerSqFt, i.gravelPerTon, i.meshSheetPrice, i.rebarStickPrice, i.stampedPerSqFt, i.extras];
  if (prices.some((p) => !(p >= 0))) return "Prices can't be negative or blank (use 0 to skip).";
  return null;
}

export function calcSlabCost(i: SlabCostInput): SlabCostResult {
  const warnings: string[] = [];
  const sqFt = i.lengthFt * i.widthFt;
  const concreteCuFt = withWaste(boxCuFt(i.lengthFt * 12, i.widthFt * 12, i.thicknessIn), i.wastePct);
  const concreteYd = cuFtToYd(concreteCuFt);
  const orderYd = readyMixOrderYd(concreteCuFt);
  const bags80 = bagsNeeded(concreteCuFt, 80);

  const gravelTons = cuFtToYd(boxCuFt(i.lengthFt * 12, i.widthFt * 12, i.baseIn)) * GRAVEL_TONS_PER_YD * 1.1; // +10% compaction
  const meshSheets = i.reinforcement === "mesh" ? Math.ceil((sqFt * 1.1) / MESH_SHEET_SQFT - 1e-9) : 0;
  let rebarSticks = 0;
  if (i.reinforcement === "rebar") {
    const s = i.rebarSpacingIn / 12;
    const cover = 0.25; // 3 in. from edges
    const barsAlongL = Math.floor((i.widthFt - 2 * cover) / s) + 1;
    const barsAlongW = Math.floor((i.lengthFt - 2 * cover) / s) + 1;
    const lf = (barsAlongL * (i.lengthFt - 2 * cover) + barsAlongW * (i.widthFt - 2 * cover)) * 1.1; // laps
    rebarSticks = Math.ceil(lf / 20 - 1e-9);
  }

  const lines: CostLine[] = [];
  if (i.supply === "readymix") {
    lines.push({ label: "Ready-mix concrete", amount: orderYd * i.readyMixPerYd, detail: `${orderYd} yd × $${i.readyMixPerYd}` });
    if (orderYd < i.shortLoadUnderYd && i.shortLoadFee > 0)
      lines.push({ label: "Short-load fee", amount: i.shortLoadFee, detail: `order under ${i.shortLoadUnderYd} yd` });
  } else {
    lines.push({ label: "Bagged concrete (80 lb)", amount: bags80 * i.bagPrice80, detail: `${bags80} bags × $${i.bagPrice80}` });
  }
  if (i.baseIn > 0) lines.push({ label: "Gravel base", amount: gravelTons * i.gravelPerTon, detail: `${gravelTons.toFixed(1)} tons × $${i.gravelPerTon}` });
  if (meshSheets) lines.push({ label: "Welded wire mesh", amount: meshSheets * i.meshSheetPrice, detail: `${meshSheets} sheets × $${i.meshSheetPrice}` });
  if (rebarSticks) lines.push({ label: "#4 rebar", amount: rebarSticks * i.rebarStickPrice, detail: `${rebarSticks} × 20 ft @ ${i.rebarSpacingIn} in. grid` });
  if (!i.diy && i.laborPerSqFt > 0) lines.push({ label: "Labor: form, pour & finish", amount: sqFt * i.laborPerSqFt, detail: `${sqFt.toFixed(0)} sq ft × $${i.laborPerSqFt}` });
  if (i.finish === "stamped") lines.push({ label: "Stamped finish", amount: sqFt * i.stampedPerSqFt, detail: `${sqFt.toFixed(0)} sq ft × $${i.stampedPerSqFt}` });
  if (i.extras > 0) lines.push({ label: "Permit, excavation & extras", amount: i.extras, detail: "your entry" });

  const total = lines.reduce((a, l) => a + l.amount, 0);

  if (i.supply === "bags" && concreteYd > 1.5) warnings.push(`That's ${bags80} bags to mix by hand. Ready-mix is usually cheaper and far faster above ~1.5 yd.`);
  if (i.supply === "readymix" && concreteYd < 0.75) warnings.push("Many ready-mix plants won't deliver this little. Bags or a mix-on-site truck may be your only options.");
  if (i.thicknessIn < 4) warnings.push("Slabs thinner than 4 in. crack easily; 4 in. is the usual minimum for patios and walks.");
  if (i.thicknessIn < 5 && i.reinforcement === "none") warnings.push("Add wire mesh, rebar or fiber mix to control cracking, especially for driveways.");

  return { sqFt, concreteCuFt, concreteYd, orderYd, bags80, gravelTons, meshSheets, rebarSticks, lines, total, perSqFt: total / sqFt, warnings };
}
