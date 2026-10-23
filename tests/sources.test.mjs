// The texture tab has one numbered source list for the triangle and the jar
// test. Every citation must point to a listed source, and every listed source
// must be cited somewhere. The information cards of every class of every
// triangle (and the USDA sand subclasses) and the jar section are built with
// a tiny DOM stand-in, collecting the citation links.
import { test } from 'node:test';
import assert from 'node:assert/strict';

class El {
  constructor(tag) { this.tag = tag; this.attrs = {}; this.kids = []; this.textContent = ''; this.className = ''; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  addEventListener() {}
  append(...k) { this.kids.push(...k); }
  appendChild(k) { this.kids.push(k); return k; }
  replaceChildren(...k) { this.kids = k; }
  set innerHTML(v) { this.html = v; }
}
const roots = {};
globalThis.document = {
  createElement: (t) => new El(t),
  createTextNode: (s) => s,
  getElementById: (id) => (roots[id] ??= new El('div')),
};

const { SOURCES } = await import('../site/texture/js/info/sources.js');
const { renderInfo } = await import('../site/texture/js/info/render.js');
const { buildJar } = await import('../site/texture/js/jar.js');
const { SYSTEMS, SYSTEM_ORDER } = await import('../site/texture/js/systems/index.js');
const { classify, neighbours } = await import('../site/texture/js/classify.js');
const { usdaSubclass } = await import('../site/texture/js/systems/usda.js');
const { setLang } = await import('../site/assets/site.js');
const { STR } = await import('../site/texture/js/i18n.js');

const cited = new Set();
function walk(n) {
  if (!n || typeof n !== 'object') return;
  const href = n.attrs?.href;
  if (n.className === 'src' && href?.startsWith('#src-')) cited.add(href.slice(5));
  if (n.html) for (const m of n.html.matchAll(/href="#src-([\w-]+)"/g)) cited.add(m[1]);
  (n.kids || []).forEach(walk);
}
const t = (k, vars) => {
  const s = STR[k]?.en ?? k;
  return vars ? s.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? '') : s;
};

test('every class card cites listed sources, every source is cited', () => {
  // setLang touches document.documentElement and the language buttons.
  globalThis.document.documentElement = {};
  globalThis.document.querySelectorAll = () => [];
  globalThis.localStorage = { setItem() {}, getItem() { return null; } };
  const seen = new Set();
  for (const lang of ['en', 'fr']) {
    setLang(lang, { save: false });
    for (const id of SYSTEM_ORDER) {
      const system = SYSTEMS[id];
      for (let clay = 0; clay <= 100; clay += 2) {
        for (let sand = 0; sand <= 100 - clay; sand += 2) {
          const comp = { sand, silt: 100 - sand - clay, clay };
          const result = classify(system, comp);
          const gradeSets = id === 'usda' && ['S', 'LS', 'SL'].includes(result.id)
            ? ['vcs', 'cs', 'ms', 'fs', 'vfs'].map((g) => ({ vcs: 0, cs: 0, ms: 0, fs: 0, vfs: 0, [g]: sand }))
            : [null];
          for (const grades of gradeSets) {
            const subclass = id === 'usda' ? usdaSubclass(result.id, grades) : null;
            const key = `${lang}:${id}:${result.id}:${subclass}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const near = neighbours(system, comp, result.id, 3);
            // cite() throws on a source that is not listed.
            renderInfo({ system, comp, result, near, subclass, grades, t, lang }).forEach(walk);
          }
        }
      }
    }
    buildJar();
    walk(roots['jar-main']);
  }
  const classes = SYSTEM_ORDER.reduce((n, id) => n + SYSTEMS[id].classes.length, 0);
  assert.ok(seen.size >= classes * 2, `${seen.size} cards rendered for ${classes} classes`);
  const listed = new Set(SOURCES.map((s) => s.id));
  assert.equal(listed.size, SOURCES.length, 'source ids are unique');
  for (const id of cited) assert.ok(listed.has(id), `cited but not listed: ${id}`);
  // The photo credit is a link in its caption, not a numbered citation.
  for (const s of SOURCES) if (s.id !== 'photo') assert.ok(cited.has(s.id), `listed but never cited: ${s.id}`);
  for (const s of SOURCES) assert.match(s.url, /^https:\/\//, `${s.id}: https link`);
});
