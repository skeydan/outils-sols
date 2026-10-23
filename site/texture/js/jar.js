// The jar test section: steps with our own SVG drawings, a calculator
// linked to the triangle, the physics, the limits compared with a
// laboratory. Citations share the numbered list of the texture tab.
import { lang } from '../../assets/site.js';
import { h, num, fmtn } from '../../assets/ui.js';
import { formatHash } from '../../assets/router.js';
import { jarToPercent } from './parse.js';
import { cite } from './info/render.js';
import { SOURCES } from './info/sources.js';

const T = (en, fr) => (lang() === 'fr' ? fr : en);
const f = (v, d = 1) => fmtn(v, lang(), d);

// ---------------------------------------------------------------- drawings (our own)
const jarPath = 'M18 22 h44 M14 30 q0 -8 6 -8 M66 30 q0 -8 -6 -8 M14 30 V108 q0 8 8 8 H58 q8 0 8 -8 V30';
function jarSvg({ soil = 0, water = 0, layers = null, shake = false, label = '', extra = '' }) {
  // y from 116 (bottom) up to 30 (shoulder): 86 units of height.
  const H = 86, bottom = 116;
  let body = '';
  if (water) body += `<rect x="15" y="${bottom - H * water}" width="50" height="${H * water - 1}" rx="6" class="d-water"/>`;
  if (shake) body += `<rect x="15" y="${bottom - H * water}" width="50" height="${H * water - 1}" rx="6" class="d-mud"/>`;
  if (soil && !layers) body += `<rect x="15" y="${bottom - H * soil}" width="50" height="${H * soil - 1}" rx="6" class="d-soil"/>`;
  if (layers) {
    let y = bottom - 1;
    for (const [k, frac] of layers) {
      const hh = H * frac;
      y -= hh;
      body += `<rect x="15" y="${y}" width="50" height="${hh}" class="d-${k}"/>`;
    }
  }
  const lid = '<rect x="20" y="10" width="40" height="9" rx="2" class="d-glass-fill"/>';
  const motion = shake ? '<path d="M4 50 q-4 12 0 24 M76 50 q4 12 0 24 M0 44 q-5 18 0 36 M80 44 q5 18 0 36" class="d-motion"/>' : '';
  return `<svg viewBox="-6 0 92 124" role="img" aria-label="${label}"><title>${label}</title>${body}<path d="${jarPath}" class="d-glass"/>${lid}${motion}${extra}</svg>`;
}

