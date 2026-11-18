import { test } from "node:test";
import assert from "node:assert/strict";
import { calcSlabCost, SLAB_DEFAULTS } from "../lib/calc/slabcost.ts";
import { calcFrenchDrain } from "../lib/calc/frenchdrain.ts";
import { calcWall } from "../lib/calc/wall.ts";
import { calcFenceEstimate } from "../lib/calc/fenceestimate.ts";
import { calcUnit, targetRoas } from "../lib/calc/ecommerce.ts";

const close = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const slab = { lengthFt: 20, widthFt: 20, thicknessIn: 4, baseIn: 4, reinforcement: "mesh" as const, rebarSpacingIn: 18, finish: "broom" as const, supply: "readymix" as const, diy: false, wastePct: 5, extras: 0, ...SLAB_DEFAULTS };

test("slab cost 20x20x4 mesh, pro", () => {
  const r = calcSlabCost(slab);
  close(r.concreteCuFt, 140);
  assert.equal(r.orderYd, 5.25);
  assert.equal(r.meshSheets, 9);
  close(r.gravelTons, 7.605, 0.01);
  close(r.total, 840 + 7.605 * 40 + 108 + 1600, 0.5);
  close(r.perSqFt, 7.13, 0.01);
  assert.ok(!r.lines.some((l) => l.label === "Short-load fee"));
});
test("slab cost: short-load fee under 5 yd, rebar grid", () => {
  const r = calcSlabCost({ ...slab, lengthFt: 10, widthFt: 10, reinforcement: "rebar" });
  assert.ok(r.lines.some((l) => l.label === "Short-load fee"));
  const big = calcSlabCost({ ...slab, reinforcement: "rebar" });
  assert.equal(big.rebarSticks, 31);
});
test("slab cost: DIY drops labor", () => {
  const r = calcSlabCost({ ...slab, diy: true });
  assert.ok(!r.lines.some((l) => l.label.startsWith("Labor")));
});
test("french drain 50 ft, 12x18, 4 in pipe, 1%", () => {
  const r = calcFrenchDrain({ lengthFt: 50, widthIn: 12, depthIn: 18, pipeDiaIn: 4, slopePct: 1, wrapFabric: true, pipeType: "rigid", wastePct: 10, gravelPerTon: 0 });
  close(r.dropIn, 6);
  close(r.endDepthIn, 24);
  close(r.trenchCuFt, 87.5);
  close(r.gravelCuFt, (75 - 4.3633) * 1.1, 0.01);
  close(r.fabricWidthFt, 6);
  close(r.fabricSqFt, 315);
  assert.equal(r.pipePieces, 6);
  assert.equal(r.couplers, 5);
});
test("block wall 40x4 solid grouted", () => {
  const r = calcWall({ type: "block", lengthFt: 40, heightFt: 4, openingsSqFt: 0, thicknessIn: 8, vertSpacingIn: 0, horizSpacingIn: 0, groutSpacing: "solid", blockWastePct: 5, wastePct: 0, bagSize: 80 });
  assert.equal(r.blocks, 189);
  assert.equal(r.mortarBags, 15);
  close(r.groutCuFt, 57.76);
  assert.equal(r.groutBags, 97);
});
test("poured wall 30x8x8 with #4 @ 12 each way", () => {
  const r = calcWall({ type: "poured", lengthFt: 30, heightFt: 8, openingsSqFt: 0, thicknessIn: 8, vertSpacingIn: 12, horizSpacingIn: 12, groutSpacing: "none", blockWastePct: 0, wastePct: 0, bagSize: 80 });
  close(r.concreteCuFt, 160);
  close(r.rebarLf, 569.8);
  assert.equal(r.rebarSticks, 29);
});
const fe = { sidesFt: [100, 50, 100], closed: false, heightFt: 4, gates: 1, gateWidthFt: 4, lineSpacingFt: 10, rollFt: 50, railStickFt: 21, panelWidthFt: 8, railsPerPanel: 2, pricePerRoll: 0, pricePerTerminal: 0, pricePerLinePost: 0, pricePerRail: 0, pricePerPanel: 0, pricePerPost: 0, pricePerGate: 0 };
test("chain link estimate", () => {
  const r = calcFenceEstimate({ ...fe, kind: "chainlink" });
  const q = (n: string) => r.items.find((x) => x.name.startsWith(n))!.qty;
  assert.equal(r.terminalPosts, 6);
  assert.equal(r.linePosts, 21);
  assert.equal(q("Chain link fabric"), 5);
  assert.equal(q("Top rail"), 12);
  assert.equal(q("Tension bars"), 8);
  assert.equal(q("Tension bands"), 24);
  assert.equal(q("Fence ties"), 207);
  assert.equal(r.cost, null);
});
test("panel estimate + cost", () => {
  const r = calcFenceEstimate({ ...fe, kind: "panel", heightFt: 6, pricePerPanel: 60, pricePerPost: 20 });
  const q = (n: string) => r.items.find((x) => x.name.startsWith(n))!.qty;
  assert.equal(q("Fence panels"), 32);
  assert.equal(q("Posts"), 35);
  assert.equal(q("Panel brackets"), 128);
  assert.equal(r.cost, 32 * 60 + 35 * 20);
});
test("unit economics + ROAS", () => {
  const r = calcUnit({ price: 40, cogs: 12, shipping: 6, packaging: 1, processingPct: 2.9, processingFixed: 0.3, platformPct: 0, returnPct: 5, adCostPerOrder: 10, otherPerOrder: 0 });
  close(r.processing, 1.46);
  close(r.contribution, 17.54);
  close(r.profit, 7.54);
  close(r.marginPct, 18.85);
  close(r.markupPct, 233.33);
  close(r.breakEvenRoas!, 2.2805, 0.001);
  close(r.roas!, 4);
  close(targetRoas(40, 17.54, 10)!, 2.954, 0.001);
  assert.equal(targetRoas(40, 17.54, 50), null);
});
test("wood privacy fence: posts, rails, pickets, concrete", () => {
  const r = calcFenceEstimate({ ...fe, kind: "wood", heightFt: 6, postSpacingFt: 8, railsPerPanel: 3, picketWidthIn: 5.5, picketGapIn: 0, woodPost: "4x4", pricePerPost: 15, pricePerRailBoard: 5, pricePerPicket: 3, pricePerBag: 6 });
  const q = (n: string) => r.items.find((x) => x.name.startsWith(n))!.qty;
  // same layout as spacing test: 35 posts, 33 sections, 537 pickets
  assert.equal(r.posts, 35);
  assert.equal(q("Pickets"), 537);
  assert.equal(q("2×4 rails"), 33 * 3 - 3); // minus gate section rails
  assert.equal(q("Exterior screws"), 537 * 3 * 2);
  // 6 ft, 4x4: 36 in embed -> ~1.72 cu ft each; windy (privacy 6 ft) -> 45 in embed
  assert.ok(q("50 lb fast-setting") > 35 * 4);
  assert.ok(r.cost! > 0);
});
