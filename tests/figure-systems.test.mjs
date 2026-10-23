// Tests for the triangles that are only published as figures (UK SSEW,
// GEPPA, Aisne). Expected classes are read off the published figures cited
// in the system files (AHDB figure for the UK; Baize, Les Mots de
// l'agronomie, figures 2 and 3 for Aisne and GEPPA).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uk } from '../site/texture/js/systems/uk.js';
import { geppa } from '../site/texture/js/systems/geppa.js';
import { aisne } from '../site/texture/js/systems/aisne.js';
import { usda } from '../site/texture/js/systems/usda.js';
import { classify, neighbours, planePoly } from '../site/texture/js/classify.js';
import { toPlane, pointInPolygon } from '../site/texture/js/geometry.js';

const c = (sand, silt, clay) => ({ sand, silt, clay });
const area = (poly) => {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
  return a / 2;
};

for (const sys of [uk, geppa, aisne, usda]) {
  test(`${sys.id}: vertices are valid compositions`, () => {
    for (const k of sys.classes) for (const [a, b, d] of k.poly) {
      assert.ok(Math.abs(a + b + d - 100) < 1e-9, `${k.id} ${a}/${b}/${d}`);
      assert.ok(a >= 0 && b >= 0 && d >= 0);
    }
  });
  test(`${sys.id}: class polygons tile the triangle without overlap`, () => {
    const total = sys.classes.reduce((s, k) => s + Math.abs(area(planePoly(k))), 0);
    const whole = (100 * 100 * Math.sqrt(3)) / 4;
    assert.ok(Math.abs(total - whole) < 1e-3, `${sys.id}: ${total} vs ${whole}`);
    // Every point of an offset grid is inside exactly one polygon.
    for (let clay = 0.37; clay < 100; clay += 1.1) {
      for (let silt = 0.29; silt < 100 - clay; silt += 1.1) {
        const p = toPlane(c(100 - clay - silt, silt, clay));
        const n = sys.classes.filter((k) => pointInPolygon(p, planePoly(k))).length;
        assert.equal(n, 1, `${sys.id} at clay ${clay} silt ${silt}: ${n} classes`);
      }
    }
  });
  test(`${sys.id}: corners and every grid point classify`, () => {
    for (let clay = 0; clay <= 100; clay += 2.5)
      for (let silt = 0; silt <= 100 - clay; silt += 2.5) classify(sys, c(100 - clay - silt, silt, clay));
  });
}

const cls = (sys, a, b, d) => classify(sys, c(a, b, d)).id;

test('UK (AHDB figure): one point inside each class', () => {
  const cases = [
    [10, 10, 80, 'C'], [55, 5, 40, 'SC'], [5, 50, 45, 'SIC'], [35, 40, 25, 'CL'], [10, 65, 25, 'SICL'],
    [60, 15, 25, 'SCL'], [60, 30, 10, 'SL'], [35, 55, 10, 'SSIL'], [10, 80, 10, 'SIL'], [80, 15, 5, 'LS'], [95, 3, 2, 'S'],
  ];
  for (const [a, b, d, want] of cases) assert.equal(cls(uk, a, b, d), want, `${a}/${b}/${d}`);
});

test('UK: clay limits at 18, 30/35 and 55 %, sand limits at 20 and 50 %', () => {
  assert.equal(cls(uk, 40, 43, 17), 'SSIL');
  assert.equal(cls(uk, 40, 41, 19), 'CL');
  assert.equal(cls(uk, 60, 11, 29), 'SCL');
  assert.equal(cls(uk, 60, 9, 31), 'SC');
  assert.equal(cls(uk, 21, 60, 19), 'CL');
  assert.equal(cls(uk, 19, 62, 19), 'SICL');
});

test('UK: a point exactly on a drawn line reports both classes', () => {
  const r = classify(uk, c(50, 32, 18)); // corner of SL, SSIL, CL, SCL
  assert.ok(r.boundary.length >= 2, JSON.stringify(r.boundary));
  const r2 = classify(uk, c(35, 47, 18)); // on the 18 % clay line
  assert.ok(['CL', 'SSIL'].includes(r2.id));
  assert.deepEqual(r2.boundary, [r2.id === 'CL' ? 'SSIL' : 'CL']);
});

test('GEPPA (Baize fig. 3): one point inside each class', () => {
  // [sand, silt, clay] read in the right-angled triangle as (silt, clay).
  const cases = [
    [10, 10, 80, 'AA'], [30, 20, 50, 'A'], [45, 15, 40, 'As'], [25, 40, 35, 'Als'], [5, 60, 35, 'Al'],
    [60, 15, 25, 'AS'], [35, 40, 25, 'LAS'], [10, 65, 25, 'La'], [70, 15, 15, 'Sa'], [55, 30, 15, 'Sal'],
    [40, 45, 15, 'Lsa'], [10, 75, 15, 'L'], [80, 15, 5, 'S'], [95, 3, 2, 'SS'], [65, 30, 5, 'Sl'],
    [40, 55, 5, 'Ls'], [10, 85, 5, 'LL'],
  ];
  for (const [a, b, d, want] of cases) assert.equal(cls(geppa, a, b, d), want, `${a}/${b}/${d}`);
});

test('GEPPA: Baize\'s worked example (clay 35 %, silt 50 %) sits on the Als / Al line', () => {
  const comp = c(15, 50, 35);
  const r = classify(geppa, comp);
  assert.ok(['Al', 'Als'].includes(r.id));
  const other = r.id === 'Al' ? 'Als' : 'Al';
  const nb = neighbours(geppa, comp, r.id, 1);
  assert.equal(nb[0].id, other);
  assert.ok(nb[0].distance < 0.5);
});

test('Aisne (Baize fig. 2): one point inside each class, and the worked example', () => {
  const cases = [
    [10, 10, 80, 'ALO'], [30, 35, 35, 'A'], [10, 55, 35, 'AL'], [60, 5, 35, 'AS'], [5, 70, 25, 'LA'],
    [25, 50, 25, 'LAS'], [45, 33, 22, 'LSA'], [70, 15, 15, 'SA'], [5, 82, 13, 'LM'], [25, 63, 12, 'LMS'],
    [45, 45, 10, 'LS'], [65, 30, 5, 'SL'], [93, 5, 2, 'S'], [5, 92, 3, 'LL'], [35, 61, 4, 'LLS'],
  ];
  for (const [a, b, d, want] of cases) assert.equal(cls(aisne, a, b, d), want, `${a}/${b}/${d}`);
  assert.equal(cls(aisne, 15, 50, 35), 'AL'); // "A = 35 % et LT = 50 %" lands in AL
});

test('USDA: worked example of the FAO French training manual (sand 32, silt 38, clay 30)', () => {
  assert.equal(cls(usda, 32, 38, 30), 'CL');
});