const STEPS = () => [
  {
    svg: `<svg viewBox="0 0 92 124" role="img" aria-label="${T('Dry, crushed soil without stones or roots', 'Terre sèche émiettée, sans cailloux ni racines')}"><path d="M10 104 Q46 60 82 104 Z" class="d-soil"/><circle cx="24" cy="112" r="5" class="d-stone"/><circle cx="70" cy="114" r="4" class="d-stone"/><path d="M60 40 q8 10 2 22 M64 44 q-6 6 -2 14" class="d-root"/><path d="M14 30 l18 0 M23 21 l0 18" class="d-x"/></svg>`,
    title: T('Prepare the soil', 'Préparer la terre'),
    text: T('Dry the sample, crush the lumps and take out stones, roots and plant debris.', 'Faites sécher l’échantillon, écrasez les mottes et retirez cailloux, racines et débris végétaux.'),
    src: ['csu', 'clemson'],
  },
  {
    svg: jarSvg({ soil: 0.3, label: T('Jar a quarter to a half full of soil', 'Bocal rempli d’un quart à la moitié de terre') }),
    title: T('Fill the jar with soil', 'Mettre la terre dans le bocal'),
    text: T('Use a clear jar with straight sides. Guides fill it from a quarter to half with soil.', 'Prenez un bocal transparent à bords droits. Selon les guides, remplissez-le d’un quart à la moitié de terre.'),
    src: ['csu', 'clemson', 'msu', 'agriconn'],
  },
  {
    svg: jarSvg({ soil: 0.3, water: 0.82, label: T('Water added to about three quarters', 'Eau ajoutée jusqu’aux trois quarts environ'), extra: '<path d="M74 2 v14 M68 10 l6 6 6 -6" class="d-arrow"/>' }),
    title: T('Add water and a dispersant', 'Ajouter l’eau et un dispersant'),
    text: T('Add water to about three quarters, leaving some air. Some guides add a teaspoon of non-foaming dishwasher detergent or water softener to separate the particles.', 'Ajoutez de l’eau jusqu’aux trois quarts environ, en laissant un peu d’air. Certains guides ajoutent une cuillère à café de détergent lave-vaisselle non moussant ou d’adoucisseur d’eau pour séparer les particules.'),
    src: ['csu', 'msu', 'agriconn'],
  },
  {
    svg: jarSvg({ water: 0.82, shake: true, label: T('Shaking the closed jar', 'Agiter le bocal fermé') }),
    title: T('Shake hard', 'Agiter fort'),
    text: T('Close and shake vigorously, from several minutes to 10–15 minutes, until all the soil is in suspension.', 'Fermez et agitez énergiquement, de plusieurs minutes à 10–15 minutes, jusqu’à ce que toute la terre soit en suspension.'),
    src: ['csu', 'agriconn', 'clemson'],
  },
  {
    svg: jarSvg({ water: 0.82, layers: [['sand', 0.18]], label: T('Sand settles within a minute', 'Le sable se dépose en une minute'), extra: '<rect x="15" y="40" width="50" height="60" class="d-mud" opacity="0.6"/>' }),
    title: T('Mark the sand', 'Marquer le sable'),
    text: T('Put the jar down on a level spot. After about a minute, mark the top of the layer at the bottom: that is the sand.', 'Posez le bocal à plat. Au bout d’une minute environ, marquez le haut de la couche du fond : c’est le sable.'),
    src: ['csu', 'clemson', 'msu'],
  },
  {
    svg: jarSvg({ water: 0.82, layers: [['sand', 0.18], ['silt', 0.16]], label: T('Silt settles in hours', 'Le limon se dépose en quelques heures'), extra: '<rect x="15" y="40" width="50" height="46" class="d-mud" opacity="0.35"/>' }),
    title: T('Mark the silt', 'Marquer le limon'),
    text: T('After 2 to 6 hours depending on the guide, mark the top of the next layer: the silt.', 'Après 2 à 6 heures selon les guides, marquez le haut de la couche suivante : le limon.'),
    src: ['csu', 'clemson', 'msu', 'ubc'],
  },
  {
    svg: jarSvg({ water: 0.82, layers: [['sand', 0.18], ['silt', 0.16], ['clay', 0.08]], label: T('Clay settles last, the water clears', 'L’argile se dépose en dernier, l’eau s’éclaircit'), extra: '<path d="M18 46 h44" class="d-om"/>' }),
    title: T('Wait for the clay', 'Attendre l’argile'),
    text: T('When the water has cleared (one to three days), mark the top of the last layer: the clay. Plant debris floating at the top is not counted.', 'Quand l’eau s’est éclaircie (un à trois jours), marquez le haut de la dernière couche : l’argile. Les débris végétaux qui flottent ne comptent pas.'),
    src: ['csu', 'clemson', 'agriconn'],
  },
  {
    svg: jarSvg({ water: 0.82, layers: [['sand', 0.18], ['silt', 0.16], ['clay', 0.08]], label: T('Measuring the layers with a ruler', 'Mesurer les couches à la règle'),
      extra: '<rect x="70" y="60" width="8" height="58" class="d-ruler"/><path d="M70 115 h4 M70 108 h3 M70 101 h4 M70 94 h3 M70 87 h4 M70 80 h3 M70 73 h4 M70 66 h3" class="d-tick"/>' }),
    title: T('Measure and calculate', 'Mesurer et calculer'),
    text: T('Measure the thickness of each layer and of the whole deposit. Each share = layer thickness ÷ total thickness × 100.', 'Mesurez l’épaisseur de chaque couche et du dépôt entier. Chaque part = épaisseur de la couche ÷ épaisseur totale × 100.'),
    src: ['csu', 'clemson', 'agriconn'],
  },
];

