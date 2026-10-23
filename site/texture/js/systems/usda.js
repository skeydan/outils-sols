// USDA soil texture classes.
//
// Source: Soil Science Division Staff (2017). Soil Survey Manual. USDA
// Handbook 18, chapter 3, "Definitions of Soil Texture Classes and
// Subclasses", pp. 122-124. Sand/silt limit 0.05 mm, silt/clay 0.002 mm.
//
// `rule` implements the printed definitions literally (including which side
// of each limit is "or more" / "less than"), so points exactly on a line get
// the class the manual gives them. `poly` (sand, silt, clay vertices) is
// derived from the same definitions and is only used for drawing and for
// distances to neighbouring classes. Abbreviations are the NRCS symbols
// (National Engineering Handbook part 652, ch. 2, table 2-5).

export const usda = {
  id: 'usda',
  layout: 'equilateral',
  limits: { clay: 2, silt: 50 }, // upper size limits in micrometres
  classes: [
    {
      id: 'C', abbr: 'C',
      rule: ({ sand, silt, clay }) => clay >= 40 && sand <= 45 && silt < 40,
      poly: [[45, 15, 40], [20, 40, 40], [0, 40, 60], [0, 0, 100], [45, 0, 55]],
      label: [22, 20, 58],
    },
    {
      id: 'SIC', abbr: 'SIC',
      rule: ({ silt, clay }) => clay >= 40 && silt >= 40,
      poly: [[20, 40, 40], [0, 60, 40], [0, 40, 60]],
      label: [6.5, 47, 46.5],
    },
    {
      id: 'SC', abbr: 'SC',
      rule: ({ sand, clay }) => clay >= 35 && sand > 45,
      poly: [[65, 0, 35], [45, 20, 35], [45, 0, 55]],
      label: [52, 7, 41],
    },
    {
      id: 'SICL', abbr: 'SICL',
      rule: ({ sand, clay }) => clay >= 27 && clay < 40 && sand <= 20,
      poly: [[20, 53, 27], [0, 73, 27], [0, 60, 40], [20, 40, 40]],
      label: [10, 56.5, 33.5],
    },
    {
      id: 'CL', abbr: 'CL',
      rule: ({ sand, clay }) => clay >= 27 && clay < 40 && sand > 20 && sand <= 45,
      poly: [[45, 28, 27], [20, 53, 27], [20, 40, 40], [45, 15, 40]],
      label: [32.5, 34, 33.5],
    },
    {
      id: 'SCL', abbr: 'SCL',
      rule: ({ sand, silt, clay }) => clay >= 20 && clay < 35 && silt < 28 && sand > 45,
      poly: [[80, 0, 20], [52, 28, 20], [45, 28, 27], [45, 20, 35], [65, 0, 35]],
      label: [60, 13, 27],
    },
    {
      id: 'L', abbr: 'L',
      rule: ({ sand, silt, clay }) => clay >= 7 && clay < 27 && silt >= 28 && silt < 50 && sand <= 52,
      poly: [[52, 41, 7], [43, 50, 7], [23, 50, 27], [45, 28, 27], [52, 28, 20]],
      label: [42, 40, 18],
    },
    {
      id: 'SIL', abbr: 'SIL',
      rule: ({ silt, clay }) => (silt >= 50 && clay >= 12 && clay < 27) || (silt >= 50 && silt < 80 && clay < 12),
      poly: [[50, 50, 0], [20, 80, 0], [8, 80, 12], [0, 88, 12], [0, 73, 27], [23, 50, 27]],
      label: [22, 64, 14],
    },
    {
      id: 'SI', abbr: 'SI',
      rule: ({ silt, clay }) => silt >= 80 && clay < 12,
      poly: [[20, 80, 0], [0, 100, 0], [0, 88, 12], [8, 80, 12]],
      label: [7, 88, 5],
    },
    {
      id: 'SL', abbr: 'SL',
      rule: ({ sand, silt, clay }) =>
        (clay >= 7 && clay < 20 && sand > 52 && silt + 2 * clay >= 30) ||
        (clay < 7 && silt < 50 && silt + 2 * clay >= 30),
      poly: [[80, 0, 20], [85, 0, 15], [70, 30, 0], [50, 50, 0], [43, 50, 7], [52, 41, 7], [52, 28, 20]],
      label: [63, 27, 10],
    },
    {
      id: 'LS', abbr: 'LS',
      rule: ({ sand, silt, clay }) => sand >= 70 && sand <= 90 && silt + 1.5 * clay >= 15 && silt + 2 * clay < 30,
      poly: [[85, 15, 0], [70, 30, 0], [85, 0, 15], [90, 0, 10]],
      label: [81, 14, 5],
    },
    {
      id: 'S', abbr: 'S',
      rule: ({ sand, silt, clay }) => sand > 85 && silt + 1.5 * clay < 15,
      poly: [[100, 0, 0], [85, 15, 0], [90, 0, 10]],
      label: [93, 4, 3],
    },
  ],
};

