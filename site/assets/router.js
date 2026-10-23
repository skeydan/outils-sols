// Hash routing for the single page. Pure functions (no DOM), unit-tested.
//
//   #texture                         tab "texture", its first section
//   #texture/jar                     tab "texture", section "jar"
//   #texture?sand=40&silt=40&clay=20 tab, section and parameters
//   #sand=40&silt=40&clay=20         older links without a route: parameters only
//
// Tab and section names are lower-case words ([a-z0-9-]). A hash that names
// no known tab and has no parameters (for example "#src-ssm", a citation) is
// not a route: resolveRoute gives null and the page keeps the current view.

const NAME = /^[a-z][a-z0-9-]*$/;

/** '#tab/section?k=v' -> { tab, section, params } (null when absent). */
export function parseHash(hash) {
  const s = String(hash ?? '').replace(/^#/, '');
  const q = s.indexOf('?');
  let path = q >= 0 ? s.slice(0, q) : s;
  let query = q >= 0 ? s.slice(q + 1) : '';
  // Older links: only parameters, no route.
  if (q < 0 && path.includes('=')) { query = path; path = ''; }
  const [tab = '', section = ''] = path.split('/');
  const params = {};
  for (const [k, v] of new URLSearchParams(query)) params[k] = v;
  return {
    tab: NAME.test(tab) ? tab : null,
    section: NAME.test(section) ? section : null,
    params,
  };
}

/** { tab, section, params } -> '#tab/section?k=v'. The default section can be left out. */
export function formatHash({ tab, section = null, params = {} }) {
  let out = `#${tab}`;
  if (section) out += `/${section}`;
  const q = new URLSearchParams(params).toString();
  return q ? `${out}?${q}` : out;
}

/**
 * Resolve a parsed hash against the tab list [{ id, sections: [ids] }]:
 * unknown tabs fall back to the first tab, unknown sections to the tab's
 * first section. Returns null when the hash is not a route at all (so the
 * caller keeps the current view), unless `fallback` is set.
 */
export function resolveRoute(parsed, tabs, { fallback = false } = {}) {
  const hasParams = Object.keys(parsed.params).length > 0;
  let tab = tabs.find((t) => t.id === parsed.tab);
  if (!tab) {
    if (!fallback && !hasParams) return null;
    tab = tabs[0];
  }
  const section = tab.sections.includes(parsed.section) ? parsed.section : tab.sections[0];
  return { tab: tab.id, section, params: parsed.params };
}
