// Builds the information cards under the triangle, and the table twin of
// the triangle. Everything is created with DOM APIs and textContent.

import { SOURCES, sourceIndex } from './sources.js';
import { className } from '../names.js';
import { fmt } from '../triangle.js';
import { sectionsFor } from './sections.js';

export const h = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) n.append(kid);
  return n;
};

/** Superscript links to the numbered sources. */
export function cite(...ids) {
  return ids.map((id) => {
    const i = sourceIndex(id);
    if (!i) throw new Error(`unknown source ${id}`);
    return h('a', { class: 'src', href: `#src-${id}`, 'aria-label': `source ${i}` }, `[${i}]`);
  });
}

export const L = (o, lang) => (typeof o === 'string' ? o : o?.[lang] ?? o?.en ?? '');

export function card(title, ...kids) {
  return h('section', { class: 'card' }, h('h2', { text: title }), ...kids);
}

/** A definition list item: term, then description nodes, then citations. */
export function fact(term, desc, srcs = []) {
  return [h('dt', { text: term }), h('dd', {}, ...(Array.isArray(desc) ? desc : [desc]), ' ', ...cite(...srcs))];
}

export function renderInfo(ctx) {
  return sectionsFor(ctx).filter(Boolean);
}

/**
 * The numbered source list of the whole tab (triangle and jar test), at the
 * bottom of the page. Every listed source is cited somewhere in the tab
 * (checked by tests/sources.test.mjs).
 */
export function renderSources({ t }) {
  return h(
    'section',
    { class: 'card sources', id: 'sources' },
    h('h2', { text: 'Sources' }),
    h('ol', {}, ...SOURCES.map((s) => h('li', { id: `src-${s.id}` }, `${s.text} `, h('a', { href: s.url, rel: 'noopener', target: '_blank' }, s.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))))),
    h('p', { class: 'small muted', text: t('sources.note') })
  );
}

/** Table twin of the triangle: every class, its definition or limits, and how far the sample is. */
export function renderTable({ system, comp, result, near, t, lang }) {
  const nearIds = new Map(near.map((n) => [n.id, n.distance]));
  const rows = system.classes.map((cls) => {
    const isCur = cls.id === result.id;
    const d = isCur ? 0 : nearIds.get(cls.id);
    const def = system.definitions?.[cls.id];
    return h(
      'tr',
      { class: isCur ? 'is-current' : nearIds.has(cls.id) ? 'is-near' : '' },
      h('td', { text: className(system.id, cls.id, lang) }),
      h('td', { text: cls.abbr }),
      h('td', { text: def ? L(def, lang) : vertexText(cls, lang) }),
      h('td', { class: 'num', text: isCur ? t('table.here') : d !== undefined ? fmt(d) : '' })
    );
  });
  return h(
    'table',
    { class: 'table-view' },
    h('caption', { class: 'visually-hidden', text: t('table.summary') }),
    h('thead', {}, h('tr', {}, h('th', { text: t('table.class') }), h('th', { text: t('table.abbr') }), h('th', { text: t('table.limits') }), h('th', { text: t('table.dist', { n: 3 }) }))),
    h('tbody', {}, ...rows),
    h('tfoot', {}, h('tr', {}, h('td', { colspan: '4', class: 'small muted', text: t('table.sample', { sand: fmt(comp.sand), silt: fmt(comp.silt), clay: fmt(comp.clay) }) })))
  );
}

function vertexText(cls, lang) {
  const sep = lang === 'fr' ? ' ; ' : '; ';
  const f = (x) => (lang === 'fr' ? fmt(x).replace('.', ',') : fmt(x));
  return (lang === 'fr' ? 'Sommets (sable/limon/argile) : ' : 'Corners (sand/silt/clay): ') + cls.poly.map((p) => p.map(f).join('/')).join(sep);
}
