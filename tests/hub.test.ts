import { test } from "node:test";
import assert from "node:assert/strict";
import { calcProject, itemCuFt, type Item } from "../lib/calc/project.ts";

const close = (a: number, b: number, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const it = (shape: Item["shape"], a: number, b = 0, c = 0, d = 0, qty = 1): Item => ({ id: 1, shape, qty, a, b, c, d });
const prices = { wastePct: 0, bagPrice80: 6.5, bagPrice60: 5, readyMixPerYd: 160, shortLoadFee: 100, shortLoadUnderYd: 5 };

test("shape volumes", () => {
  close(itemCuFt(it("slab", 10, 10, 0, 0)), 0);
  close(itemCuFt(it("slab", 10, 10, 4)), 33.333);
  close(itemCuFt(it("circle", 10, 0, 4)), Math.PI * 25 / 3);
  close(itemCuFt(it("wall", 20, 4, 8)), 53.333);
  close(itemCuFt(it("footing", 50, 16, 8)), 44.444);
  close(itemCuFt(it("column", 12, 48)), Math.PI);
  close(itemCuFt(it("tube", 12, 48, 0, 8)), Math.PI - (Math.PI * 16 * 48) / 1728);
});
test("project: 10x10x4 slab + 6 x 12in tubes 48in, bags vs ready-mix", () => {
  const r = calcProject({ ...prices, items: [it("slab", 10, 10, 4), { ...it("column", 12, 48), id: 2, qty: 6 }] });
  close(r.rawCuFt, 33.333 + 6 * Math.PI);
  // 52.18 cu ft -> 1.93 yd -> order 2 yd
  assert.equal(r.readyMixYd, 2);
  const b80 = r.bags.find((b) => b.size === 80)!.bags;
  assert.equal(b80, 87);
  close(r.bags80Cost!, 87 * 6.5);
  close(r.readyMixCost!, 2 * 160 + 100);
  assert.equal(r.cheapest, "readymix");
});
test("small job: bags win", () => {
  const r = calcProject({ ...prices, items: [it("column", 10, 36, 0, 0, 4)] });
  assert.equal(r.cheapest === "bags80" || r.cheapest === "bags60", true);
});
