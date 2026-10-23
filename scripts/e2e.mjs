// Browser check of the single page: screenshots of each section (desktop/phone
// x light/dark x fr/en), the tab bar and hash routing (sections, back button,
// citations, older links), scripted interaction on the triangle (drag, tap,
// type, sliders, calculated fraction, keyboard, paste, system switch) and on
// the jar test calculator. Fails on any console error or warning, and on any
// horizontal overflow.
//
//   npm i            (installs playwright, dev only)
//   npx playwright install chromium   (once, if no browser is cached)
//   BASE=http://localhost:9417 node scripts/e2e.mjs
//
// Screenshots go to $SHOTS (default /tmp/sols-shots).

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const BASE = process.env.BASE || 'http://localhost:9417';
const SHOTS = process.env.SHOTS || '/tmp/sols-shots';
mkdirSync(SHOTS, { recursive: true });

const devices = {
  desktop: { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await chromium.launch();
const problems = [];
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) problems.push(msg); };

async function newPage(device, scheme, lang) {
  const ctx = await browser.newContext({ ...devices[device], colorScheme: scheme, locale: lang === 'fr' ? 'fr-FR' : 'en-GB' });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push(`[${device} ${scheme} ${lang}] console ${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`[${device} ${scheme} ${lang}] page error: ${e.message}`));
  return { ctx, page };
}

const values = (page) => page.evaluate(() => {
  const v = (k) => {
    const out = document.getElementById(`f-${k}-out`);
    const num = document.getElementById(`f-${k}-num`);
    return Number((out.hidden ? num.value : out.textContent).replace(',', '.'));
  };
  return { sand: v('sand'), silt: v('silt'), clay: v('clay') };
});
const className = (page) => page.textContent('#result-name');
// page.waitForFunction evaluates strings, which the site's content security
// policy forbids (the Docker image sends it): poll with page.evaluate instead.
async function waitFor(page, fn, arg, what = 'condition') {
  for (let i = 0; i < 400; i++) {
    if (await page.evaluate(fn, arg)) return;
    await page.waitForTimeout(25);
  }
  throw new Error(`timed out waiting for ${what}`);
}
// app.js stamps the route it has shown on <html data-route="tab/section">.
const route = (page, r) => waitFor(page, (r) => document.documentElement.dataset.route === r, r, `route ${r}`);

// Where a composition is on screen (equilateral USDA layout).
async function screenPoint(page, { silt, clay }) {
  return page.evaluate(({ silt, clay }) => {
    const svg = document.querySelector('.tri-svg');
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const k = r.width / vb.width;
    const x = 13 + silt + clay / 2, y = 9 + (100 - clay) * Math.sqrt(3) / 2; // margins as in triangle.js
    return { x: r.left + x * k, y: r.top + y * k };
  }, { silt, clay });
}

// ---------------------------------------------------------------- screenshots
const overflowOf = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const visible = (page, sel) => page.isVisible(sel);
for (const device of Object.keys(devices)) {
  for (const scheme of ['light', 'dark']) {
    for (const lang of ['en', 'fr']) {
      const tag = `[${device} ${scheme} ${lang}]`;
      const { ctx, page } = await newPage(device, scheme, lang);
      // No hash: the first tab, its first section, the default sample in the URL.
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
      ok((await page.getAttribute('html', 'lang')) === lang, `${tag} browser language not picked up`);
      ok(new URL(page.url()).hash === '#texture?sand=40&silt=40&clay=20&calc=silt&sys=usda', `${tag} default route: ${page.url()}`);
      ok((await page.textContent('#tabs a[aria-current="page"]')) === (lang === 'fr' ? 'Texture du sol' : 'Texture'), `${tag} tab label`);
      ok(await visible(page, '[data-section-panel="triangle"]') && !(await visible(page, '[data-section-panel="jar"]')), `${tag} triangle section shown alone`);
      ok(await visible(page, '#sources'), `${tag} sources under the triangle`);
      await page.screenshot({ path: `${SHOTS}/triangle-${device}-${scheme}-${lang}.png`, fullPage: true });
      await page.screenshot({ path: `${SHOTS}/triangle-${device}-${scheme}-${lang}-top.png` });
      let overflow = await overflowOf(page);
      ok(overflow <= 0, `${tag} triangle: horizontal overflow ${overflow}px`);
      // The jar test, from the section link.
      await page.click('[data-section-link="jar"]'); await route(page, 'texture/jar');
      await route(page, 'texture/jar');
      ok(await visible(page, '#jar-main') && !(await visible(page, '#tri-card')), `${tag} jar section shown alone`);
      ok((await page.getAttribute('[data-section-link="jar"]', 'aria-current')) === 'page', `${tag} jar link marked current`);
      ok(await visible(page, '#sources'), `${tag} sources under the jar test`);
      ok(await page.evaluate(() => window.scrollY === 0), `${tag} section change scrolls to the top`);
      ok((await page.title()).startsWith(lang === 'fr' ? 'Le test du bocal' : 'The jar test'), `${tag} jar title: ${await page.title()}`);
      await page.locator('figure.photo img').scrollIntoViewIfNeeded();
      await waitFor(page, () => document.querySelector('figure.photo img').complete, null, 'the photo');
      ok(await page.evaluate(() => document.querySelector('figure.photo img').naturalWidth > 0), `${tag} jar photo loads`);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${SHOTS}/jar-${device}-${scheme}-${lang}.png`, fullPage: true });
      overflow = await overflowOf(page);
      ok(overflow <= 0, `${tag} jar: horizontal overflow ${overflow}px`);
      await ctx.close();
    }
  }
}
// Each classification system, desktop light, in the language that suits it.
for (const [sys, lang, comp] of [['geppa', 'fr', 'sand=30&silt=45&clay=25'], ['aisne', 'fr', 'sand=12&silt=58&clay=30'], ['uk', 'en', 'sand=35&silt=47&clay=18'], ['usda', 'en', 'sand=30&silt=31&clay=39']]) {
  const { ctx, page } = await newPage('desktop', 'light', lang);
  await page.goto(`${BASE}/#texture?${comp}&calc=silt&sys=${sys}`, { waitUntil: 'networkidle' });
  ok((await page.getAttribute('#sys-switch button[aria-pressed="true"]', 'aria-pressed')) === 'true' && new URL(page.url()).hash.includes(`sys=${sys}`), `system ${sys} from the URL`);
  await page.screenshot({ path: `${SHOTS}/system-${sys}-${lang}.png`, fullPage: true });
  await ctx.close();
}

