// Input rule (pure, no DOM).
//
// One fraction is "calculated" (silt by default). The other two are set by
// the user, by typing or with sliders; the calculated one is always
// 100 minus the other two.
// - Typing never changes the other typed value: if the two typed values add
//   up to more than 100 the entry is refused with an explanation.
// - With a slider, if the calculated fraction is already at 0 and you keep
//   pushing, the other fraction makes room (it goes down) instead of the
//   slider getting stuck.

export const KEYS = ['sand', 'silt', 'clay'];

const tidy = (x) => Math.round(x * 1000) / 1000;

export function createState(comp = { sand: 40, silt: 40, clay: 20 }, calc = 'silt') {
  return { sand: comp.sand, silt: comp.silt, clay: comp.clay, calc };
}

/** The two fractions the user sets directly. */
export const inputKeys = (s) => KEYS.filter((k) => k !== s.calc);

const otherInput = (s, key) => KEYS.find((k) => k !== key && k !== s.calc);

/** Slider move: always succeeds (value clamped to 0..100). */
export function slide(s, key, value) {
  if (key === s.calc) return s;
  const v = Math.max(0, Math.min(100, value));
  const o = otherInput(s, key);
  const ov = Math.min(s[o], 100 - v);
  return { ...s, [key]: tidy(v), [o]: tidy(ov), [s.calc]: tidy(100 - v - ov) };
}

/**
 * Typed entry. Returns {state, error}. error is one of
 * 'empty' | 'nan' | 'range' | 'sum' (state unchanged when there is an error).
 */
export function type(s, key, raw) {
  if (key === s.calc) return { state: s, error: null };
  const txt = String(raw ?? '').trim().replace(',', '.').replace(/\s*%$/, '');
  if (txt === '') return { state: s, error: 'empty' };
  const v = Number(txt);
  if (!Number.isFinite(v)) return { state: s, error: 'nan' };
  if (v < 0 || v > 100) return { state: s, error: 'range' };
  const o = otherInput(s, key);
  if (v + s[o] > 100 + 1e-9) return { state: s, error: 'sum', over: tidy(v + s[o] - 100), other: o };
  return { state: { ...s, [key]: tidy(v), [s.calc]: tidy(100 - v - s[o]) }, error: null };
}

/** Choose which fraction is calculated. Values do not change. */
export function setCalc(s, key) {
  return KEYS.includes(key) ? { ...s, calc: key } : s;
}

/** Set all three at once (triangle, paste). Assumes the composition sums to 100. */
export function setComposition(s, comp) {
  return { ...s, sand: tidy(comp.sand), silt: tidy(comp.silt), clay: tidy(comp.clay) };
}

/**
 * Snap a composition picked on the triangle to whole percentages: the two
 * entered fractions are rounded, the calculated one takes the remainder.
 */
export function snapComposition(s, comp, step = 1) {
  const [a, b] = inputKeys(s);
  const r = (x) => Math.round(x / step) * step;
  let va = Math.max(0, Math.min(100, r(comp[a])));
  let vb = Math.max(0, Math.min(100 - va, r(comp[b])));
  return { ...s, [a]: tidy(va), [b]: tidy(vb), [s.calc]: tidy(100 - va - vb) };
}

/** Keyboard nudge on the triangle: arrows move the point in that direction. */
export function nudge(s, dir, step = 1) {
  let { sand, silt, clay } = s;
  if (dir === 'left' || dir === 'right') {
    // Horizontal move: sand <-> silt at constant clay.
    const d = dir === 'left' ? Math.min(step, silt) : -Math.min(step, sand);
    sand += d; silt -= d;
  } else if (dir === 'up') {
    // Vertical move: clay up, taken equally from sand and silt (or from
    // whichever is left when one of them is at 0).
    const d = Math.min(step, sand + silt);
    let fromSand = Math.min(d / 2, sand);
    let fromSilt = Math.min(d - fromSand, silt);
    fromSand = d - fromSilt;
    clay += d; sand -= fromSand; silt -= fromSilt;
  } else if (dir === 'down') {
    const d = Math.min(step, clay);
    clay -= d; sand += d / 2; silt += d / 2;
  }
  return setComposition(s, { sand, silt, clay });
}
