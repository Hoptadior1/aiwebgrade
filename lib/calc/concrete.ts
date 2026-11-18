// Shared concrete math. All inputs/outputs are US customary units.

export const CU_IN_PER_CU_FT = 1728;
export const CU_FT_PER_CU_YD = 27;

/** Yield per bag of standard premixed concrete, cubic feet (manufacturer-published figures). */
export const BAG_YIELD_CU_FT = {
  40: 0.3,
  50: 0.375,
  60: 0.45,
  80: 0.6,
} as const;

export type BagSize = keyof typeof BAG_YIELD_CU_FT;
export const BAG_SIZES: BagSize[] = [40, 50, 60, 80];

/** Typical bag weights per cubic foot for ready-mix ordering note (ready-mix is sold in 1/4 yd increments). */
export const READY_MIX_INCREMENT_YD = 0.25;

export function cylinderCuFt(diameterIn: number, heightIn: number): number {
  const r = diameterIn / 2;
  return (Math.PI * r * r * heightIn) / CU_IN_PER_CU_FT;
}

export function boxCuFt(lengthIn: number, widthIn: number, heightIn: number): number {
  return (lengthIn * widthIn * heightIn) / CU_IN_PER_CU_FT;
}

export function withWaste(cuFt: number, wastePct: number): number {
  return cuFt * (1 + Math.max(0, wastePct) / 100);
}

export function bagsNeeded(cuFt: number, size: BagSize): number {
  if (cuFt <= 0) return 0;
  // small epsilon so 3.0000000001 bags doesn't become 4
  return Math.ceil(cuFt / BAG_YIELD_CU_FT[size] - 1e-9);
}

export function bagTable(cuFt: number): { size: BagSize; bags: number; weightLb: number }[] {
  return BAG_SIZES.map((size) => {
    const bags = bagsNeeded(cuFt, size);
    return { size, bags, weightLb: bags * size };
  });
}

export function cuFtToYd(cuFt: number): number {
  return cuFt / CU_FT_PER_CU_YD;
}

/** Ready-mix trucks sell in quarter-yard steps. */
export function readyMixOrderYd(cuFt: number): number {
  const yd = cuFtToYd(cuFt);
  return Math.ceil(yd / READY_MIX_INCREMENT_YD - 1e-9) * READY_MIX_INCREMENT_YD;
}

/** Rule of thumb: under ~1 yd bags usually win; over ~1.5 yd call a truck. */
export function supplyAdvice(cuFt: number): string {
  const yd = cuFtToYd(cuFt);
  if (yd < 1) return "Bagged concrete is usually the practical choice at this volume.";
  if (yd < 1.5)
    return "You're in the gray zone. Bags work but mean a lot of mixing; compare a short-load ready-mix delivery or a towable mixer rental.";
  return "At this volume, ready-mix delivery is usually cheaper and faster than bags. Ask about short-load fees.";
}

export function round(n: number, d = 2): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

export function fmt(n: number, d = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });
}

export function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** Standard round form-tube (Sonotube-style) diameters sold at US home centers / supply yards. */
export const TUBE_DIAMETERS_IN = [6, 8, 10, 12, 14, 16, 18, 20, 24, 30, 36] as const;

export function nextTubeDiameter(minDiameterIn: number): number | null {
  for (const d of TUBE_DIAMETERS_IN) if (d >= minDiameterIn - 1e-9) return d;
  return null;
}

/**
 * How many tubes to buy. Tubes are commonly sold in 4 ft lengths at home centers and 12 ft at supply yards.
 * Pieces can't be spliced, so we count whole pieces cut from each stock length.
 */
export function tubePurchase(pieceLengthIn: number, pieces: number) {
  const fourFt = pieceLengthIn <= 48 ? pieces : null; // 4 ft tubes only work if each pier fits in one
  const perTwelve = Math.floor(144 / pieceLengthIn);
  const twelveFt = perTwelve >= 1 ? Math.ceil(pieces / perTwelve) : null;
  return { fourFt, twelveFt, linearFt: (pieceLengthIn * pieces) / 12 };
}
