// Information for the French triangles (GEPPA, Aisne). Our wording of the
// cited sources.

// Groups of D. Baize's figures (Les Mots de l'agronomie, INRAE).
export const GEPPA_GROUP = {
  'tf-arg': { fr: 'Très fines · argileuses', en: 'Very fine · clayey', family: 'clay' },
  'f-arglim': { fr: 'Fines · argilo-limoneuses', en: 'Fine · clayey-silty', family: null },
  'f-argsab': { fr: 'Fines · argilo-sableuses', en: 'Fine · clayey-sandy', family: null },
  'm-lim': { fr: 'Moyennes · limoneuses', en: 'Medium · silty (limoneuses)', family: 'silt' },
  'm-sabarg': { fr: 'Moyennes · sablo-argileuses', en: 'Medium · sandy-clayey', family: null },
  'g-sab': { fr: 'Grossières · sableuses', en: 'Coarse · sandy', family: 'sand' },
};
export const AISNE_GROUP = {
  sab: { fr: 'Textures sableuses', en: 'Sandy textures', family: 'sand' },
  'lim-sab': { fr: 'Textures limono-sableuses', en: 'Silty-sandy textures', family: null },
  lim: { fr: 'Textures limoneuses', en: 'Silty textures (limoneuses)', family: 'silt' },
  'arg-sab': { fr: 'Textures argilo-sableuses', en: 'Clayey-sandy textures', family: null },
  arg: { fr: 'Textures argileuses', en: 'Clayey textures', family: 'clay' },
  'tres-arg': { fr: 'Textures très argileuses', en: 'Very clayey textures', family: 'clay' },
};

// Réserve utile (available water) per Aisne class, "méthode de Jamagne"
// (Jamagne et al. 1977), mm of water per cm of soil, with the bulk density
// it assumes. Table of Agriconnaissances "Estimation rapide du RU d'un sol"
// p. 3, same values as A. Brêthes (ONF), AFORCE 2010, slide 11.
export const AISNE_RU = {
  S: [0.7, 1.35], SL: [1.0, 1.40], SA: [1.35, 1.50], LLS: [1.2, 1.50], LS: [1.45, 1.45], LMS: [1.6, 1.45],
  LSA: [1.65, 1.50], LAS: [1.75, 1.45], LL: [1.3, 1.45], LM: [1.75, 1.35], LA: [1.95, 1.40], AS: [1.7, 1.55],
  A: [1.75, 1.45], AL: [1.8, 1.40], ALO: [1.65, 1.50],
};

// Sensitivity to surface crusting (battance), INRA Orléans, as mapped on the
// Aisne triangle in Baize's figure 6.
export const AISNE_BATTANCE = {
  LS: 'high', LMS: 'high', LM: 'high', LLS: 'high', LL: 'high',
  LSA: 'low', LAS: 'low', LA: 'low', SL: 'low',
  S: 'none', SA: 'none', AS: 'none', A: 'none', AL: 'none', ALO: 'none',
};

// Plain-language behaviour of the three families (Académie d'agriculture de
// France, fiche 01.08.Q01, 2024; SupAgro "Texture et travail du sol").
export const FAMILY = {
  clay: {
    fr: 'Un sol très argileux est dit lourd et difficile à travailler. Il est plutôt riche en éléments nutritifs, retenus par les argiles, mais souvent peu aéré, compact et mal drainé. En séchant il se rétracte, forme une croûte et se fend ; il se réchauffe lentement, ce qui retarde la levée au printemps.',
    en: 'A very clayey soil is called heavy and is hard to work. It tends to be rich in nutrients, held by the clay, but is often poorly aerated, compact and slow to drain. When it dries it shrinks, crusts and cracks; it warms up slowly, which delays emergence in spring.',
    src: ['aca'],
  },
  silt: {
    fr: 'Un sol limoneux est souvent difficile à travailler : très sec, les outils n’y pénètrent presque pas. Il se tasse facilement : une pluie juste après le travail du sol remet les limons en suspension, ils bouchent les vides et le sol se referme, sans circulation d’air ni d’eau. Une fois sa structure dégradée (par exemple par des engins trop lourds), il peut mettre des années à se réparer.',
    en: 'A silty soil is often hard to work: when very dry, tools barely get in. It compacts easily: rain just after tillage puts silt back in suspension, it clogs the pores and the soil seals, without air or water movement. Once its structure is damaged (by heavy machinery, say), it can take years to recover.',
    src: ['aca', 'supagro'],
  },
  sand: {
    fr: 'Un sol sableux ou très sableux est léger, se ressuie vite et draine bien, mais craint la sécheresse. Il est facile à travailler, poreux (les racines s’y installent facilement) et peu sensible au passage des engins, mais pauvre en éléments minéraux et usant pour les outils. Le risque de tassement n’est pas nul : il y a toujours un peu de limon ou d’argile.',
    en: 'A sandy or very sandy soil is light, dries out quickly after rain and drains well, but suffers in drought. It is easy to work, porous (roots settle easily) and tolerant of traffic, but poor in mineral nutrients and hard on tools. Compaction is still possible: there is always some silt or clay.',
    src: ['aca', 'supagro'],
  },
};
