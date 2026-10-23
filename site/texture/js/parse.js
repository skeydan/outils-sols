// Parse a pasted lab result (French or English) into sand / silt / clay.
// Pure function, no DOM. Handles labels with or without accents, decimal
// commas, %, g/kg and per-mille, the French 5-fraction particle-size
// analysis (argile, limons fins/grossiers, sables fins/grossiers), the
// USDA sand grades (VCS, CS, MS, FS, VFS), and organic matter.

const LABELS = [
  // [key, regex source]  - longest / most specific first is not required,
  // overlaps are resolved by preferring the longer match.
  ['vcs', String.raw`very\s+coarse\s+sand|\bvcs\b|\bvcos\b`],
  ['cs', String.raw`coarse\s+sand|\bcs\b|\bcos\b`],
  ['ms', String.raw`medium\s+sand|\bms\b`],
  ['vfs', String.raw`very\s+fine\s+sand|\bvfs\b`],
  ['fs', String.raw`fine\s+sand|\bfs\b`],
  ['frFineSand', String.raw`sables?\s+fins?|\bsf\b`],
  ['frCoarseSand', String.raw`sables?\s+grossiers?|\bsg\b`],
  ['frFineSilt', String.raw`limons?\s+fins?|\blf\b`],
  ['frCoarseSilt', String.raw`limons?\s+grossiers?|\blg\b`],
  ['fineSilt', String.raw`fine\s+silt`],
  ['coarseSilt', String.raw`coarse\s+silt`],
  ['sand', String.raw`total\s+sand|sables?(?:\s+totaux?)?|\bsand\b`],
  ['silt', String.raw`total\s+silt|limons?(?:\s+totaux?)?|\bsilt\b`],
  ['clay', String.raw`argiles?|\bclay\b`],
  ['om', String.raw`mati[e]res?\s+organiques?|\bm\.?\s?o\.?(?=[\s:=]|$)|organic\s+matter|\bs?om\b`],
];

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

function clean(text) {
  let t = strip(String(text)).toLowerCase();
  t = t.replace(/(\d),(\d)/g, '$1.$2'); // decimal comma
  t = t.replace(/µ|μ/g, 'u'); // micro sign -> u
  // Drop particle-size limits such as "(< 2 um)", "2/20 um", "0.05-2 mm", "50 a 200 um".
  t = t.replace(/\([^)]*(?:um|mm|micron)[^)]*\)/g, ' ');
  t = t.replace(/[<>]\s*\d+(?:\.\d+)?\s*(?:um|mm|microns?)/g, ' ');
  t = t.replace(/\d+(?:\.\d+)?\s*(?:-|\/|a|to|–)\s*\d+(?:\.\d+)?\s*(?:um|mm|microns?)/g, ' ');
  return t;
}

function findLabels(t) {
  const found = [];
  for (const [key, src] of LABELS) {
    const re = new RegExp(src, 'g');
    let m;
    while ((m = re.exec(t))) found.push({ key, start: m.index, end: m.index + m[0].length });
  }
  // Keep the longest match where matches overlap.
  found.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const kept = [];
  for (const f of found) {
    const clash = kept.find((k) => f.start < k.end && k.start < f.end);
    if (!clash) kept.push(f);
    else if (f.end - f.start > clash.end - clash.start) kept[kept.indexOf(clash)] = f;
  }
  return kept.sort((a, b) => a.start - b.start);
}

const NUM = /(-?\d+(?:\.\d+)?)\s*(%|g\s*\/\s*kg|g\.kg-1|g\s*\/\s*100\s*g|‰|per\s*mille|pour\s*mille)?/;

function unitOf(u) {
  if (!u) return null;
  if (u === '%' || /100/.test(u)) return '%';
  return 'g/kg';
}

const near = (a, b, tol) => Math.abs(a - b) <= tol;

/**
 * Returns {ok:true, sand, silt, clay, om?, grades?, notes:[...], raw:{...}}
 * or {ok:false, error, notes}.
 * notes are codes the UI translates: 'gkg', 'rescaled', 'far-from-100',
 * 'computed-third', 'assumed-order', 'grades-of-sand', 'grades-mismatch',
 * 'summed-fr-fractions', 'summed-silt'.
 */
