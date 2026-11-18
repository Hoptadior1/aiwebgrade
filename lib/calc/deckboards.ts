/** Standard decking widths (actual), inches. 5/4×6 wood and most composite boards are 5.5 in. wide. */
export const BOARD_WIDTHS = [
  { value: 5.5, label: "5.5 in. (5/4×6 or 2×6 wood, most composite)" },
  { value: 3.5, label: "3.5 in. (2×4 or narrow hardwood)" },
  { value: 7.25, label: "7.25 in. (2×8)" },
];
export const STOCK_LENGTHS_FT = [8, 10, 12, 16, 20];

export type DeckBoardInput = {
  lengthFt: number; // dimension the boards run along
  widthFt: number; // dimension across the boards
  boardWidthIn: number;
  gapIn: number;
  joistSpacingIn: number;
  pattern: "straight" | "diagonal";
  stockFt: number | "auto";
  wastePct: number;
  fastener: "screws" | "hidden";
  pricePerBoard: number; // 0 = skip
};

export type StockOption = { lengthFt: number; perRow: number; boards: number; linearFt: number };

export type DeckBoardResult = {
  sqFt: number;
  rows: number;
  joists: number;
  chosen: StockOption;
  options: StockOption[];
  boards: number; // with waste
  linearFt: number;
  screws: number;
  clips: number;
  cost: number | null;
  warnings: string[];
};

export function validateDeckBoards(i: DeckBoardInput): string | null {
  if (!(i.lengthFt > 0) || !(i.widthFt > 0)) return "Enter the deck dimensions.";
  if (!(i.boardWidthIn > 0)) return "Choose a board width.";
  if (!(i.gapIn >= 0) || i.gapIn > 0.5) return "Board gap should be between 0 and 1/2 in.";
  if (!(i.joistSpacingIn >= 8)) return "Enter the joist spacing (usually 12 or 16 in.).";
  return null;
}

/**
 * Rows of boards = width across the boards ÷ (board width + gap), rounded up.
 * Each row is covered with whole stock boards (butt joints land on joists). We compare every stock length and pick the
 * one that buys the fewest linear feet. Diagonal decking adds ~15% for angled cuts on top of normal waste.
 */
export function calcDeckBoards(i: DeckBoardInput): DeckBoardResult {
  const warnings: string[] = [];
  const pitch = i.boardWidthIn + i.gapIn;
  const diag = i.pattern === "diagonal";
  const rows = Math.ceil((i.widthFt * 12) / pitch - 1e-9);
  const options = STOCK_LENGTHS_FT.map((s) => {
    const perRow = Math.ceil(i.lengthFt / s - 1e-9);
    return { lengthFt: s, perRow, boards: perRow * rows, linearFt: perRow * rows * s };
  });
  const chosen =
    i.stockFt === "auto"
      ? options.reduce((best, o) => (o.linearFt < best.linearFt || (o.linearFt === best.linearFt && o.boards < best.boards) ? o : best))
      : options.find((o) => o.lengthFt === i.stockFt)!;
  const factor = 1 + i.wastePct / 100 + (diag ? 0.15 : 0);
  const boards = Math.ceil(chosen.boards * factor - 1e-9);
  const joists = Math.floor((i.lengthFt * 12) / i.joistSpacingIn) + 1;
  const crossings = rows * joists * (diag ? 1.15 : 1);

  if (i.boardWidthIn >= 5.5 && i.joistSpacingIn > 16) warnings.push("Most wood and composite decking is rated for joists at 16 in. on center or closer. Check the board manufacturer's span.");
  if (diag && i.joistSpacingIn > 12) warnings.push("Diagonal decking usually needs joists at 12 in. on center, since boards span farther at an angle.");
  if (chosen.perRow > 1) warnings.push("Rows need butt joints. Stagger them so no two neighboring rows join on the same joist, and add blocking or a doubled joist where boards meet.");
  warnings.push("This counts deck surface boards only. Size footings with the deck footing calculator and confirm joist and beam spans with IRC R507 tables.");

  return {
    sqFt: i.lengthFt * i.widthFt,
    rows,
    joists,
    chosen,
    options,
    boards,
    linearFt: boards * chosen.lengthFt,
    screws: Math.ceil(crossings * 2 * (1 + i.wastePct / 100)),
    clips: Math.ceil(crossings * (1 + i.wastePct / 100)),
    cost: i.pricePerBoard > 0 ? boards * i.pricePerBoard : null,
    warnings,
  };
}
