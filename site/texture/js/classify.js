// Classification engine: pure functions, no DOM. Works for rule-based
// systems (USDA: printed definitions) and polygon-based systems (triangles
// only published as figures, digitised as vertex lists).

import { toPlane, fromPlane, pointInPolygon, distanceToPolygon } from './geometry.js';

export const SUM_TOLERANCE = 0.05; // percentage points

const r6 = (x) => Math.round(x * 1e6) / 1e6;

/** Check a composition. Returns {ok, sum, error}. error is a code, not a message. */
export function validate(c, tol = SUM_TOLERANCE) {
  const vals = [c?.sand, c?.silt, c?.clay];
  if (vals.some((v) => typeof v !== 'number' || !Number.isFinite(v))) return { ok: false, error: 'not-a-number' };
  if (vals.some((v) => v < 0)) return { ok: false, error: 'negative' };
  if (vals.some((v) => v > 100)) return { ok: false, error: 'over-100' };
  const sum = vals[0] + vals[1] + vals[2];
  if (Math.abs(sum - 100) > tol) return { ok: false, sum, error: 'sum' };
  return { ok: true, sum };
}

/**
 * Rescale three non-negative values so they sum to 100.
 * Returns {sand, silt, clay, sum} where sum is the original total.
 */
export function normalize({ sand, silt, clay }) {
  const sum = sand + silt + clay;
  if (!(sum > 0)) throw new Error('cannot normalise a zero sum');
  const k = 100 / sum;
  return { sand: sand * k, silt: silt * k, clay: clay * k, sum };
}

/** Vertices of a class polygon in the plane (cached on the class object). */
export function planePoly(cls) {
  if (!cls._plane) {
    Object.defineProperty(cls, '_plane', {
      value: cls.poly.map(([sand, silt, clay]) => toPlane({ sand, silt, clay })),
      enumerable: false,
    });
  }
  return cls._plane;
}

const BOUNDARY_EPS = 1e-6;

/**
 * Classify a composition in a system.
 * Returns {id, cls, boundary: [ids of other classes whose edge the point lies on]}.
 * Throws if the composition is invalid (callers normalise first if they want).
 */
export function classify(system, comp) {
  const v = validate(comp);
  if (!v.ok) {
    const e = new Error(`invalid composition: ${v.error}`);
    e.code = v.error;
    e.sum = v.sum;
    throw e;
  }
  // Remove float noise (e.g. 26.999999999 from a rescale) before comparing to limits.
  const c = { sand: r6(comp.sand), silt: r6(comp.silt), clay: r6(comp.clay) };
  const p = toPlane(c);

  // Classes whose polygon contains the point or whose edge it lies on.
  const touching = system.classes.filter((cls) => distanceToPolygon(p, planePoly(cls)).d <= BOUNDARY_EPS);

  let cls;
  if (system.classes[0].rule) {
    const hits = system.classes.filter((k) => k.rule(c));
    if (hits.length !== 1) {
      // Should never happen for a complete rule set; tests check this.
      throw new Error(`rule set gave ${hits.length} classes for ${JSON.stringify(c)}`);
    }
    cls = hits[0];
  } else {
    const inside = system.classes.filter((k) => pointInPolygon(p, planePoly(k)));
    // On an edge, ray casting may give 0 or 2 hits; fall back to the first
    // touching class in the system's order and report the others.
    cls = inside.length === 1 ? inside[0] : touching[0];
  }
  const boundary = touching.filter((k) => k !== cls).map((k) => k.id);
  return { id: cls.id, cls, boundary };
}

/**
 * Other classes within `maxDist` percentage points of the composition,
 * nearest first. Each entry has the closest composition inside that class
 * and the change needed to get there (rounded to 0.1).
 */
export function neighbours(system, comp, currentId, maxDist = 3) {
  const p = toPlane(comp);
  const out = [];
  for (const cls of system.classes) {
    if (cls.id === currentId) continue;
    const { d, at } = distanceToPolygon(p, planePoly(cls));
    if (d <= maxDist) {
      const to = fromPlane(at);
      out.push({
        id: cls.id,
        distance: d,
        to,
        delta: {
          sand: Math.round((to.sand - comp.sand) * 10) / 10,
          silt: Math.round((to.silt - comp.silt) * 10) / 10,
          clay: Math.round((to.clay - comp.clay) * 10) / 10,
        },
      });
    }
  }
  return out.sort((a, b) => a.distance - b.distance);
}

export function findClass(system, id) {
  return system.classes.find((c) => c.id === id);
}