// ---------------------------------------------------------------- interaction (desktop)
{
  const { ctx, page } = await newPage('desktop', 'light', 'en');
  await page.goto(`${BASE}/#texture?sand=40&silt=40&clay=20&calc=silt&sys=usda`, { waitUntil: 'networkidle' });
  ok((await className(page)) === 'Loam', 'start: loam');

  // Drag in the triangle from loam towards clay.
  const a = await screenPoint(page, { silt: 40, clay: 20 });
  const b = await screenPoint(page, { silt: 30, clay: 50 });
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(a.x + ((b.x - a.x) * i) / 10, a.y + ((b.y - a.y) * i) / 10);
  await page.mouse.up();
  let v = await values(page);
  ok(Math.abs(v.clay - 50) <= 1 && Math.abs(v.silt - 30) <= 1, `drag: got ${JSON.stringify(v)}`);
  ok((await className(page)) === 'Clay', `drag: class ${await className(page)}`);
  await page.screenshot({ path: `${SHOTS}/interact-1-drag.png` });

  // Type two values; silt is calculated.
  await page.fill('#f-sand-num', '23');
  await page.fill('#f-clay-num', '26');
  v = await values(page);
  ok(v.sand === 23 && v.clay === 26 && v.silt === 51, `type: ${JSON.stringify(v)}`);
  ok((await className(page)) === 'Silt loam', `type: class ${await className(page)}`);

  // A typed value that would overflow is refused with a message.
  await page.fill('#f-sand-num', '80');
  const msg = await page.textContent('#msg');
  ok(/over 100/.test(msg), `overflow message: "${msg}"`);
  v = await values(page);
  ok(v.clay === 26 && v.silt === 51, `overflow keeps state: ${JSON.stringify(v)}`);
  await page.screenshot({ path: `${SHOTS}/interact-2-type-error.png` });
  await page.fill('#f-sand-num', '23');

  // Slider with the keyboard: sand +5 -> silt -5, clay untouched.
  await page.focus('#f-sand-range');
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  v = await values(page);
  ok(v.sand === 28 && v.silt === 46 && v.clay === 26, `slider: ${JSON.stringify(v)}`);

  // Make clay the calculated fraction; now the sand slider trades with clay.
  await page.click('#f-clay-calc');
  ok(await page.isDisabled('#f-clay-range'), 'calc switch: clay slider disabled');
  await page.focus('#f-sand-range');
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowLeft');
  v = await values(page);
  ok(v.sand === 25 && v.silt === 46 && v.clay === 29, `calc clay: ${JSON.stringify(v)}`);
  const rule = await page.textContent('#rule');
  ok(/clay is calculated/i.test(rule), `rule line: ${rule}`);
  await page.screenshot({ path: `${SHOTS}/interact-3-calc-clay.png` });

  // Mouse drag on a slider thumb.
  const box = await page.locator('#f-sand-range').boundingBox();
  await page.mouse.click(box.x + box.width * 0.45, box.y + box.height / 2);
  v = await values(page);
  ok(Math.abs(v.sand - 45) <= 2 && v.silt === 46 && Math.abs(v.sand + v.silt + v.clay - 100) < 1e-6, `slider click: ${JSON.stringify(v)}`);
  // Past the limit the other entered fraction (silt) makes room: clay stays at 0.
  await page.mouse.click(box.x + box.width * 0.7, box.y + box.height / 2);
  v = await values(page);
  ok(v.clay === 0 && Math.abs(v.sand + v.silt - 100) < 1e-6 && v.sand > 60, `slider makes room: ${JSON.stringify(v)}`);

  // Keyboard on the point: arrow up adds clay.
  const before = await values(page);
  await page.focus('.tri-handle');
  await page.keyboard.press('ArrowUp');
  v = await values(page);
  ok(Math.abs(v.clay - before.clay - 1) < 1e-6, `handle up: ${JSON.stringify(before)} -> ${JSON.stringify(v)}`);
  await page.keyboard.press('Shift+ArrowLeft');
  const v2 = await values(page);
  ok(Math.abs(v2.sand - v.sand - 5) < 1e-6 && v2.clay === v.clay, `handle shift-left: ${JSON.stringify(v2)}`);

  // Paste a French lab report.
  await page.click('#paste-details summary');
  await page.fill('#paste', 'Argile (< 2 µm) : 215 g/kg\nLimons fins (2/20 µm) : 310 g/kg\nLimons grossiers (20/50 µm) : 205 g/kg\nSables fins (50/200 µm) : 150 g/kg\nSables grossiers (200/2000 µm) : 120 g/kg');
  await page.click('#paste-go');
  v = await values(page);
  ok(v.sand === 27 && v.silt === 51.5 && v.clay === 21.5, `paste: ${JSON.stringify(v)}`);
  await page.screenshot({ path: `${SHOTS}/interact-4-paste.png`, fullPage: false });

  // Near a boundary: neighbours are listed.
  await page.goto(`${BASE}/#texture?sand=30&silt=31&clay=39&calc=silt&sys=usda`, { waitUntil: 'networkidle' });
  const near = await page.textContent('#result-near');
  ok(/Clay: 0\.9 points away/.test(near), `neighbours: ${near}`);

  // Sand grades -> subclass.
  await page.goto(`${BASE}/#texture?sand=75&silt=15&clay=10&calc=silt&sys=usda`, { waitUntil: 'networkidle' });
  await page.click('#grades-details summary');
  for (const [k, x] of [['vcs', 2], ['cs', 6], ['ms', 20], ['fs', 35], ['vfs', 12]]) await page.fill(`#g-${k}`, String(x));
  const sub = await page.textContent('#result-sub');
  ok(/Fine sandy loam/.test(sub), `subclass: ${sub}`);

  // System switch keeps the point.
  await page.click('#sys-switch button:has-text("GEPPA")');
  ok((await page.textContent('#result-sys')).includes('GEPPA'), 'switch to GEPPA');
  v = await values(page);
  ok(v.sand === 75, 'switch keeps values');

  // Language and theme toggles.
  await page.click('[data-lang-btn="fr"]');
  ok((await page.textContent('h1')) === 'Triangle des textures du sol', 'language toggle');
  await page.click('[data-theme-btn]');
  ok((await page.getAttribute('html', 'data-theme')) === 'dark', 'theme toggle');
  await page.screenshot({ path: `${SHOTS}/interact-5-fr-dark-geppa.png` });
  await ctx.close();
}

