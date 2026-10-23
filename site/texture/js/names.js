// Class names. `official` says in which language the system defines its
// names; the other language is a translation (shown with the official name
// as a gloss).

const N = {
  usda: {
    official: 'en',
    // French: names of the Canadian System of Soil Classification (French
    // edition, 1998, fig. 42), whose class limits are the USDA ones.
    sourced: ['fr'],
    classes: {
      S: { en: 'Sand', fr: 'Sable' },
      LS: { en: 'Loamy sand', fr: 'Sable loameux' },
      SL: { en: 'Sandy loam', fr: 'Loam sableux' },
      L: { en: 'Loam', fr: 'Loam' },
      SIL: { en: 'Silt loam', fr: 'Loam limoneux' },
      SI: { en: 'Silt', fr: 'Limon' },
      SCL: { en: 'Sandy clay loam', fr: 'Loam sablo-argileux' },
      CL: { en: 'Clay loam', fr: 'Loam argileux' },
      SICL: { en: 'Silty clay loam', fr: 'Loam limono-argileux' },
      SC: { en: 'Sandy clay', fr: 'Argile sableuse' },
      SIC: { en: 'Silty clay', fr: 'Argile limoneuse' },
      C: { en: 'Clay', fr: 'Argile' },
    },
  },
  'usda-sub': {
    official: 'en',
    // French: IRDA (Québec), Guide explicatif des séries de sols, 2024, table 9.
    sourced: ['fr'],
    classes: {
      COS: { en: 'Coarse sand', fr: 'Sable grossier' },
      S: { en: 'Sand', fr: 'Sable' },
      FS: { en: 'Fine sand', fr: 'Sable fin' },
      VFS: { en: 'Very fine sand', fr: 'Sable très fin' },
      LCOS: { en: 'Loamy coarse sand', fr: 'Sable grossier loameux' },
      LS: { en: 'Loamy sand', fr: 'Sable loameux' },
      LFS: { en: 'Loamy fine sand', fr: 'Sable fin loameux' },
      LVFS: { en: 'Loamy very fine sand', fr: 'Sable très fin loameux' },
      COSL: { en: 'Coarse sandy loam', fr: 'Loam sableux grossier' },
      SL: { en: 'Sandy loam', fr: 'Loam sableux' },
      FSL: { en: 'Fine sandy loam', fr: 'Loam sableux fin' },
      VFSL: { en: 'Very fine sandy loam', fr: 'Loam sableux très fin' },
    },
  },
  uk: {
    official: 'en',
    // French: our own indicative translations.
    sourced: [],
    classes: {
      S: { en: 'Sand', fr: 'Sable' },
      LS: { en: 'Loamy sand', fr: 'Sable loameux' },
      SL: { en: 'Sandy loam', fr: 'Loam sableux' },
      SSIL: { en: 'Sandy silt loam', fr: 'Loam limoneux sableux' },
      SIL: { en: 'Silt loam', fr: 'Loam limoneux' },
      SCL: { en: 'Sandy clay loam', fr: 'Loam sablo-argileux' },
      CL: { en: 'Clay loam', fr: 'Loam argileux' },
      SICL: { en: 'Silty clay loam', fr: 'Loam limono-argileux' },
      SC: { en: 'Sandy clay', fr: 'Argile sableuse' },
      SIC: { en: 'Silty clay', fr: 'Argile limoneuse' },
      C: { en: 'Clay', fr: 'Argile' },
    },
  },
  geppa: {
    official: 'fr',
    // Names from D. Baize, Les Mots de l'agronomie, figure 3 (after GEPPA 1963).
    // English: our literal translations.
    sourced: [],
    classes: {
      AA: { fr: 'Argile lourde', en: 'Heavy clay' },
      A: { fr: 'Argile', en: 'Clay' },
      Als: { fr: 'Argile limono-sableuse', en: 'Silty-sandy clay' },
      Al: { fr: 'Argile limoneuse', en: 'Silty clay' },
      LAS: { fr: 'Limon argilo-sableux', en: 'Clayey-sandy limon' },
      La: { fr: 'Limon argileux', en: 'Clayey limon' },
      As: { fr: 'Argile sableuse', en: 'Sandy clay' },
      AS: { fr: 'Argilo-sableux', en: 'Clay-sand' },
      Lsa: { fr: 'Limon sablo-argileux', en: 'Sandy-clayey limon' },
      L: { fr: 'Limon', en: 'Limon' },
      Ls: { fr: 'Limon sableux', en: 'Sandy limon' },
      LL: { fr: 'Limon pur', en: 'Pure limon' },
      Sa: { fr: 'Sable argileux', en: 'Clayey sand' },
      Sal: { fr: 'Sable argilo-limoneux', en: 'Clayey-silty sand' },
      Sl: { fr: 'Sable limoneux', en: 'Silty sand' },
      S: { fr: 'Sableux', en: 'Sandy' },
      SS: { fr: 'Sable', en: 'Sand' },
    },
  },
  aisne: {
    official: 'fr',
    // Names from D. Baize, Les Mots de l'agronomie, figure 2 (after Jamagne 1967).
    // English: our literal translations.
    sourced: [],
    classes: {
      S: { fr: 'Sable', en: 'Sand' },
      SL: { fr: 'Sable limoneux', en: 'Silty sand' },
      SA: { fr: 'Sable argileux', en: 'Clayey sand' },
      LLS: { fr: 'Limon léger sableux', en: 'Light sandy limon' },
      LS: { fr: 'Limon sableux', en: 'Sandy limon' },
      LMS: { fr: 'Limon moyen sableux', en: 'Medium sandy limon' },
      LSA: { fr: 'Limon sablo-argileux', en: 'Sandy-clayey limon' },
      LAS: { fr: 'Limon argilo-sableux', en: 'Clayey-sandy limon' },
      LL: { fr: 'Limon léger', en: 'Light limon' },
      LM: { fr: 'Limon moyen', en: 'Medium limon' },
      LA: { fr: 'Limon argileux', en: 'Clayey limon' },
      AS: { fr: 'Argile sableuse', en: 'Sandy clay' },
      A: { fr: 'Argile', en: 'Clay' },
      AL: { fr: 'Argile limoneuse', en: 'Silty clay' },
      ALO: { fr: 'Argile lourde', en: 'Heavy clay' },
    },
  },
};

/**
 * Main name in the UI language: a published name in that language if there
 * is one, else the official name.
 */
export function className(systemId, id, lang) {
  const sys = N[systemId];
  const c = sys?.classes[id];
  if (!c) return id;
  if (lang === sys.official || sys.sourced.includes(lang)) return c[lang] ?? c[sys.official];
  return c[sys.official];
}

/** Second line under the name: the official name, or our translation. */
export function classGloss(systemId, id, lang) {
  const sys = N[systemId];
  const c = sys?.classes[id];
  if (!c) return '';
  const main = className(systemId, id, lang);
  if (lang !== sys.official && sys.sourced.includes(lang)) {
    if (c[sys.official] === main) return '';
    return { en: `Official name: ${c[sys.official]}`, fr: `Nom officiel : ${c[sys.official]}` }[lang];
  }
  const tr = c[lang];
  if (lang !== sys.official && tr && tr !== main) {
    return { en: `Literal translation: ${tr.toLowerCase()}`, fr: `Traduction indicative : ${tr.toLowerCase()}` }[lang];
  }
  return '';
}

export function officialLang(systemId) {
  return N[systemId]?.official;
}
