# outils-sols

A soil texture calculator on one page, which also explains how to measure
texture at home with the jar test. French and English (follows the browser
language, with a switch), light and dark, works on phones. A static site: no
backend, no build step, no tracking (the language and theme choices are kept
in the browser's local storage, nothing else). Every number comes from a
cited source, listed at the bottom of the page.

Split out of outils-plantes, where
it was `site/texture/` and `site/texture/jar/`.

## What is on the page

A tab bar at the top. For now there is one tab, **Texture** (« Texture du
sol »), with two sections:

- **The texture triangle** (`#texture`): sand, silt and clay to a texture
  class in four triangles (**USDA** 12 classes, **GEPPA** 17, **Aisne** 15,
  **UK SSEW** 11), nearby classes and the change that would cross a limit, a
  table version of the triangle, per-class information (definition, feel
  test, available water, practical notes). Input by dragging or tapping in
  the triangle, arrow keys, sliders, typed values, a pasted lab report
  (French 5-fraction analyses in g/kg, English reports, sand and clay
  only...), USDA sand grades, or jar-test layer thicknesses. Fractions are
  listed as they settle in a jar: clay on top, sand at the bottom, with a
  jar column kept in sync.
- **How to measure at home: the jar test** (`#texture/jar`): step by step
  with our own drawings, the reading times of six guides, a layer
  calculator linked to the triangle, the physics, the limits compared with a
  laboratory. One CC BY-SA 3.0 Wikimedia Commons photo, credited next to it;
  a marked placeholder (`data-placeholder="own-photo-1"`) for photos of
  a real jar test.

It is reachable from the section links under the tab bar, the lead text of
the triangle, the result card ("Measure your texture with a jar") and the
"From a jar test" input. One numbered source list for both sections sits at
the bottom of the tab.

## URLs

The tab, the section and the sample are in the hash, so any view can be
linked and the back button works:

```
#texture                                               the triangle, default sample
#texture?sand=40&silt=40&clay=20&calc=silt&sys=usda    the triangle with a sample
#texture/jar                                           the jar test
```

`calc` is the calculated fraction (`sand`, `silt`, `clay`), `sys` the
triangle (`usda`, `uk`, `geppa`, `aisne`). The jar calculator links to the
triangle with `sand`, `silt`, `clay` and `calc` only, so the triangle keeps
the classification chosen there. Older links with only parameters
(`#sand=..&silt=..&clay=..`, as in outils-plantes) still open the triangle.
A sample that does not add up to 100 is ignored. Citations (`[3]`) scroll to
the source list without changing the URL.

## The texture input rule

One fraction is **calculated** (silt by default). You set the other two,
by typing or sliding, and the calculated one is always what is left to
reach 100 %. Any fraction can be the calculated one ("Calculate this one").

- Typing never changes the other typed value; an entry that would go over
  100 is refused with an explanation.
- A slider never gets stuck: only when the calculated fraction is already at
  0 does the other set fraction make room.

Why: sliders that silently move the others (proportionally, or with a
hidden partner) make it hard to hit a lab value. `node scripts/input-sim.mjs`
simulates 2000 lab results: with this rule every one is reached in at most
2 moves; with proportional sliders it takes up to 6 (3.3 on average).

## Run locally

Any static file server works. With Python:

```bash
python3 -m http.server 9417 --directory site     # or: npm run serve
# open http://localhost:9417/
```

or with Docker (the same image as for deployment):

```bash
docker build -t outils-sols .
docker run --rm -p 9418:8080 outils-sols
# open http://localhost:9418/   (the container listens on $PORT, default 8080)
```

All paths inside the site are relative, so it also works from a sub-path.

## Tests

```bash
npm test               # unit tests, plain Node (no dependencies)
npm i && npm run e2e   # browser checks with Playwright, BASE=http://localhost:9417 by default
```

- `tests/usda.test.mjs`: every limit of the USDA definitions (points on and
  just next to each limit, corners), the rules form a partition of the
  triangle, the drawn polygons agree with the rules, sums that do not add to
  100 are rejected, sand subclasses.
- `tests/figure-systems.test.mjs`: UK, GEPPA and Aisne polygons tile the
  triangle; one point per class; worked examples of the cited figures.
- `tests/parse-model.test.mjs`: lab-report parser, jar layers, input rule.
- `tests/router.test.mjs`: parsing and writing the hash, default sections,
  fallbacks for unknown routes and older links.
- `tests/sources.test.mjs`: the information cards of every class of the four
  triangles (and the USDA sand subclasses) and the jar section, in both
  languages, cite only listed sources, and every listed source is cited.
- `scripts/e2e.mjs`: screenshots of both sections (desktop and phone, light
  and dark, French and English, into `/tmp/sols-shots`); the tab bar and the
  routing (section links, back and forward, citations, older links); scripted
  interaction on the triangle (drag, tap, type, sliders, calculated
  fraction, keyboard, paste, sand grades, system switch) and on the jar
  calculator and its link; no link to a page that is not here. Fails on any
  console error or warning or any horizontal overflow. It also runs against
  the Docker image (`BASE=http://localhost:9418`), whose content security
  policy it respects.

## Layout

```
site/
  index.html              the page: header, tab bar, the Texture tab, footer
  app.js                  tab list, tab bar, hash routing, language and theme shell
  assets/router.js        parse and write the hash (pure, tested)
  assets/site.js          language and theme
  assets/site.css         shared tokens (light/dark, validated palettes), tabs, layout
  assets/ui.js            small DOM helpers
  texture/js/tab.js       the Texture tab: sections, shared source list
  texture/js/triangle-page.js   the triangle section (DOM)
  texture/js/jar.js       the jar test section, drawings and calculator
  texture/js/             model, classify, parse, geometry, systems/, info/ (cards, sources)
  texture/css/texture.css
  texture/img/            the credited Commons photo
deploy/default.conf.template   nginx config
tests/                    node:test unit tests
scripts/                  e2e browser checks, input-rule simulation
```

### Adding a tab

1. Add an entry to `TABS` in `site/app.js`: `id`, `label` (`{en, fr}`),
   `sections` (the first one is the default) and `module`.
2. Add `<div class="tab-panel" data-tab-panel="<id>" hidden>` to
   `index.html`, with one `data-section-panel="<section>"` element per
   section and, if there is more than one, a `.subnav` with
   `data-section-link` links (`#<id>`, `#<id>/<section>`).
3. Write the module (see `texture/js/tab.js`): it exports `STR` (its strings,
   keys prefixed so they do not clash), `init({ setParams })`,
   `show(section, params)` and optionally `title(section)`. `setParams`
   writes the view's parameters in the URL without a history entry.
4. Add its checks to `scripts/e2e.mjs`, and its sources to the bottom of
   its panel.

## Deploy

The repository root has a `Dockerfile` (nginx, about 50 MB, listens on
`$PORT`, default 8080, with a strict content security policy in
`deploy/default.conf.template`). It runs on any host that builds a
Dockerfile or runs a container image.

## Sources and respect

Texts and drawings are original. Facts come from the documents listed at the
bottom of the page, each one opened while writing it; numbers are copied
with unit conversions only. Class limits of the triangles that are only
published as figures (UK, GEPPA, Aisne) come from the vertex lists of the
`soiltexture` R package (J. Moeys), checked against the AHDB and INRAE
(D. Baize) figures. Nothing was copied from other online calculators. The
one photo is Chaojoker's, CC BY-SA 3.0, credited where it is shown.

Colours are checked for contrast in both themes: fractions have
categorical colours (sand ochre, silt slate blue, clay terracotta, also
checked for colour-vision deficiency); triangle classes are
filled by texture group with an ordinal earthy ramp; classes are told apart
by direct labels and gaps, not by a dozen hues.