// Sand subclasses (Soil Survey Manual 2017, pp. 122-124). Inputs are the
// sand grades in percent of the fine earth (< 2 mm): vcs (2-1 mm),
// cs (1-0.5), ms (0.5-0.25), fs (0.25-0.10), vfs (0.10-0.05 mm).
// Each function returns a subclass id or null. The manual's "OR" branches
// are kept as written; where they overlap, the order below decides (same
// order as the manual).

export function sandSubclass(g) {
  const { vcs, cs, ms, fs, vfs } = g;
  const vc_c = vcs + cs;
  const vc_c_m = vcs + cs + ms;
  if (vc_c >= 25 && ms < 50 && fs < 50 && vfs < 50) return 'COS';
  if ((vc_c_m >= 25 && vc_c < 25 && fs < 50 && vfs < 50) || (vc_c >= 25 && ms >= 50)) return 'S';
  if ((fs >= 50 && fs > vfs) || (vc_c_m < 25 && vfs < 50)) return 'FS';
  if (vfs >= 50) return 'VFS';
  return null;
}

export function loamySandSubclass(g) {
  const { vcs, cs, ms, fs, vfs } = g;
  const vc_c = vcs + cs;
  const vc_c_m = vcs + cs + ms;
  if (vc_c >= 25 && ms < 50 && fs < 50 && vfs < 50) return 'LCOS';
  if ((vc_c_m >= 25 && vc_c < 25 && fs < 50 && vfs < 50) || (vc_c >= 25 && ms >= 50)) return 'LS';
  // Printed: "50 percent or more fine sand or less than 50 percent very fine
  // sand and a total of less than 25 percent very coarse, coarse, and medium sand."
  if (fs >= 50 || (vfs < 50 && vc_c_m < 25)) return 'LFS';
  if (vfs >= 50) return 'LVFS';
  return null;
}

export function sandyLoamSubclass(g) {
  const { vcs, cs, ms, fs, vfs } = g;
  const vc_c = vcs + cs;
  const vc_c_m = vcs + cs + ms;
  const f_vf = fs + vfs;
  if ((vc_c >= 25 && ms < 50 && fs < 50 && vfs < 50) || (vc_c_m >= 30 && vfs >= 30 && vfs < 50)) return 'COSL';
  if (
    (vc_c_m >= 30 && vc_c < 25 && fs < 30 && vfs < 30) ||
    (vc_c_m <= 15 && fs < 30 && vfs < 30 && f_vf <= 40) ||
    (vc_c >= 25 && ms >= 50)
  ) return 'SL';
  if (
    (fs >= 30 && vfs < 30 && vc_c < 25) ||
    (vc_c_m >= 15 && vc_c_m < 30 && vc_c < 25) ||
    (f_vf >= 40 && fs >= vfs && vc_c_m <= 15) ||
    (vc_c >= 25 && fs >= 50)
  ) return 'FSL';
  if (
    (vfs >= 30 && vc_c_m < 15 && vfs > fs) ||
    (f_vf >= 40 && vfs > fs && vc_c_m < 15) ||
    (vfs >= 50 && vc_c >= 25) ||
    (vc_c_m >= 30 && vfs >= 50)
  ) return 'VFSL';
  return null;
}

/** Subclass for a USDA class id, or null when the class has no subclasses or grades are missing. */
export function usdaSubclass(classId, grades) {
  if (!grades) return null;
  if (classId === 'S') return sandSubclass(grades);
  if (classId === 'LS') return loamySandSubclass(grades);
  if (classId === 'SL') return sandyLoamSubclass(grades);
  return null;
}
