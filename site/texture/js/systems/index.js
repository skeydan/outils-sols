// Registry of classification systems shown in the switcher, with the
// ordered texture groups used to colour the triangle (coarse -> fine).
import { usda } from './usda.js';
import { uk } from './uk.js';
import { geppa } from './geppa.js';
import { aisne } from './aisne.js';
import { DEFINITION, GROUP } from '../info/usda.js';

usda.definitions = DEFINITION;
for (const c of usda.classes) c.group = GROUP[c.id];

// legend: groups in order from coarse to fine; classes point to a group id.
// USDA: Soil Survey Manual table 3-1. UK: AHDB light / medium / heavy.
// GEPPA: the four textures of Baize's figure 3 (grossières ... très fines);
// Aisne: the six groups of Baize's figure 2, in his order.
usda.legend = [
  { id: 'coarse', name: { en: 'Coarse', fr: 'Grossière' } },
  { id: 'modCoarse', name: { en: 'Moderately coarse', fr: 'Modérément grossière' } },
  { id: 'medium', name: { en: 'Medium', fr: 'Moyenne' } },
  { id: 'modFine', name: { en: 'Moderately fine', fr: 'Modérément fine' } },
  { id: 'fine', name: { en: 'Fine', fr: 'Fine' } },
];
uk.legend = [
  { id: 'light', name: { en: 'Sandy and light', fr: 'Sableux et légers' } },
  { id: 'medium', name: { en: 'Medium', fr: 'Moyens' } },
  { id: 'heavy', name: { en: 'Heavy', fr: 'Lourds' } },
];
geppa.legend = [
  { id: 'g', groups: ['g-sab'], name: { en: 'Coarse', fr: 'Grossières' } },
  { id: 'm', groups: ['m-sabarg', 'm-lim'], name: { en: 'Medium', fr: 'Moyennes' } },
  { id: 'f', groups: ['f-argsab', 'f-arglim'], name: { en: 'Fine', fr: 'Fines' } },
  { id: 'tf', groups: ['tf-arg'], name: { en: 'Very fine', fr: 'Très fines' } },
];
aisne.legend = [
  { id: 'sab', name: { en: 'Sandy', fr: 'Sableuses' } },
  { id: 'lim-sab', name: { en: 'Silty-sandy', fr: 'Limono-sableuses' } },
  { id: 'lim', name: { en: 'Silty', fr: 'Limoneuses' } },
  { id: 'arg-sab', name: { en: 'Clayey-sandy', fr: 'Argilo-sableuses' } },
  { id: 'arg', name: { en: 'Clayey', fr: 'Argileuses' } },
  { id: 'tres-arg', name: { en: 'Very clayey', fr: 'Très argileuses' } },
];

// Ramp step (1..6) for each legend entry, spread evenly over the 6 steps.
for (const sys of [usda, uk, geppa, aisne]) {
  const n = sys.legend.length;
  sys.legend.forEach((g, i) => { g.step = Math.round((i * 5) / (n - 1)) + 1; });
  const stepOf = {};
  for (const g of sys.legend) for (const id of g.groups ?? [g.id]) stepOf[id] = g.step;
  for (const c of sys.classes) c.step = stepOf[c.group];
}

export const SYSTEMS = { usda, geppa, aisne, uk };
export const SYSTEM_ORDER = ['usda', 'geppa', 'aisne', 'uk'];
