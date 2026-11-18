import { cuFtToYd } from "./concrete.ts";
import { GRAVEL_TONS_PER_YD, GRAVEL_BAG_CU_FT } from "./shed.ts";

export type AreaShape = "rect" | "circle" | "triangle";

export const AREA_SHAPES: Record<AreaShape, { label: string; fields: { key: "a" | "b"; label: string }[] }> = {
  rect: { label: "Rectangle (driveway, path, pad)", fields: [{ key: "a", label: "Length" }, { key: "b", label: "Width" }] },
  circle: { label: "Circle (fire pit area, tree ring)", fields: [{ key: "a", label: "Diameter" }] },
  triangle: { label: "Triangle (corner bed)", fields: [{ key: "a", label: "Base" }, { key: "b", label: "Height" }] },
};

/** Recommended depths for common uses (inches). */
export const USES = [
  { label: "Gravel driveway", depth: "4–6 in. (8–12 in. on soft soil, in layers)" },
  { label: "Walkway or garden path", depth: "2–3 in." },
  { label: "Pea gravel patio", depth: "3 in." },
  { label: "Base under pavers or a shed", depth: "4–6 in. compacted" },
  { label: "Landscape / decorative beds", depth: "2–3 in." },
  { label: "French drain / drainage", depth: "fill the trench (see French drain calculator)" },
];

export type GravelArea = { id: number; shape: AreaShape; a: number; b: number; depthIn: number };

export type GravelInput = {
  areas: GravelArea[];
  compactionPct: number;
  tonsPerYd: number;
  pricePerTon: number;
  deliveryFee: number;
  bagPrice: number; // per 0.5 cu ft bag
  fabric: boolean;
};

export type GravelResult = {
  areas: { id: number; label: string; sqFt: number; cuFt: number }[];
  sqFt: number;
  cuFt: number;
  yd: number;
  tons: number;
  bags: number;
  bulkCost: number | null;
  bagCost: number | null;
  fabricSqFt: number;
  warnings: string[];
};

export function areaSqFt(x: GravelArea): number {
  if (x.shape === "rect") return x.a * x.b;
  if (x.shape === "circle") return Math.PI * (x.a / 2) ** 2;
  return 0.5 * x.a * x.b;
}

export function validateGravel(i: GravelInput): string | null {
  if (!i.areas.length) return "Add at least one area.";
  for (const [k, x] of i.areas.entries()) {
    const keys = AREA_SHAPES[x.shape].fields.map((f) => f.key);
    if (keys.some((key) => !(x[key] > 0))) return `Area ${k + 1}: fill in every dimension.`;
    if (!(x.depthIn > 0)) return `Area ${k + 1}: enter a depth.`;
  }
  if (!(i.tonsPerYd > 0)) return "Enter the gravel weight per cubic yard (1.4 is typical).";
  if ([i.compactionPct, i.pricePerTon, i.deliveryFee, i.bagPrice].some((x) => !(x >= 0))) return "Values can't be negative (use 0 to skip).";
  return null;
}

export function calcGravel(i: GravelInput): GravelResult {
  const areas = i.areas.map((x) => {
    const sqFt = areaSqFt(x);
    return { id: x.id, label: AREA_SHAPES[x.shape].label.split(" (")[0], sqFt, cuFt: (sqFt * x.depthIn) / 12 };
  });
  const sqFt = areas.reduce((a, x) => a + x.sqFt, 0);
  const cuFt = areas.reduce((a, x) => a + x.cuFt, 0) * (1 + i.compactionPct / 100);
  const yd = cuFtToYd(cuFt);
  const tons = yd * i.tonsPerYd;
  const bags = Math.ceil(cuFt / GRAVEL_BAG_CU_FT - 1e-9);
  const warnings: string[] = [];
  if (tons > 20) warnings.push("That's more than a typical tri-axle dump truck carries (about 15–20 tons), so plan for more than one delivery.");
  if (bags > 60) warnings.push(`${bags} bags is a lot of lifting. Bulk delivery by the ton is usually far cheaper above 1–2 tons.`);
  if (i.areas.some((x) => x.depthIn > 6)) warnings.push("Lay and compact gravel in layers of 2–4 in. Thick single layers settle unevenly.");
  return {
    areas,
    sqFt,
    cuFt,
    yd,
    tons,
    bags,
    bulkCost: i.pricePerTon > 0 ? tons * i.pricePerTon + i.deliveryFee : null,
    bagCost: i.bagPrice > 0 ? bags * i.bagPrice : null,
    fabricSqFt: i.fabric ? Math.ceil(sqFt * 1.1) : 0,
    warnings,
  };
}

export { GRAVEL_TONS_PER_YD, GRAVEL_BAG_CU_FT };