function settledDiagram() {
  const L = (y, txt, k) => `<line x1="68" y1="${y}" x2="88" y2="${y}" class="d-lead"/>${k ? `<rect x="92" y="${y - 4.5}" width="9" height="9" rx="2" class="d-${k}"/>` : ''}<text x="${k ? 106 : 92}" y="${y + 3.5}" class="d-lbl">${txt}</text>`;
  const lbl = T('A settled jar, from top to bottom: floating debris, clear water, clay, silt, sand', 'Un bocal décanté, de haut en bas : débris flottants, eau claire, argile, limon, sable');
  return `<svg viewBox="-6 0 250 124" role="img" aria-label="${lbl}"><title>${lbl}</title>
    <rect x="15" y="44.5" width="50" height="70.5" rx="6" class="d-water"/>
    <rect x="15" y="79.5" width="50" height="8" class="d-clay"/>
    <rect x="15" y="87.5" width="50" height="13" class="d-silt"/>
    <rect x="15" y="100.5" width="50" height="14.5" rx="0" class="d-sand"/>
    <path d="M18 46 h44" class="d-om"/>
    <path d="${jarPath}" class="d-glass"/><rect x="20" y="10" width="40" height="9" rx="2" class="d-glass-fill"/>
    ${L(46, T('floating debris (not counted)', 'débris flottants (non comptés)'))}
    ${L(62, T('clear water', 'eau claire'))}
    ${L(83, T('clay (top)', 'argile (en haut)'), 'clay')}
    ${L(94, T('silt', 'limon'), 'silt')}
    ${L(108, T('sand (bottom)', 'sable (au fond)'), 'sand')}
  </svg>`;
}

// ---------------------------------------------------------------- page
const S = { clay: '0.8', silt: '1.5', sand: '4.5' }; // Agriconnaissances worked example (cm)
const out = {};

