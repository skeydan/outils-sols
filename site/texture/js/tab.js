// The "Texture" tab: two sections, the triangle (default) and the jar test,
// and one source list at the bottom for both. Wired by ../../app.js.
//
//   #texture?sand=40&silt=40&clay=20&calc=silt&sys=usda   the triangle
//   #texture/jar                                          the jar test

import { lang, onLangChange } from '../../assets/site.js';
import { STR } from './i18n.js';
import { initTriangle, rebuildTriangle, showTriangle } from './triangle-page.js';
import { buildJar } from './jar.js';
import { renderSources } from './info/render.js';

export { STR };

const t = (k) => STR[k]?.[lang()] ?? STR[k]?.en ?? k;

function renderAll() {
  buildJar();
  document.getElementById('texture-sources').replaceChildren(renderSources({ t }));
}

export function init({ setParams }) {
  initTriangle({ setParams });
  renderAll();
  onLangChange(() => { rebuildTriangle(); renderAll(); });
}

export function show(section, params) {
  showTriangle(params, section === 'triangle');
}

export const title = (section) => t(`tx.title.${section}`);
