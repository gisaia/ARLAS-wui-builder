/**
 * Tests of the validator and normalizer (lib/rules.js, validate.js, normalize.js).
 * Run: npm run genui:test   (node --test generative-ui/test/)
 *
 * Base config: the round-trip fixture (courses.v2, normalized and Builder-stable). Each test breaks one thing
 * and checks that the expected rule reports it, and that the normalizer repairs it only when the value does
 * not depend on the data.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { validate } = require('../validate');
const { normalize } = require('../normalize');
const { assertNoFieldValue, FIELD_LIKE_KEYS } = require('../lib/rules');

const ROOT = path.join(__dirname, '..', '..');
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const FIXTURES = 'src/app/services/main-form-manager/fixtures';
const base = () => ({
  config: read(`${FIXTURES}/generated.config.json`),
  map: read(`${FIXTURES}/generated.config.map.json`),
  mapping: read(`${FIXTURES}/generated.mapping.json`)
});

const errorsOf = (config, map, mapping) => validate(config, map, { mapping }).findings.filter(f => f.severity === 'ERROR');
const rulesOf = findings => [...new Set(findings.map(f => f.rule))];
const contributor = (config, type) => config.arlas.web.contributors.find(c => c.type === type);
const widget = (config, type) => config.arlas.web.analytics.flatMap(g => g.components).find(w => w.componentType === type);

/** Breaks the base config, checks the rule fires, then (optionally) that normalize repairs it. */
function expectRule(rule, breakIt, { fixable }) {
  const { config, map, mapping } = base();
  breakIt(config, map);
  const errors = errorsOf(config, map, mapping);
  assert.ok(rulesOf(errors).includes(rule), `${rule} attendu, obtenu : ${JSON.stringify(rulesOf(errors))}`);
  const { config: fixed } = normalize(config, map, { mapping });
  const after = rulesOf(errorsOf(fixed, map, mapping));
  if (fixable) assert.ok(!after.includes(rule), `normalize devrait corriger ${rule}`);
  else assert.ok(after.includes(rule), `normalize ne doit pas corriger ${rule} (valeur dépendant des données)`);
}

test('the round-trip fixture is valid, without warning', () => {
  const { config, map, mapping } = base();
  const r = validate(config, map, { mapping });
  assert.equal(r.errors, 0, JSON.stringify(r.findings.filter(f => f.severity === 'ERROR'), null, 2));
  assert.equal(r.warnings, 0, JSON.stringify(r.findings.filter(f => f.severity === 'WARN'), null, 2));
});

test('generated courses.v2 has no error once normalized', () => {
  const config = read('generative-ui/generated/courses.v2.config.json');
  const map = read('generative-ui/generated/courses.v2.config.map.json');
  const mapping = read(`${FIXTURES}/generated.mapping.json`);
  const { config: n } = normalize(config, map, { mapping });
  assert.deepEqual(errorsOf(n, map, mapping), []);
});

test('generated maritime has the known errors, and none once normalized', () => {
  const config = read('generative-ui/generated/maritime.config.json');
  const map = read('generative-ui/generated/maritime.config.map.json');
  const mapping = read(`${FIXTURES}/generated.mapping.json`);
  const before = rulesOf(errorsOf(config, map, mapping));
  ['SCH-2', 'R9', 'C1', 'C2', 'C3', 'C4', 'TL-1'].forEach(r => assert.ok(before.includes(r), `${r} attendu sur maritime`));
  assert.deepEqual(errorsOf(normalize(config, map, { mapping }).config, map, mapping), []);
});

test('normalize does not touch its input and is idempotent', () => {
  const { config, map, mapping } = base();
  delete widget(config, 'histogram').input.chartWidth;
  const snapshot = JSON.stringify(config);
  const once = normalize(config, map, { mapping });
  assert.equal(JSON.stringify(config), snapshot);
  assert.ok(once.changes.length > 0);
  assert.deepEqual(normalize(once.config, map, { mapping }).changes, []);
});

test('normalize never writes a field, collection or contributor id', () => {
  const { config, map, mapping } = base();
  // Strip everything a fix may add
  const rl = contributor(config, 'resultlist');
  delete rl.fieldsConfiguration;
  delete rl.includeMetadata;
  config.arlas.web.components.resultlists.forEach(c => { c.input = {}; });
  config.arlas.web.analytics.flatMap(g => g.components).forEach(w => { w.input = { id: w.input.id, chartTitle: w.input.chartTitle, dataType: w.input.dataType }; });
  delete config.arlas.web.components.timeline.input;
  delete config.arlas.web.options.tabs;
  delete config.extraConfigs;
  contributor(config, 'search').search_field = '';
  const { changes } = normalize(config, map, { mapping });
  const offending = [];
  const walk = (k, v, p) => {
    if (FIELD_LIKE_KEYS.has(k) && typeof v === 'string' && v !== '') offending.push(`${p} = ${v}`);
    if (v && typeof v === 'object') Object.entries(v).forEach(([ck, cv]) => walk(ck, cv, `${p}.${ck}`));
  };
  changes.forEach(c => walk(c.path.split('.').pop(), c.after, c.path));
  assert.deepEqual(offending, []);
  assert.equal(contributor(normalize(config, map, { mapping }).config, 'search').search_field, '');
});

