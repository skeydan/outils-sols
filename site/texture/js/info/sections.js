// Information cards per classification system.

import { h, card, fact, cite, L } from './render.js';
import { AWC, AWC_SUBROWS, FAO56, GROUP, subGroup, DEFINITION, FEEL, FIELD } from './usda.js';
import { UK_FEEL, UK_GROUP_TEXT } from './uk.js';
import { className } from '../names.js';
import { fmt } from '../triangle.js';
import { GEPPA_GROUP, AISNE_GROUP, AISNE_RU, AISNE_BATTANCE, FAMILY } from './fr.js';

const T = (lang, en, fr) => (lang === 'fr' ? fr : en);
const num = (x, lang) => (lang === 'fr' ? fmt(x).replace('.', ',') : fmt(x));
const range = (a, b, lang, unit = '') => `${num(a, lang)}–${num(b, lang)}${unit}`;

export function sectionsFor(ctx) {
  const { system } = ctx;
  if (system.id === 'usda') return usdaSections(ctx);
  if (system.id === 'uk') return ukSections(ctx);
  if (system.id === 'geppa' || system.id === 'aisne') return frSections(ctx);
  if (system.sections) return system.sections(ctx);
  return [];
}

// ------------------------------------------------------------------ USDA

const GROUP_NAME = {
  coarse: { en: 'Coarse textured (sandy soil materials)', fr: 'Texture grossière (matériaux sableux)' },
  modCoarse: { en: 'Moderately coarse textured (loamy soil materials)', fr: 'Texture modérément grossière (matériaux loameux)' },
  medium: { en: 'Medium textured (loamy soil materials)', fr: 'Texture moyenne (matériaux loameux)' },
  modFine: { en: 'Moderately fine textured (loamy soil materials)', fr: 'Texture modérément fine (matériaux loameux)' },
  fine: { en: 'Fine textured (clayey soil materials)', fr: 'Texture fine (matériaux argileux)' },
};

