import {
  bagTable,
  boxCuFt,
  cuFtToYd,
  readyMixOrderYd,
  supplyAdvice,
  withWaste,
  type BagSize,
} from "./concrete.ts";

export type FootingMode = "strip" | "pad";

export type FootingInput = {
  mode: FootingMode;
  // strip (continuous) footing
  lengthFt: number;
  widthIn: number;
  depthIn: number;
  bars: number; // continuous horizontal bars
  // pad (spread) footing
  padLengthIn: number;
  padWidthIn: number;
  padDepthIn: number;
  padCount: number;
  padRebarSpacingIn: number; // 0 = no rebar grid
  // common
  wastePct: number;
  bagSize: BagSize;
  pricePerYd: number; // ready-mix $/yd, 0 = skip
  pricePerBag: number; // 0 = skip
};

export type FootingResult = {
  cuFt: number;
  cuFtWithWaste: number;
  yd: number;
  readyMixYd: number;
  bags: ReturnType<typeof bagTable>;
  chosenBags: number;
  bagCost: number | null;
  readyMixCost: number | null;
  rebarLf: number;
  rebarSticks20: number;
  formLf: number; // linear ft of form boards (both sides of a strip, perimeter of pads)
  advice: string;
  warnings: string[];
};

const LAP_FACTOR = 1.1; // ~10% extra for laps at splices and bends
const COVER_IN = 3; // rebar cover in footings cast against earth

export function validateFooting(i: FootingInput): string | null {
  if (i.mode === "strip") {
    if (!(i.lengthFt > 0)) return "Enter the total length of footing.";
    if (!(i.widthIn > 0)) return "Enter the footing width.";
    if (!(i.depthIn > 0)) return "Enter the footing depth (thickness).";
    if (!(i.bars >= 0)) return "Rebar count can't be negative.";
  } else {
    if (!(i.padLengthIn > 0) || !(i.padWidthIn > 0)) return "Enter the pad length and width.";
    if (!(i.padDepthIn > 0)) return "Enter the pad thickness.";
    if (!(i.padCount >= 1) || !Number.isInteger(i.padCount)) return "Number of pads must be a whole number of at least 1.";
  }
  return null;
}

export function calcFooting(i: FootingInput): FootingResult {
  const warnings: string[] = [];
  let cuFt = 0;
  let rebarLf = 0;
  let formLf = 0;

  if (i.mode === "strip") {
    cuFt = boxCuFt(i.lengthFt * 12, i.widthIn, i.depthIn);
    rebarLf = i.lengthFt * i.bars * LAP_FACTOR;
    formLf = i.lengthFt * 2;
    if (i.widthIn < 12) warnings.push("IRC minimum footing width is 12 in. for most one- and two-story homes.");
    if (i.depthIn < 6) warnings.push("IRC minimum footing thickness is 6 in.");
  } else {
    cuFt = boxCuFt(i.padLengthIn, i.padWidthIn, i.padDepthIn) * i.padCount;
    formLf = ((2 * (i.padLengthIn + i.padWidthIn)) / 12) * i.padCount;
    if (i.padRebarSpacingIn > 0) {
      const clearL = Math.max(0, i.padLengthIn - 2 * COVER_IN);
      const clearW = Math.max(0, i.padWidthIn - 2 * COVER_IN);
      const barsAlongL = Math.floor(clearW / i.padRebarSpacingIn) + 1; // bars running the long way
      const barsAlongW = Math.floor(clearL / i.padRebarSpacingIn) + 1;
      rebarLf = ((barsAlongL * clearL + barsAlongW * clearW) / 12) * i.padCount;
    }
    if (i.padDepthIn < 6) warnings.push("Pad footings are typically at least 6 in. thick; 8 to 12 in. is common for posts.");
  }

  const cuFtWithWaste = withWaste(cuFt, i.wastePct);
  const bags = bagTable(cuFtWithWaste);
  const chosenBags = bags.find((b) => b.size === i.bagSize)!.bags;
  const readyMixYd = readyMixOrderYd(cuFtWithWaste);

  return {
    cuFt,
    cuFtWithWaste,
    yd: cuFtToYd(cuFtWithWaste),
    readyMixYd,
    bags,
    chosenBags,
    bagCost: i.pricePerBag > 0 ? chosenBags * i.pricePerBag : null,
    readyMixCost: i.pricePerYd > 0 ? readyMixYd * i.pricePerYd : null,
    rebarLf,
    rebarSticks20: rebarLf > 0 ? Math.ceil(rebarLf / 20 - 1e-9) : 0,
    formLf,
    advice: supplyAdvice(cuFtWithWaste),
    warnings,
  };
}
