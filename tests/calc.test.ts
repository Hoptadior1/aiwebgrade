import { test } from "node:test";
import assert from "node:assert/strict";
import { bagsNeeded, cylinderCuFt, readyMixOrderYd, tubePurchase, nextTubeDiameter } from "../lib/calc/concrete.ts";
import { calcSonotube } from "../lib/calc/sonotube.ts";
import { calcFooting } from "../lib/calc/footing.ts";
import { calcDeck } from "../lib/calc/deck.ts";

const close = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);

test("cylinder volume: 12 in x 48 in = pi cu ft", () => close(cylinderCuFt(12, 48), Math.PI, 1e-9));
test("bag counts round up, not on float noise", () => {
  assert.equal(bagsNeeded(1.8, 80), 3);
  assert.equal(bagsNeeded(1.81, 80), 4);
  assert.equal(bagsNeeded(0, 80), 0);
});
test("ready-mix in quarter yards", () => {
  assert.equal(readyMixOrderYd(27), 1);
  assert.equal(readyMixOrderYd(27.1), 1.25);
});
test("tube purchase", () => {
  assert.deepEqual(tubePurchase(48, 6), { fourFt: 6, twelveFt: 2, linearFt: 24 });
  assert.equal(tubePurchase(50, 6).fourFt, null);
  assert.equal(tubePurchase(50, 6).twelveFt, 3); // 2 per 12 ft tube
});
test("next tube diameter", () => {
  assert.equal(nextTubeDiameter(11.2), 12);
  assert.equal(nextTubeDiameter(12), 12);
  assert.equal(nextTubeDiameter(40), null);
});

test("sonotube: six 12 in tubes, 42 in deep + 6 in above grade, 10% waste", () => {
  const r = calcSonotube({ diameterIn: 12, depthIn: 42, aboveGradeIn: 6, count: 6, wastePct: 10, bagSize: 80, pricePerBag: 6.5 });
  close(r.totalCuFt, 6 * Math.PI);
  close(r.totalCuFtWithWaste, 20.73);
  assert.equal(r.chosenBags, 35);
  assert.equal(r.cost, 35 * 6.5);
  assert.equal(r.tubes.fourFt, 6);
});

test("strip footing: 100 ft x 16 in x 8 in, 2 bars", () => {
  const r = calcFooting({
    mode: "strip", lengthFt: 100, widthIn: 16, depthIn: 8, bars: 2,
    padLengthIn: 0, padWidthIn: 0, padDepthIn: 0, padCount: 1, padRebarSpacingIn: 0,
    wastePct: 0, bagSize: 80, pricePerYd: 0, pricePerBag: 0,
  });
  close(r.cuFt, 100 * (16 / 12) * (8 / 12)); // 88.89
  close(r.yd, 3.29);
  assert.equal(r.readyMixYd, 3.5);
  close(r.rebarLf, 220);
  assert.equal(r.rebarSticks20, 11);
});

test("pad footing: 4 pads 24x24x12 with #4 @ 12 in", () => {
  const r = calcFooting({
    mode: "pad", lengthFt: 0, widthIn: 0, depthIn: 0, bars: 0,
    padLengthIn: 24, padWidthIn: 24, padDepthIn: 12, padCount: 4, padRebarSpacingIn: 12,
    wastePct: 0, bagSize: 80, pricePerYd: 0, pricePerBag: 0,
  });
  close(r.cuFt, 16);
  // clear 18 in each way -> 2 bars each way x 18 in = 6 ft per pad
  close(r.rebarLf, 24);
});

test("deck: 16 x 12 ledger deck, 8 ft spacing, 1500 psf soil", () => {
  const r = calcDeck({
    widthFt: 16, projectionFt: 12, attach: "ledger", cantileverFt: 0, maxPostSpacingFt: 8,
    liveLoadPsf: 40, deadLoadPsf: 10, soilPsf: 1500, frostDepthIn: 36, aboveGradeIn: 2,
    footingType: "pier", padThicknessIn: 8, pierDiameterIn: 10, wastePct: 0, bagSize: 80,
  });
  assert.equal(r.postsPerBeam, 3);
  assert.equal(r.totalPosts, 3);
  close(r.tributaryWidthFt, 6);
  close(r.interiorTribAreaSqFt, 48);
  close(r.interiorLoadLb, 2400);
  close(r.requiredAreaSqFt, 1.6);
  // min dia = sqrt(4*1.6/pi)*12 = 17.13 in -> 18 in tube
  assert.equal(r.pierDiameterIn, 18);
});

test("deck: pad option rounds side up to even inch", () => {
  const r = calcDeck({
    widthFt: 16, projectionFt: 12, attach: "ledger", cantileverFt: 0, maxPostSpacingFt: 8,
    liveLoadPsf: 40, deadLoadPsf: 10, soilPsf: 1500, frostDepthIn: 36, aboveGradeIn: 2,
    footingType: "pad", padThicknessIn: 8, pierDiameterIn: 10, wastePct: 0, bagSize: 80,
  });
  // sqrt(1.6) * 12 = 15.18 -> 16 in
  assert.equal(r.padSizeIn, 16);
  close(r.tubeLengthIn, 30);
});

test("deck: freestanding doubles beams", () => {
  const r = calcDeck({
    widthFt: 16, projectionFt: 12, attach: "freestanding", cantileverFt: 0, maxPostSpacingFt: 8,
    liveLoadPsf: 40, deadLoadPsf: 10, soilPsf: 1500, frostDepthIn: 36, aboveGradeIn: 2,
    footingType: "pier", padThicknessIn: 8, pierDiameterIn: 10, wastePct: 0, bagSize: 80,
  });
  assert.equal(r.totalPosts, 6);
});
