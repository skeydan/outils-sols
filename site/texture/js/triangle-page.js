// The texture triangle section (DOM). Pure logic lives in model.js,
// classify.js and parse.js; content in info/*.js. Started by tab.js.

import { lang } from '../../assets/site.js';
import { STR } from './i18n.js';
import { SYSTEMS, SYSTEM_ORDER } from './systems/index.js';
import { className, classGloss } from './names.js';
import { classify, neighbours, findClass } from './classify.js';
import { createState, slide, type, setCalc, snapComposition, nudge, setComposition, KEYS, inputKeys } from './model.js';
import { parseLab, jarToPercent } from './parse.js';
import { usdaSubclass } from './systems/usda.js';
import { createTriangle, fmt } from './triangle.js';
import { renderInfo, renderTable } from './info/render.js';

const NEAR = 3; // percentage points: classes this close are shown as "within reach"
// Rows and the jar are shown as the layers settle in a jar: clay on top, sand at the bottom.
const JAR_ORDER = ['clay', 'silt', 'sand'];

const t = (k, vars) => {
  const s = STR[k]?.[lang()] ?? STR[k]?.en ?? k;
  return vars ? s.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? '') : s;
};

// ---------------------------------------------------------------- state
let state = createState({ sand: 40, silt: 40, clay: 20 }, 'silt');
let systemId = 'usda';
let grades = null; // USDA sand grades, % of the whole sample
let lastClassKey = '';
const typedErrors = {}; // key -> error code while a typed value is refused
let active = false; // is the triangle the section on screen (and in the URL)?
let setParams = () => {};

/** URL parameters -> {comp, calc, sys}, keeping only valid values. */
export function readParams(p) {
  const out = {};
  const n = (k) => (p[k] !== undefined && p[k] !== '' ? Number(p[k]) : NaN);
  const sand = n('sand'), silt = n('silt'), clay = n('clay');
  if ([sand, silt, clay].every(Number.isFinite) && Math.abs(sand + silt + clay - 100) < 0.05 && Math.min(sand, silt, clay) >= 0) {
    out.comp = { sand, silt, clay };
  }
  if (KEYS.includes(p.calc)) out.calc = p.calc;
  if (SYSTEMS[p.sys]) out.sys = p.sys;
  return out;
}
function writeHash() {
  if (!active) return;
  setParams({ sand: fmt(state.sand), silt: fmt(state.silt), clay: fmt(state.clay), calc: state.calc, sys: systemId });
}

// ---------------------------------------------------------------- DOM refs
const $ = (id) => document.getElementById(id);
const els = {
  sysSwitch: $('sys-switch'), sysNote: $('sys-note'), tri: $('tri'), legendNear: $('legend-near'),
  rule: $('rule'), fracs: $('fracs'), msg: $('msg'),
  resultSys: $('result-sys'), resultName: $('result-name'), resultGloss: $('result-gloss'),
  resultSub: $('result-sub'), resultComp: $('result-comp'), resultNear: $('result-near'),
  info: $('info'), tableView: $('table-view'),
  paste: $('paste'), pasteGo: $('paste-go'), pasteExample: $('paste-example'), pasteMsg: $('paste-msg'),
  grades: $('grades'), gradesMsg: $('grades-msg'),
};

const describe = (c) =>
  t('handle.label', { sand: fmt(c.sand), silt: fmt(c.silt), clay: fmt(c.clay), cls: currentName() });

const tri = createTriangle(els.tri, {
  onPick(comp, { final }) {
    state = snapComposition(state, comp);
    clearTypedErrors();
    update({ from: 'triangle', final });
  },
  describe,
});

// Keyboard on the point.
tri.handle.addEventListener('keydown', (e) => {
  const dir = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[e.key];
  if (!dir) return;
  e.preventDefault();
  state = nudge(state, dir, e.shiftKey ? 5 : 1);
  clearTypedErrors();
  update({ from: 'keyboard' });
});

// ---------------------------------------------------------------- systems
function buildSystemSwitch() {
  els.sysSwitch.replaceChildren();
  for (const id of SYSTEM_ORDER) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = t(`sys.${id}.short`);
    b.setAttribute('aria-pressed', String(id === systemId));
    b.addEventListener('click', () => {
      systemId = id;
      update({ from: 'system' });
      buildSystemSwitch();
    });
    els.sysSwitch.appendChild(b);
  }
}

