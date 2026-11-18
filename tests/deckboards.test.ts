import { test } from "node:test";
import assert from "node:assert/strict";
import { calcDeckBoards } from "../lib/calc/deckboards.ts";

const base = { lengthFt: 16, widthFt: 12, boardWidthIn: 5.5, gapIn: 0.125, joistSpacingIn: 16, pattern: "straight" as const, stockFt: "auto" as const, wastePct: 10, fastener: "screws" as const, pricePerBoard: 0 };
test("16 x 12 deck, 5.5 in boards, 1/8 gap", () => {
  const r = calcDeckBoards(base);
  // 144 / 5.625 = 25.6 -> 26 rows; 16 ft run -> 16 ft stock, 1 per row
  assert.equal(r.rows, 26);
  assert.equal(r.chosen.lengthFt, 16);
  assert.equal(r.chosen.boards, 26);
  assert.equal(r.boards, 29); // 26 * 1.1 = 28.6
  assert.equal(r.joists, 13); // 192/16 + 1
  assert.equal(r.screws, Math.ceil(26 * 13 * 2 * 1.1));
});
test("odd length: 14 ft run picks least linear feet", () => {
  const r = calcDeckBoards({ ...base, lengthFt: 14 });
  // 8ft: 2/row=16ft, 10: 2/row=20, 12: 2/row=24, 16: 1/row=16, 20: 1/row=20 -> 16 ft tie, fewer boards = 16 ft stock
  assert.equal(r.chosen.lengthFt, 16);
  assert.equal(r.chosen.perRow, 1);
});
test("diagonal adds 15%", () => {
  const r = calcDeckBoards({ ...base, pattern: "diagonal", joistSpacingIn: 12 });
  assert.equal(r.boards, Math.ceil(26 * 1.25 - 1e-9));
});