function usdaSections(ctx) {
  const { result, subclass, comp, lang } = ctx;
  const id = result.id;
  const name = className('usda', id, lang);
  const group = subGroup(subclass) ?? GROUP[id];
  const subName = subclass ? className('usda-sub', subclass, lang) : null;

  // About the class.
  const about = [
    ...fact(T(lang, 'Definition', 'Définition'), L(DEFINITION[id], lang), ['ssm']),
    ...fact(T(lang, 'Texture group', 'Groupe de texture'), L(GROUP_NAME[group], lang) + (subclass === 'VFSL' ? T(lang, ' (very fine sandy loams are grouped with medium textures).', ' (les loams sableux très fins sont classés en texture moyenne).') : '.'), ['ssm']),
    ...fact(T(lang, 'By feel', 'Au toucher'), L(FEEL[id], lang), ['thien']),
  ];
  if (FIELD[id]) about.push(...fact(T(lang, 'In the hand', 'Dans la main'), L(FIELD[id], lang), ['neh652']));
  if (['S', 'LS', 'SL'].includes(id)) {
    about.push(
      ...fact(
        T(lang, 'Subclasses', 'Sous-classes'),
        subclass
          ? T(lang, `With your sand grades: ${subName}.`, `D’après vos sables détaillés : ${subName}.`)
          : T(lang, 'This class is split by the size of its sand grains (coarse, fine, very fine…). Enter the sand grades in “Your sample” to get the subclass.', 'Cette classe se subdivise selon la taille des grains de sable (grossier, fin, très fin…). Saisissez les sables détaillés dans « Votre échantillon » pour obtenir la sous-classe.'),
        ['ssm']
      )
    );
  }
  about.push(...fact(T(lang, 'French names', 'Noms français'), T(lang, 'French names on this page are those of the Canadian System of Soil Classification, which uses the same class limits as the USDA. In France, “limon” also names the 2–50 µm fraction, so “loam” is kept.', 'Les noms français sont ceux du Système canadien de classification des sols, qui a les mêmes limites de classes que l’USDA. En France, « limon » désigne aussi la fraction 2–50 µm : le mot « loam » est donc conservé.'), ['cssc', 'quebec', 'irda']));
  const c1 = card(T(lang, `About “${name}”`, `À propos : « ${name} »`), h('dl', { class: 'facts' }, ...about));

  // Water.
  const water = [];
  const rowIds = subclass ? [subclass] : AWC_SUBROWS[id] ?? [id];
  const main = AWC[rowIds[0]];
  water.push(
    ...fact(
      T(lang, 'Available water capacity (typical)', 'Réserve utile (valeurs types)'),
      [
        h('span', { text: T(lang, `${range(main.range[0], main.range[1], lang)} mm of water per metre of soil (typical ${main.typical}).`, `${range(main.range[0], main.range[1], lang)} mm d’eau par mètre de sol (valeur type ${main.typical}).`) }),
        waterBar(main.range, lang),
        h('span', { class: 'muted', text: T(lang, ` In a 30 cm root zone: about ${range(main.range[0] * 0.3, main.range[1] * 0.3, lang)} mm.`, ` Sur 30 cm de racines : environ ${range(main.range[0] * 0.3, main.range[1] * 0.3, lang)} mm.`) }),
        rowIds.length > 1 ? h('span', { class: 'muted', text: ' ' + T(lang, 'Other subclasses: ', 'Autres sous-classes : ') + rowIds.slice(1).map((r) => `${className('usda-sub', r, lang).toLowerCase()} ${range(AWC[r].range[0], AWC[r].range[1], lang)}`).join(', ') + ' mm/m.' }) : null,
      ],
      ['neh652']
    )
  );
  const fao = FAO56[id];
  if (fao) {
    water.push(
      ...fact(
        T(lang, 'Field capacity and wilting point', 'Capacité au champ et point de flétrissement'),
        T(
          lang,
          `Water content at field capacity ${range(fao.fc[0] * 100, fao.fc[1] * 100, lang)} % by volume, at wilting point ${range(fao.wp[0] * 100, fao.wp[1] * 100, lang)} %; available between the two: ${range(fao.taw[0] * 1000, fao.taw[1] * 1000, lang)} mm per metre.`,
          `Teneur en eau à la capacité au champ ${range(fao.fc[0] * 100, fao.fc[1] * 100, lang)} % en volume, au point de flétrissement ${range(fao.wp[0] * 100, fao.wp[1] * 100, lang)} % ; disponible entre les deux : ${range(fao.taw[0] * 1000, fao.taw[1] * 1000, lang)} mm par mètre.`
        ),
        ['fao56']
      )
    );
  }
  water.push(
    h('dd', { class: 'small muted' }, T(lang, 'These are averages for the class. Structure, organic matter, stones and salts change them; NRCS gives corrections for stones and salinity.', 'Ce sont des moyennes de classe. La structure, la matière organique, les cailloux et les sels les modifient ; le NRCS donne des corrections pour les cailloux et la salinité.'), ' ', ...cite('neh652'))
  );
  const c2 = card(T(lang, 'Water', 'Eau'), h('dl', { class: 'facts' }, ...water));

  // Garden and field.
  const notes = [];
  const coarse = id === 'S' || id === 'LS';
  if (coarse) {
    notes.push(
      ...fact(T(lang, 'Watering', 'Arrosage'), T(lang, 'Holds little water and few nutrients. Plants do not need more water here, but they need it more often and in smaller amounts: heavy watering drains below the roots and takes soluble nutrients such as nitrogen with it.', 'Retient peu d’eau et peu d’éléments nutritifs. Les plantes n’ont pas besoin de plus d’eau, mais plus souvent et en plus petites quantités : un gros arrosage file sous les racines et entraîne les éléments solubles comme l’azote.'), ['csu']),
      ...fact(T(lang, 'Improving it', 'L’améliorer'), T(lang, 'Add organic matter regularly: it holds ten times or more the water and nutrients of sand. A sandy soil with 4–5 % organic matter makes a very good garden soil.', 'Apportez régulièrement de la matière organique : elle retient dix fois plus d’eau et d’éléments nutritifs que le sable, voire davantage. Un sol sableux à 4–5 % de matière organique fait une excellente terre de jardin.'), ['csu']),
      ...fact(T(lang, 'Irrigation', 'Irrigation'), T(lang, 'Sands and loamy sands have a high intake rate, a limitation for surface irrigation (basins, borders, furrows).', 'Les sables et sables loameux absorbent l’eau vite, ce qui limite l’irrigation de surface (bassins, planches, raies).'), ['neh652'])
    );
  }
  if (comp.clay >= 20) {
    notes.push(
      ...fact(T(lang, 'Already clayey in behaviour', 'Déjà argileux dans son comportement'), T(lang, `With ${num(comp.clay, lang)} % clay: from about 20 % clay, a soil already behaves like a sticky clay soil. Clayey soils lack large pores, so water and air move slowly and the soil waterlogs easily after rain or irrigation.`, `Avec ${num(comp.clay, lang)} % d’argile : dès 20 % d’argile environ, un sol se comporte déjà comme un sol argileux collant. Les sols argileux manquent de gros pores : l’eau et l’air circulent lentement et le sol s’engorge facilement après la pluie ou l’arrosage.`), ['csu']),
      ...fact(T(lang, 'Improving it', 'L’améliorer'), T(lang, 'Organic matter every year and care for soil life (earthworms, microbes), which bind particles into crumbs over several years; one big application is not enough. Do not add sand: unless the clay drops well below 20 %, it does not help and can give a concrete-like soil.', 'De la matière organique chaque année et un sol vivant (vers de terre, microbes), qui assemblent les particules en agrégats sur plusieurs années ; un seul gros apport ne suffit pas. N’ajoutez pas de sable : sauf à faire tomber l’argile bien en dessous de 20 %, cela n’aide pas et peut donner un sol comme du béton.'), ['csu']),
      ...fact(T(lang, 'Compaction', 'Tassement'), T(lang, 'Wet soil compacts most easily: do not work it wet, keep walking to paths, and keep beds mulched.', 'Un sol humide se tasse le plus facilement : ne le travaillez pas mouillé, circulez sur des allées, gardez les planches paillées.'), ['csu'])
    );
  }
  if (id === 'SIC' || id === 'C') {
    notes.push(...fact(T(lang, 'Irrigation', 'Irrigation'), T(lang, 'Silty clays and clays take water in slowly, a limitation for level basins and centre pivots.', 'Les argiles limoneuses et les argiles absorbent l’eau lentement, ce qui limite l’irrigation par bassins et par pivot.'), ['neh652']));
  }
  if (!coarse && comp.clay < 20) {
    notes.push(...fact(T(lang, 'In the hand', 'Dans la main'), T(lang, 'Medium textured soils such as sandy loams and silt loams hold together when squeezed but change shape easily; coarse ones crumble, fine ones resist.', 'Les sols de texture moyenne comme les loams sableux et limoneux tiennent quand on les serre mais se déforment facilement ; les grossiers s’effritent, les fins résistent.'), ['csu']));
  }
  notes.push(h('dt', { text: T(lang, 'Coarse, medium, fine: what changes', 'Grossier, moyen, fin : ce qui change') }), h('dd', {}, compareTable(group, lang), ...cite('thien')));
  const c3 = card(T(lang, 'In the garden and the field', 'Au jardin et aux champs'), h('dl', { class: 'facts' }, ...notes));

  return [c1, c2, c3, aboutCard(ctx)];
}

