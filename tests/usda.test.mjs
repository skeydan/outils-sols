// USDA classification tests. Expected classes come from the definitions in
// the Soil Survey Manual (2017), ch. 3, pp. 122-124, and from worked examples
// in Colorado State University Extension CMG GardenNotes #213 and #214.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { usda, sandSubclass, loamySandSubclass, sandyLoamSubclass } from '../site/texture/js/systems/usda.js';
import { classify, validate, normalize, neighbours, planePoly } from '../site/texture/js/classify.js';
import { toPlane, pointInPolygon } from '../site/texture/js/geometry.js';

const c = (sand, silt, clay) => ({ sand, silt, clay });
const cls = (sand, silt, clay) => classify(usda, c(sand, silt, clay)).id;

test('corners', () => {
  assert.equal(cls(100, 0, 0), 'S');
  assert.equal(cls(0, 100, 0), 'SI');
  assert.equal(cls(0, 0, 100), 'C');
});

test('worked examples from CSU GardenNotes', () => {
  assert.equal(cls(50, 20, 30), 'SCL'); // #214: 30 % clay, 50 % sand, 20 % silt
  assert.equal(cls(60, 10, 30), 'SCL'); // #213: 30 % clay, 10 % silt, 60 % sand
  assert.equal(cls(40, 40, 20), 'L'); // #213: 20 % clay, 40 % silt, 40 % sand
});

// [sand, silt, clay, expected, why]
const boundaryCases = [
  [30, 30, 40, 'C', 'clay: 40 % or more clay'],
  [30, 30.1, 39.9, 'CL', 'clay loam: 27 to less than 40 % clay'],
  [20, 40, 40, 'SIC', 'silty clay: 40 % or more silt'],
  [20.1, 39.9, 40, 'C', 'clay: less than 40 % silt'],
  [45.1, 19.9, 35, 'SC', 'sandy clay: more than 45 % sand'],
  [45, 20, 35, 'CL', 'clay loam: sand up to and including 45 %'],
  [45, 0, 55, 'C', 'clay: 45 % or less sand'],
  [45.1, 0, 54.9, 'SC', 'sandy clay: more than 45 % sand'],
  [45, 28, 27, 'CL', 'loam needs less than 27 % clay'],
  [45, 28.1, 26.9, 'L', 'loam'],
  [52.1, 27.9, 20, 'SCL', 'sandy clay loam: 20 % clay or more, silt < 28'],
  [52.1, 28, 19.9, 'SL', 'sandy loam: clay < 20, sand > 52'],
  [52, 28, 20, 'L', 'loam: 52 % or less sand, silt 28 or more'],
  [52, 41, 7, 'L', 'loam: 7 % clay or more'],
  [52.1, 40.9, 7, 'SL', 'sandy loam: more than 52 % sand'],
  [51, 42.1, 6.9, 'SL', 'sandy loam: less than 7 % clay, silt < 50'],
  [8, 80, 12, 'SIL', 'silt needs less than 12 % clay'],
  [8.1, 80, 11.9, 'SI', 'silt: 80 % silt or more, clay < 12'],
  [20, 80, 0, 'SI', 'silt: 80 % or more silt'],
  [20.1, 79.9, 0, 'SIL', 'silt loam: 50 to less than 80 % silt'],
  [50, 50, 0, 'SIL', 'silt loam: 50 % or more silt'],
  [50.1, 49.9, 0, 'SL', 'sandy loam: less than 50 % silt'],
  [85, 15, 0, 'LS', 'sand needs more than 85 % sand'],
  [85.1, 14.9, 0, 'S', 'sand'],
  [90, 0, 10, 'LS', 'sand needs silt + 1.5 clay < 15'],
  [90.1, 0, 9.9, 'S', 'sand'],
  [70, 30, 0, 'SL', 'loamy sand needs silt + 2 clay < 30'],
  [70.1, 29.9, 0, 'LS', 'loamy sand'],
  [85, 0, 15, 'SL', 'silt + 2 clay = 30 is sandy loam'],
  [80, 0, 20, 'SCL', 'sandy clay loam: 20 % clay or more'],
  [80.1, 0, 19.9, 'SL', 'sandy loam'],
  [65, 0, 35, 'SC', 'sandy clay: 35 % clay or more'],
  [65.1, 0, 34.9, 'SCL', 'sandy clay loam: less than 35 % clay'],
  [20, 53, 27, 'SICL', 'silty clay loam: 20 % or less sand'],
  [20.1, 52.9, 27, 'CL', 'clay loam: more than 20 % sand'],
  [0, 73, 27, 'SICL', 'silty clay loam: 27 % clay or more'],
  [0, 73.1, 26.9, 'SIL', 'silt loam: 12 to less than 27 % clay'],
  [0, 60, 40, 'SIC', 'silty clay'],
  [0, 60.1, 39.9, 'SICL', 'silty clay loam: less than 40 % clay'],
  [23, 50, 27, 'CL', 'clay loam: clay 27 and sand > 20'],
  [23.1, 50, 26.9, 'SIL', 'silt loam: silt 50 and clay 12-27'],
  [23.1, 49.9, 27, 'CL', ''],
  [43, 50, 7, 'SIL', 'silt loam: silt 50, clay < 12'],
  [43.1, 49.9, 7, 'L', ''],
];

