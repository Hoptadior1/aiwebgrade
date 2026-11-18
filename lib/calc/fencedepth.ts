import { bagTable, cylinderCuFt, cuFtToYd, withWaste, type BagSize } from "./concrete.ts";

/** Actual cross-section of common US fence posts. Square lumber uses actual (dressed) size. */
export const POST_TYPES = {
  "4x4": { label: "4×4 wood (3.5 × 3.5 in)", shape: "square", sizeIn: 3.5 },
  "4x6": { label: "4×6 wood (3.5 × 5.5 in)", shape: "rect", sizeIn: 3.5, size2In: 5.5 },
  "6x6": { label: "6×6 wood (5.5 × 5.5 in)", shape: "square", sizeIn: 5.5 },
  "steel-line": { label: "Steel line post, 1-7/8 in OD (chain link)", shape: "round", sizeIn: 1.875 },
  "steel-2-3-8": { label: "Steel post, 2-3/8 in OD (chain link line / terminal)", shape: "round", sizeIn: 2.375 },
  "steel-2-7-8": { label: "Steel terminal post, 2-7/8 in OD", shape: "round", sizeIn: 2.875 },
} as const;
export type PostType = keyof typeof POST_TYPES;

/** Common lengths posts are sold in at US home centers, ft. */
export const POST_LENGTHS_FT = [6, 8, 10, 12, 14, 16];

export type FenceDepthInput = {
  heightFt: number; // fence height above ground
  postType: PostType;
  frostDepthIn: number; // 0 = ignore frost line
  count: number;
  gravelIn: number; // drainage gravel under each post
  windy: boolean; // exposed site, privacy fence, or soft soil → deeper
  wastePct: number;
  bagSize: BagSize;
};

export type FenceDepthResult = {
  embedIn: number; // how deep the post is set
  holeDepthIn: number; // embed + gravel
  holeDiaIn: number;
  postLengthFt: number; // exact
  buyLengthFt: number | null; // next standard length
  ruleDepthIn: number;
  governing: "rule" | "minimum" | "frost";
  concretePerPostCuFt: number;
  totalCuFt: number;
  totalYd: number;
  bags: ReturnType<typeof bagTable>;
  chosenBags: number;
  bagsPerPost: number;
  gravelCuFt: number;
  gravelBags: number; // 0.5 cu ft bags
  warnings: string[];
};

export function validateFenceDepth(i: FenceDepthInput): string | null {
  if (!(i.heightFt > 0)) return "Enter the fence height above ground.";
  if (i.heightFt > 12) return "That's taller than a typical fence. Over 8 ft usually needs an engineered design.";
  if (!(i.count >= 1) || !Number.isInteger(i.count)) return "Number of posts must be a whole number of at least 1.";
  if (!(i.frostDepthIn >= 0)) return "Frost depth can't be negative.";
  if (!(i.gravelIn >= 0)) return "Gravel depth can't be negative.";
  return null;
}

function postAreaSqIn(t: PostType): number {
  const p = POST_TYPES[t];
  if (p.shape === "round") return Math.PI * (p.sizeIn / 2) ** 2;
  if (p.shape === "rect") return p.sizeIn * (p as { size2In: number }).size2In;
  return p.sizeIn * p.sizeIn;
}

function postWidthIn(t: PostType): number {
  const p = POST_TYPES[t];
  return p.shape === "rect" ? (p as { size2In: number }).size2In : p.sizeIn;
}

/**
 * Rules of thumb used by US fence builders and post manufacturers:
 * - Bury 1/3 of the post's total length (= half the above-ground height). Exposed/windy sites: closer to 1/2 of height + extra.
 * - Never less than 24 in.
 * - In frost areas, get the bottom below the frost line so the post doesn't heave.
 * - Hole diameter ≈ 3× the post width (wood); steel posts use ~4× their diameter, min 6 in.
 */
export function calcFenceDepth(i: FenceDepthInput): FenceDepthResult {
  const warnings: string[] = [];
  const heightIn = i.heightFt * 12;
  const ruleDepthIn = Math.ceil((heightIn / 2) * (i.windy ? 1.25 : 1));
  let embedIn = Math.max(ruleDepthIn, 24);
  let governing: FenceDepthResult["governing"] = ruleDepthIn >= 24 ? "rule" : "minimum";
  if (i.frostDepthIn > embedIn) {
    embedIn = i.frostDepthIn;
    governing = "frost";
  }
  embedIn = Math.ceil(embedIn);

  const isSteel = POST_TYPES[i.postType].shape === "round";
  const w = postWidthIn(i.postType);
  const holeDiaIn = Math.max(6, Math.ceil(w * (isSteel ? 4 : 3)));
  const holeDepthIn = embedIn + i.gravelIn;

  const postLengthFt = (heightIn + embedIn) / 12;
  const buyLengthFt = POST_LENGTHS_FT.find((l) => l >= postLengthFt - 1e-9) ?? null;

  // Concrete fills the hole around the post, from top of gravel to grade.
  const holeCuFt = cylinderCuFt(holeDiaIn, embedIn);
  const postCuFt = (postAreaSqIn(i.postType) * embedIn) / 1728;
  const concretePerPostCuFt = Math.max(0, holeCuFt - postCuFt);
  const totalCuFt = withWaste(concretePerPostCuFt * i.count, i.wastePct);
  const bags = bagTable(totalCuFt);
  const chosenBags = bags.find((b) => b.size === i.bagSize)!.bags;

  const gravelCuFt = cylinderCuFt(holeDiaIn, i.gravelIn) * i.count;

  if (buyLengthFt === null) warnings.push("Posts this long are special order. Consider a shorter fence or engineered posts.");
  if (i.heightFt > 6) warnings.push("Fences over 6 ft (7 ft in some areas) often need a permit and may need engineered posts.");
  if (i.frostDepthIn === 0) warnings.push("No frost depth entered. In cold climates, posts set above the frost line can heave out of the ground.");
  if (i.postType === "4x4" && i.heightFt >= 6 && i.windy) warnings.push("4×4 posts on a tall, exposed privacy fence often twist or snap. 6×6 or 4×6 posts are sturdier.");

  return {
    embedIn,
    holeDepthIn,
    holeDiaIn,
    postLengthFt,
    buyLengthFt,
    ruleDepthIn,
    governing,
    concretePerPostCuFt,
    totalCuFt,
    totalYd: cuFtToYd(totalCuFt),
    bags,
    chosenBags,
    bagsPerPost: chosenBags / i.count,
    gravelCuFt,
    gravelBags: Math.ceil(gravelCuFt / 0.5 - 1e-9),
    warnings,
  };
}
