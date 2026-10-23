import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLab } from '../site/texture/js/parse.js';
import { createState, slide, type, setCalc, snapComposition, nudge } from '../site/texture/js/model.js';

const round = (x) => Math.round(x * 100) / 100;
const triple = (r) => [round(r.sand), round(r.silt), round(r.clay)];

test('parse: simple English labels', () => {
  const r = parseLab('Sand 40%, Silt 40%, Clay 20%');
  assert.ok(r.ok);
  assert.deepEqual(triple(r), [40, 40, 20]);
  assert.deepEqual(r.notes, []);
});

test('parse: French labels, decimal commas, any order', () => {
  const r = parseLab('Argile : 23,5 %\nLimon : 41,2 %\nSable : 35,3 %');
  assert.deepEqual(triple(r), [35.3, 41.2, 23.5]);
});

test('parse: French 5-fraction analysis in g/kg with size limits in the labels', () => {
  const r = parseLab(`Argile (< 2 µm) 215 g/kg
Limons fins (2/20 µm) 310 g/kg
Limons grossiers (20/50 µm) 205 g/kg
Sables fins (50/200 µm) 150 g/kg
Sables grossiers (200/2000 µm) 120 g/kg
Matière organique 23 g/kg`);
  assert.ok(r.ok, JSON.stringify(r));
  assert.deepEqual(triple(r), [27, 51.5, 21.5]);
  assert.ok(r.notes.includes('gkg'));
  assert.ok(r.notes.includes('summed-fr-fractions'));
  assert.equal(r.om, 2.3);
});

test('parse: g/kg detected from a sum near 1000 even without units', () => {
  const r = parseLab('argile 180 limon 520 sable 300');
  assert.deepEqual(triple(r), [30, 52, 18]);
  assert.ok(r.notes.includes('gkg'));
});

test('parse: only sand and clay -> silt is the remainder', () => {
  const r = parseLab('sand 62 clay 18');
  assert.deepEqual(triple(r), [62, 20, 18]);
  assert.ok(r.notes.includes('computed-third'));
  assert.equal(parseLab('sand 70 clay 40').error, 'two-over-100');
  assert.equal(parseLab('clay 30').error, 'missing');
});

test('parse: values not adding to 100 are rescaled, with a note', () => {
  const r = parseLab('sand 38, silt 39, clay 21'); // 98
  assert.ok(r.notes.includes('rescaled'));
  assert.ok(!r.notes.includes('far-from-100'));
  assert.equal(round(r.sand + r.silt + r.clay), 100);
  assert.equal(round(r.raw.sum), 98);
  const far = parseLab('sand 30 silt 30 clay 20');
  assert.ok(far.notes.includes('far-from-100'));
});

test('parse: three bare numbers are read as sand, silt, clay (and flagged)', () => {
  const r = parseLab('40 / 40 / 20');
  assert.deepEqual(triple(r), [40, 40, 20]);
  assert.ok(r.notes.includes('assumed-order'));
  assert.equal(parseLab('12 13').error, 'need-labels');
  assert.equal(parseLab('hello').error, 'nothing-found');
});

test('parse: USDA sand grades, as % of soil or % of sand', () => {
  const r = parseLab('VCS 2 CS 6 MS 20 FS 35 VFS 12 silt 15 clay 10');
  assert.equal(round(r.sand), 75);
  assert.deepEqual(r.grades, { vcs: 2, cs: 6, ms: 20, fs: 35, vfs: 12 });
  const s = parseLab('Total sand 80, silt 12, clay 8. Very coarse sand 10, coarse sand 20, medium sand 30, fine sand 30, very fine sand 10');
  assert.ok(s.notes.includes('grades-of-sand'));
  assert.equal(round(s.grades.ms), 24); // 30 % of 80 % sand
});