test('points on and next to every boundary (Soil Survey Manual definitions)', () => {
  for (const [sa, si, cl, want, why] of boundaryCases) {
    assert.equal(cls(sa, si, cl), want, `${sa}/${si}/${cl}: ${why}`);
  }
});

test('the rules are a partition: exactly one class for every point of a 0.5 % grid', () => {
  // classify() throws if 0 or 2+ rules match.
  let n = 0;
  for (let clay = 0; clay <= 100; clay += 0.5) {
    for (let silt = 0; silt <= 100 - clay; silt += 0.5) {
      classify(usda, c(100 - clay - silt, silt, clay));
      n++;
    }
  }
  assert.ok(n > 20000);
});

test('drawn polygons agree with the rules away from boundaries', () => {
  // Offset grid (x.25) never lies on a USDA limit, so polygon == rule.
  for (let clay = 0.25; clay < 100; clay += 1) {
    for (let silt = 0.25; silt < 100 - clay; silt += 1) {
      const comp = c(100 - clay - silt, silt, clay);
      const id = classify(usda, comp).id;
      const p = toPlane(comp);
      const inPoly = usda.classes.filter((k) => pointInPolygon(p, planePoly(k))).map((k) => k.id);
      assert.deepEqual(inPoly, [id], `${JSON.stringify(comp)}`);
    }
  }
});

test('polygons tile the triangle (areas add up to the whole)', () => {
  const area = (poly) => {
    let a = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
    return Math.abs(a / 2);
  };
  const total = usda.classes.reduce((s, k) => s + area(planePoly(k)), 0);
  const whole = (100 * 100 * Math.sqrt(3)) / 4;
  assert.ok(Math.abs(total - whole) < 1e-6, `${total} vs ${whole}`);
});

test('boundary points report the class on the other side', () => {
  const r = classify(usda, c(30, 30, 40));
  assert.equal(r.id, 'C');
  assert.deepEqual(r.boundary, ['CL']);
  const corner = classify(usda, c(45, 15, 40)); // C / CL / SC meet
  assert.equal(corner.id, 'C');
  assert.deepEqual(corner.boundary.sort(), ['CL', 'SC']);
});

test('float noise from rescaling does not flip a class', () => {
  // 27 % clay after a rescale may come out as 26.9999999.
  const n = normalize({ sand: 45 * 1.1, silt: 28 * 1.1, clay: 27 * 1.1 });
  assert.equal(classify(usda, n).id, 'CL');
});