export function parseLab(text) {
  const t = clean(text);
  const labels = findLabels(t);
  const vals = {};
  const units = new Set();
  labels.forEach((l, i) => {
    const seg = t.slice(l.end, i + 1 < labels.length ? labels[i + 1].start : undefined);
    const m = seg.match(NUM);
    if (m && vals[l.key] === undefined) {
      vals[l.key] = Number(m[1]);
      const u = unitOf(m[2]);
      if (u && l.key !== 'om') units.add(u);
      if (l.key === 'om') vals.omUnit = u;
    }
  });
  const notes = [];

  // No labels: accept exactly three bare numbers as sand, silt, clay.
  const mainFound = ['sand', 'silt', 'clay', 'frFineSand', 'frCoarseSand', 'frFineSilt', 'frCoarseSilt', 'fineSilt', 'coarseSilt', 'vcs', 'cs', 'ms', 'fs', 'vfs']
    .some((k) => vals[k] !== undefined);
  if (!mainFound) {
    const nums = (t.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    if (nums.length === 3) {
      [vals.sand, vals.silt, vals.clay] = nums;
      notes.push('assumed-order');
    } else if (nums.length === 0) {
      return { ok: false, error: 'nothing-found', notes };
    } else {
      return { ok: false, error: 'need-labels', notes };
    }
  }

  let { sand, silt, clay } = vals;
  // French 5-fraction analysis (NF X 31-107 limits: 2 / 20 / 50 / 200 / 2000 um).
  if (sand === undefined && (vals.frFineSand !== undefined || vals.frCoarseSand !== undefined)) {
    sand = (vals.frFineSand ?? 0) + (vals.frCoarseSand ?? 0);
    notes.push('summed-fr-fractions');
  }
  if (silt === undefined && (vals.frFineSilt !== undefined || vals.frCoarseSilt !== undefined)) {
    silt = (vals.frFineSilt ?? 0) + (vals.frCoarseSilt ?? 0);
    if (!notes.includes('summed-fr-fractions')) notes.push('summed-fr-fractions');
  }
  if (silt === undefined && (vals.fineSilt !== undefined || vals.coarseSilt !== undefined)) {
    silt = (vals.fineSilt ?? 0) + (vals.coarseSilt ?? 0);
    notes.push('summed-silt');
  }
  const gradeKeys = ['vcs', 'cs', 'ms', 'fs', 'vfs'];
  const hasGrades = gradeKeys.every((k) => vals[k] !== undefined);
  let grades = hasGrades ? Object.fromEntries(gradeKeys.map((k) => [k, vals[k]])) : null;
  const gradeSum = hasGrades ? gradeKeys.reduce((s, k) => s + vals[k], 0) : 0;
  if (sand === undefined && hasGrades) sand = gradeSum;

  // Units: g/kg if stated, or if the main fractions add up to about 1000.
  const present = [sand, silt, clay].filter((v) => v !== undefined);
  let k = 1;
  const rawSum = present.reduce((a, b) => a + b, 0);
  if (units.has('g/kg') || (present.length === 3 && rawSum > 500 && near(rawSum, 1000, 100))) {
    k = 0.1;
    notes.push('gkg');
  }
  const scale = (v) => (v === undefined ? undefined : v * k);
  sand = scale(sand); silt = scale(silt); clay = scale(clay);
  if (grades) for (const g of gradeKeys) grades[g] *= k;

  // Two of three: the third is what is left.
  const missing = ['sand', 'silt', 'clay'].filter((n) => ({ sand, silt, clay })[n] === undefined);
  if (missing.length >= 2) return { ok: false, error: 'missing', missing, notes };
  if (missing.length === 1) {
    const have = { sand, silt, clay };
    const s2 = Object.values(have).filter((v) => v !== undefined).reduce((a, b) => a + b, 0);
    if (s2 > 100 + 1e-9) return { ok: false, error: 'two-over-100', missing, notes };
    have[missing[0]] = 100 - s2;
    ({ sand, silt, clay } = have);
    notes.push('computed-third');
  }
  if ([sand, silt, clay].some((v) => v < 0)) return { ok: false, error: 'negative', notes };

  const sum = sand + silt + clay;
  if (!(sum > 0)) return { ok: false, error: 'nothing-found', notes };
  const raw = { sand, silt, clay, sum };
  if (!near(sum, 100, 0.05)) {
    notes.push('rescaled');
    if (!near(sum, 100, 10)) notes.push('far-from-100');
  }
  const f = 100 / sum;

  // Sand grades: % of the whole fine earth (they add up to total sand), or %
  // of the sand fraction (they add up to 100).
  if (grades) {
    const gs = gradeSum * k;
    if (near(gs, raw.sand, 1.5)) {
      for (const g of gradeKeys) grades[g] *= f;
    } else if (near(gs, 100, 1.5)) {
      for (const g of gradeKeys) grades[g] = (grades[g] / gs) * raw.sand * f;
      notes.push('grades-of-sand');
    } else {
      notes.push('grades-mismatch');
      grades = null;
    }
  }

  let om;
  if (vals.om !== undefined) om = vals.omUnit === 'g/kg' ? vals.om / 10 : vals.om;

  return {
    ok: true,
    sand: sand * f, silt: silt * f, clay: clay * f,
    raw, notes,
    ...(grades ? { grades } : {}),
    ...(om !== undefined ? { om } : {}),
  };
}

/**
 * Jar test: layer thicknesses (any unit, the same for the three) to
 * percentages of the total thickness. Returns {ok, sand, silt, clay} or
 * {ok:false, error: 'nan' | 'negative' | 'empty'}.
 * Thickness shares are shares of volume of settled sediment, not of mass:
 * the caller shows that caveat.
 */
export function jarToPercent({ sand, silt, clay }) {
  const v = [sand, silt, clay].map((x) => (typeof x === 'number' ? x : Number(String(x ?? '').trim().replace(',', '.') || NaN)));
  if (v.some((x) => !Number.isFinite(x))) return { ok: false, error: 'nan' };
  if (v.some((x) => x < 0)) return { ok: false, error: 'negative' };
  const total = v[0] + v[1] + v[2];
  if (!(total > 0)) return { ok: false, error: 'empty' };
  return { ok: true, sand: (100 * v[0]) / total, silt: (100 * v[1]) / total, clay: (100 * v[2]) / total, total };
}
