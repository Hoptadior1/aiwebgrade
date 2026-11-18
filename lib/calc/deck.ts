import {
  bagTable,
  boxCuFt,
  cuFtToYd,
  cylinderCuFt,
  nextTubeDiameter,
  readyMixOrderYd,
  supplyAdvice,
  tubePurchase,
  withWaste,
  type BagSize,
} from "./concrete.ts";

export type DeckAttach = "ledger" | "freestanding";
export type DeckFootingType = "pier" | "pad";

export type DeckInput = {
  widthFt: number; // along the house / beam length
  projectionFt: number; // out from the house
  attach: DeckAttach;
  cantileverFt: number; // joist overhang past the beam
  maxPostSpacingFt: number;
  liveLoadPsf: number;
  deadLoadPsf: number;
  soilPsf: number;
  frostDepthIn: number; // bottom of footing below grade
  aboveGradeIn: number;
  footingType: DeckFootingType;
  padThicknessIn: number;
  pierDiameterIn: number; // column on top of pad
  wastePct: number;
  bagSize: BagSize;
};

export type DeckResult = {
  beams: number;
  postsPerBeam: number;
  totalPosts: number;
  actualSpacingFt: number;
  tributaryWidthFt: number;
  interiorTribAreaSqFt: number;
  interiorLoadLb: number;
  requiredAreaSqFt: number;
  // sizing
  pierDiameterIn: number | null; // when footingType = pier
  padSizeIn: number | null; // square pad side when footingType = pad
  perFootingCuFt: number;
  totalCuFt: number;
  totalCuFtWithWaste: number;
  yd: number;
  readyMixYd: number;
  bags: ReturnType<typeof bagTable>;
  chosenBags: number;
  tubes: ReturnType<typeof tubePurchase> | null;
  tubeDiameterIn: number;
  tubeLengthIn: number;
  advice: string;
  warnings: string[];
};

export function validateDeck(i: DeckInput): string | null {
  if (!(i.widthFt > 0) || !(i.projectionFt > 0)) return "Enter the deck width and projection.";
  if (!(i.maxPostSpacingFt >= 2)) return "Post spacing should be at least 2 ft.";
  if (!(i.cantileverFt >= 0)) return "Cantilever can't be negative.";
  if (i.cantileverFt >= i.projectionFt) return "Cantilever must be smaller than the deck projection.";
  if (!(i.soilPsf > 0)) return "Enter a soil bearing capacity.";
  if (!(i.frostDepthIn > 0)) return "Enter the footing depth (frost depth for your area).";
  if (i.footingType === "pad" && !(i.padThicknessIn > 0)) return "Enter the pad thickness.";
  if (i.footingType === "pad" && i.padThicknessIn >= i.frostDepthIn) return "Pad thickness must be less than the footing depth.";
  return null;
}

/**
 * Footing size = load on the worst (interior) post ÷ allowable soil bearing.
 * This is the same load-path approach behind the IRC deck footing tables; your local code and inspector govern.
 */
export function calcDeck(i: DeckInput): DeckResult {
  const warnings: string[] = [];
  const beams = i.attach === "ledger" ? 1 : 2;

  // Width of deck each beam carries.
  let tributaryWidthFt: number;
  if (i.attach === "ledger") {
    const joistSpan = i.projectionFt - i.cantileverFt; // ledger to beam
    tributaryWidthFt = joistSpan / 2 + i.cantileverFt;
  } else {
    // Freestanding: two beams sharing the deck, cantilever on the outer side.
    const span = i.projectionFt - i.cantileverFt;
    tributaryWidthFt = span / 2 + i.cantileverFt; // outer beam governs
  }

  const postsPerBeam = Math.max(2, Math.ceil(i.widthFt / i.maxPostSpacingFt - 1e-9) + 1);
  const actualSpacingFt = i.widthFt / (postsPerBeam - 1);
  const totalPosts = postsPerBeam * beams;

  const interiorTribAreaSqFt = actualSpacingFt * tributaryWidthFt; // end posts carry about half this
  const totalPsf = i.liveLoadPsf + i.deadLoadPsf;
  const interiorLoadLb = interiorTribAreaSqFt * totalPsf;
  const requiredAreaSqFt = interiorLoadLb / i.soilPsf;

  let pierDiameterIn: number | null = null;
  let padSizeIn: number | null = null;
  let perFootingCuFt: number;
  let tubeDiameterIn: number;
  let tubeLengthIn: number;

  if (i.footingType === "pier") {
    const minDia = Math.sqrt((4 * requiredAreaSqFt) / Math.PI) * 12;
    const d = nextTubeDiameter(Math.max(minDia, 8));
    if (d === null) {
      warnings.push("Load is too high for a single round pier. Use a pad footing, closer posts, or an engineered design.");
      pierDiameterIn = Math.ceil(minDia);
    } else pierDiameterIn = d;
    tubeDiameterIn = pierDiameterIn;
    tubeLengthIn = i.frostDepthIn + i.aboveGradeIn;
    perFootingCuFt = cylinderCuFt(pierDiameterIn, tubeLengthIn);
  } else {
    const minSide = Math.sqrt(requiredAreaSqFt) * 12;
    padSizeIn = Math.max(12, Math.ceil(minSide / 2 - 1e-9) * 2); // round up to even inch, 12 in. minimum
    tubeDiameterIn = i.pierDiameterIn;
    tubeLengthIn = i.frostDepthIn - i.padThicknessIn + i.aboveGradeIn;
    perFootingCuFt = boxCuFt(padSizeIn, padSizeIn, i.padThicknessIn) + cylinderCuFt(i.pierDiameterIn, tubeLengthIn);
    if (i.padThicknessIn < 6) warnings.push("IRC minimum footing thickness is 6 in.");
    if ((padSizeIn - i.pierDiameterIn) / 2 > i.padThicknessIn)
      warnings.push("The pad projects past the pier more than its thickness. Thicken the pad or add rebar per your plans.");
  }

  const totalCuFt = perFootingCuFt * totalPosts;
  const totalCuFtWithWaste = withWaste(totalCuFt, i.wastePct);
  const bags = bagTable(totalCuFtWithWaste);

  if (i.frostDepthIn < 12) warnings.push("Footings generally must be at least 12 in. below grade, and below the local frost line.");
  if (i.liveLoadPsf < 40) warnings.push("The IRC design live load for residential decks is 40 psf. Use more where snow load is higher.");
  if (i.maxPostSpacingFt > 10) warnings.push("Post spacing over ~10 ft usually requires a large built-up or engineered beam.");
  if (i.cantileverFt > (i.projectionFt - i.cantileverFt) / 4)
    warnings.push("IRC limits joist cantilever to about 1/4 of the joist span.");

  return {
    beams,
    postsPerBeam,
    totalPosts,
    actualSpacingFt,
    tributaryWidthFt,
    interiorTribAreaSqFt,
    interiorLoadLb,
    requiredAreaSqFt,
    pierDiameterIn,
    padSizeIn,
    perFootingCuFt,
    totalCuFt,
    totalCuFtWithWaste,
    yd: cuFtToYd(totalCuFtWithWaste),
    readyMixYd: readyMixOrderYd(totalCuFtWithWaste),
    bags,
    chosenBags: bags.find((b) => b.size === i.bagSize)!.bags,
    tubes: tubeLengthIn > 0 ? tubePurchase(tubeLengthIn, totalPosts) : null,
    tubeDiameterIn,
    tubeLengthIn,
    advice: supplyAdvice(totalCuFtWithWaste),
    warnings,
  };
}
