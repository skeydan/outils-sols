// SVG texture triangle: drawing + pointer / touch / keyboard interaction.
//
// Visual rules: classes are told apart by direct labels and a
// 2px surface gap, not by 12 hues. Only two states carry colour: "your
// class" (cyan wash + outline) and "classes within reach" (yellow wash). The
// sample point is an ink dot with a surface ring. Gridlines are solid
// hairlines. A table twin of the triangle lives in the page.

import { layouts, clampComposition } from './layouts.js';
import { classify } from './classify.js';

const NS = 'http://www.w3.org/2000/svg';
const M = { top: 9, right: 13, bottom: 15, left: 13 }; // margins in drawing units
const el = (name, attrs = {}, parent) => {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
};

export function createTriangle(host, { onPick, onHover, describe }) {
  host.classList.add('tri');
  const svg = el('svg', { class: 'tri-svg', role: 'img', 'aria-hidden': 'false' });
  const title = el('title', {}, svg);
  const gRegions = el('g', { class: 'tri-regions' }, svg);
  const gGrid = el('g', { class: 'tri-grid' }, svg);
  const gAxes = el('g', { class: 'tri-axes' }, svg);
  const gHigh = el('g', { class: 'tri-high' }, svg);
  const gLabels = el('g', { class: 'tri-labels' }, svg);
  const gGuides = el('g', { class: 'tri-guides' }, svg);
  host.appendChild(svg);

  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'tri-handle';
  host.appendChild(handle);

  const tip = document.createElement('div');
  tip.className = 'tri-tip';
  tip.setAttribute('aria-hidden', 'true');
  host.appendChild(tip);

  let st = null; // last render input
  const FS = { label: 2.9, tick: 2.4, title: 2.9, pill: 2.5 };
  let L = layouts.equilateral;

  const P = (c) => {
    const [x, y] = L.project(c);
    return [x + M.left, y + M.top];
  };
  // eslint-disable-next-line
  const pts = (poly) => poly.map(([sand, silt, clay]) => P({ sand, silt, clay }).map((v) => v.toFixed(3)).join(',')).join(' ');

  function scale() {
    const r = svg.getBoundingClientRect();
    return r.width / (L.width + M.left + M.right);
  }

  function toComp(clientX, clientY) {
    const r = svg.getBoundingClientRect();
    const k = r.width / (L.width + M.left + M.right);
    const x = (clientX - r.left) / k - M.left;
    const y = (clientY - r.top) / k - M.top;
    return clampComposition(L.unproject([x, y]));
  }

  function drawStatic() {
    const { system, names, t } = st;
    L = layouts[system.layout];
    const W = L.width + M.left + M.right;
    const Hh = L.height + M.top + M.bottom;
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
    title.textContent = t('tri.title');
    // Font sizes in drawing units, never below a readable pixel size.
    const k0 = scale() || 7;
    FS.label = Math.max(2.9, 11 / k0);
    FS.tick = Math.max(2.4, 9.5 / k0);
    FS.title = Math.max(2.9, 11 / k0);
    FS.pill = Math.max(2.5, 9.5 / k0);
    svg.style.setProperty('--fs-label', `${FS.label}px`);
    svg.style.setProperty('--fs-tick', `${FS.tick}px`);
    svg.style.setProperty('--fs-title', `${FS.title}px`);
    svg.style.setProperty('--fs-pill', `${FS.pill}px`);
    for (const g of [gGrid, gRegions, gAxes, gLabels, gHigh]) g.replaceChildren();

    // Gridlines every 10 %.
    for (const f of ['clay', 'silt', 'sand']) {
      if (system.layout === 'right' && f === 'sand') continue;
      for (let v = 10; v < 100; v += 10) {
        const [a, b] = L.iso[f](v);
        const [x1, y1] = P(a), [x2, y2] = P(b);
        el('line', { x1, y1, x2, y2 }, gGrid);
      }
    }

    // Class regions.
    for (const cls of system.classes) {
      el('polygon', { points: pts(cls.poly), 'data-id': cls.id, class: `g${cls.step ?? 0}` }, gRegions);
    }

    // Outline and ticks.
    const c = L.corners;
    const corner = (k) => [c[k][0] + M.left, c[k][1] + M.top];
    el('polygon', { class: 'tri-frame', points: [corner('sand'), corner('silt'), corner('clay')].map((p) => p.join(',')).join(' ') }, gAxes);

    const tickText = (x, y, txt, anchor, cls = 'tri-tick') => {
      const n = el('text', { x, y, 'text-anchor': anchor, class: cls }, gAxes);
      n.textContent = txt;
      return n;
    };
    for (const f of ['clay', 'silt', 'sand']) {
      const ax = L.axes[f];
      if (ax.side === 'none') continue;
      for (let v = 0; v <= 100; v += 10) {
        const [x, y] = P(ax.at(v));
        // Short tick pointing along the gridline direction, outwards.
        let dx = 0, dy = 0, tx = x, ty = y, anchor = 'middle';
        if (system.layout === 'equilateral') {
          if (f === 'clay') { dx = -1.6; dy = 0; tx = x - 2.4; ty = y + 1.2; anchor = 'end'; }
          if (f === 'silt') { dx = 0.8; dy = -1.4; tx = x + 2.2; ty = y - 1.2; anchor = 'start'; }
          if (f === 'sand') { dx = -0.8; dy = 1.4; tx = x - 1.2; ty = y + 2.2 + FS.tick; anchor = 'middle'; }
        } else {
          if (f === 'clay') { dx = -1.6; tx = x - 2.4; ty = y + 1.2; anchor = 'end'; }
          if (f === 'silt') { dy = 1.6; tx = x; ty = y + 2.4 + FS.tick; anchor = 'middle'; }
        }
        el('line', { x1: x, y1: y, x2: x + dx, y2: y + dy, class: 'tri-tickmark' }, gAxes);
        const tt = tickText(tx, ty, String(v), anchor);
        tt.dataset.f = f;
        tt.dataset.v = String(v);
      }
    }

    // Axis titles with a reading direction.
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const axisTitle = (txt, [x, y], rot) => {
      const n = el('text', { x, y, 'text-anchor': 'middle', class: 'tri-axis-title', transform: `rotate(${rot} ${x} ${y})` }, gAxes);
      n.textContent = txt;
    };
    if (system.layout === 'equilateral') {
      const lm = mid(corner('sand'), corner('clay'));
      axisTitle(`${t('clay')} % →`, [lm[0] - 10.5, lm[1] - 2], -60);
      const rm = mid(corner('silt'), corner('clay'));
      axisTitle(`${t('silt')} % →`, [rm[0] + 10.5, rm[1] - 2], 60);
      const bm = mid(corner('sand'), corner('silt'));
      axisTitle(`← ${t('sand')} %`, [bm[0], bm[1] + 10.5], 0);
    } else {
      const lm = mid(corner('sand'), corner('clay'));
      axisTitle(`${t('clay')} % →`, [lm[0] - 9, lm[1]], -90);
      const bm = mid(corner('sand'), corner('silt'));
      axisTitle(`${t('silt')} % →`, [bm[0], bm[1] + 10.5], 0);
      const hm = mid(corner('silt'), corner('clay'));
      axisTitle(`${t('sand.hyp')}`, [hm[0] + 3.2, hm[1] - 3.2], 45);
    }

    // Direct labels: full name if it fits inside the region, else two
    // lines, else the abbreviation.
    for (const cls of system.classes) {
      const poly = cls.poly.map(([sand, silt, clay]) => P({ sand, silt, clay }));
      const at = cls.label ? P({ sand: cls.label[0], silt: cls.label[1], clay: cls.label[2] }) : centroidOf(poly);
      const name = names(cls.id);
      const fs = FS.label; // drawing units
      const fitsBox = (lines) => {
        const w = Math.max(...lines.map((l) => l.length)) * fs * 0.56 + 1.2;
        const hh = lines.length * fs * 1.15 + 0.6;
        const xs = [at[0] - w / 2, at[0], at[0] + w / 2];
        const ys = [at[1] - hh / 2 - fs * 0.3, at[1] + hh / 2 - fs * 0.3];
        return xs.every((x) => ys.every((y) => inPoly([x, y], poly)));
      };
      const words = name.split(' ');
      const half = Math.ceil(words.length / 2);
      const two = [words.slice(0, half).join(' '), words.slice(half).join(' ')];
      const n = el('text', { x: at[0], y: at[1], 'text-anchor': 'middle', class: `tri-label on-g${cls.step ?? 0}`, 'data-id': cls.id }, gLabels);
      n._at = at;
      n._poly = poly;
      if (fitsBox([name])) {
        n.textContent = name;
      } else if (words.length > 1 && fitsBox(two)) {
        el('tspan', { x: at[0], dy: '-0.55em' }, n).textContent = two[0];
        el('tspan', { x: at[0], dy: '1.1em' }, n).textContent = two[1];
      } else {
        n.textContent = cls.abbr;
        n.classList.add('abbr');
      }
    }
  }

  function inPoly([x, y], poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function centroidOf(p) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const f = p[j][0] * p[i][1] - p[i][0] * p[j][1];
      a += f; cx += (p[j][0] + p[i][0]) * f; cy += (p[j][1] + p[i][1]) * f;
    }
    a /= 2;
    return [cx / (6 * a), cy / (6 * a) + 1];
  }

  function drawDynamic() {
    const { comp, classId, near, t } = st;
    // Outlines (surface halo + ink core) so they read on every fill.
    gHigh.replaceChildren();
    for (const cls of st.system.classes) {
      const kind = cls.id === classId ? 'current' : near.includes(cls.id) ? 'near' : null;
      if (!kind) continue;
      const points = pts(cls.poly);
      el('polygon', { points, class: `halo ${kind}` }, gHigh);
      el('polygon', { points, class: `core ${kind}` }, gHigh);
    }
    const [mx, my] = P(comp);
    gLabels.querySelectorAll('text').forEach((n) => {
      const cur = n.dataset.id === classId;
      n.classList.toggle('is-current', cur);
      // Keep labels readable: move a label off the dot when they overlap
      // (up/down first, then sideways), staying inside its region.
      let dx = 0, dy = 0;
      n.removeAttribute('transform');
      let bb;
      try { bb = n.getBBox(); } catch { bb = null; }
      const r = 3.2; // dot radius + ring, drawing units (approx.)
      const hit = (ox, oy) => mx > bb.x + ox - r && mx < bb.x + bb.width + ox + r && my > bb.y + oy - r && my < bb.y + bb.height + oy + r;
      const fits = (ox, oy) => [[bb.x + ox, bb.y + oy], [bb.x + bb.width + ox, bb.y + oy], [bb.x + ox, bb.y + bb.height + oy], [bb.x + bb.width + ox, bb.y + bb.height + oy]].every((q) => inPoly(q, n._poly));
      if (bb && hit(0, 0)) {
        const cy = bb.y + bb.height / 2, cx = bb.x + bb.width / 2;
        const up = my - r - 0.4 - (bb.y + bb.height), down = my + r + 0.4 - bb.y;
        const left = mx - r - 0.4 - (bb.x + bb.width), right = mx + r + 0.4 - bb.x;
        const cands = [[0, my > cy ? up : down], [0, my > cy ? down : up], [mx > cx ? left : right, 0], [mx > cx ? right : left, 0]];
        const ok = cands.find(([ox, oy]) => fits(ox, oy));
        if (ok) [dx, dy] = ok;
      }
      n.setAttribute('transform', dx || dy ? `translate(${dx} ${dy})` : '');
    });
    gGuides.replaceChildren();
    const [px, py] = P(comp);
    // Hide tick labels that the value pills would cover.
    gAxes.querySelectorAll('text.tri-tick').forEach((n) => {
      const f = n.dataset.f;
      n.classList.toggle('is-hidden', !!L.guide[f] && Math.abs(Number(n.dataset.v) - comp[f]) < 6);
    });
    for (const f of ['clay', 'silt', 'sand']) {
      const g = L.guide[f];
      if (!g) continue;
      const [x2, y2] = P(g(comp));
      el('line', { x1: px, y1: py, x2, y2, class: 'tri-guide' }, gGuides);
      const v = comp[f];
      const txt = `${fmt(v)}`;
      const w = txt.length * FS.pill * 0.66 + FS.pill * 0.9;
      const ph = FS.pill * 1.6;
      let bx = x2, by = y2;
      if (L === layouts.equilateral) {
        if (f === 'clay') bx -= w / 2 + 0.8;
        if (f === 'silt') { bx += w / 2 + 0.6; by -= 0.8; }
        if (f === 'sand') by += ph * 0.65;
      } else {
        if (f === 'clay') bx -= w / 2 + 0.8;
        if (f === 'silt') by += ph * 0.65;
      }
      el('rect', { x: bx - w / 2, y: by - ph / 2, width: w, height: ph, rx: ph / 2, class: 'tri-guide-pill' }, gGuides);
      el('text', { x: bx, y: by + FS.pill * 0.36, 'text-anchor': 'middle', class: 'tri-guide-text' }, gGuides).textContent = txt;
    }
    // Handle position (HTML, so it can take focus and touch-drag reliably).
    const k = scale();
    handle.style.left = `${px * k}px`;
    handle.style.top = `${py * k}px`;
    handle.setAttribute('aria-label', describe(comp));
    void t;
  }

  // ---- interaction ---------------------------------------------------------
  let drag = null;
  const pick = (e, final) => {
    const c = toComp(e.clientX, e.clientY);
    onPick(c, { final });
  };

  svg.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (e.pointerType === 'touch') {
      drag = { touch: true, x: e.clientX, y: e.clientY, t: e.timeStamp };
      return;
    }
    e.preventDefault();
    svg.setPointerCapture(e.pointerId);
    drag = { touch: false };
    pick(e, false);
    hideTip();
  });
  svg.addEventListener('pointermove', (e) => {
    if (drag && !drag.touch) { pick(e, false); return; }
    if (e.pointerType === 'mouse' && !drag) showTip(e);
  });
  svg.addEventListener('pointerup', (e) => {
    if (!drag) return;
    if (drag.touch) {
      const moved = Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
      if (moved < 10 && e.timeStamp - drag.t < 600) pick(e, true);
    } else {
      pick(e, true);
    }
    drag = null;
  });
  svg.addEventListener('pointercancel', () => { drag = null; });
  svg.addEventListener('pointerleave', () => hideTip());

  // Handle: drag with any pointer (touch-action: none in CSS).
  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    handle.focus({ preventScroll: true });
    drag = { handle: true };
    host.classList.add('dragging');
  });
  handle.addEventListener('pointermove', (e) => {
    if (drag?.handle) pick(e, false);
  });
  const endHandle = (e) => {
    if (drag?.handle) { pick(e, true); drag = null; host.classList.remove('dragging'); }
  };
  handle.addEventListener('pointerup', endHandle);
  handle.addEventListener('pointercancel', () => { drag = null; host.classList.remove('dragging'); });

  function showTip(e) {
    if (!st) return;
    const c = toComp(e.clientX, e.clientY);
    const r = host.getBoundingClientRect();
    let id;
    try { id = classify(st.system, roundComp(c)).id; } catch { return; }
    tip.replaceChildren();
    const v = document.createElement('div');
    v.className = 'tri-tip-values';
    v.textContent = `${st.t('sand')} ${fmt(c.sand)} · ${st.t('silt')} ${fmt(c.silt)} · ${st.t('clay')} ${fmt(c.clay)}`;
    const n = document.createElement('div');
    n.className = 'tri-tip-name';
    n.textContent = st.names(id);
    const h = document.createElement('div');
    h.className = 'tri-tip-hint';
    h.textContent = st.t('tri.clickToSet');
    tip.append(n, v, h);
    tip.style.left = `${e.clientX - r.left}px`;
    tip.style.top = `${e.clientY - r.top}px`;
    tip.classList.add('show');
  }
  function hideTip() { tip.classList.remove('show'); }

  const ro = new ResizeObserver(() => { if (st) { drawStatic(); drawDynamic(); } });
  ro.observe(host);

  let staticKey = '';
  return {
    handle,
    render(next) {
      st = next;
      const key = `${next.system.id}|${next.lang}`;
      if (key !== staticKey) { staticKey = key; drawStatic(); }
      drawDynamic();
    },
    redrawStatic() { if (st) { drawStatic(); drawDynamic(); } },
  };
}

function roundComp(c) {
  const sand = Math.round(c.sand), clay = Math.round(c.clay);
  return { sand, clay, silt: 100 - sand - clay };
}

export function fmt(v) {
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}