function waterBar([lo, hi], lang) {
  const max = 250;
  const track = h('div', { class: 'track' }, h('div', { class: 'range', style: `left:${(lo / max) * 100}%;width:${Math.max(1.5, ((hi - lo) / max) * 100)}%` }));
  return h('div', { class: 'water-bar', 'aria-hidden': 'true' }, track, h('div', { class: 'axis' }, h('span', { text: '0' }), h('span', { text: '100' }), h('span', { text: '200' }), h('span', { text: lang === 'fr' ? '250 mm/m' : '250 mm/m' })));
}

function compareTable(group, lang) {
  // K-State MF2852 "Soil properties related to texture" (coarse / medium / fine).
  const rows = [
    [T(lang, 'Water storage', 'Stockage de l’eau'), 'low', 'medium', 'high'],
    [T(lang, 'Power needed for digging or tillage', 'Effort pour bêcher ou travailler'), 'low', 'medium', 'high'],
    [T(lang, 'Erosion: ease of detaching particles', 'Érosion : facilité d’arrachement'), 'high', 'medium', 'low'],
    [T(lang, 'Erosion: ease of transport', 'Érosion : facilité de transport'), 'low', 'medium', 'high'],
    [T(lang, 'Nutrient storage', 'Stockage des éléments nutritifs'), 'low', 'medium', 'high'],
    [T(lang, 'Movement of contaminants', 'Déplacement des polluants'), 'high', 'medium', 'low'],
  ];
  const word = { low: T(lang, 'low', 'faible'), medium: T(lang, 'medium', 'moyen'), high: T(lang, 'high', 'élevé') };
  const col = { coarse: [1], modCoarse: [1, 2], medium: [2], modFine: [2, 3], fine: [3] }[group];
  const head = [T(lang, 'Coarse', 'Grossière'), T(lang, 'Medium', 'Moyenne'), T(lang, 'Fine', 'Fine')];
  const table = h(
    'table',
    { class: 'compare' },
    h('thead', {}, h('tr', {}, h('th', { text: '' }), ...head.map((x, i) => h('th', { class: col.includes(i + 1) ? 'hl' : '', text: x })))),
    h('tbody', {}, ...rows.map((r) => h('tr', {}, h('td', { text: r[0] }), ...[1, 2, 3].map((i) => h('td', { class: col.includes(i) ? 'hl' : '', text: word[r[i]] })))))
  );
  const between = col.length === 2;
  return h('div', {}, table, between ? h('p', { class: 'small muted', text: T(lang, 'Your class is in an intermediate group, between the two highlighted columns.', 'Votre classe est dans un groupe intermédiaire, entre les deux colonnes surlignées.') }) : null);
}

