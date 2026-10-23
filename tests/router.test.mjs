// Hash routing of the single page (site/assets/router.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, formatHash, resolveRoute } from '../site/assets/router.js';

const TABS = [
  { id: 'texture', sections: ['triangle', 'jar'] },
  { id: 'later', sections: ['main'] },
];

test('parse: tab, section and parameters', () => {
  assert.deepEqual(parseHash('#texture'), { tab: 'texture', section: null, params: {} });
  assert.deepEqual(parseHash('#texture/jar'), { tab: 'texture', section: 'jar', params: {} });
  assert.deepEqual(parseHash('#texture?sand=40&silt=40&clay=20&calc=silt&sys=usda'),
    { tab: 'texture', section: null, params: { sand: '40', silt: '40', clay: '20', calc: 'silt', sys: 'usda' } });
  assert.deepEqual(parseHash('#texture/jar?x=1'), { tab: 'texture', section: 'jar', params: { x: '1' } });
});

test('parse: empty hash, older parameter-only links, odd input', () => {
  assert.deepEqual(parseHash(''), { tab: null, section: null, params: {} });
  assert.deepEqual(parseHash('#'), { tab: null, section: null, params: {} });
  assert.deepEqual(parseHash(undefined), { tab: null, section: null, params: {} });
  assert.deepEqual(parseHash('#sand=60&silt=30&clay=10&calc=silt&sys=usda'),
    { tab: null, section: null, params: { sand: '60', silt: '30', clay: '10', calc: 'silt', sys: 'usda' } });
  assert.equal(parseHash('#Texture/<b>').tab, null);
  assert.equal(parseHash('#texture/<b>').section, null);
  assert.equal(parseHash('#texture?sand=a%20b').params.sand, 'a b');
});

test('format: the default section can be left out, parameters are encoded', () => {
  assert.equal(formatHash({ tab: 'texture' }), '#texture');
  assert.equal(formatHash({ tab: 'texture', section: 'jar' }), '#texture/jar');
  assert.equal(formatHash({ tab: 'texture', params: { sand: 60, silt: 30, clay: 10, calc: 'silt' } }), '#texture?sand=60&silt=30&clay=10&calc=silt');
  assert.equal(formatHash({ tab: 'texture', params: { note: 'a&b' } }), '#texture?note=a%26b');
});

test('format and parse round-trip', () => {
  for (const r of [
    { tab: 'texture', section: 'jar', params: {} },
    { tab: 'texture', section: null, params: { sand: '12.5', silt: '57.5', clay: '30', calc: 'clay', sys: 'aisne' } },
  ]) assert.deepEqual(parseHash(formatHash(r)), r);
});

test('resolve: defaults and fallbacks', () => {
  const r = (h, o) => resolveRoute(parseHash(h), TABS, o);
  assert.deepEqual(r('#texture'), { tab: 'texture', section: 'triangle', params: {} });
  assert.deepEqual(r('#texture/jar'), { tab: 'texture', section: 'jar', params: {} });
  assert.deepEqual(r('#texture/nope'), { tab: 'texture', section: 'triangle', params: {} });
  assert.deepEqual(r('#later'), { tab: 'later', section: 'main', params: {} });
  // Not a route (a citation, an old tool name): keep the current view...
  assert.equal(r('#src-ssm'), null);
  assert.equal(r('#water'), null);
  assert.equal(r(''), null);
  // ...except on first load, which falls back to the first tab.
  assert.deepEqual(r('', { fallback: true }), { tab: 'texture', section: 'triangle', params: {} });
  assert.deepEqual(r('#water', { fallback: true }), { tab: 'texture', section: 'triangle', params: {} });
  // Older links with only a sample open the first tab with it.
  assert.deepEqual(r('#sand=60&silt=30&clay=10'), { tab: 'texture', section: 'triangle', params: { sand: '60', silt: '30', clay: '10' } });
});
