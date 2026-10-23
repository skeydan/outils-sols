// Pure geometry helpers for ternary (sand, silt, clay) compositions.
// A composition is an object {sand, silt, clay} in percent (sum = 100).
//
// For distances we use the equilateral triangle with side 100, where moving
// one percentage point from one fraction to another moves the point by
// exactly one unit. So "distance 2" reads as "2 percentage points".

const H = Math.sqrt(3) / 2;

/** Composition -> equilateral plane (sand corner at origin, silt corner at (100,0), clay at the top). */
export function toPlane({ silt, clay }) {
  return [silt + clay / 2, clay * H];
}

/** Equilateral plane -> composition (inverse of toPlane). */
export function fromPlane([x, y]) {
  const clay = y / H;
  const silt = x - clay / 2;
  return { sand: 100 - silt - clay, silt, clay };
}

/** Euclidean distance between two compositions, in percentage points. */
export function distance(a, b) {
  const [ax, ay] = toPlane(a);
  const [bx, by] = toPlane(b);
  return Math.hypot(ax - bx, ay - by);
}

/** Ray-casting point in polygon, in the plane. */
export function pointInPolygon([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Closest point to p on segment ab (all in the plane). */
export function closestOnSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return [a[0] + t * dx, a[1] + t * dy];
}

/**
 * Distance from p to a polygon (0 if inside) and the closest point of the
 * polygon (p itself when inside).
 */
export function distanceToPolygon(p, poly) {
  if (pointInPolygon(p, poly)) return { d: 0, at: p };
  let best = { d: Infinity, at: p };
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const q = closestOnSegment(p, poly[j], poly[i]);
    const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (d < best.d) best = { d, at: q };
  }
  return best;
}

/** Area-weighted centroid of a polygon in the plane. */
export function centroid(poly) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const f = poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
    a += f;
    cx += (poly[j][0] + poly[i][0]) * f;
    cy += (poly[j][1] + poly[i][1]) * f;
  }
  a /= 2;
  return [cx / (6 * a), cy / (6 * a)];
}