// ------------------------------------------------------------------ UK

function ukSections(ctx) {
  const { result, lang, system } = ctx;
  const id = result.id;
  const name = className('uk', id, lang);
  const cls = system.classes.find((c) => c.id === id);
  const g = UK_GROUP_TEXT[cls.group];
  const about = [
    ...fact(T(lang, 'Management group', 'Groupe de gestion'), L(g.name, lang), ['ahdb-texture']),
    ...fact(T(lang, 'By hand', 'À la main'), L(UK_FEEL[id], lang), ['ahdb-texture']),
    ...fact(T(lang, 'Class limits', 'Limites de la classe'), T(lang, 'Drawn from the published triangle (no written definition is given there).', 'Tracées d’après le triangle publié (qui ne donne pas de définition écrite).'), ['moeys', 'ahdb-texture']),
    ...(lang === 'fr' ? fact('Noms', 'Les noms officiels sont anglais ; les traductions indiquées sont les nôtres.', []) : []),
  ];
  const c1 = card(T(lang, `About “${name}”`, `À propos : « ${name} »`), h('dl', { class: 'facts' }, ...about));
  const mgmt = [];
  for (const part of g.points) mgmt.push(...fact(L(part.title, lang), L(part.text, lang), ['ahdb-principles']));
  const c2 = card(T(lang, `${L(g.short, lang)}: soil health principles`, `${L(g.short, lang)} : principes de gestion`), h('dl', { class: 'facts' }, ...mgmt));
  return [c1, c2, aboutCard(ctx)];
}

// ------------------------------------------------------------------ France

