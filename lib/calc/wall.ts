import { bagTable, boxCuFt, cuFtToYd, readyMixOrderYd, withWaste, type BagSize } from "./concrete.ts";

export type WallType = "poured" | "block";

/** NCMA TEK 4-2A: grout for 8 in. hollow CMU, cu ft per 100 sq ft of wall, 3% waste included. */
export const GROUT_8IN_PER_100SF: Record<string, number> = {
  solid: 36.1,
  "16": 18.1,
  "24": 12.1,
  "32": 9.1,
  "48": 6.1,
  none: 0,
};
export const BLOCKS_PER_SQFT = 1.125; // 8×16 face with 3/8 in. joints
export const BLOCKS_PER_MORTAR_BAG = 13; // 80 lb Type S, per manufacturer guidance
export const GROUT_BAG_CU_FT = 0.6; // 80 lb bag

export type WallInput = {
  type: WallType;
  lengthFt: number;
  heightFt: number;
  openingsSqFt: number;
  // poured
  thicknessIn: number;
  vertSpacingIn: number;
  horizSpacingIn: number;
  // block
  groutSpacing: keyof typeof GROUT_8IN_PER_100SF;
  blockWastePct: number;
  // common
  wastePct: number;
  bagSize: BagSize;
};

export type WallResult = {
  type: WallType;
  netSqFt: number;
  // poured
  concreteCuFt: number;
  concreteYd: number;
  readyMixYd: number;
  bags: ReturnType<typeof bagTable>;
  chosenBags: number;
  rebarLf: number;
  rebarSticks: number;
  formSqFt: number;
  // block
  blocks: number;
  courses: number;
  blocksPerCourse: number;
  mortarBags: number;
  groutCuFt: number;
  groutYd: number;
  groutBags: number;
  warnings: string[];
};

export function validateWall(i: WallInput): string | null {
  if (!(i.lengthFt > 0) || !(i.heightFt > 0)) return "Enter the wall length and height.";
  if (!(i.openingsSqFt >= 0)) return "Openings can't be negative.";
  if (i.openingsSqFt >= i.lengthFt * i.heightFt) return "Openings are larger than the wall.";
  if (i.type === "poured" && !(i.thicknessIn > 0)) return "Enter the wall thickness.";
  return null;
}

export function calcWall(i: WallInput): WallResult {
  const warnings: string[] = [];
  const netSqFt = i.lengthFt * i.heightFt - i.openingsSqFt;
  const r: WallResult = {
    type: i.type, netSqFt, concreteCuFt: 0, concreteYd: 0, readyMixYd: 0, bags: bagTable(0), chosenBags: 0, rebarLf: 0, rebarSticks: 0, formSqFt: 0,
    blocks: 0, courses: 0, blocksPerCourse: 0, mortarBags: 0, groutCuFt: 0, groutYd: 0, groutBags: 0, warnings,
  };

  if (i.type === "poured") {
    r.concreteCuFt = withWaste((netSqFt * 144 * i.thicknessIn) / 1728, i.wastePct);
    r.concreteYd = cuFtToYd(r.concreteCuFt);
    r.readyMixYd = readyMixOrderYd(r.concreteCuFt);
    r.bags = bagTable(r.concreteCuFt);
    r.chosenBags = r.bags.find((b) => b.size === i.bagSize)!.bags;
    const vert = i.vertSpacingIn > 0 ? (Math.floor((i.lengthFt * 12) / i.vertSpacingIn) + 1) * i.heightFt : 0;
    const horiz = i.horizSpacingIn > 0 ? (Math.floor((i.heightFt * 12) / i.horizSpacingIn) + 1) * i.lengthFt : 0;
    r.rebarLf = (vert + horiz) * 1.1;
    r.rebarSticks = r.rebarLf > 0 ? Math.ceil(r.rebarLf / 20 - 1e-9) : 0;
    r.formSqFt = 2 * i.lengthFt * i.heightFt;
    if (i.thicknessIn < 8) warnings.push("Poured foundation walls are usually at least 8 in. thick (IRC Table R404.1).");
    if (i.heightFt > 4) warnings.push("Formwork for walls over 4 ft carries a lot of pressure. Use engineered forms or rent wall forms.");
  } else {
    r.courses = Math.ceil((i.heightFt * 12) / 8 - 1e-9);
    r.blocksPerCourse = Math.ceil((i.lengthFt * 12) / 16 - 1e-9);
    r.blocks = Math.ceil(netSqFt * BLOCKS_PER_SQFT * (1 + i.blockWastePct / 100) - 1e-9);
    r.mortarBags = Math.ceil(r.blocks / BLOCKS_PER_MORTAR_BAG - 1e-9);
    r.groutCuFt = (netSqFt / 100) * GROUT_8IN_PER_100SF[i.groutSpacing];
    r.groutYd = cuFtToYd(r.groutCuFt);
    r.groutBags = r.groutCuFt > 0 ? Math.ceil(r.groutCuFt / GROUT_BAG_CU_FT - 1e-9) : 0;
    r.readyMixYd = r.groutCuFt > 0 ? readyMixOrderYd(r.groutCuFt) : 0;
    if (i.groutSpacing === "none") warnings.push("Ungrouted, unreinforced block walls should be short garden or screen walls only. Retaining and foundation walls need rebar and grout.");
    if (i.heightFt > 4) warnings.push("Block walls over 4 ft, or any wall holding back soil, usually need an engineered design and a permit.");
  }
  return r;
}
