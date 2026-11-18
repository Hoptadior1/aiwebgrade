import {
  bagTable,
  cuFtToYd,
  cylinderCuFt,
  readyMixOrderYd,
  supplyAdvice,
  tubePurchase,
  withWaste,
  type BagSize,
  BAG_YIELD_CU_FT,
} from "./concrete.ts";

export type SonotubeInput = {
  diameterIn: number;
  depthIn: number; // below grade
  aboveGradeIn: number; // tube sticking out of the ground
  count: number;
  wastePct: number;
  bagSize: BagSize;
  pricePerBag: number; // 0 = skip cost
};

export type SonotubeResult = {
  pieceLengthIn: number;
  perTubeCuFt: number;
  totalCuFt: number;
  totalCuFtWithWaste: number;
  totalYd: number;
  readyMixYd: number;
  bagsPerTube: number;
  bags: ReturnType<typeof bagTable>;
  chosenBags: number;
  cost: number | null;
  tubes: ReturnType<typeof tubePurchase>;
  advice: string;
  warnings: string[];
};

export function validateSonotube(i: SonotubeInput): string | null {
  if (!(i.diameterIn > 0)) return "Enter a tube diameter.";
  if (!(i.depthIn > 0)) return "Enter how deep the hole is.";
  if (!(i.aboveGradeIn >= 0)) return "Height above ground can't be negative.";
  if (!(i.count >= 1) || !Number.isInteger(i.count)) return "Number of tubes must be a whole number of at least 1.";
  if (i.diameterIn > 60) return "That diameter is larger than standard form tubes.";
  return null;
}

export function calcSonotube(i: SonotubeInput): SonotubeResult {
  const pieceLengthIn = i.depthIn + i.aboveGradeIn;
  const perTubeCuFt = cylinderCuFt(i.diameterIn, pieceLengthIn);
  const totalCuFt = perTubeCuFt * i.count;
  const totalCuFtWithWaste = withWaste(totalCuFt, i.wastePct);
  const bags = bagTable(totalCuFtWithWaste);
  const chosenBags = bags.find((b) => b.size === i.bagSize)!.bags;

  const warnings: string[] = [];
  if (i.depthIn < 12) warnings.push("Most US codes require footings at least 12 in. below undisturbed soil, and below the local frost line.");
  if (i.diameterIn < 8) warnings.push("6 in. tubes are generally too small for structural deck or porch piers. Check your plans.");
  if (pieceLengthIn > 144) warnings.push("Each pier is longer than a 12 ft tube. You'll need special-order lengths.");

  return {
    pieceLengthIn,
    perTubeCuFt,
    totalCuFt,
    totalCuFtWithWaste,
    totalYd: cuFtToYd(totalCuFtWithWaste),
    readyMixYd: readyMixOrderYd(totalCuFtWithWaste),
    bagsPerTube: withWaste(perTubeCuFt, i.wastePct) / BAG_YIELD_CU_FT[i.bagSize],
    bags,
    chosenBags,
    cost: i.pricePerBag > 0 ? chosenBags * i.pricePerBag : null,
    tubes: tubePurchase(pieceLengthIn, i.count),
    advice: supplyAdvice(totalCuFtWithWaste),
    warnings,
  };
}
