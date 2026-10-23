// Per-class information for the USDA system. Every item names its source
// (ids from sources.js). Texts are our own wording of what the source says.

// Available water capacity, NRCS NEH 652 ch. 2 Table 2-1: in/in range and
// typical in/ft, converted to mm of water per metre of soil
// (in/in x 1000 = mm/m; in/ft / 12 x 1000 = mm/m).
const awc = (lo, hi, typInFt) => ({ range: [lo * 1000, hi * 1000], typical: Math.round((typInFt / 12) * 1000) });
export const AWC = {
  COS: awc(0.01, 0.03, 0.25), S: awc(0.01, 0.03, 0.25), FS: awc(0.05, 0.07, 0.75), VFS: awc(0.05, 0.07, 0.75),
  LCOS: awc(0.06, 0.08, 0.85), LS: awc(0.06, 0.08, 0.85), LFS: awc(0.09, 0.11, 1.25), LVFS: awc(0.10, 0.12, 1.25),
  COSL: awc(0.10, 0.12, 1.3), SL: awc(0.11, 0.13, 1.45), FSL: awc(0.13, 0.15, 1.7), VFSL: awc(0.15, 0.17, 1.9),
  L: awc(0.16, 0.18, 2.0), SIL: awc(0.19, 0.21, 2.4), SI: awc(0.16, 0.18, 2.0), SCL: awc(0.14, 0.16, 1.8),
  CL: awc(0.19, 0.21, 2.4), SICL: awc(0.19, 0.21, 2.4), SC: awc(0.15, 0.17, 1.9), SIC: awc(0.15, 0.17, 1.9),
  C: awc(0.14, 0.16, 1.8),
};
// Subclasses that share the class row name in Table 2-1, for classes
// entered without sand grades.
export const AWC_SUBROWS = { S: ['S', 'FS', 'VFS', 'COS'], LS: ['LS', 'LFS', 'LVFS', 'LCOS'], SL: ['SL', 'FSL', 'VFSL', 'COSL'] };

// FAO-56 Table 19, volumetric water content (m3/m3). Only 9 classes listed.
// "Silty clay" lower field capacity is printed "0-30" (read 0.30).
export const FAO56 = {
  S: { fc: [0.07, 0.17], wp: [0.02, 0.07], taw: [0.05, 0.11] },
  LS: { fc: [0.11, 0.19], wp: [0.03, 0.10], taw: [0.06, 0.12] },
  SL: { fc: [0.18, 0.28], wp: [0.06, 0.16], taw: [0.11, 0.15] },
  L: { fc: [0.20, 0.30], wp: [0.07, 0.17], taw: [0.13, 0.18] },
  SIL: { fc: [0.22, 0.36], wp: [0.09, 0.21], taw: [0.13, 0.19] },
  SI: { fc: [0.28, 0.36], wp: [0.12, 0.22], taw: [0.16, 0.20] },
  SICL: { fc: [0.30, 0.37], wp: [0.17, 0.24], taw: [0.13, 0.18] },
  SIC: { fc: [0.30, 0.42], wp: [0.17, 0.29], taw: [0.13, 0.19] },
  C: { fc: [0.32, 0.40], wp: [0.20, 0.24], taw: [0.12, 0.20] },
};

// Soil Survey Manual Table 3-1 general texture groups.
// VFSL is "medium" although it is a sandy loam subclass.
export const GROUP = { S: 'coarse', LS: 'coarse', SL: 'modCoarse', L: 'medium', SIL: 'medium', SI: 'medium', CL: 'modFine', SCL: 'modFine', SICL: 'modFine', SC: 'fine', SIC: 'fine', C: 'fine' };
export const subGroup = (sub) => (sub === 'VFSL' ? 'medium' : null);

export const DEFINITION = {
  S: { en: 'Sand over 85 %, and silt + 1.5 × clay under 15.', fr: 'Sable supérieur à 85 %, et limon + 1,5 × argile inférieur à 15.' },
  LS: { en: 'Sand 70 to 90 %, silt + 1.5 × clay 15 or more, and silt + 2 × clay under 30.', fr: 'Sable de 70 à 90 %, limon + 1,5 × argile au moins 15, et limon + 2 × argile inférieur à 30.' },
  SL: {
    en: 'Clay 7 to under 20 %, sand over 52 % and silt + 2 × clay 30 or more; or clay under 7 %, silt under 50 % and silt + 2 × clay 30 or more.',
    fr: 'Argile de 7 à moins de 20 %, sable supérieur à 52 % et limon + 2 × argile au moins 30 ; ou argile inférieure à 7 %, limon inférieur à 50 % et limon + 2 × argile au moins 30.',
  },
  L: { en: 'Clay 7 to under 27 %, silt 28 to under 50 %, sand 52 % or less.', fr: 'Argile de 7 à moins de 27 %, limon de 28 à moins de 50 %, sable au plus 52 %.' },
  SIL: { en: 'Silt 50 % or more with clay 12 to under 27 %; or silt 50 to under 80 % with clay under 12 %.', fr: 'Limon au moins 50 % avec argile de 12 à moins de 27 % ; ou limon de 50 à moins de 80 % avec argile inférieure à 12 %.' },
  SI: { en: 'Silt 80 % or more, clay under 12 %.', fr: 'Limon au moins 80 %, argile inférieure à 12 %.' },
  SCL: { en: 'Clay 20 to under 35 %, silt under 28 %, sand over 45 %.', fr: 'Argile de 20 à moins de 35 %, limon inférieur à 28 %, sable supérieur à 45 %.' },
  CL: { en: 'Clay 27 to under 40 %, sand over 20 % and up to 45 %.', fr: 'Argile de 27 à moins de 40 %, sable de plus de 20 % jusqu’à 45 %.' },
  SICL: { en: 'Clay 27 to under 40 %, sand 20 % or less.', fr: 'Argile de 27 à moins de 40 %, sable au plus 20 %.' },
  SC: { en: 'Clay 35 % or more, sand over 45 %.', fr: 'Argile au moins 35 %, sable supérieur à 45 %.' },
  SIC: { en: 'Clay 40 % or more, silt 40 % or more.', fr: 'Argile au moins 40 %, limon au moins 40 %.' },
  C: { en: 'Clay 40 % or more, sand 45 % or less, silt under 40 %.', fr: 'Argile au moins 40 %, sable au plus 45 %, limon inférieur à 40 %.' },
};

