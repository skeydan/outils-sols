// French GEPPA texture triangle (Groupe d'étude des problèmes de pédologie
// appliquée, 1963), 17 classes. Right-angled triangle: clay on the vertical
// axis, silt (2-50 um) on the horizontal axis, sand = 100 - clay - silt.
//
// Vertices: digitised by J. Moeys (soiltexture R package, CRAN v1.5.3,
// "FR.GEPPA.TT", after Baize & Jabiol 1995 via sols-de-bretagne.fr), checked
// against D. Baize, "Granulométrie et diagrammes de texture", Les Mots de
// l'agronomie (INRAE), figure 3: clay limits 60/55, 45/37.5, 32.5/27.5,
// 22.5/17.5, 12.5/7.5, 7.5/3.33 and silt limits 25, 45 and 75 match.
// No numeric definition is published, so points on a line are "on the
// boundary". Codes are case-sensitive (As and AS are different classes).

const P = {
  1: [0, 0, 100], 2: [40, 0, 60], 3: [0, 45, 55], 4: [55, 0, 45], 5: [37.4, 20, 42.6],
  6: [14.05109, 46.53285, 39.41606], 7: [0, 62.5, 37.5], 8: [67.5, 0, 32.5], 9: [44.22414, 25, 30.77586],
  10: [17.01109, 54.22883, 28.76008], 11: [0, 72.5, 27.5], 12: [77.5, 0, 22.5], 13: [54.01515, 25, 20.98485],
  14: [44.48225, 35.14793, 20.36982], 15: [19.78433, 61.43926, 18.77641], 16: [0, 82.5, 17.5], 17: [87.5, 0, 12.5],
  18: [63.85135, 25, 11.14865], 19: [49.66216, 40, 10.33784], 20: [22.558593, 68.652344, 8.789063], 21: [0, 92.5, 7.5],
  22: [92.5, 0, 7.5], 23: [71.666667, 25, 3.333333], 24: [100, 0, 0], 25: [75, 25, 0], 26: [55, 45, 0],
  27: [25, 75, 0], 28: [0, 100, 0],
};
// Fix the last digits so every vertex sums to exactly 100.
for (const k of Object.keys(P)) { const [sa, si, c] = P[k]; P[k] = [100 - si - c, si, c]; }
const poly = (...ids) => ids.map((i) => P[i]);

// group: the six groups of Baize's figure 3 (very fine ... coarse).
export const geppa = {
  id: 'geppa',
  layout: 'right',
  limits: { clay: 2, silt: 50 },
  classes: [
    { id: 'AA', abbr: 'AA', poly: poly(1, 2, 3), group: 'tf-arg' },
    { id: 'A', abbr: 'A', poly: poly(2, 4, 5, 6, 7, 3), group: 'tf-arg' },
    { id: 'As', abbr: 'As', poly: poly(4, 8, 9, 5), group: 'f-argsab' },
    { id: 'Als', abbr: 'Als', poly: poly(5, 9, 10, 6), group: 'f-arglim' },
    { id: 'Al', abbr: 'Al', poly: poly(6, 10, 11, 7), group: 'f-arglim' },
    { id: 'AS', abbr: 'AS', poly: poly(8, 12, 13, 9), group: 'f-argsab' },
    { id: 'LAS', abbr: 'LAS', poly: poly(9, 13, 14, 15, 10), group: 'f-arglim' },
    { id: 'La', abbr: 'La', poly: poly(10, 15, 16, 11), group: 'f-arglim' },
    { id: 'Sa', abbr: 'Sa', poly: poly(12, 17, 18, 13), group: 'm-sabarg' },
    { id: 'Sal', abbr: 'Sal', poly: poly(13, 18, 19, 14), group: 'm-sabarg' },
    { id: 'Lsa', abbr: 'Lsa', poly: poly(14, 19, 20, 15), group: 'm-lim' },
    { id: 'L', abbr: 'L', poly: poly(15, 20, 21, 16), group: 'm-lim' },
    { id: 'S', abbr: 'S', poly: poly(17, 22, 23, 18), group: 'g-sab' },
    { id: 'SS', abbr: 'SS', poly: poly(22, 24, 25, 23), group: 'g-sab' },
    { id: 'Sl', abbr: 'Sl', poly: poly(18, 23, 25, 26, 19), group: 'g-sab' },
    { id: 'Ls', abbr: 'Ls', poly: poly(19, 26, 27, 20), group: 'm-lim' },
    { id: 'LL', abbr: 'LL', poly: poly(20, 27, 28, 21), group: 'm-lim' },
  ],
};
