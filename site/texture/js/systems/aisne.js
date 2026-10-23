// French Aisne texture triangle (soil survey of the Aisne department,
// Jamagne 1967, modified to separate LS and LMS), 15 classes.
//
// Vertices: digitised by J. Moeys (soiltexture R package, CRAN v1.5.3,
// "FR.AISNE.TT", after Baize & Jabiol 1995 and Jamagne 1967), checked against
// D. Baize, "Granulométrie et diagrammes de texture", Les Mots de
// l'agronomie (INRAE), figure 2: clay limits 7.5, 17.5, 30 and 45 % (with
// the step at 25 % on the sandy side) and the sand limits match.
// Only published as a figure: points on a line are "on the boundary".

const P = {
  1: [55, 0, 45], 2: [45, 10, 45], 3: [20, 35, 45], 4: [0, 55, 45], 5: [75, 0, 25], 6: [55, 20, 25],
  7: [45, 25, 30], 8: [35, 35, 30], 9: [20, 50, 30], 10: [0, 70, 30], 11: [90, 0, 10], 12: [80, 10, 10],
  13: [77.5, 10, 12.5], 14: [55, 32.5, 12.5], 15: [55, 27.5, 17.5], 16: [35, 47.5, 17.5], 17: [15, 67.5, 17.5],
  18: [0, 82.5, 17.5], 19: [100, 0, 0], 20: [80, 20, 0], 21: [55, 37.5, 7.5], 22: [35, 57.5, 7.5],
  23: [15, 77.5, 7.5], 24: [0, 92.5, 7.5], 25: [55, 45, 0], 26: [15, 85, 0], 27: [0, 100, 0], 28: [0, 0, 100],
  29: [15, 55, 30],
};
const poly = (...ids) => ids.map((i) => P[i]);

// group: textures of Baize's figure 2 (sableuses ... très argileuses).
export const aisne = {
  id: 'aisne',
  layout: 'equilateral',
  limits: { clay: 2, silt: 50 },
  classes: [
    { id: 'ALO', abbr: 'ALO', poly: poly(28, 1, 4), group: 'tres-arg' },
    { id: 'A', abbr: 'A', poly: poly(2, 7, 9, 3), group: 'arg' },
    { id: 'AL', abbr: 'AL', poly: poly(3, 9, 10, 4), group: 'arg' },
    { id: 'AS', abbr: 'AS', poly: poly(1, 5, 6, 7, 2), group: 'arg-sab' },
    { id: 'LA', abbr: 'LA', poly: poly(29, 17, 18, 10), group: 'lim' },
    { id: 'LAS', abbr: 'LAS', poly: poly(8, 16, 17, 29, 9), group: 'lim-sab' },
    { id: 'LSA', abbr: 'LSA', poly: poly(7, 6, 15, 16, 8), group: 'lim-sab' },
    { id: 'SA', abbr: 'SA', poly: poly(5, 11, 12, 13, 14, 15, 6), group: 'sab' },
    { id: 'LM', abbr: 'LM', poly: poly(17, 23, 24, 18), group: 'lim' },
    { id: 'LMS', abbr: 'LMS', poly: poly(16, 22, 23, 17), group: 'lim-sab' },
    { id: 'LS', abbr: 'LS', poly: poly(15, 14, 21, 22, 16), group: 'lim-sab' },
    { id: 'SL', abbr: 'SL', poly: poly(13, 12, 20, 25, 21, 14), group: 'sab' },
    { id: 'S', abbr: 'S', poly: poly(11, 19, 20, 12), group: 'sab' },
    { id: 'LL', abbr: 'LL', poly: poly(23, 26, 27, 24), group: 'lim' },
    { id: 'LLS', abbr: 'LLS', poly: poly(21, 25, 26, 23, 22), group: 'lim-sab' },
  ],
};