// Texture-by-feel flow chart (Thien 1979, as printed in K-State MF2852).
const ball = { en: 'Moist, it does not stay in a ball when squeezed.', fr: 'Humide, elle ne tient pas en boule quand on la serre.' };
const noRibbon = (gritty) => ({
  en: `It holds in a ball but does not form a ribbon, and ${gritty ? 'a gritty feel dominates' : 'it does not feel gritty'}.`,
  fr: `Elle tient en boule mais ne forme pas de ruban, et ${gritty ? 'la sensation rugueuse domine' : 'elle n’est pas rugueuse'}.`,
});
const ribbon = (len, feel) => {
  const L = { short: { en: 'a ribbon of 2.5 cm or less', fr: 'un ruban de 2,5 cm ou moins' }, mid: { en: 'a ribbon of 2.5 to 5 cm', fr: 'un ruban de 2,5 à 5 cm' }, long: { en: 'a ribbon of 5 cm or more', fr: 'un ruban de 5 cm ou plus' } }[len];
  const F = {
    gritty: { en: 'a wet pinch rubbed in the palm feels mostly gritty', fr: 'une pincée mouillée frottée dans la paume est surtout rugueuse' },
    smooth: { en: 'a wet pinch feels mostly smooth', fr: 'une pincée mouillée est surtout douce' },
    neither: { en: 'a wet pinch feels neither mainly gritty nor mainly smooth', fr: 'une pincée mouillée n’est ni surtout rugueuse ni surtout douce' },
  }[feel];
  return { en: `It forms ${L.en} before breaking, and ${F.en}.`, fr: `Elle forme ${L.fr} avant de casser, et ${F.fr}.` };
};
export const FEEL = {
  S: ball, LS: noRibbon(true), SI: noRibbon(false),
  SL: ribbon('short', 'gritty'), SIL: ribbon('short', 'smooth'), L: ribbon('short', 'neither'),
  SCL: ribbon('mid', 'gritty'), SICL: ribbon('mid', 'smooth'), CL: ribbon('mid', 'neither'),
  SC: ribbon('long', 'gritty'), SIC: ribbon('long', 'smooth'), C: ribbon('long', 'neither'),
};

// Field descriptions in NEH 652 ch. 2 (from the USDA soils manual), our wording.
export const FIELD = {
  S: {
    en: 'Loose, single grains you can see and feel. A dry handful falls apart as soon as you open your hand; a moist one keeps its shape but crumbles when touched.',
    fr: 'Grains séparés, visibles et perceptibles au toucher. Une poignée sèche se défait dès qu’on ouvre la main ; humide, elle garde sa forme mais s’effrite au contact.',
  },
  SL: {
    en: 'Mostly sand, with just enough silt and clay to hold together a little. Grains are easy to see and feel. A dry squeezed lump falls apart readily; a moist one survives careful handling.',
    fr: 'Surtout du sable, avec juste assez de limon et d’argile pour un peu de cohésion. Les grains se voient et se sentent. Une motte sèche pressée se défait facilement ; humide, elle supporte d’être manipulée avec précaution.',
  },
  L: {
    en: 'A fairly even mix of sand grades, silt and clay. Crumbly, a little gritty but quite smooth, slightly plastic. A dry squeezed lump survives careful handling; a moist one can be handled freely.',
    fr: 'Un mélange assez équilibré de sables, limon et argile. Friable, un peu rugueux mais assez doux, légèrement plastique. Une motte sèche pressée supporte une manipulation prudente ; humide, on peut la manipuler librement.',
  },
  SIL: {
    en: 'Over half silt, some fine sand, little clay. Dry, it is cloddy but the lumps break easily and feel soft and floury when crushed. Wet, it runs together and puddles. Pinched, it does not ribbon but looks broken.',
    fr: 'Plus de la moitié de limon, un peu de sable fin, peu d’argile. Sec, il forme des mottes qui se cassent facilement et donnent une poudre douce comme de la farine. Mouillé, il se tasse et forme des flaques. Pincé, il ne fait pas de ruban mais un aspect brisé.',
  },
  CL: {
    en: 'Breaks into clods that are hard when dry. Moist and pinched, it makes a thin ribbon that breaks easily and barely carries its own weight. Plastic; kneaded, it turns into a heavy, compact mass.',
    fr: 'Se casse en mottes dures à l’état sec. Humide et pincé, il forme un ruban mince qui casse vite et supporte à peine son propre poids. Plastique ; pétri, il devient une masse lourde et compacte.',
  },
  C: {
    en: 'Very hard lumps when dry; very sticky and plastic when wet. Pinched moist, it makes a long flexible ribbon. Some clays very rich in colloids stay crumbly and are never plastic.',
    fr: 'Mottes très dures à l’état sec ; très collante et plastique à l’état humide. Pincée humide, elle forme un long ruban souple. Certaines argiles très riches en colloïdes restent friables et ne sont jamais plastiques.',
  },
};