export function buildJar() {
  const main = document.getElementById('jar-main');
  const steps = STEPS();
  // Our own constant SVG strings (no user input inside).
  const art = (svg) => { const d = h('div', { class: 'art' }); d.innerHTML = svg; return d; };

  const calcInputs = ['clay', 'silt', 'sand'].map((k) => {
    const id = `j-${k}`;
    const input = h('input', { id, type: 'text', inputmode: 'decimal', autocomplete: 'off', value: S[k] });
    input.addEventListener('input', () => { S[k] = input.value; compute(); });
    return h('div', { class: 'field' }, h('label', { for: id }, h('span', { class: `chip ${k}`, 'aria-hidden': 'true' }), { clay: T('Clay layer (top)', 'Couche d’argile (en haut)'), silt: T('Silt layer (middle)', 'Couche de limon (au milieu)'), sand: T('Sand layer (bottom)', 'Couche de sable (au fond)') }[k]), h('div', { class: 'field-in' }, input, h('span', { class: 'unit', text: 'cm', 'aria-hidden': 'true' })));
  });
  out.result = h('p', { class: 'hero' });
  out.sub = h('p', { class: 'sub' });
  out.link = h('a', { class: 'btn', id: 'jar-to-triangle', href: formatHash({ tab: 'texture' }) }, T('See it in the triangle →', 'Voir dans le triangle →'));

  main.replaceChildren(
    h('h1', { id: 'jar-h1', text: T('The jar test: soil texture at home', 'Le test du bocal : la texture du sol à la maison') }),
    h('p', { class: 'lead muted' }, T('Shake soil in a jar of water and let it settle: sand drops first, then silt, then clay. Measuring the layers gives a rough idea of the texture, to enter in the triangle. A laboratory analysis remains the reference.', 'Agitez de la terre dans un bocal d’eau et laissez reposer : le sable tombe d’abord, puis le limon, puis l’argile. Mesurer les couches donne une idée approximative de la texture, à reporter dans le triangle. L’analyse de laboratoire reste la référence.'), ' ', ...cite('csu', 'ssm')),

    h('section', { class: 'card', 'aria-labelledby': 'steps-h' },
      h('h2', { id: 'steps-h', text: T('Step by step', 'Pas à pas') }),
      h('ol', { class: 'steps' }, ...steps.map((s) => h('li', {}, art(s.svg), h('div', {}, h('h3', { text: s.title }), h('p', {}, s.text, ' ', ...cite(...s.src))))))),

    h('div', { class: 'tool-cols' },
      h('section', { class: 'card' },
        h('h2', { text: T('Reading the jar', 'Lire le bocal') }),
        h('div', { class: 'art settled' }, ...[art(settledDiagram())]),
        h('table', { class: 'kv' },
          h('caption', { class: 'small muted', text: T('Reading times differ between guides', 'Les temps de lecture varient selon les guides') }),
          h('thead', {}, h('tr', {}, h('th', { text: T('Guide', 'Guide') }), h('th', { text: T('Sand', 'Sable') }), h('th', { text: T('Silt', 'Limon') }), h('th', { text: T('Clay', 'Argile') }))),
          h('tbody', {},
            ...[
              ['Colorado State', T('1 min', '1 min'), T('2 h', '2 h'), T('water clear, 1–3 days', 'eau claire, 1–3 jours'), 'csu'],
              ['Clemson', '1 min', '2 h', '48 h', 'clemson'],
              ['Montana State', '1 min', '6 h', '24 h', 'msu'],
              ['UBC', '40 s', '6 h', T('by difference', 'par différence'), 'ubc'],
              ['UC ANR', '30 s', '30 min', T('by difference', 'par différence'), 'ucanr'],
              [T('Chambres d’agriculture', 'Chambres d’agriculture'), '–', '–', T('2 days', '2 jours'), 'agriconn'],
            ].map(([g, a, b, c, src]) => h('tr', {}, h('td', {}, g, ' ', ...cite(src)), h('td', { text: a }), h('td', { text: b }), h('td', { text: c }))))),
        h('figure', { class: 'photo' },
          h('img', { src: 'texture/img/jar-test-chaojoker-cc-by-sa-3.0.jpg', width: '720', height: '960', loading: 'lazy', alt: T('A glass jar of soil and water after settling: a thick dark deposit at the bottom, a thin lighter layer above it, cloudy water and floating debris at the top.', 'Un bocal de terre et d’eau après décantation : un épais dépôt sombre au fond, une fine couche plus claire au-dessus, de l’eau trouble et des débris flottants en haut.') }),
          h('figcaption', {}, T('A real jar after settling. Photo ', 'Un vrai bocal après décantation. Photo '), h('a', { href: SOURCES.find((s) => s.id === 'photo').url, rel: 'noopener', target: '_blank', text: 'Chaojoker' }), ', Wikimedia Commons, ', h('a', { href: 'https://creativecommons.org/licenses/by-sa/3.0/', rel: 'license noopener', target: '_blank', text: 'CC BY-SA 3.0' }), T(', resized.', ', redimensionnée.'))),
        // Placeholder for photos of a real jar test: replace the div with a <figure><img …><figcaption>…</figcaption></figure>.
        h('div', { class: 'photo-placeholder', 'data-placeholder': 'own-photo-1' }, T('Room for your own photos: the jar at each step.', 'Place pour vos propres photos : le bocal à chaque étape.'))),

      h('section', { class: 'card', id: 'jar-calc' },
        h('h2', { text: T('Calculate', 'Calculer') }),
        h('p', { class: 'small' }, T('Enter the thickness of each layer, from the top down. Pre-filled with the worked example of the Chambres d’agriculture slides: 6.8 cm of deposit, 4.5 cm of sand, 1.5 cm of silt and 0.8 cm of clay.', 'Saisissez l’épaisseur de chaque couche, de haut en bas. Pré-rempli avec l’exemple des Chambres d’agriculture : 6,8 cm de dépôt, dont 4,5 cm de sable, 1,5 cm de limon et 0,8 cm d’argile.'), ' ', ...cite('agriconn')),
        h('div', { class: 'fields' }, ...calcInputs),
        (out.err = h('p', { class: 'err', role: 'status' })),
        out.result, out.sub, out.link,
        h('p', { class: 'hint' }, T('These are shares of the settled thickness. Texture classes are defined by weight, from a laboratory analysis: use the result as an estimate.', 'Ce sont des parts de l’épaisseur déposée. Les classes de texture sont définies en poids, d’après une analyse de laboratoire : prenez le résultat comme une estimation.'), ' ', ...cite('ssm')))),

    h('div', { class: 'tool-cols' },
      h('section', { class: 'card' },
        h('h2', { text: T('Why the layers form', 'Pourquoi les couches se forment') }),
        h('p', {}, T('A particle falling in water soon reaches a constant speed that grows with the square of its diameter (Stokes’ law). Sand grains therefore settle faster than silt, and silt faster than clay. Water temperature changes the speed too.', 'Une particule qui tombe dans l’eau atteint vite une vitesse constante, qui croît avec le carré de son diamètre (loi de Stokes). Les grains de sable se déposent donc plus vite que le limon, et le limon plus vite que l’argile. La température de l’eau change aussi la vitesse.'), ' ', ...cite('ksu', 'baize-dispersion')),
        h('p', {}, T('In the laboratory, at 25 °C, the top 10 cm of a suspension is free of particles of 0.05 mm and more after about 40 seconds, and holds only clay after about 7 hours.', 'Au laboratoire, à 25 °C, les 10 cm supérieurs d’une suspension sont débarrassés des particules de 0,05 mm et plus après environ 40 secondes, et ne contiennent plus que de l’argile après environ 7 heures.'), ' ', ...cite('ksu')),
        h('p', {}, T('The law assumes smooth, rigid, spherical particles in a dilute, still suspension; real soil particles are not like that.', 'La loi suppose des particules sphériques, lisses et rigides dans une suspension diluée et calme ; les vraies particules de sol ne le sont pas.'), ' ', ...cite('ubc'))),
      h('section', { class: 'card' },
        h('h2', { text: T('Limits compared with a laboratory', 'Limites par rapport au laboratoire') }),
        h('dl', { class: 'facts' },
          h('dt', { text: T('Thickness is not weight', 'Une épaisseur n’est pas un poids') }),
          h('dd', {}, T('Texture is defined as shares by weight measured in a laboratory; the jar gives thicknesses of settled layers.', 'La texture est définie par des parts en poids mesurées au laboratoire ; le bocal donne des épaisseurs de couches déposées.'), ' ', ...cite('ssm', 'csu')),
          h('dt', { text: T('Aggregates', 'Agrégats') }),
          h('dd', {}, T('Particles are bound in aggregates that must be broken up: a clay aggregate that is not dispersed settles like a silt particle.', 'Les particules sont liées en agrégats qu’il faut défaire : un agrégat d’argile non dispersé se dépose comme une particule de limon.'), ' ', ...cite('ksu')),
          h('dt', { text: T('Dispersion', 'Dispersion') }),
          h('dd', {}, T('Laboratories first destroy organic matter with hydrogen peroxide, then disperse with sodium hexametaphosphate and stir for hours. A few minutes of shaking with household detergent does less; some soils are hard to disperse at all.', 'Les laboratoires détruisent d’abord la matière organique à l’eau oxygénée, puis dispersent à l’hexamétaphosphate de sodium et agitent pendant des heures. Quelques minutes d’agitation avec un détergent ménager font moins ; certains sols se dispersent mal de toute façon.'), ' ', ...cite('baize-dispersion', 'ksu')),
          h('dt', { text: T('Where the layers end', 'Où s’arrêtent les couches') }),
          h('dd', {}, T('Guides read the layers at different times (table above), so the limits between sand, silt and clay in a jar are approximate.', 'Les guides lisent les couches à des moments différents (tableau ci-dessus) : les limites entre sable, limon et argile dans un bocal sont approximatives.'), ' ', ...cite('csu', 'msu', 'ubc', 'ucanr')),
          h('dt', { text: T('The reference', 'La référence') }),
          h('dd', {}, T('The pipette method is the preferred laboratory standard; the hydrometer method is also used. Field estimates should be checked against laboratory results.', 'La méthode de la pipette est la référence de laboratoire ; celle du densimètre est aussi utilisée. Les estimations de terrain sont à vérifier par le laboratoire.'), ' ', ...cite('ssm', 'baize-dispersion')))))
  );
  compute();
}