// ---------------------------------------------------------------- fractions
const rows = {};
function buildFractions() {
  els.fracs.replaceChildren();
  for (const k of JAR_ORDER) {
    const row = document.createElement('div');
    row.className = 'frac';
    const id = `f-${k}`;

    const label = document.createElement('label');
    label.className = 'name';
    label.htmlFor = `${id}-num`;
    setLabel(label, k);

    const range = document.createElement('input');
    range.type = 'range';
    range.min = '0'; range.max = '100'; range.step = '1';
    range.id = `${id}-range`;
    range.className = k;
    range.setAttribute('aria-label', t('range.label', { f: t(k) }));
    range.addEventListener('input', () => {
      state = slide(state, k, Number(range.value));
      clearTypedErrors();
      update({ from: 'slider', key: k });
    });

    const wrap = document.createElement('div');
    wrap.className = 'num-wrap';
    const num = document.createElement('input');
    num.type = 'text';
    num.inputMode = 'decimal';
    num.autocomplete = 'off';
    num.id = `${id}-num`;
    num.setAttribute('aria-describedby', 'msg');
    const out = document.createElement('output');
    out.id = `${id}-out`;
    out.setAttribute('for', `${id}-range`);
    const pct = document.createElement('span');
    pct.className = 'pct';
    pct.textContent = '%';
    pct.setAttribute('aria-hidden', 'true');
    wrap.append(num, out, pct);
    num.addEventListener('input', () => {
      const r = type(state, k, num.value);
      if (r.error && r.error !== 'empty') {
        typedErrors[k] = r;
        num.setAttribute('aria-invalid', 'true');
      } else {
        delete typedErrors[k];
        num.removeAttribute('aria-invalid');
        state = r.state;
      }
      update({ from: 'typed', key: k });
    });
    num.addEventListener('blur', () => {
      // Leaving a field with a refused or empty value restores the shown value.
      delete typedErrors[k];
      num.removeAttribute('aria-invalid');
      update({ from: 'blur' });
    });

    const pick = document.createElement('div');
    pick.className = 'calc-pick';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'calc-toggle';
    toggle.id = `f-${k}-calc`;
    toggle.addEventListener('click', () => {
      state = setCalc(state, k);
      clearTypedErrors();
      update({ from: 'calc' });
    });
    pick.append(toggle);

    row.append(label, range, wrap, pick);
    els.fracs.appendChild(row);
    rows[k] = { row, label, range, num, out, toggle };
  }
}

function setLabel(label, k) {
  const chip = document.createElement('span');
  chip.className = `chip ${k}`;
  chip.setAttribute('aria-hidden', 'true');
  label.replaceChildren(chip, document.createTextNode(t(k)));
}

// The jar: three layers in proportion, sand at the bottom.
const NSVG = 'http://www.w3.org/2000/svg';
function svgEl(name, attrs, parent) {
  const n = document.createElementNS(NSVG, name);
  for (const [a, v] of Object.entries(attrs)) n.setAttribute(a, v);
  if (parent) parent.appendChild(n);
  return n;
}
function renderJar() {
  const box = $('jar');
  const svg = svgEl('svg', { viewBox: '0 0 60 230', preserveAspectRatio: 'xMidYMax meet' });
  const top = 30, bottom = 222, left = 8, right = 52;
  svgEl('rect', { x: left, y: top + 8, width: right - left, height: bottom - top - 8, rx: 6, class: 'water' }, svg);
  const soilH = 150; // drawing height of the settled soil
  let y = bottom;
  for (const k of ['sand', 'silt', 'clay']) {
    const hgt = (state[k] / 100) * soilH;
    y -= hgt;
    svgEl('rect', { x: left, y, width: right - left, height: hgt, class: `layer ${k}`, rx: k === 'sand' ? 5 : 0 }, svg);
    if (hgt >= 13) {
      const tx = svgEl('text', { x: 30, y: y + hgt / 2 + 3.2, 'text-anchor': 'middle', class: k === 'sand' ? 'dark' : '' }, svg);
      tx.textContent = `${fmt(state[k])}%`;
    }
  }
  svgEl('path', { d: `M${left + 4} ${top} h${right - left - 8} M${left} ${top + 8} q0 -8 6 -8 M${right} ${top + 8} q0 -8 -6 -8 M${left} ${top + 8} V${bottom - 6} q0 6 6 6 H${right - 6} q6 0 6 -6 V${top + 8}`, class: 'glass' }, svg);
  svgEl('rect', { x: left + 2, y: top - 12, width: right - left - 4, height: 10, rx: 2, class: 'glass' }, svg);
  box.replaceChildren(svg);
}

