// The single page: language and theme shell, the tab bar and hash routing.
//
// To add a tab: add an entry to TABS (id, label, sections, module), a
// <div class="tab-panel" data-tab-panel="<id>"> in index.html with one
// [data-section-panel] element per section, and a module exporting
//   STR                      its strings {key: {en, fr}} (prefix the keys)
//   init({ setParams })      once, after the shell has picked the language
//   show(section, params)    each time the route enters or changes in the tab
//   title(section)           optional, the document title for a section

import { initShell, lang, onLangChange } from './assets/site.js';
import { parseHash, formatHash, resolveRoute } from './assets/router.js';
import * as texture from './texture/js/tab.js';

const TABS = [
  { id: 'texture', label: { en: 'Texture', fr: 'Texture du sol' }, sections: ['triangle', 'jar'], module: texture },
];

const SHELL_STR = {
  'shell.home': { en: 'outils-sols', fr: 'outils-sols' },
  'shell.tabs': { en: 'Tools', fr: 'Outils' },
  footer: {
    en: 'Independent personal project, no tracking. Texts and drawings are original; the photo is credited where it is shown; facts come from the sources listed on the page.',
    fr: 'Projet personnel indépendant, sans pistage. Textes et dessins originaux ; la photo est créditée là où elle apparaît ; les faits viennent des sources citées sur la page.',
  },
};

let current = null; // { tab, section, params }

// ---------------------------------------------------------------- tab bar
function buildTabs() {
  const nav = document.getElementById('tabs');
  nav.replaceChildren(...TABS.map((t) => {
    const a = document.createElement('a');
    a.href = formatHash({ tab: t.id });
    a.dataset.tab = t.id;
    a.textContent = t.label[lang()] ?? t.label.en;
    if (current?.tab === t.id) a.setAttribute('aria-current', 'page');
    return a;
  }));
}

// ---------------------------------------------------------------- routing
function show(route, { scroll = false } = {}) {
  const prev = current;
  current = route;
  const tab = TABS.find((t) => t.id === route.tab);
  document.querySelectorAll('[data-tab-panel]').forEach((p) => { p.hidden = p.dataset.tabPanel !== route.tab; });
  const panel = document.querySelector(`[data-tab-panel="${route.tab}"]`);
  panel.querySelectorAll('[data-section-panel]').forEach((p) => { p.hidden = p.dataset.sectionPanel !== route.section; });
  panel.querySelectorAll('[data-section-link]').forEach((a) => {
    if (a.dataset.sectionLink === route.section) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.querySelectorAll('#tabs a').forEach((a) => {
    if (a.dataset.tab === route.tab) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  tab.module.show(route.section, route.params);
  setTitle();
  document.documentElement.dataset.route = `${route.tab}/${route.section}`; // for the browser checks
  const moved = !prev || prev.tab !== route.tab || prev.section !== route.section;
  if (scroll && moved) window.scrollTo(0, 0);
}

function setTitle() {
  const tab = TABS.find((t) => t.id === current.tab);
  const name = tab.module.title?.(current.section) ?? tab.label[lang()] ?? tab.label.en;
  document.title = `${name} · outils-sols`;
}

window.addEventListener('hashchange', () => {
  const route = resolveRoute(parseHash(location.hash), TABS);
  if (route) show(route, { scroll: true });
});

// Citations ("[3]") jump to the source list without touching the route.
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href^="#src-"]');
  if (!a) return;
  const target = document.getElementById(a.getAttribute('href').slice(1));
  if (!target) return;
  e.preventDefault();
  document.querySelectorAll('.is-target').forEach((n) => n.classList.remove('is-target'));
  target.classList.add('is-target');
  target.scrollIntoView({ block: 'center' });
});

// ---------------------------------------------------------------- start
const dict = { ...SHELL_STR };
for (const t of TABS) Object.assign(dict, t.module.STR);
initShell(dict);

/** Write the parameters of the current view in the URL, without a history entry. */
function setParams(tabId, params) {
  if (!current || current.tab !== tabId) return;
  const section = TABS.find((t) => t.id === tabId).sections[0] === current.section ? null : current.section;
  current = { ...current, params };
  history.replaceState(null, '', formatHash({ tab: tabId, section, params }));
}

for (const t of TABS) t.module.init({ setParams: (params) => setParams(t.id, params) });
onLangChange(() => { buildTabs(); if (current) setTitle(); });
show(resolveRoute(parseHash(location.hash), TABS, { fallback: true }));
buildTabs();
