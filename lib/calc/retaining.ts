import { cuFtToYd } from "./concrete.ts";
import { GRAVEL_TONS_PER_YD } from "./shed.ts";

/** Common segmental retaining wall (SRW) block sizes sold at US home centers: height × face length × depth, inches. */
export const SRW_BLOCKS = {
  small: { label: "Small garden wall block, 4 × 12 × 7 in (≈2 ft walls)", h: 4, l: 12, d: 7 },
  medium: { label: "Standard wall block, 6 × 16 × 10 in", h: 6, l: 16, d: 10 },
  large: { label: "Large wall block, 8 × 18 × 12 in", h: 8, l: 18, d: 12 },
} as const;
export type BlockKey = keyof typeof SRW_BLOCKS | "custom";

export type RetainingInput = {
  lengthFt: number;
  exposedHeightFt: number;
  block: BlockKey;
  customH: number;
  customL: number;
  customD: number;
  caps: boolean;
  baseIn: number; // compacted gravel leveling pad
  drainZoneIn: number; // clean gravel behind the wall
  drainPipe: boolean;
  wastePct: number;
  surcharge: boolean; // driveway, slope, structure above the wall
};

export type RetainingResult = {
  blockH: number;
  blockL: number;
  blockD: number;
  buriedIn: number;
  buriedCourses: number;
  exposedCourses: number;
  courses: number;
  totalHeightIn: number;
  blocksPerCourse: number;
  blocks: number;
  capBlocks: number;
  trenchWidthIn: number;
  trenchDepthIn: number;
  baseCuFt: number;
  drainCuFt: number;
  gravelCuFt: number;
  gravelYd: number;
  gravelTons: number;
  fabricSqFt: number;
  pipeFt: number;
  needsEngineer: boolean;
  warnings: string[];
};

export function validateRetaining(i: RetainingInput): string | null {
  if (!(i.lengthFt > 0)) return "Enter the wall length.";
  if (!(i.exposedHeightFt > 0)) return "Enter how tall the wall will be above ground.";
  if (i.block === "custom" && (!(i.customH > 0) || !(i.customL > 0) || !(i.customD > 0))) return "Enter your block's height, face length and depth.";
  if (!(i.baseIn >= 0) || !(i.drainZoneIn >= 0)) return "Gravel depths can't be negative.";
  return null;
}

/**
 * Typical SRW manufacturer guidance: bury about 1 in. per 8 in. of wall height (at least ~6 in., and at least one
 * course), build on a 6 in. compacted gravel pad that extends 6 in. in front of and behind the block, and backfill
 * the first 12 in. behind the wall with clean drainage gravel.
 */
export function calcRetaining(i: RetainingInput): RetainingResult {
  const b = i.block === "custom" ? { h: i.customH, l: i.customL, d: i.customD } : SRW_BLOCKS[i.block];
  const exposedIn = i.exposedHeightFt * 12;
  const buriedMin = Math.max(6, exposedIn / 8);
  const buriedCourses = Math.max(1, Math.ceil(buriedMin / b.h - 1e-9));
  const buriedIn = buriedCourses * b.h;
  const capH = i.caps ? Math.min(4, b.h) : 0;
  const exposedCourses = Math.max(1, Math.ceil((exposedIn - capH) / b.h - 1e-9));
  const courses = buriedCourses + exposedCourses;
  const totalHeightIn = courses * b.h + capH;

  const blocksPerCourse = Math.ceil((i.lengthFt * 12) / b.l - 1e-9);
  const blocks = Math.ceil(blocksPerCourse * courses * (1 + i.wastePct / 100) - 1e-9);
  const capBlocks = i.caps ? Math.ceil(((i.lengthFt * 12) / b.l) * 1.05 - 1e-9) : 0;

  const trenchWidthIn = b.d + 12;
  const trenchDepthIn = buriedIn + i.baseIn;
  const baseCuFt = (i.lengthFt * 12 * trenchWidthIn * i.baseIn) / 1728;
  const drainCuFt = (i.lengthFt * 12 * i.drainZoneIn * (courses * b.h)) / 1728;
  const gravelCuFt = (baseCuFt + drainCuFt) * (1 + i.wastePct / 100);
  const gravelYd = cuFtToYd(gravelCuFt);

  const warnings: string[] = [];
  const totalFt = totalHeightIn / 12; // bottom of the buried course to the top of the wall
  const needsEngineer = totalFt > 4 || i.surcharge;
  if (totalFt > 4)
    warnings.push(`Your wall is about ${totalFt.toFixed(1)} ft from the bottom of the buried course to the top. Under the IRC, retaining walls over 4 ft (measured from the bottom of the footing to the top) need a permit, and most need an engineered design with geogrid reinforcement.`);
  if (i.surcharge) warnings.push("Walls holding up a driveway, a slope, a fence or a building carry extra load (surcharge). Get an engineered design regardless of height.");
  if (!needsEngineer && i.exposedHeightFt > 3) warnings.push("Many block makers require geogrid layers behind walls over about 3 ft. Check your block's installation guide.");
  if (!i.drainPipe && i.exposedHeightFt >= 2) warnings.push("Add a 4 in. perforated drain pipe at the base behind the wall. Trapped water is the #1 reason retaining walls fail.");
  warnings.push("Call 811 before digging, and check setback rules if the wall is near a property line.");

  return {
    blockH: b.h, blockL: b.l, blockD: b.d, buriedIn, buriedCourses, exposedCourses, courses, totalHeightIn, blocksPerCourse, blocks, capBlocks,
    trenchWidthIn, trenchDepthIn, baseCuFt, drainCuFt, gravelCuFt, gravelYd, gravelTons: gravelYd * GRAVEL_TONS_PER_YD,
    fabricSqFt: Math.ceil(i.lengthFt * ((courses * b.h) / 12 + 2)), pipeFt: i.drainPipe ? Math.ceil(i.lengthFt * 1.05) : 0,
    needsEngineer, warnings,
  };
}