function frSections(ctx) {
  const { system, result, comp, lang } = ctx;
  const id = result.id;
  const isAisne = system.id === 'aisne';
  const cls = system.classes.find((c) => c.id === id);
  const groups = isAisne ? AISNE_GROUP : GEPPA_GROUP;
  const g = groups[cls.group];
  const name = className(system.id, id, lang);

  const about = [
    ...fact(T(lang, 'Group', 'Groupe'), L(g, lang), ['baize']),
    ...fact(
      T(lang, 'This triangle', 'Ce triangle'),
      isAisne
        ? T(lang, 'Built for the soil map of the Aisne department from 3,000 local samples. It first had 14 classes, then 15 when sandy limon (LS) and medium sandy limon (LMS) were separated.', 'Établi pour la carte des sols de l’Aisne à partir de 3 000 échantillons du département. Il comptait d’abord 14 classes, puis 15 avec la séparation du limon sableux (LS) et du limon moyen sableux (LMS).')
        : T(lang, 'Published in 1963 with 17 classes, built from what the hand feels on 150 samples. It is usually drawn as a right-angled triangle: clay up, silt across, and sand read by difference (sand = 100 − clay − silt).', 'Publié en 1963 avec 17 classes, établi d’après les sensations tactiles sur 150 prélèvements. On le dessine le plus souvent en triangle rectangle : argile en hauteur, limons en largeur, et le sable se déduit par différence (sable = 100 − argile − limons).'),
      ['richer2008']
    ),
    ...fact(T(lang, 'Class limits', 'Limites des classes'), T(lang, 'Drawn from the published figure; no written definition exists.', 'Tracées d’après la figure publiée ; il n’existe pas de définition écrite.'), ['moeys', 'baize']),
    ...fact(T(lang, 'Words', 'Vocabulaire'), T(lang, 'In these French names, “limon” means silty, loam-like textures. It is not the USDA class “silt”, and the same word also names the 2–50 µm particle fraction.', 'Dans ces noms français, « limon » désigne des textures limoneuses, de type loam. Ce n’est pas la classe USDA « silt », et le même mot désigne aussi la fraction 2–50 µm.'), ['mots-limon', 'quebec']),
  ];
  const c1 = card(T(lang, `About “${name}”`, `À propos : « ${name} »`), h('dl', { class: 'facts' }, ...about));

  // Water (Aisne only: the "Jamagne" table is defined on the Aisne triangle).
  let c2;
  if (isAisne) {
    const [ru, da] = AISNE_RU[id];
    const water = [
      ...fact(
        T(lang, 'Available water (réserve utile)', 'Réserve utile'),
        [
          h('span', { text: T(lang, `${num(ru, lang)} mm of water per cm of soil, i.e. ${num(ru * 100, lang)} mm per metre (for a bulk density of ${num(da, lang)}).`, `${num(ru, lang)} mm d’eau par cm de sol, soit ${num(ru * 100, lang)} mm par mètre (pour une densité apparente de ${num(da, lang)}).`) }),
          waterBar([ru * 100 - 2, ru * 100 + 2], lang),
          h('span', { class: 'muted', text: T(lang, ` Over 30 cm: about ${num(Math.round(ru * 30), lang)} mm; over 60 cm: about ${num(Math.round(ru * 60), lang)} mm.`, ` Sur 30 cm : environ ${num(Math.round(ru * 30), lang)} mm ; sur 60 cm : environ ${num(Math.round(ru * 60), lang)} mm.`) }),
        ],
        ['agriconn', 'aforce']
      ),
      ...fact(T(lang, 'Reading it', 'Repères'), T(lang, 'Over the whole rooting depth, under 50 mm is a droughty soil; over 150 mm, a soil with good potential.', 'Sur toute la profondeur enracinée, moins de 50 mm : sol séchant ; plus de 150 mm : sol à bonne potentialité.'), ['agriconn']),
      h('dd', { class: 'small muted' }, T(lang, 'These averages (the “Jamagne method”, 1977) come from soils of the Aisne and strictly apply there; they tend to overestimate the water held at field capacity, especially in clayey soils. Stones reduce the reserve.', 'Ces moyennes (« méthode de Jamagne », 1977) viennent de sols de l’Aisne et ne valent strictement que là ; elles surestiment plutôt l’eau à la capacité au champ, surtout en sols argileux. Les cailloux diminuent la réserve.'), ' ', ...cite('bruand2002', 'aforce')),
    ];
    const bat = AISNE_BATTANCE[id];
    water.push(...fact(T(lang, 'Surface crusting (battance)', 'Battance'), {
      high: T(lang, 'Very sensitive: rain on bare soil can seal the surface into a crust.', 'Très sensible : la pluie sur sol nu peut refermer la surface en croûte.'),
      low: T(lang, 'Slightly sensitive.', 'Peu sensible.'),
      none: T(lang, 'Not sensitive.', 'Pas sensible.'),
    }[bat], ['baize']));
    c2 = card(T(lang, 'Water and surface', 'Eau et surface'), h('dl', { class: 'facts' }, ...water));
  } else {
    c2 = card(
      T(lang, 'Water', 'Eau'),
      h('p', { class: 'small' }, T(lang, 'The usual French tables of available water per class (the “Jamagne method”) are defined on the Aisne triangle: switch to “Aisne” to see them.', 'Les tables françaises usuelles de réserve utile par classe (« méthode de Jamagne ») sont établies sur le triangle de l’Aisne : passez à « Aisne » pour les voir.'), ' ', ...cite('aforce'))
    );
  }

  // Garden and field.
  const notes = [];
  if (g.family) notes.push(...fact(L({ clay: { en: 'Clayey soils', fr: 'Sols argileux' }, silt: { en: 'Silty soils', fr: 'Sols limoneux' }, sand: { en: 'Sandy soils', fr: 'Sols sableux' } }[g.family], lang), L(FAMILY[g.family], lang), FAMILY[g.family].src));
  if (comp.clay > 40) notes.push(...fact(T(lang, 'Over 40 % clay', 'Plus de 40 % d’argile'), T(lang, 'Hard to work; best worked before winter so that frost can break the clods.', 'Difficile à travailler ; à travailler avant l’hiver pour profiter de l’effet du gel.'), ['aca']));
  else if (comp.clay > 25) notes.push(...fact(T(lang, 'Over 25 % clay', 'Plus de 25 % d’argile'), T(lang, 'Enough clay for the soil to rebuild its structure by itself after damage, unlike silty soils.', 'Assez d’argile pour que le sol reconstitue seul sa structure après un dégât, contrairement aux sols limoneux.'), ['supagro']));
  if (g.family === 'silt' && comp.clay < 15) notes.push(...fact(T(lang, 'Under 15 % clay', 'Moins de 15 % d’argile'), T(lang, 'Silty soils this poor in clay are especially fragile: the structure made by tillage is easily destroyed by rain, and only 3–4 % organic matter or more gives a minimum of stable structure.', 'Les sols limoneux aussi pauvres en argile sont particulièrement fragiles : la structure créée par le travail est vite détruite par les pluies, et seule une teneur en matière organique d’au moins 3 à 4 % donne un minimum de structure stable.'), ['aca']));
  notes.push(...fact(T(lang, 'Improving it', 'L’améliorer'), T(lang, 'Texture itself hardly changes. To help a sandy soil hold water and nutrients, add organic matter, not clay; to make a clay soil easier to work, add organic matter (and if needed bring the pH up to 6.5–7), not sand.', 'La texture elle-même ne change guère. Pour qu’un sol sableux retienne mieux l’eau et les éléments, apportez de la matière organique, pas d’argile ; pour qu’un sol argileux soit plus facile à travailler, apportez de la matière organique (et au besoin remontez le pH vers 6,5–7), pas de sable.'), ['aca']));
  const c3 = card(T(lang, 'In the garden and the field', 'Au jardin et aux champs'), h('dl', { class: 'facts' }, ...notes));

  // By feel, from the fractions of this sample.
  const feel = [];
  feel.push(...fact(T(lang, 'Sand', 'Sable'), comp.sand < 15 ? T(lang, `${num(comp.sand, lang)} %: no grittiness between the fingers (under 15 % sand).`, `${num(comp.sand, lang)} % : aucune rugosité entre les doigts (moins de 15 % de sable).`) : comp.sand > 50 ? T(lang, `${num(comp.sand, lang)} %: very gritty, grains visible to the eye, the sample crumbles quickly (over 50 % sand).`, `${num(comp.sand, lang)} % : forte rugosité, grains visibles à l’œil nu, l’échantillon s’effrite vite (plus de 50 % de sable).`) : T(lang, `${num(comp.sand, lang)} %: some grittiness, coarse or fine depending on the sand.`, `${num(comp.sand, lang)} % : un peu de rugosité, grossière ou fine selon les sables.`), ['supagro']));
  feel.push(...fact(T(lang, 'Clay', 'Argile'), comp.clay > 30 ? T(lang, `${num(comp.clay, lang)} %: the moist soil rolls into a thread that bends into a ring, sticks strongly to the fingers and leaves a shiny film (over 30 % clay).`, `${num(comp.clay, lang)} % : la terre humide fait un boudin que l’on peut fermer en anneau, colle fortement aux doigts et y laisse une plaquette brillante (plus de 30 % d’argile).`) : comp.clay >= 17 ? T(lang, `${num(comp.clay, lang)} %: the moist soil can be rolled into a thread (from about 17–20 % clay).`, `${num(comp.clay, lang)} % : la terre humide se roule en boudin (à partir de 17–20 % d’argile environ).`) : T(lang, `${num(comp.clay, lang)} %: too little clay to roll a thread; silt feels soft and silky, like talc.`, `${num(comp.clay, lang)} % : trop peu d’argile pour faire un boudin ; le limon donne un toucher doux et soyeux, comme du talc.`), ['supagro']));
  const c4 = card(T(lang, 'By feel', 'Au toucher'), h('dl', { class: 'facts' }, ...feel));

  return [c1, c2, c3, c4, aboutCard(ctx)];
}

