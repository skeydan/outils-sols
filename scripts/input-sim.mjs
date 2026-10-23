// How many slider moves does it take to enter a lab result with each
// slider rule? A small simulation used to choose the input rule.
//
// A "move" = dragging one slider to a value. The simulated user is greedy:
// each move, they pick the fraction that is furthest from its target and
// drag it exactly to the target (best case for every rule). Success = all
// three fractions within 0.5 of the target. Run: node scripts/input-sim.mjs

const KEYS = ['sand', 'silt', 'clay'];

const rules = {
  // Moving one fraction rescales the other two, keeping their ratio.
  proportional: {
    move(s, k, v) {
      const others = KEYS.filter((o) => o !== k);
      const rest = s[others[0]] + s[others[1]];
      const n = { ...s, [k]: v };
      for (const o of others) n[o] = rest > 0 ? (s[o] * (100 - v)) / rest : (100 - v) / 2;
      return n;
    },
  },
  // Moving one fraction trades with a fixed partner the user cannot see
  // (sand<->silt, silt<->clay, clay<->sand). NB: the simulated user knows the
  // partner and plans for it, which a real user cannot do; it is a best case.
  hiddenPartner: {
    move(s, k, v) {
      const partner = { sand: 'silt', silt: 'clay', clay: 'sand' }[k];
      const d = v - s[k];
      const pv = s[partner] - d;
      if (pv < 0 || pv > 100) return s; // blocked
      return { ...s, [k]: v, [partner]: pv };
    },
  },
  // One fraction is "calculated" (default silt). The user moves the other
  // two; the calculated one takes the remainder. Moves that would make it
  // negative are clamped at the limit.
  calculatedClamp: {
    move(s, k, v, calc = 'silt') {
      if (k === calc) return s; // not movable
      const other = KEYS.find((o) => o !== k && o !== calc);
      const vv = Math.min(v, 100 - s[other]);
      return { ...s, [k]: vv, [calc]: 100 - vv - s[other] };
    },
  },
  // Chosen rule: same, but when the calculated fraction is already 0 the
  // other entered fraction makes room instead of blocking the move.
  calculated: {
    move(s, k, v, calc = 'silt') {
      if (k === calc) return s;
      const other = KEYS.find((o) => o !== k && o !== calc);
      const ov = Math.min(s[other], 100 - v);
      return { ...s, [k]: v, [other]: ov, [calc]: 100 - v - ov };
    },
  },
};

function solve(rule, start, target, maxMoves = 30) {
  let s = { ...start };
  for (let m = 0; m <= maxMoves; m++) {
    const err = KEYS.map((k) => Math.abs(s[k] - target[k]));
    if (Math.max(...err) <= 0.5) return m;
    // Candidate moves: set any movable fraction to its target; keep the one
    // that reduces the worst error most (greedy, but smart).
    let best = null;
    for (const k of KEYS) {
      const n = rule.move(s, k, target[k]);
      if (n === s) continue;
      const e = Math.max(...KEYS.map((q) => Math.abs(n[q] - target[q])));
      if (!best || e < best.e) best = { n, e };
    }
    if (!best) return Infinity;
    s = best.n;
  }
  return Infinity;
}

// Reproducible pseudo-random lab results (integers summing to 100).
let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const targets = [];
while (targets.length < 2000) {
  const clay = Math.floor(rnd() * 70);
  const sand = Math.floor(rnd() * (100 - clay));
  targets.push({ sand, silt: 100 - sand - clay, clay });
}
const start = { sand: 40, silt: 40, clay: 20 };

for (const [name, rule] of Object.entries(rules)) {
  const moves = targets.map((t) => solve(rule, start, t));
  const ok = moves.filter(Number.isFinite);
  const mean = ok.reduce((a, b) => a + b, 0) / ok.length;
  const worst = Math.max(...ok);
  const stuck = moves.length - ok.length;
  console.log(
    `${name.padEnd(14)} mean moves ${mean.toFixed(2)}  worst ${worst}  ` +
      `needed >2 moves: ${((100 * ok.filter((m) => m > 2).length) / ok.length).toFixed(0)} %  ` +
      `could not reach: ${stuck}`
  );
}
