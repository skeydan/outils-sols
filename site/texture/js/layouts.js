// Triangle layouts: how a composition maps to the drawing, and where each
// fraction is read. Coordinates are in a 0..100 drawing box (y down) before
// the SVG margins are applied.
//
// equilateral: the USDA / UK / Aisne convention. Sand corner bottom-left,
//   silt corner bottom-right, clay corner at the top. Clay is read on the
//   left edge, silt on the right edge, sand on the bottom edge.
// right: the GEPPA convention, a right-angled triangle with clay on the
//   vertical axis and silt on the horizontal axis; sand is what is left
//   (100 % sand at the right angle).

const H = Math.sqrt(3) / 2;

export const layouts = {
  equilateral: {
    width: 100,
    height: 100 * H,
    project: ({ silt, clay }) => [silt + clay / 2, (100 - clay) * H],
    unproject: ([x, y]) => {
      const clay = 100 - y / H;
      const silt = x - clay / 2;
      return { sand: 100 - silt - clay, silt, clay };
    },
    corners: { sand: [0, 100 * H], silt: [100, 100 * H], clay: [50, 0] },
    // For each fraction: the edge on which it is read, and a composition
    // generator for the point of that edge where the fraction equals v.
    axes: {
      clay: { at: (v) => ({ sand: 100 - v, silt: 0, clay: v }), side: 'left' },
      silt: { at: (v) => ({ sand: 0, silt: v, clay: 100 - v }), side: 'right' },
      sand: { at: (v) => ({ sand: v, silt: 100 - v, clay: 0 }), side: 'bottom' },
    },
    // Reading guide from a point to the axis of each fraction (keep that
    // fraction constant, set the "zero" fraction of that edge to 0).
    guide: {
      clay: (c) => ({ sand: 100 - c.clay, silt: 0, clay: c.clay }),
      silt: (c) => ({ sand: 0, silt: c.silt, clay: 100 - c.silt }),
      sand: (c) => ({ sand: c.sand, silt: 100 - c.sand, clay: 0 }),
    },
    // Iso-lines: for fraction f = v, the segment between two edges.
    iso: {
      clay: (v) => [{ sand: 100 - v, silt: 0, clay: v }, { sand: 0, silt: 100 - v, clay: v }],
      silt: (v) => [{ sand: 100 - v, silt: v, clay: 0 }, { sand: 0, silt: v, clay: 100 - v }],
      sand: (v) => [{ sand: v, silt: 100 - v, clay: 0 }, { sand: v, silt: 0, clay: 100 - v }],
    },
  },
  right: {
    width: 100,
    height: 100,
    project: ({ silt, clay }) => [silt, 100 - clay],
    unproject: ([x, y]) => {
      const clay = 100 - y;
      const silt = x;
      return { sand: 100 - silt - clay, silt, clay };
    },
    corners: { sand: [0, 100], silt: [100, 100], clay: [0, 0] },
    axes: {
      clay: { at: (v) => ({ sand: 100 - v, silt: 0, clay: v }), side: 'left' },
      silt: { at: (v) => ({ sand: 100 - v, silt: v, clay: 0 }), side: 'bottom' },
      sand: { at: (v) => ({ sand: v, silt: (100 - v) / 2, clay: (100 - v) / 2 }), side: 'none' },
    },
    guide: {
      clay: (c) => ({ sand: 100 - c.clay, silt: 0, clay: c.clay }),
      silt: (c) => ({ sand: 100 - c.silt, silt: c.silt, clay: 0 }),
      sand: null,
    },
    iso: {
      clay: (v) => [{ sand: 100 - v, silt: 0, clay: v }, { sand: 0, silt: 100 - v, clay: v }],
      silt: (v) => [{ sand: 100 - v, silt: v, clay: 0 }, { sand: 0, silt: v, clay: 100 - v }],
      sand: (v) => [{ sand: v, silt: 100 - v, clay: 0 }, { sand: v, silt: 0, clay: 100 - v }],
    },
  },
};

/** Clamp an arbitrary (possibly outside) composition back into the triangle. */
export function clampComposition(c) {
  let sand = Math.max(0, c.sand), silt = Math.max(0, c.silt), clay = Math.max(0, c.clay);
  const s = sand + silt + clay;
  if (s <= 0) return { sand: 100, silt: 0, clay: 0 };
  return { sand: (sand * 100) / s, silt: (silt * 100) / s, clay: (clay * 100) / s };
}
