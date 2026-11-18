export type FenceSpacingInput = {
  sidesFt: number[]; // length of each straight side, ft (one entry = a single straight run)
  closed: boolean; // fence closes on itself (last side meets the first)
  maxSpacingFt: number;
  gates: number;
  gateWidthFt: number;
  rails: number; // horizontal rails per section (wood); 0 = none
  picketWidthIn: number; // 0 = no pickets
  picketGapIn: number;
};

export type SideLayout = { lengthFt: number; sections: number; spacingFt: number; positionsFt: number[] };

export type FenceSpacingResult = {
  totalFt: number;
  fencedFt: number; // minus gate openings
  sides: SideLayout[];
  sections: number;
  linePosts: number;
  cornerEndPosts: number;
  gatePosts: number;
  totalPosts: number;
  rails: number;
  railBoards8: number; // 8 ft rail boards
  pickets: number;
  warnings: string[];
};

export function parseSides(s: string): number[] {
  return s
    .split(/[,;\s]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map(Number);
}

export function validateFenceSpacing(i: FenceSpacingInput): string | null {
  if (!i.sidesFt.length || i.sidesFt.some((x) => !(x > 0))) return "Enter each side's length in feet, separated by commas (e.g. 100, 50, 100).";
  if (i.closed && i.sidesFt.length < 3) return "A closed fence needs at least 3 sides.";
  if (!(i.maxSpacingFt >= 2)) return "Post spacing should be at least 2 ft.";
  if (!(i.gates >= 0) || !Number.isInteger(i.gates)) return "Number of gates must be a whole number.";
  if (i.gates > 0 && !(i.gateWidthFt > 0)) return "Enter the gate width.";
  const total = i.sidesFt.reduce((a, b) => a + b, 0);
  if (i.gates * i.gateWidthFt >= total) return "The gates are wider than the whole fence.";
  if (!(i.picketWidthIn >= 0) || !(i.picketGapIn >= 0)) return "Picket width and gap can't be negative.";
  return null;
}

/**
 * Posts are spaced evenly on each side (never more than maxSpacing). Corners and ends get a post.
 * Each gate adds one extra post (the opening needs a post on both sides; one is usually an existing line post moved).
 */
export function calcFenceSpacing(i: FenceSpacingInput): FenceSpacingResult {
  const warnings: string[] = [];
  const sides: SideLayout[] = i.sidesFt.map((L) => {
    const sections = Math.max(1, Math.ceil(L / i.maxSpacingFt - 1e-9));
    const spacingFt = L / sections;
    return { lengthFt: L, sections, spacingFt, positionsFt: Array.from({ length: sections + 1 }, (_, k) => k * spacingFt) };
  });

  const sections = sides.reduce((a, s) => a + s.sections, 0);
  const linePosts = sides.reduce((a, s) => a + (s.sections - 1), 0);
  const cornerEndPosts = i.closed ? sides.length : sides.length + 1;
  const gatePosts = i.gates;
  const totalPosts = linePosts + cornerEndPosts + gatePosts;

  const totalFt = i.sidesFt.reduce((a, b) => a + b, 0);
  const fencedFt = totalFt - i.gates * i.gateWidthFt;

  const rails = i.rails > 0 ? sections * i.rails : 0;
  // Rails span post-to-post; an 8 ft board covers one section up to 8 ft, longer sections need 10/12/16 ft stock.
  const railBoards8 = i.rails > 0 ? sides.reduce((a, s) => a + s.sections * Math.ceil(s.spacingFt / 8 - 1e-9), 0) * i.rails : 0;

  const pickets = i.picketWidthIn > 0 ? Math.ceil((fencedFt * 12) / (i.picketWidthIn + i.picketGapIn) - 1e-9) : 0;

  if (i.maxSpacingFt > 8 && i.rails > 0) warnings.push("Wood fence rails usually span 8 ft max; wider spacing tends to sag.");
  if (i.maxSpacingFt > 10) warnings.push("Chain link line posts are usually 10 ft apart at most.");
  if (i.gates > 0) warnings.push("Gate posts carry the most load. Use a heavier post (e.g. 6×6 or a terminal post) and set them deeper.");

  return { totalFt, fencedFt, sides, sections, linePosts, cornerEndPosts, gatePosts, totalPosts, rails, railBoards8, pickets, warnings };
}