function renderRampLegend(system) {
  const ul = $('ramp-legend');
  ul.replaceChildren();
  const ttl = document.createElement('li');
  ttl.className = 'ttl';
  ttl.textContent = t('legend.groups');
  ul.appendChild(ttl);
  for (const g of system.legend) {
    const li = document.createElement('li');
    const sw = document.createElement('span');
    sw.className = `sw g${g.step}`;
    sw.setAttribute('aria-hidden', 'true');
    li.append(sw, document.createTextNode(g.name[lang()] ?? g.name.en));
    ul.appendChild(li);
  }
}

// Jar test layers -> percentages.
const jarInputs = {};
function buildJarInputs() {
  const box = $('jar-inputs');
  box.replaceChildren();
  for (const k of JAR_ORDER) {
    const wrap = document.createElement('div');
    const l = document.createElement('label');
    l.htmlFor = `jar-${k}`;
    l.textContent = t(`jarin.${k}`);
    const i = document.createElement('input');
    i.id = `jar-${k}`;
    i.type = 'text';
    i.inputMode = 'decimal';
    i.autocomplete = 'off';
    wrap.append(l, i);
    box.appendChild(wrap);
    jarInputs[k] = i;
  }
}
$('jar-go').addEventListener('click', () => {
  const r = jarToPercent(Object.fromEntries(JAR_ORDER.map((k) => [k, jarInputs[k].value])));
  const box = $('jar-msg');
  box.className = 'msg';
  if (!r.ok) {
    box.classList.add('error');
    box.textContent = t(`jarin.err.${r.error}`);
    return;
  }
  state = setComposition(state, r);
  clearTypedErrors();
  box.classList.add('info');
  box.textContent = t('jarin.ok', { sand: fmt(r.sand), silt: fmt(r.silt), clay: fmt(r.clay) });
  update({ from: 'jar' });
});

function clearTypedErrors() {
  for (const k of Object.keys(typedErrors)) delete typedErrors[k];
  for (const k of KEYS) rows[k]?.num.removeAttribute('aria-invalid');
}

function syncFractions(from, key) {
  for (const k of KEYS) {
    const r = rows[k];
    const isCalc = state.calc === k;
    r.row.classList.toggle('is-calc', isCalc);
    setLabel(r.label, k);
    r.label.htmlFor = isCalc ? `f-${k}-range` : `f-${k}-num`;
    r.range.value = String(Math.round(state[k]));
    r.range.disabled = isCalc;
    r.range.setAttribute('aria-label', t(isCalc ? 'range.labelCalc' : 'range.label', { f: t(k) }));
    r.range.setAttribute('aria-valuetext', `${fmt(state[k])} %`);
    r.num.hidden = isCalc;
    r.out.hidden = !isCalc;
    r.out.textContent = fmt(state[k]);
    // Do not overwrite the field the user is typing in.
    if (!(from === 'typed' && key === k)) r.num.value = fmt(state[k]);
    r.toggle.textContent = isCalc ? t('calc.is') : t('calc.make');
    r.toggle.setAttribute('aria-pressed', String(isCalc));
    r.toggle.setAttribute('aria-label', isCalc ? t('calc.isLabel', { f: t(k) }) : t('calc.makeLabel', { f: t(k) }));
  }
  const [a, b] = inputKeys(state);
  els.rule.textContent = lang() === 'fr'
    ? t(`rule.fr.${state.calc}`)
    : t('rule', { calc: t(state.calc).toLowerCase(), a: t(a).toLowerCase(), b: t(b).toLowerCase() });

  const errs = Object.entries(typedErrors);
  els.msg.className = 'msg';
  if (errs.length) {
    const [k, e] = errs[0];
    els.msg.classList.add('error');
    els.msg.textContent =
      e.error === 'sum' ? t('err.sum', { f: t(k).toLowerCase(), o: t(e.other).toLowerCase(), over: fmt(e.over) })
      : e.error === 'range' ? t('err.range')
      : t('err.nan');
  } else {
    els.msg.textContent = '';
  }
}

