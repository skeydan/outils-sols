// UK texture classes, Soil Survey of England and Wales (SSEW) triangle.
// Sand/silt limit 0.06 mm (60 um), silt/clay 0.002 mm.
//
// Vertices: digitised by J. Moeys in the soiltexture R package (CRAN,
// v1.5.3, "UK.SSEW.TT", after Defra Technical Advice Note 52, 2006),
// checked against the AHDB figure "Soil texture classification for mineral
// soils with soil management groupings" (ahdb.org.uk, 2021).
// Abbreviations are this site's own labels for small regions (USDA style).
// Only published as a figure, so points exactly on a line are reported as
// "on the boundary" rather than given to one side by a written rule.

const P = {
  1: [0, 0, 100], 2: [45, 0, 55], 3: [0, 45, 55], 4: [45, 20, 35], 5: [20, 45, 35],
  6: [0, 65, 35], 7: [70, 0, 30], 8: [50, 20, 30], 9: [82, 0, 18], 10: [50, 32, 18],
  11: [20, 62, 18], 12: [0, 82, 18], 13: [85, 0, 15], 14: [90, 0, 10], 15: [100, 0, 0],
  16: [85, 15, 0], 17: [70, 30, 0], 18: [50, 50, 0], 19: [20, 80, 0], 20: [0, 100, 0],
};
const poly = (...ids) => ids.map((i) => P[i]);

export const uk = {
  id: 'uk',
  layout: 'equilateral',
  limits: { clay: 2, silt: 60 },
  classes: [
    { id: 'C', abbr: 'C', poly: poly(1, 2, 4, 5, 3), label: [25, 20, 55], group: 'heavy' },
    { id: 'SC', abbr: 'SC', poly: poly(2, 7, 8, 4), label: [56, 4, 40], group: 'heavy' },
    { id: 'SIC', abbr: 'SiC', poly: poly(3, 5, 6), label: [6, 52, 42], group: 'heavy' },
    { id: 'CL', abbr: 'CL', poly: poly(4, 8, 10, 11, 5), label: [36, 37, 27], group: 'medium' },
    { id: 'SICL', abbr: 'SiCL', poly: poly(5, 11, 12, 6), label: [10, 63, 27], group: 'medium' },
    { id: 'SCL', abbr: 'SCL', poly: poly(7, 9, 10, 8), label: [63, 13, 24], group: 'medium' },
    { id: 'SL', abbr: 'SL', poly: poly(9, 13, 17, 18, 10), label: [67, 23, 10], group: 'light' },
    { id: 'SSIL', abbr: 'SSiL', poly: poly(10, 18, 19, 11), label: [35, 56, 9], group: 'light' },
    { id: 'SIL', abbr: 'SiL', poly: poly(11, 19, 20, 12), label: [9, 82, 9], group: 'light' },
    { id: 'LS', abbr: 'LS', poly: poly(13, 14, 16, 17), label: [82, 12, 6], group: 'light' },
    { id: 'S', abbr: 'S', poly: poly(14, 15, 16), label: [94, 3, 3], group: 'light' },
  ],
};
