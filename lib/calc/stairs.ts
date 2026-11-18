import { bagTable, cuFtToYd, readyMixOrderYd, supplyAdvice, withWaste, type BagSize } from "./concrete.ts";

/** IRC R311.7.5: max riser 7-3/4 in., min tread 10 in. Exterior door landing ≥ 36 in. deep (R311.3.1). */
export const IRC_MAX_RISER = 7.75;
export const IRC_MIN_TREAD = 10;
export const IRC_MIN_LANDING = 36;

export type StairsInput = {
  totalRiseIn: number;
  widthFt: number;
  maxRiserIn: number;
  treadIn: number;
  landingIn: number; // 0 = no top landing (top step is the last tread)
  wastePct: number;
  bagSize: BagSize;
};

export type StairsResult = {
  risers: number;
  riserIn: number;
  treads: number;
  totalRunIn: number;
  profileSqFt: number; // side profile area
  concreteCuFt: number;
  yd: number;
  readyMixYd: number;
  bags: ReturnType<typeof bagTable>;
  chosenBags: number;
  sideFormSqFt: number;
  riserFormLf: number;
  comfort: number; // 2R + T
  checks: { label: string; ok: boolean }[];
  advice: string;
  warnings: string[];
};

export function validateStairs(i: StairsInput): string | null {
  if (!(i.totalRiseIn > 0)) return "Enter the total rise: ground to the top surface.";
  if (i.totalRiseIn > 150) return "That's a full story or more. Concrete stairs that tall need an engineered design.";
  if (!(i.widthFt > 0)) return "Enter the stair width.";
  if (!(i.maxRiserIn >= 4)) return "Max riser should be at least 4 in.";
  if (!(i.treadIn > 0)) return "Enter the tread depth.";
  if (!(i.landingIn >= 0)) return "Landing depth can't be negative.";
  return null;
}

/**
 * Solid stairs poured to grade. Risers = total rise ÷ max riser, rounded up; every riser is equal.
 * With a top landing, there is one fewer tread than risers (the landing is the top step).
 * Volume = width × [Σ tread × (k × riser) for each tread + landing × total rise].
 */
export function calcStairs(i: StairsInput): StairsResult {
  const risers = Math.max(1, Math.ceil(i.totalRiseIn / i.maxRiserIn - 1e-9));
  const riserIn = i.totalRiseIn / risers;
  const treads = i.landingIn > 0 ? risers - 1 : risers;
  const totalRunIn = treads * i.treadIn + i.landingIn;

  // Side profile: stacked columns, one per tread (heights riser, 2·riser, …) plus the landing at full height.
  let profileSqIn = 0;
  for (let k = 1; k <= treads; k++) profileSqIn += i.treadIn * k * riserIn;
  if (i.landingIn > 0) profileSqIn += i.landingIn * i.totalRiseIn;
  const profileSqFt = profileSqIn / 144;

  const concreteCuFt = withWaste(profileSqFt * i.widthFt, i.wastePct);
  const bags = bagTable(concreteCuFt);
  const comfort = 2 * riserIn + i.treadIn;

  const checks = [
    { label: `Riser ${riserIn.toFixed(2)} in. ≤ 7-3/4 in. max (IRC)`, ok: riserIn <= IRC_MAX_RISER + 1e-9 },
    { label: `Tread ${i.treadIn} in. ≥ 10 in. min (IRC)`, ok: i.treadIn >= IRC_MIN_TREAD },
    { label: `Width ${(i.widthFt * 12).toFixed(0)} in. ≥ 36 in. min (IRC)`, ok: i.widthFt * 12 >= 36 },
    ...(i.landingIn > 0 ? [{ label: `Top landing ${i.landingIn} in. ≥ 36 in. at a door (IRC)`, ok: i.landingIn >= IRC_MIN_LANDING }] : []),
    { label: `Comfort: 2 × riser + tread = ${comfort.toFixed(1)} in. (about 24–26 in. feels natural)`, ok: comfort >= 24 && comfort <= 26 },
  ];

  const warnings: string[] = [];
  if (risers >= 4) warnings.push("4 or more risers: the IRC requires a handrail on at least one side (34–38 in. high).");
  if (i.totalRiseIn > 30) warnings.push("Over 30 in. above grade, open sides need a guard at least 36 in. high.");
  warnings.push("Pour stairs on a compacted gravel base, and tie them to the foundation or slab with rebar dowels where code requires. Large stairs often need a footing below frost depth.");

  return {
    risers, riserIn, treads, totalRunIn, profileSqFt, concreteCuFt, yd: cuFtToYd(concreteCuFt), readyMixYd: readyMixOrderYd(concreteCuFt), bags,
    chosenBags: bags.find((b) => b.size === i.bagSize)!.bags, sideFormSqFt: 2 * profileSqFt, riserFormLf: risers * i.widthFt, comfort, checks,
    advice: supplyAdvice(concreteCuFt), warnings,
  };
}