// ---------------------------------------------------------------- paste
function runPaste(text) {
  const r = parseLab(text);
  const box = els.pasteMsg;
  box.className = 'msg';
  if (!r.ok) {
    box.classList.add('error');
    box.textContent = t(`paste.err.${r.error}`, { missing: (r.missing || []).map((m) => t(m).toLowerCase()).join(', ') });
    return;
  }
  state = setComposition(state, r);
  clearTypedErrors();
  grades = r.grades ?? grades;
  if (r.grades) fillGrades();
  const parts = [t('paste.ok', { sand: fmt(r.sand), silt: fmt(r.silt), clay: fmt(r.clay) })];
  for (const n of r.notes) parts.push(t(`paste.note.${n}`, { sum: fmt(r.raw.sum) }));
  if (r.om !== undefined) parts.push(t('paste.note.om', { om: fmt(r.om) }));
  box.classList.add('info');
  box.textContent = parts.join(' ');
  update({ from: 'paste' });
}
els.pasteGo.addEventListener('click', () => runPaste(els.paste.value));
els.pasteExample.addEventListener('click', () => {
  els.paste.value = t('paste.exampleText');
  runPaste(els.paste.value);
});

// ---------------------------------------------------------------- grades
const GRADE_KEYS = ['vcs', 'cs', 'ms', 'fs', 'vfs'];
const gradeInputs = {};
function buildGrades() {
  els.grades.replaceChildren();
  for (const g of GRADE_KEYS) {
    const wrap = document.createElement('div');
    const l = document.createElement('label');
    l.htmlFor = `g-${g}`;
    l.textContent = t(`grade.${g}`);
    const i = document.createElement('input');
    i.id = `g-${g}`;
    i.type = 'text';
    i.inputMode = 'decimal';
    i.autocomplete = 'off';
    i.addEventListener('input', readGrades);
    wrap.append(l, i);
    els.grades.appendChild(wrap);
    gradeInputs[g] = { l, i };
  }
}
function fillGrades() {
  for (const g of GRADE_KEYS) gradeInputs[g].i.value = grades ? fmt(grades[g]) : '';
}
function readGrades() {
  const v = {};
  let any = false;
  for (const g of GRADE_KEYS) {
    const s = gradeInputs[g].i.value.trim().replace(',', '.');
    if (s !== '') any = true;
    v[g] = s === '' ? 0 : Number(s);
  }
  els.gradesMsg.className = 'msg';
  if (!any) { grades = null; els.gradesMsg.textContent = ''; update({ from: 'grades' }); return; }
  if (Object.values(v).some((x) => !Number.isFinite(x) || x < 0)) {
    grades = null;
    els.gradesMsg.classList.add('error');
    els.gradesMsg.textContent = t('err.nan');
    update({ from: 'grades' });
    return;
  }
  const sum = Object.values(v).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - state.sand) <= 1.5) {
    grades = v;
    els.gradesMsg.textContent = '';
  } else if (Math.abs(sum - 100) <= 1.5) {
    grades = Object.fromEntries(GRADE_KEYS.map((g) => [g, (v[g] / sum) * state.sand]));
    els.gradesMsg.classList.add('info');
    els.gradesMsg.textContent = t('grades.ofSand');
  } else {
    grades = null;
    els.gradesMsg.classList.add('error');
    els.gradesMsg.textContent = t('grades.mismatch', { sum: fmt(sum), sand: fmt(state.sand) });
  }
  update({ from: 'grades' });
}

// ---------------------------------------------------------------- render
let current = null; // {system, result, near, subclass}

function currentName() {
  return current ? className(current.system.id, current.result.id, lang()) : '';
}