test('sums that do not add to 100 are rejected, not silently classified', () => {
  assert.throws(() => classify(usda, c(40, 40, 19)), (e) => e.code === 'sum');
  assert.throws(() => classify(usda, c(50, 50, 1)), (e) => e.code === 'sum');
  assert.throws(() => classify(usda, c(-1, 51, 50)), (e) => e.code === 'negative');
  assert.throws(() => classify(usda, c(NaN, 50, 50)), (e) => e.code === 'not-a-number');
  assert.equal(validate(c(40, 40, 20.04)).ok, true); // within tolerance
  assert.equal(validate(c(40, 40, 20.1)).ok, false);
});

test('normalize rescales to 100 and keeps ratios', () => {
  const n = normalize({ sand: 20, silt: 20, clay: 10 });
  assert.deepEqual([n.sand, n.silt, n.clay].map((x) => Math.round(x * 1e9) / 1e9), [40, 40, 20]);
  assert.equal(n.sum, 50);
  assert.equal(cls(n.sand, n.silt, n.clay), 'L');
});

test('neighbours: near a boundary we list the class across it and the change needed', () => {
  const comp = c(30, 31, 39); // clay loam, 1 point below clay
  const id = classify(usda, comp).id;
  assert.equal(id, 'CL');
  const nb = neighbours(usda, comp, id, 3);
  assert.equal(nb[0].id, 'C');
  assert.ok(Math.abs(nb[0].distance - Math.sqrt(3) / 2) < 1e-9); // straight up: +1 clay, -0.5 sand, -0.5 silt
  assert.ok(Math.abs(nb[0].delta.clay - 1) < 0.051);
  // Deep inside a class there are no neighbours within 3 points.
  assert.deepEqual(neighbours(usda, c(10, 10, 80), 'C', 3), []);
});

test('sand subclasses (Soil Survey Manual definitions)', () => {
  const g = (vcs, cs, ms, fs, vfs) => ({ vcs, cs, ms, fs, vfs });
  assert.equal(sandSubclass(g(10, 20, 30, 30, 10)), 'COS');
  assert.equal(sandSubclass(g(5, 10, 40, 35, 10)), 'S');
  assert.equal(sandSubclass(g(10, 20, 55, 10, 5)), 'S'); // >=25 vc+c and >=50 medium
  assert.equal(sandSubclass(g(2, 5, 15, 60, 18)), 'FS');
  assert.equal(sandSubclass(g(2, 3, 10, 30, 55)), 'VFS');
  assert.equal(loamySandSubclass(g(15, 15, 20, 20, 10)), 'LCOS');
  assert.equal(loamySandSubclass(g(2, 5, 15, 60, 3)), 'LFS');
  assert.equal(loamySandSubclass(g(2, 3, 25, 10, 55)), 'LVFS');
  assert.equal(sandyLoamSubclass(g(15, 15, 10, 10, 10)), 'COSL');
  assert.equal(sandyLoamSubclass(g(5, 10, 25, 15, 10)), 'SL');
  assert.equal(sandyLoamSubclass(g(2, 5, 10, 35, 10)), 'FSL');
  assert.equal(sandyLoamSubclass(g(1, 2, 5, 10, 40)), 'VFSL');
});

test('sand subclass rules leave no gap for any split of the sand grades', () => {
  // All splits of 100 % sand into 5 grades on a 5 % grid.
  const step = 5;
  for (let a = 0; a <= 100; a += step)
    for (let b = 0; a + b <= 100; b += step)
      for (let m = 0; a + b + m <= 100; m += step)
        for (let f = 0; a + b + m + f <= 100; f += step) {
          const gr = { vcs: a, cs: b, ms: m, fs: f, vfs: 100 - a - b - m - f };
          assert.ok(sandSubclass(gr), `sand ${JSON.stringify(gr)}`);
          assert.ok(loamySandSubclass(gr), `loamy sand ${JSON.stringify(gr)}`);
        }
});