// ---------------------------------------------------------------- interaction (phone)
{
  const { ctx, page } = await newPage('phone', 'light', 'fr');
  await page.goto(`${BASE}/#texture?sand=40&silt=40&clay=20&calc=silt&sys=usda`, { waitUntil: 'networkidle' });
  await page.locator('#tri').scrollIntoViewIfNeeded();
  const p = await screenPoint(page, { silt: 70, clay: 10 });
  await page.touchscreen.tap(p.x, p.y);
  const v = await values(page);
  ok(Math.abs(v.silt - 70) <= 1 && Math.abs(v.clay - 10) <= 1, `tap: ${JSON.stringify(v)}`);
  ok((await className(page)) === 'Loam limoneux', `tap class: ${await className(page)}`);
  await page.screenshot({ path: `${SHOTS}/interact-6-phone-tap.png` });
  // The page must not scroll sideways.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(overflow <= 0, `phone horizontal overflow: ${overflow}px`);
  await ctx.close();
}

// ---------------------------------------------------------------- jar test and routing
{
  const { ctx, page } = await newPage('desktop', 'light', 'en');
  await page.goto(`${BASE}/#texture/jar`, { waitUntil: 'networkidle' });
  ok((await page.title()) === 'The jar test · outils-sols', `jar title: ${await page.title()}`);
  // Jar test calculator, linked to the triangle.
  ok(/66\.2 · 22\.1 · 11\.8/.test(await page.textContent('#jar-calc .hero')), 'jar: Chambres d’agriculture example');
  await page.fill('#j-clay', '1');
  await page.fill('#j-silt', '3');
  await page.fill('#j-sand', '6');
  const href = await page.getAttribute('#jar-to-triangle', 'href');
  ok(href === '#texture?sand=60&silt=30&clay=10&calc=silt', `jar link: ${href}`);
  await page.click('#jar-to-triangle');
  await route(page, 'texture/triangle');
  ok(await page.isVisible('#tri-card') && !(await page.isVisible('#jar-main')), 'jar -> triangle section');
  ok((await page.textContent('#result-name')) === 'Sandy loam', `jar -> triangle: ${await page.textContent('#result-name')}`);
  ok(new URL(page.url()).hash === '#texture?sand=60&silt=30&clay=10&calc=silt&sys=usda', `triangle writes its URL: ${page.url()}`);
  ok((await page.title()) === 'Soil texture triangle · outils-sols', `triangle title: ${await page.title()}`);
  // The back button returns to the jar test, with its values kept.
  await page.goBack();
  await route(page, 'texture/jar');
  ok(await page.isVisible('#jar-main') && (await page.inputValue('#j-sand')) === '6', 'back: jar test with its values');
  await page.goForward();
  await route(page, 'texture/triangle');
  ok((await page.textContent('#result-name')) === 'Sandy loam', 'forward: the sample again');

  // The jar link keeps the classification chosen in the triangle.
  await page.click('#sys-switch button:has-text("GEPPA")');
  await page.click('#result-jar');
  await route(page, 'texture/jar');
  await page.click('#jar-to-triangle');
  await route(page, 'texture/triangle');
  ok((await page.textContent('#result-sys')).includes('GEPPA'), 'jar -> triangle keeps GEPPA');
  // From the lead and from the "jar test" input of the triangle.
  await page.click('.lead a[href="#texture/jar"]');
  await route(page, 'texture/jar');
  ok(await page.isVisible('#jar-main'), 'lead link opens the jar test');
  await page.click('[data-section-link="triangle"]'); await route(page, 'texture/triangle');
  await page.click('#jar-details summary');
  await page.click('#jar-details a[href="#texture/jar"]');
  await route(page, 'texture/jar');
  ok(await page.isVisible('#jar-main'), 'jar input help links to the jar test');
  await page.click('[data-section-link="triangle"]'); await route(page, 'texture/triangle');
  // Layers typed in the triangle's own jar input (still open).
  await page.fill('#jar-clay', '8');
  await page.fill('#jar-silt', '15');
  await page.fill('#jar-sand', '45');
  await page.click('#jar-go');
  ok(/sand 66\.2 %/.test(await page.textContent('#jar-msg')), `jar input: ${await page.textContent('#jar-msg')}`);

  // A citation jumps to the source list without changing the route.
  const before = page.url();
  await page.click('#info a.src >> nth=0');
  const target = await page.evaluate(() => document.querySelector('.sources li.is-target')?.id);
  ok(page.url() === before && /^src-/.test(target ?? ''), `citation: ${page.url()} ${target}`);
  ok(await page.isVisible('#tri-card'), 'citation keeps the triangle on screen');
  await page.click('[data-section-link="jar"]'); await route(page, 'texture/jar');
  await page.click('#jar-main a.src >> nth=0');
  ok(page.url().endsWith('#texture/jar') && await page.isVisible('#jar-main'), 'citation in the jar test');

  // Every link stays on the page (a known route or a listed source) or is an outside https link.
  for (const sec of ['triangle', 'jar']) {
    await page.click(`[data-section-link="${sec}"]`);
    await route(page, `texture/${sec}`);
    const bad = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => {
      if (/^https:\/\//.test(h)) return false;
      if (/^#src-/.test(h)) return !document.getElementById(h.slice(1));
      return !/^#texture(\/jar)?(\?.*)?$/.test(h);
    }));
    ok(bad.length === 0, `${sec}: links that go nowhere: ${bad.join(', ')}`);
  }

  // Older links (parameters only) and unknown routes.
  await page.goto(`${BASE}/#sand=60&silt=30&clay=10&calc=silt&sys=usda`, { waitUntil: 'networkidle' });
  await route(page, 'texture/triangle');
  ok((await page.textContent('#result-name')) === 'Sandy loam' && page.url().includes('#texture?'), `older link: ${page.url()}`);
  await page.goto(`${BASE}/#water`, { waitUntil: 'networkidle' });
  ok(await page.isVisible('#tri-card'), 'unknown route falls back to the triangle');
  await page.goto(`${BASE}/#texture?sand=90&silt=90&clay=90`, { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  ok((await page.textContent('#result-name')) === 'Loam', 'a sample that does not add to 100 is ignored');
  await page.screenshot({ path: `${SHOTS}/interact-7-jar.png`, fullPage: false });
  await ctx.close();
}
{
  // Phone: the jar test in French, the calculator, the section links.
  const { ctx, page } = await newPage('phone', 'dark', 'fr');
  await page.goto(`${BASE}/#texture/jar`, { waitUntil: 'networkidle' });
  ok(/66,2 · 22,1 · 11,8/.test(await page.textContent('#jar-calc .hero')), 'phone jar: example in French');
  await page.locator('#jar-to-triangle').tap();
  await route(page, 'texture/triangle');
  ok((await page.textContent('#result-name')) === 'Loam sableux', `phone jar -> triangle: ${await page.textContent('#result-name')}`);
  ok(await page.isVisible('.subnav'), 'phone: section links shown');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(overflow <= 0, `phone after jar: horizontal overflow ${overflow}px`);
  await ctx.close();
}

await browser.close();
if (problems.length) {
  console.error(`FAILED ${problems.length} of ${checks} checks:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`OK: ${checks} checks, no console errors. Screenshots in ${SHOTS}`);
void assert;
