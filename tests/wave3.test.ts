import { test } from "node:test";
import assert from "node:assert/strict";
import { calcRetaining } from "../lib/calc/retaining.ts";
import { calcStairs } from "../lib/calc/stairs.ts";

const close = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const rw = { lengthFt: 30, exposedHeightFt: 3, block: "medium" as const, customH: 0, customL: 0, customD: 0, caps: true, baseIn: 6, drainZoneIn: 12, drainPipe: true, wastePct: 5, surcharge: false };

test("retaining wall 30 ft x 3 ft, 6x16x10 block", () => {
  const r = calcRetaining(rw);
  assert.equal(r.buriedCourses, 1);
  assert.equal(r.exposedCourses, 6);
  assert.equal(r.courses, 7);
  assert.equal(r.totalHeightIn, 46);
  assert.equal(r.blocksPerCourse, 23);
  assert.equal(r.blocks, 170);
  assert.equal(r.capBlocks, 24);
  close(r.baseCuFt, 27.5);
  close(r.drainCuFt, 105);
  close(r.gravelYd, 139.125 / 27);
  assert.equal(r.fabricSqFt, 165);
  assert.equal(r.pipeFt, 32);
  assert.equal(r.needsEngineer, false);
});
test("retaining wall: 4 ft exposed needs engineer; tall wall buries more", () => {
  const r = calcRetaining({ ...rw, exposedHeightFt: 4 });
  assert.equal(r.needsEngineer, true);
  const t = calcRetaining({ ...rw, exposedHeightFt: 6, block: "large" }); // 72/8 = 9 in -> 2 courses of 8
  assert.equal(t.buriedCourses, 2);
  assert.equal(calcRetaining({ ...rw, surcharge: true }).needsEngineer, true);
});
test("stairs: 30 in rise, 4 ft wide, 11 in tread, 36 in landing", () => {
  const r = calcStairs({ totalRiseIn: 30, widthFt: 4, maxRiserIn: 7.75, treadIn: 11, landingIn: 36, wastePct: 5, bagSize: 80 });
  assert.equal(r.risers, 4);
  close(r.riserIn, 7.5);
  assert.equal(r.treads, 3);
  assert.equal(r.totalRunIn, 69);
  close(r.profileSqFt, 1575 / 144);
  close(r.concreteCuFt, 45.9375);
  assert.equal(r.readyMixYd, 1.75);
  assert.equal(r.chosenBags, 77);
  assert.ok(r.checks.every((c) => c.ok));
});
test("stairs: no landing, IRC fail flagged", () => {
  const r = calcStairs({ totalRiseIn: 16, widthFt: 2.5, maxRiserIn: 8, treadIn: 9, landingIn: 0, wastePct: 0, bagSize: 80 });
  assert.equal(r.risers, 2);
  assert.equal(r.treads, 2);
  close(r.profileSqFt, (9 * 8 + 9 * 16) / 144);
  assert.equal(r.checks.find((c) => c.label.startsWith("Tread"))!.ok, false);
  assert.equal(r.checks.find((c) => c.label.startsWith("Width"))!.ok, false);
});
