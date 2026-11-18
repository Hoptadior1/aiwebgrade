import { test } from "node:test";
import assert from "node:assert/strict";
import { calcGravel, areaSqFt } from "../lib/calc/gravel.ts";

const close = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const base = { compactionPct: 0, tonsPerYd: 1.4, pricePerTon: 40, deliveryFee: 75, bagPrice: 5, fabric: true };

test("areas", () => {
  close(areaSqFt({ id: 1, shape: "rect", a: 10, b: 20, depthIn: 4 }), 200);
  close(areaSqFt({ id: 1, shape: "circle", a: 10, b: 0, depthIn: 4 }), 78.54);
  close(areaSqFt({ id: 1, shape: "triangle", a: 10, b: 6, depthIn: 4 }), 30);
});
test("driveway 12x50 at 4 in + path 3x30 at 2 in, 10% compaction", () => {
  const r = calcGravel({ ...base, compactionPct: 10, areas: [{ id: 1, shape: "rect", a: 50, b: 12, depthIn: 4 }, { id: 2, shape: "rect", a: 30, b: 3, depthIn: 2 }] });
  // 200 + 15 = 215 cu ft * 1.1 = 236.5 -> 8.759 yd -> 12.26 t
  close(r.cuFt, 236.5);
  close(r.yd, 8.759, 0.001);
  close(r.tons, 12.263, 0.001);
  assert.equal(r.bags, 473);
  close(r.bulkCost!, 12.263 * 40 + 75, 0.05);
  assert.equal(r.fabricSqFt, Math.ceil(690 * 1.1));
});
