import { boxCuFt, cuFtToYd, withWaste } from "./concrete.ts";
import { GRAVEL_TONS_PER_YD } from "./shed.ts";

export type FrenchDrainInput = {
  lengthFt: number;
  widthIn: number;
  depthIn: number; // at the high (start) end
  pipeDiaIn: number; // 0 = no pipe (gravel-only drain)
  slopePct: number;
  wrapFabric: boolean;
  pipeType: "rigid" | "corrugated";
  wastePct: number;
  gravelPerTon: number; // 0 = skip cost
};

export type FrenchDrainResult = {
  dropIn: number;
  endDepthIn: number;
  avgDepthIn: number;
  trenchCuFt: number;
  spoilYd: number; // loose soil to deal with (≈25% swell)
  gravelCuFt: number;
  gravelYd: number;
  gravelTons: number;
  gravelBags: number;
  fabricWidthFt: number;
  fabricSqFt: number;
  pipeLf: number;
  pipePieces: number;
  couplers: number;
  gravelCost: number | null;
  warnings: string[];
};

export function validateFrenchDrain(i: FrenchDrainInput): string | null {
  if (!(i.lengthFt > 0)) return "Enter the trench length.";
  if (!(i.widthIn > 0) || !(i.depthIn > 0)) return "Enter the trench width and depth.";
  if (!(i.slopePct >= 0)) return "Slope can't be negative.";
  if (i.pipeDiaIn > 0 && i.pipeDiaIn + 4 > i.depthIn) return "The trench must be at least 4 in. deeper than the pipe is wide.";
  if (i.pipeDiaIn > 0 && i.pipeDiaIn + 2 > i.widthIn) return "The trench must be wider than the pipe.";
  return null;
}

export function calcFrenchDrain(i: FrenchDrainInput): FrenchDrainResult {
  const warnings: string[] = [];
  const dropIn = i.lengthFt * 12 * (i.slopePct / 100);
  const endDepthIn = i.depthIn + dropIn;
  const avgDepthIn = (i.depthIn + endDepthIn) / 2;

  const trenchCuFt = boxCuFt(i.lengthFt * 12, i.widthIn, avgDepthIn);
  const pipeCuFt = i.pipeDiaIn > 0 ? (Math.PI * (i.pipeDiaIn / 2) ** 2 * i.lengthFt * 12) / 1728 : 0;
  // Gravel fills the trench to ~3 in. below grade (topsoil/sod or decorative stone goes on top).
  const gravelDepthIn = Math.max(0, avgDepthIn - 3);
  const gravelCuFt = withWaste(boxCuFt(i.lengthFt * 12, i.widthIn, gravelDepthIn) - pipeCuFt, i.wastePct);
  const gravelYd = cuFtToYd(gravelCuFt);
  const gravelTons = gravelYd * GRAVEL_TONS_PER_YD;

  // Fabric lines the trench (bottom + both sides) and folds over the top with a 12 in. overlap.
  const fabricWidthFt = i.wrapFabric ? (2 * gravelDepthIn + 2 * i.widthIn + 12) / 12 : 0;
  const fabricSqFt = i.wrapFabric ? fabricWidthFt * i.lengthFt * 1.05 : 0;

  const pieceLen = i.pipeType === "rigid" ? 10 : 100;
  const pipeLf = i.pipeDiaIn > 0 ? i.lengthFt * 1.05 : 0;
  const pipePieces = pipeLf > 0 ? Math.ceil(pipeLf / pieceLen - 1e-9) : 0;

  if (i.slopePct < 1) warnings.push("Use at least 1% slope (1/8 in. per foot) so water keeps moving. 1–2% is typical.");
  if (i.depthIn < 12) warnings.push("Most yard French drains are 18–24 in. deep; shallower trenches catch less ground water.");
  warnings.push("Call 811 before you dig. Utility lines are often buried 18–24 in. deep, right where a French drain goes.");
  warnings.push("Make sure the outlet is downhill: a dry well, a daylight point, or the street where your city allows it. Don't send water onto a neighbor's lot.");

  return {
    dropIn,
    endDepthIn,
    avgDepthIn,
    trenchCuFt,
    spoilYd: cuFtToYd(trenchCuFt) * 1.25,
    gravelCuFt,
    gravelYd,
    gravelTons,
    gravelBags: Math.ceil(gravelCuFt / 0.5 - 1e-9),
    fabricWidthFt,
    fabricSqFt,
    pipeLf,
    pipePieces,
    couplers: i.pipeType === "rigid" ? Math.max(0, pipePieces - 1) : Math.max(0, pipePieces - 1),
    gravelCost: i.gravelPerTon > 0 ? gravelTons * i.gravelPerTon : null,
    warnings,
  };
}
