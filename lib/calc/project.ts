import { bagTable, boxCuFt, cuFtToYd, cylinderCuFt, readyMixOrderYd, supplyAdvice, withWaste } from "./concrete.ts";

export type Shape = "slab" | "circle" | "wall" | "footing" | "column" | "tube";

export const SHAPES: Record<Shape, { label: string; fields: { key: string; label: string; unit: "ft" | "in" }[] }> = {
  slab: { label: "Slab / patio / driveway", fields: [{ key: "a", label: "Length", unit: "ft" }, { key: "b", label: "Width", unit: "ft" }, { key: "c", label: "Thickness", unit: "in" }] },
  circle: { label: "Round slab", fields: [{ key: "a", label: "Diameter", unit: "ft" }, { key: "c", label: "Thickness", unit: "in" }] },
  wall: { label: "Wall", fields: [{ key: "a", label: "Length", unit: "ft" }, { key: "b", label: "Height", unit: "ft" }, { key: "c", label: "Thickness", unit: "in" }] },
  footing: { label: "Footing (continuous)", fields: [{ key: "a", label: "Length", unit: "ft" }, { key: "b", label: "Width", unit: "in" }, { key: "c", label: "Depth", unit: "in" }] },
  column: { label: "Round column / post hole / Sonotube", fields: [{ key: "a", label: "Diameter", unit: "in" }, { key: "b", label: "Height / depth", unit: "in" }] },
  tube: { label: "Hollow tube / ring", fields: [{ key: "a", label: "Outer diameter", unit: "in" }, { key: "d", label: "Inner diameter", unit: "in" }, { key: "b", label: "Height", unit: "in" }] },
};

export type Item = { id: number; shape: Shape; qty: number; a: number; b: number; c: number; d: number };

export type ProjectInput = {
  items: Item[];
  wastePct: number;
  bagPrice80: number;
  bagPrice60: number;
  readyMixPerYd: number;
  shortLoadFee: number;
  shortLoadUnderYd: number;
};

export type ItemResult = { id: number; label: string; detail: string; cuFt: number };

export type ProjectResult = {
  items: ItemResult[];
  rawCuFt: number;
  cuFt: number;
  yd: number;
  readyMixYd: number;
  bags: ReturnType<typeof bagTable>;
  bags80Cost: number | null;
  bags60Cost: number | null;
  readyMixCost: number | null;
  cheapest: "bags80" | "bags60" | "readymix" | null;
  advice: string;
};

export function itemCuFt(i: Item): number {
  switch (i.shape) {
    case "slab":
      return boxCuFt(i.a * 12, i.b * 12, i.c);
    case "circle":
      return cylinderCuFt(i.a * 12, i.c);
    case "wall":
      return boxCuFt(i.a * 12, i.b * 12, i.c);
    case "footing":
      return boxCuFt(i.a * 12, i.b, i.c);
    case "column":
      return cylinderCuFt(i.a, i.b);
    case "tube":
      return Math.max(0, cylinderCuFt(i.a, i.b) - cylinderCuFt(i.d, i.b));
  }
}

export function describe(i: Item): string {
  const f = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/0+$/, ""));
  switch (i.shape) {
    case "slab":
      return `${f(i.a)} × ${f(i.b)} ft, ${f(i.c)} in thick`;
    case "circle":
      return `${f(i.a)} ft round, ${f(i.c)} in thick`;
    case "wall":
      return `${f(i.a)} ft × ${f(i.b)} ft high, ${f(i.c)} in thick`;
    case "footing":
      return `${f(i.a)} ft long, ${f(i.b)} × ${f(i.c)} in`;
    case "column":
      return `${f(i.a)} in Ø × ${f(i.b)} in`;
    case "tube":
      return `${f(i.a)} in OD / ${f(i.d)} in ID × ${f(i.b)} in`;
  }
}

export function validateProject(p: ProjectInput): string | null {
  if (!p.items.length) return "Add at least one item.";
  for (const [k, i] of p.items.entries()) {
    const fields = SHAPES[i.shape].fields.map((x) => x.key as "a" | "b" | "c" | "d");
    if (fields.some((key) => !(i[key] > 0))) return `Item ${k + 1}: fill in every dimension.`;
    if (!(i.qty >= 1) || !Number.isInteger(i.qty)) return `Item ${k + 1}: quantity must be a whole number of at least 1.`;
    if (i.shape === "tube" && i.d >= i.a) return `Item ${k + 1}: inner diameter must be smaller than outer diameter.`;
  }
  if ([p.bagPrice80, p.bagPrice60, p.readyMixPerYd, p.shortLoadFee].some((x) => !(x >= 0))) return "Prices can't be negative (use 0 to skip).";
  return null;
}

export function calcProject(p: ProjectInput): ProjectResult {
  const items = p.items.map((i) => ({
    id: i.id,
    label: SHAPES[i.shape].label,
    detail: `${i.qty > 1 ? `${i.qty} × ` : ""}${describe(i)}`,
    cuFt: itemCuFt(i) * i.qty,
  }));
  const rawCuFt = items.reduce((a, x) => a + x.cuFt, 0);
  const cuFt = withWaste(rawCuFt, p.wastePct);
  const bags = bagTable(cuFt);
  const readyMixYd = readyMixOrderYd(cuFt);
  const b80 = bags.find((b) => b.size === 80)!.bags;
  const b60 = bags.find((b) => b.size === 60)!.bags;
  const bags80Cost = p.bagPrice80 > 0 ? b80 * p.bagPrice80 : null;
  const bags60Cost = p.bagPrice60 > 0 ? b60 * p.bagPrice60 : null;
  const readyMixCost = p.readyMixPerYd > 0 ? readyMixYd * p.readyMixPerYd + (readyMixYd < p.shortLoadUnderYd ? p.shortLoadFee : 0) : null;
  const options = [
    ["bags80", bags80Cost],
    ["bags60", bags60Cost],
    ["readymix", readyMixCost],
  ].filter(([, c]) => c !== null) as [ProjectResult["cheapest"], number][];
  const cheapest = options.length ? options.reduce((a, b) => (b[1] < a[1] ? b : a))[0] : null;
  return { items, rawCuFt, cuFt, yd: cuFtToYd(cuFt), readyMixYd, bags, bags80Cost, bags60Cost, readyMixCost, cheapest, advice: supplyAdvice(cuFt) };
}