test('the guard refuses a data value', () => {
  assert.throws(() => assertNoFieldValue('search_field', 'title', 'x'));
  assert.throws(() => assertNoFieldValue('fieldsConfiguration', { idFieldName: 'id' }, 'x'));
  assert.doesNotThrow(() => assertNoFieldValue('titleFieldNames', [{ fieldPath: '', process: '' }], 'x'));
  assert.doesNotThrow(() => assertNoFieldValue('chartWidth', 445, 'x'));
});

// ---- one broken invariant per test

test('R1: resultlist without columns', () => expectRule('R1', c => { contributor(c, 'resultlist').columns = []; }, { fixable: false }));
test('R6: idFieldName different from the collection id_path', () => expectRule('R6', c => { contributor(c, 'resultlist').fieldsConfiguration.idFieldName = 'object.id'; }, { fixable: false }));
test('R9: options on the resultlist contributor', () => expectRule('R9', c => { contributor(c, 'resultlist').options = { showName: true }; }, { fixable: true }));
test('C1: resultlist input.id different from contributorId', () => expectRule('C1', c => { c.arlas.web.components.resultlists[0].input.id = 'other'; }, { fixable: true }));
test('C2: resultlist view flags missing', () => expectRule('C2', c => { delete c.arlas.web.components.resultlists[0].input.hasListView; }, { fixable: true }));
test('DIM-1: histogram without chartWidth', () => expectRule('DIM-1', c => { delete widget(c, 'histogram').input.chartWidth; }, { fixable: true }));
test('DIM-1: histogram without dataType (data-dependent)', () => expectRule('DIM-1', c => { delete widget(c, 'histogram').input.dataType; }, { fixable: false }));
test('TL-1: timeline without dataType', () => expectRule('TL-1', c => { delete c.arlas.web.components.timeline.input.dataType; }, { fixable: true }));
test('TAB-1: tab used but not declared', () => expectRule('TAB-1', c => { c.arlas.web.options.tabs.pop(); }, { fixable: true }));
test('XC-1: extraConfigs missing', () => expectRule('XC-1', c => { delete c.extraConfigs; }, { fixable: true }));
test('XC-2: layers written in config.json', () => expectRule('XC-2', (c, m) => { c.arlas.web.components.mapgl.input.mapLayers.layers = [m.layers[0]]; }, { fixable: true }));
test('MAP-0: window_extent_geometry as an object', () => expectRule('MAP-0', c => { contributor(c, 'map').window_extent_geometry = { enabled: true, boundsFieldName: '' }; }, { fixable: true }));
test('MAP-1: layer source missing from config.map.json', () => expectRule('MAP-1', (c, m) => { m.layers = m.layers.filter(l => l.id !== contributor(c, 'map').layers_sources[0].id); }, { fixable: false }));
test('SEARCH-1: search without search_field', () => expectRule('SEARCH-1', c => { delete contributor(c, 'search').search_field; }, { fixable: false }));
test('REF-1: widget pointing to an unknown contributor', () => expectRule('REF-1', c => { widget(c, 'powerbars').contributorId = 'nope'; }, { fixable: false }));
test('REF-3: detailed timeline without valid parent', () => expectRule('REF-3', c => { contributor(c, 'detailedhistogram').annexedContributorId = 'nope'; }, { fixable: false }));
test('OPT-1: zoom_to_data', () => expectRule('OPT-1', c => { c.arlas.web.options.zoom_to_data = true; }, { fixable: true }));
test('TYPE-1: chipssearch', () => expectRule('TYPE-1', c => { contributor(c, 'search').type = 'chipssearch'; }, { fixable: false }));

test('FLD-0: unknown field in an aggregation', () => expectRule('FLD-0', c => { contributor(c, 'tree').aggregationmodels[0].field = 'object.shiptype'; }, { fixable: false }));
test('FLD-0: date histogram on a numeric field', () => expectRule('FLD-0', c => { contributor(c, 'histogram').aggregationmodels[0].field = 'track.duration_s'; }, { fixable: false }));
test('FLD-0: sum on a keyword', () => expectRule('FLD-0', c => { contributor(c, 'metric').metrics[0] = { field: 'object.name', metric: 'sum' }; }, { fixable: false }));
test('FLD-0: unknown property in a map expression', () => expectRule('FLD-0', (c, m) => {
  m.layers[0].paint['line-color'] = ['match', ['get', 'object_shiptype'], 'Cargo', '#000', '#fff'];
}, { fixable: false }));

test('FLD-0: flattened map properties resolve (field, metric suffix, normalized count)', () => {
  const { config, map, mapping } = base();
  map.layers[0].paint['line-opacity'] = ['interpolate', ['linear'], ['get', 'track_duration_s_avg_'], 0, 0.2, 1, 1];
  map.layers[0].paint['line-width'] = ['interpolate', ['linear'], ['get', 'count_:normalized'], 0, 1, 1, 4];
  assert.deepEqual(rulesOf(errorsOf(config, map, mapping)), []);
});

test('without a mapping, the field check is skipped with a warning', () => {
  const { config, map } = base();
  const r = validate(config, map, {});
  assert.equal(r.errors, 0);
  assert.ok(r.findings.some(f => f.rule === 'FLD-0' && f.severity === 'WARN'));
});