function compute() {
  const r = jarToPercent({ sand: num(S.sand), silt: num(S.silt), clay: num(S.clay) });
  if (!r.ok) {
    out.err.textContent = { nan: T('Enter three numbers (0 if a layer is missing).', 'Saisissez trois nombres (0 si une couche manque).'), negative: T('Thicknesses cannot be negative.', 'Une épaisseur ne peut pas être négative.'), empty: T('The total is 0.', 'Le total est nul.') }[r.error];
    out.result.textContent = '–';
    out.sub.textContent = '';
    out.link.setAttribute('href', formatHash({ tab: 'texture' }));
    return;
  }
  out.err.textContent = '';
  out.result.replaceChildren(`${f(r.sand)} · ${f(r.silt)} · ${f(r.clay)}`, h('small', { text: T('% sand · silt · clay', '% sable · limon · argile') }));
  out.sub.textContent = T(`Total deposit ${f(r.total, 2)} cm.`, `Dépôt total ${f(r.total, 2)} cm.`);
  // Link to the triangle: sand and clay rounded to 0.1, silt takes the
  // remainder. The triangle keeps the classification chosen there.
  const sand = Math.round(r.sand * 10) / 10, clay = Math.round(r.clay * 10) / 10;
  const silt = Math.round((100 - sand - clay) * 10) / 10;
  out.link.setAttribute('href', formatHash({ tab: 'texture', params: { sand, silt, clay, calc: 'silt' } }));
}