function update({ from, key, final } = {}) {
  const system = SYSTEMS[systemId];
  const comp = { sand: state.sand, silt: state.silt, clay: state.clay };
  const result = classify(system, comp);
  const near = neighbours(system, comp, result.id, NEAR);
  const subclass = system.id === 'usda' ? usdaSubclass(result.id, gradesMatchingSand()) : null;
  current = { system, comp, result, near, subclass, grades: gradesMatchingSand() };

  syncFractions(from, key);
  tri.render({
    system, comp, classId: result.id, near: near.map((n) => n.id), lang: lang(), t,
    names: (id) => className(system.id, id, lang()),
  });

  // Result card.
  els.resultSys.textContent = t(`sys.${system.id}.long`);
  els.resultName.textContent = className(system.id, result.id, lang());
  const gloss = classGloss(system.id, result.id, lang());
  els.resultGloss.textContent = gloss || '';
  els.resultGloss.hidden = !gloss;
  els.resultSub.textContent = subclass ? t('result.subclass', { name: className('usda-sub', subclass, lang()) }) : '';
  els.resultSub.hidden = !subclass;
  els.resultComp.textContent = `${t('sand')} ${fmt(comp.sand)} % · ${t('silt')} ${fmt(comp.silt)} % · ${t('clay')} ${fmt(comp.clay)} %`;
  renderNear(system, result, near);

  els.sysNote.textContent = t(`sys.${system.id}.note`);
  els.legendNear.textContent = t('legend.near', { n: NEAR });
  renderRampLegend(system);
  renderJar();

  els.tableView.replaceChildren(renderTable({ system, comp, result, near, t, lang: lang() }));
  els.info.replaceChildren(...renderInfo({ ...current, t, lang: lang() }));

  // Announce the class to screen readers only when it changes.
  const classKey = `${system.id}:${result.id}:${subclass ?? ''}`;
  if (classKey !== lastClassKey) {
    if (lastClassKey) $('announce').textContent = t('announce', { name: els.resultName.textContent });
    lastClassKey = classKey;
  }
  writeHash();
  void final;
}

function gradesMatchingSand() {
  if (!grades) return null;
  const sum = GRADE_KEYS.reduce((s, g) => s + grades[g], 0);
  return Math.abs(sum - state.sand) <= 1.5 ? grades : null;
}

function renderNear(system, result, near) {
  const box = els.resultNear;
  box.replaceChildren();
  const onLine = result.boundary;
  if (!near.length) {
    const p = document.createElement('p');
    p.className = 'small muted';
    p.textContent = t('near.none', { n: NEAR });
    box.appendChild(p);
    return;
  }
  const h = document.createElement('p');
  h.className = 'small';
  h.textContent = onLine.length ? t('near.onLine') : t('near.title', { n: NEAR });
  const ul = document.createElement('ul');
  ul.className = 'near-list';
  for (const n of near) {
    const li = document.createElement('li');
    const sw = document.createElement('span');
    sw.className = 'sw near';
    sw.setAttribute('aria-hidden', 'true');
    const txt = document.createElement('span');
    const name = className(system.id, n.id, lang());
    if (n.distance < 1e-6) {
      txt.textContent = t(system.classes[0].rule ? 'near.boundaryRule' : 'near.boundaryFig', { name, cur: className(system.id, result.id, lang()) });
    } else {
      const parts = KEYS.filter((k) => Math.abs(n.delta[k]) >= 0.05)
        .sort((a, b) => Math.abs(n.delta[b]) - Math.abs(n.delta[a]))
        .map((k) => `${n.delta[k] > 0 ? '+' : '−'}${fmt(Math.abs(n.delta[k]))} ${t(k).toLowerCase()}`);
      txt.textContent = t('near.item', { name, d: fmt(n.distance), how: parts.join(', ') });
    }
    li.append(sw, txt);
    ul.appendChild(li);
  }
  box.append(h, ul);
}

// ---------------------------------------------------------------- start
/** Build (or rebuild, after a language change) the whole section. */
export function rebuildTriangle() {
  buildSystemSwitch();
  buildFractions();
  buildGrades();
  fillGrades();
  buildJarInputs();
  update({ from: 'lang' });
}

export function initTriangle(opts) {
  setParams = opts.setParams;
  rebuildTriangle();
}

/**
 * The route entered or left the triangle. A link with another sample (or the
 * back button) brings parameters; without them the current sample is kept.
 */
export function showTriangle(params, isActive) {
  active = isActive;
  if (!active) return;
  const h = readParams(params);
  if (h.comp) state = setComposition(state, h.comp);
  if (h.calc) state = setCalc(state, h.calc);
  if (h.sys) systemId = h.sys;
  if (h.comp || h.calc || h.sys) clearTypedErrors();
  buildSystemSwitch();
  update({ from: 'hash' });
  tri.redrawStatic(); // the section may just have become visible
}
void findClass;
