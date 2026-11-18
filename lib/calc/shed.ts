import { bagTable, boxCuFt, cuFtToYd, readyMixOrderYd, supplyAdvice, withWaste, type BagSize } from "./concrete.ts";

export type ShedFoundation = "gravel" | "slab" | "blocks";

/** Crushed stone (e.g. 3/4 in clean or crusher run) weighs roughly 1.4 tons per cubic yard. */
export const GRAVEL_TONS_PER_YD = 1.4;
export const GRAVEL_BAG_CU_FT = 0.5;
export const MESH_SHEET_SQFT = 50; // 5 × 10 ft welded wire sheet

export type ShedInput = {
  widthFt: number;
  lengthFt: number;
  type: ShedFoundation;
  // gravel pad
  overhangIn: number; // pad extends past the shed on every side
  gravelDepthIn: number;
  // slab
  slabIn: number;
  baseIn: number; // gravel base under slab
  // blocks
  maxBlockSpacingFt: number;
  maxSkidSpacingFt: number;
  wastePct: number;
  bagSize: BagSize;
};

export type ShedResult = {
  type: ShedFoundation;
  shedSqFt: number;
  padWidthFt: number;
  padLengthFt: number;
  padSqFt: number;
  gravelCuFt: number;
  gravelYd: number;
  gravelTons: number;
  gravelBags: number;
  fabricSqFt: number;
  timberLf: number; // perimeter frame for gravel pad
  // slab
  concreteCuFt: number;
  concreteYd: number;
  readyMixYd: number;
  bags: ReturnType<typeof bagTable>;
  chosenBags: number;
  meshSheets: number;
  formLf: number;
  // blocks
  skids: number;
  blocksPerSkid: number;
  blocks: number;
  skidLf: number;
  advice: string;
  warnings: string[];
};

export function validateShed(i: ShedInput): string | null {
  if (!(i.widthFt > 0) || !(i.lengthFt > 0)) return "Enter the shed width and length.";
  if (i.type === "gravel" && !(i.gravelDepthIn > 0)) return "Enter the gravel depth.";
  if (i.type === "slab" && !(i.slabIn > 0)) return "Enter the slab thickness.";
  if (i.type === "blocks" && (!(i.maxBlockSpacingFt > 0) || !(i.maxSkidSpacingFt > 0))) return "Enter block and skid spacing.";
  return null;
}

export function calcShed(i: ShedInput): ShedResult {
  const warnings: string[] = [];
  const shedSqFt = i.widthFt * i.lengthFt;

  let padWidthFt = i.widthFt;
  let padLengthFt = i.lengthFt;
  let gravelCuFt = 0;
  let concreteCuFt = 0;
  let formLf = 0;
  let timberLf = 0;
  let meshSheets = 0;
  let skids = 0;
  let blocksPerSkid = 0;
  let blocks = 0;
  let skidLf = 0;

  if (i.type === "gravel") {
    padWidthFt = i.widthFt + (2 * i.overhangIn) / 12;
    padLengthFt = i.lengthFt + (2 * i.overhangIn) / 12;
    gravelCuFt = withWaste(boxCuFt(padWidthFt * 12, padLengthFt * 12, i.gravelDepthIn), i.wastePct);
    timberLf = 2 * (padWidthFt + padLengthFt);
    if (i.gravelDepthIn < 4) warnings.push("A gravel shed pad is usually at least 4 in. deep, compacted in 2 in. layers.");
  } else if (i.type === "slab") {
    concreteCuFt = withWaste(boxCuFt(i.widthFt * 12, i.lengthFt * 12, i.slabIn), i.wastePct);
    gravelCuFt = withWaste(boxCuFt(i.widthFt * 12, i.lengthFt * 12, i.baseIn), i.wastePct);
    meshSheets = Math.ceil((shedSqFt * 1.1) / MESH_SHEET_SQFT - 1e-9); // ~10% overlap
    formLf = 2 * (i.widthFt + i.lengthFt);
    if (i.slabIn < 4) warnings.push("Shed slabs are normally at least 4 in. thick; 5–6 in. if you'll park a mower or ATV inside.");
  } else {
    // Skids (pressure-treated 4×4 or 4×6) run the length of the shed, on concrete blocks.
    skids = Math.max(2, Math.ceil(i.widthFt / i.maxSkidSpacingFt - 1e-9) + 1);
    blocksPerSkid = Math.max(2, Math.ceil(i.lengthFt / i.maxBlockSpacingFt - 1e-9) + 1);
    blocks = skids * blocksPerSkid;
    skidLf = skids * i.lengthFt;
    // 4 in. of compacted gravel under each block, on a 16 × 16 in. pad.
    gravelCuFt = withWaste(boxCuFt(16, 16, 4) * blocks, i.wastePct);
    if (shedSqFt > 200) warnings.push("Large sheds on blocks can settle unevenly; many builders switch to a slab or frost-depth piers above ~200 sq ft.");
  }

  if (shedSqFt > 200) warnings.push("Under the IRC, one-story accessory buildings over 200 sq ft generally need a building permit. Many towns set lower limits (often 100–120 sq ft).");
  else warnings.push("Many towns require a permit or setbacks even for small sheds. Check with your zoning office before you build.");

  const bags = bagTable(concreteCuFt);
  return {
    type: i.type,
    shedSqFt,
    padWidthFt,
    padLengthFt,
    padSqFt: padWidthFt * padLengthFt,
    gravelCuFt,
    gravelYd: cuFtToYd(gravelCuFt),
    gravelTons: cuFtToYd(gravelCuFt) * GRAVEL_TONS_PER_YD,
    gravelBags: gravelCuFt > 0 ? Math.ceil(gravelCuFt / GRAVEL_BAG_CU_FT - 1e-9) : 0,
    fabricSqFt: i.type === "blocks" ? 0 : Math.ceil(padWidthFt * padLengthFt),
    timberLf,
    concreteCuFt,
    concreteYd: cuFtToYd(concreteCuFt),
    readyMixYd: readyMixOrderYd(concreteCuFt),
    bags,
    chosenBags: bags.find((b) => b.size === i.bagSize)!.bags,
    meshSheets,
    formLf,
    skids,
    blocksPerSkid,
    blocks,
    skidLf,
    advice: i.type === "slab" ? supplyAdvice(concreteCuFt) : "",
    warnings,
  };
}