test('model: the calculated fraction takes the remainder', () => {
  let s = createState({ sand: 40, silt: 40, clay: 20 }, 'silt');
  s = slide(s, 'sand', 23);
  assert.deepEqual([s.sand, s.silt, s.clay], [23, 57, 20]);
  s = slide(s, 'clay', 26);
  assert.deepEqual([s.sand, s.silt, s.clay], [23, 51, 26]);
  // Any lab result is reached in two moves.
});

test('model: a slider never gets stuck; the other fraction makes room only at 0', () => {
  let s = createState({ sand: 40, silt: 20, clay: 40 }, 'silt');
  s = slide(s, 'sand', 50); // silt 20 -> 10, clay untouched
  assert.deepEqual([s.sand, s.silt, s.clay], [50, 10, 40]);
  s = slide(s, 'sand', 80); // silt would be -20: clay makes room
  assert.deepEqual([s.sand, s.silt, s.clay], [80, 0, 20]);
  assert.equal(slide(s, 'silt', 50), s); // the calculated slider does not move
});

test('model: typing never changes the other typed value', () => {
  const s = createState({ sand: 40, silt: 30, clay: 30 }, 'silt');
  const r = type(s, 'sand', '80');
  assert.equal(r.error, 'sum');
  assert.equal(r.over, 10);
  assert.equal(r.state, s);
  assert.deepEqual(type(s, 'sand', '23,5').state.silt, 46.5);
  assert.equal(type(s, 'sand', 'abc').error, 'nan');
  assert.equal(type(s, 'sand', '120').error, 'range');
  assert.equal(type(s, 'sand', '').error, 'empty');
});

test('model: choosing another calculated fraction keeps the values', () => {
  let s = createState({ sand: 40, silt: 40, clay: 20 }, 'silt');
  s = setCalc(s, 'sand');
  s = slide(s, 'clay', 30);
  assert.deepEqual([s.sand, s.silt, s.clay], [30, 40, 30]);
});

test('model: triangle picks snap to whole percentages', () => {
  const s = snapComposition(createState(), { sand: 33.4, silt: 33.3, clay: 33.3 });
  assert.deepEqual([s.sand, s.silt, s.clay], [33, 34, 33]);
});

test('model: arrow keys move the point and stay inside the triangle', () => {
  let s = createState({ sand: 40, silt: 40, clay: 20 });
  s = nudge(s, 'up');
  assert.deepEqual([s.sand, s.silt, s.clay], [39.5, 39.5, 21]);
  s = nudge(createState({ sand: 0, silt: 80, clay: 20 }), 'up');
  assert.deepEqual([s.sand, s.silt, s.clay], [0, 79, 21]);
  s = nudge(createState({ sand: 100, silt: 0, clay: 0 }), 'left');
  assert.deepEqual([s.sand, s.silt, s.clay], [100, 0, 0]);
  s = nudge(createState({ sand: 0, silt: 0, clay: 100 }), 'up');
  assert.deepEqual([s.sand, s.silt, s.clay], [0, 0, 100]);
});

import { jarToPercent } from '../site/texture/js/parse.js';
test('jar test: layer thicknesses to percentages (CSU GardenNotes #214 method)', () => {
  const r = jarToPercent({ sand: '30', silt: '45', clay: '25' });
  assert.ok(r.ok);
  assert.deepEqual([r.sand, r.silt, r.clay], [30, 45, 25]);
  const mm = jarToPercent({ sand: 12, silt: 6, clay: 2 }); // any unit
  assert.deepEqual([mm.sand, mm.silt, mm.clay], [60, 30, 10]);
  assert.equal(jarToPercent({ sand: '1,5', silt: '1,5', clay: '0' }).sand, 50);
  assert.equal(jarToPercent({ sand: 'x', silt: 1, clay: 1 }).error, 'nan');
  assert.equal(jarToPercent({ sand: 0, silt: 0, clay: 0 }).error, 'empty');
  assert.equal(jarToPercent({ sand: -1, silt: 1, clay: 1 }).error, 'negative');
});
