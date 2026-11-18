import { test } from "node:test";
import assert from "node:assert/strict";
import { calcFenceDepth } from "../lib/calc/fencedepth.ts";
import { calcFenceSpacing, parseSides } from "../lib/calc/fencespacing.ts";
import { calcShed } from "../lib/calc/shed.ts";

const close = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const fd = { heightFt: 6, postType: "4x4" as const, frostDepthIn: 0, count: 10, gravelIn: 6, windy: false, wastePct: 10, bagSize: 50 as const };

test("fence depth: 6 ft fence, 4x4 -> 36 in embed, 11 in hole, 10 ft post", () => {
  const r = calcFenceDepth(fd);
  assert.equal(r.embedIn, 36);
  assert.equal(r.governing, "rule");
  assert.equal(r.holeDiaIn, 11);
  assert.equal(r.holeDepthIn, 42);
  close(r.postLengthFt, 9);
  assert.equal(r.buyLengthFt, 10);
  close(r.concretePerPostCuFt, 1.7247, 0.001);
  assert.equal(r.chosenBags, 51);
});
test("fence depth: frost line governs", () => {
  const r = calcFenceDepth({ ...fd, frostDepthIn: 42 });
  assert.equal(r.embedIn, 42);
  assert.equal(r.governing, "frost");
});
test("fence depth: short fence hits 24 in minimum", () => {
  const r = calcFenceDepth({ ...fd, heightFt: 3 });
  assert.equal(r.embedIn, 24);
  assert.equal(r.governing, "minimum");
});
test("fence spacing: 3 open sides, 1 gate, pickets", () => {
  const r = calcFenceSpacing({ sidesFt: parseSides("100, 50, 100"), closed: false, maxSpacingFt: 8, gates: 1, gateWidthFt: 4, rails: 2, picketWidthIn: 5.5, picketGapIn: 0 });
  assert.equal(r.sections, 33);
  assert.equal(r.linePosts, 30);
  assert.equal(r.cornerEndPosts, 4);
  assert.equal(r.totalPosts, 35);
  close(r.sides[0].spacingFt, 7.692);
  assert.equal(r.pickets, 537);
  assert.equal(r.rails, 66);
  assert.equal(r.railBoards8, 66);
});
test("fence spacing: closed square, posts = sections", () => {
  const r = calcFenceSpacing({ sidesFt: [50, 50, 50, 50], closed: true, maxSpacingFt: 8, gates: 0, gateWidthFt: 0, rails: 0, picketWidthIn: 0, picketGapIn: 0 });
  assert.equal(r.totalPosts, 28);
  assert.equal(r.sections, 28);
});
const sh = { widthFt: 8, lengthFt: 10, overhangIn: 12, gravelDepthIn: 4, slabIn: 4, baseIn: 4, maxBlockSpacingFt: 4, maxSkidSpacingFt: 4, wastePct: 0, bagSize: 80 as const };
test("shed gravel pad 8x10 + 12 in overhang, 4 in deep", () => {
  const r = calcShed({ ...sh, type: "gravel" });
  close(r.padSqFt, 120);
  close(r.gravelCuFt, 40);
  close(r.gravelTons, 2.07);
  assert.equal(r.gravelBags, 80);
  close(r.timberLf, 44);
});
test("shed slab 10x12 4 in", () => {
  const r = calcShed({ ...sh, widthFt: 10, lengthFt: 12, type: "slab" });
  close(r.concreteCuFt, 40);
  assert.equal(r.readyMixYd, 1.5);
  assert.equal(r.meshSheets, 3);
});
test("shed blocks 8x10", () => {
  const r = calcShed({ ...sh, type: "blocks" });
  assert.equal(r.skids, 3);
  assert.equal(r.blocksPerSkid, 4);
  assert.equal(r.blocks, 12);
});