// ------------------------------------------------------------------ common

export function aboutCard({ system, lang, t }) {
  const items = [
    ...fact(T(lang, 'What texture measures', 'Ce que mesure la texture'), T(lang, 'The shares by weight of sand, silt and clay in the fine earth (particles under 2 mm), after organic matter, carbonates, salts and other cements are removed. Gravel and stones are described separately. The pipette method is the reference; the hydrometer method is also used.', 'Les parts en poids de sable, de limon et d’argile dans la terre fine (particules de moins de 2 mm), après élimination de la matière organique, des carbonates, des sels et autres ciments. Graviers et cailloux sont décrits à part. La méthode de la pipette est la référence ; celle du densimètre est aussi utilisée.'), ['ssm']),
    ...fact(T(lang, 'Size limits are not the same everywhere', 'Les limites de taille varient'), T(lang, `This triangle puts the silt–sand limit at ${system.limits.silt} µm. The USDA uses 50 µm, the UK system 60 µm; other systems use other limits, so the same sample can give different percentages. Use percentages measured with the limit of the triangle you read them on.`, `Ce triangle place la limite limon–sable à ${system.limits.silt} µm. L’USDA utilise 50 µm, le système britannique 60 µm ; d’autres systèmes ont d’autres limites, et un même échantillon peut donc donner des pourcentages différents. Utilisez des pourcentages mesurés avec la limite du triangle sur lequel vous les lisez.`), ['ssm', 'ahdb-texture']),
    ...(system.limits.silt === 50 && (system.id === 'geppa' || system.id === 'aisne')
      ? fact(T(lang, 'French lab reports', 'Analyses françaises'), T(lang, 'French laboratories usually report five fractions: clay under 2 µm, fine silt 2–20, coarse silt 20–50, fine sand 50–200 and coarse sand 200–2000 µm. Add the two silts and the two sands; the paste box does it for you.', 'Les laboratoires français donnent en général cinq fractions : argile sous 2 µm, limons fins 2–20, limons grossiers 20–50, sables fins 50–200 et sables grossiers 200–2000 µm. Additionnez les deux limons et les deux sables ; la zone « Coller un résultat » le fait pour vous.'), ['baize'])
      : []),
    ...fact(T(lang, 'Feel versus laboratory', 'Toucher ou laboratoire'), T(lang, 'Texture by feel can be quite reliable with practice and local reference samples, but cements, large clay crystals and some minerals mislead the fingers; check against a laboratory analysis when it matters.', 'L’estimation au toucher peut être fiable avec de la pratique et des échantillons de référence locaux, mais les ciments, les gros cristaux d’argile et certains minéraux trompent les doigts ; vérifiez par une analyse de laboratoire quand l’enjeu est réel.'), ['nrcs-feel']),
    ...fact(T(lang, 'Points on a line', 'Points sur une ligne'), system.classes[0].rule ? T(lang, 'The USDA gives each class as written limits (“40 % or more”, “less than 27 %”). This tool applies them literally, so a point on a line gets the class the definition gives it.', 'L’USDA définit chaque classe par des limites écrites (« 40 % ou plus », « moins de 27 % »). L’outil les applique à la lettre : un point sur une ligne reçoit la classe que donne la définition.') : T(lang, 'This triangle is only published as a figure. A point exactly on a line is shown with both classes.', 'Ce triangle n’est publié que sous forme de figure. Un point exactement sur une ligne est donné avec les deux classes.'), system.classes[0].rule ? ['ssm'] : ['moeys']),
    ...fact(T(lang, 'How the inputs work', 'Fonctionnement de la saisie'), T(lang, 'One fraction is calculated so the three always add up to 100: you set two, typing or sliding, and they never change behind your back. A slider only pushes the other one down when the calculated fraction is already at 0. A simulation of 2000 lab results reaches every one in at most two moves this way, against up to six with sliders that rescale the others.', 'Une fraction est calculée pour que les trois fassent toujours 100 : vous en réglez deux, par saisie ou curseur, et elles ne changent jamais dans votre dos. Un curseur ne fait baisser l’autre que lorsque la fraction calculée est déjà à 0. Une simulation sur 2000 résultats de laboratoire les atteint tous en deux gestes au plus, contre jusqu’à six avec des curseurs qui redistribuent les autres.'), []),
  ];
  void t;
  return card(T(lang, 'Good to know', 'Bon à savoir'), h('dl', { class: 'facts' }, ...items));
}
