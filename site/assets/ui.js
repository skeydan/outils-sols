// Small DOM helpers shared by the tabs. All text goes through
// textContent; only our own dictionary strings may use innerHTML.

export function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) n.append(kid);
  return n;
}

/** Parse a user number: accepts a decimal comma, spaces and a trailing unit. NaN when empty. */
export function num(raw) {
  const s = String(raw ?? '').trim().replace(/\s+/g, '').replace(',', '.').replace(/[^\d.+\-eE]+$/, '');
  if (s === '') return NaN;
  const v = Number(s);
  return Number.isFinite(v) ? v : NaN;
}

/** Format a number for the UI language with a number of decimals. */
export function fmtn(v, lang, digits = 1) {
  if (!Number.isFinite(v)) return '–';
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(v);
}
