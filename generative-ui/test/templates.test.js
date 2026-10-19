/**
 * The skeletons of templates/ must stay valid: filled with real fields of the courses collection and assembled
 * into one dashboard, they pass the validator with no error. Left unfilled, PH-1 rejects them.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { validate } = require('../validate');

const DIR = path.join(__dirname, '..', 'templates');
const tpl = name => JSON.parse(fs.readFileSync(path.join(DIR, `${name}.json`), 'utf8'));
const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'src/app/services/main-form-manager/fixtures/generated.mapping.json'), 'utf8'));

const VALUES = {
  'FIELD:DATE': 'track.timestamps.center', 'FIELD:NUMERIC': 'track.duration_s', 'FIELD:KEYWORD': 'object.ship_type',
  'FIELD:ANY': 'object.name', 'FIELD:GEO': 'track.trail', 'FIELD:GEO_POINT': 'departure.location', 'FIELD:TEXT': 'internal.fulltext',
  SERVER_URL: 'http://localhost:9999/arlas', COLLECTION: 'courses', ID_PATH: 'track.id', TITLE: 'Titre', TAB: 'Onglet', ICON: 'bar_chart', UNIT: 's', LABEL: 'Libellé',
  NAME: 'Trajets', KEY: 'trails', NAME2: 'Departs', KEY2: 'departures',
  'NUMBER:INTERVAL': 3600, 'NUMBER:ZOOM': 5, 'NUMBER:LON': 8, 'NUMBER:LAT': 55
};

/** Replaces every <<KEY>> (a whole-string <<NUMBER:…>> becomes a number). */
function fill(node, extra = {}) {
  const values = { ...VALUES, ...extra };
  if (typeof node === 'string') {
    const whole = node.match(/^<<([^>]+)>>$/);
    if (whole && typeof values[whole[1]] === 'number') return values[whole[1]];
    return node.replace(/<<([^>]+)>>/g, (m, k) => (k in values ? String(values[k]) : m));
  }
  if (Array.isArray(node)) return node.map(n => fill(n, extra));
  if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).filter(([k]) => k !== '_usage').map(([k, v]) => [k, fill(v, extra)]));
  return node;
}

function assemble(fillIt) {
  const f = (t, extra) => (fillIt ? fill(t, extra) : t);
  const timeline = f(tpl('timeline'));
  const map = f(tpl('map'));
  const resultlist = f(tpl('resultlist'), { ID: 'rl' });
  const swimRaw = tpl('swimlane');
  const swimId = fill(swimRaw.contributor.identifier);
  const swim = f(swimRaw, { ID: 'swim', 'SAME AS contributor.identifier': swimId });
  const widgets = [
    f(tpl('histogram'), { ID: 'hist' }), swim, f(tpl('powerbars'), { ID: 'pb' }), f(tpl('donut'), { ID: 'donut' }),
    f(tpl('metric'), { ID: 'metric' }), f(tpl('metricstable'), { ID: 'mt' })
  ];
  const config = f(tpl('dashboard')).config;
  config.arlas.web.contributors = [...timeline.contributors, map.contributor, resultlist.contributor,
    f(tpl('search'), { ID: 'search' }).contributor, ...widgets.map(w => w.contributor)];
  config.arlas.web.components = {
    timeline: timeline.components.timeline,
    detailedTimeline: timeline.components.detailedTimeline,
    mapgl: map.mapgl,
    resultlists: [resultlist.component]
  };
  config.arlas.web.analytics = widgets.map(w => w.analytics_group);
  config.extraConfigs = map.extraConfigs;
  const highlighted = map.map_layers.filter(l => map.external_event_layers.some(e => e.id.endsWith(l.id)))
    .flatMap(l => ['hover', 'select'].map(on => ({ ...l, id: `arlas-${on}-${l.id}` })));
  const mapConfig = { layers: [...map.map_layers, ...highlighted], 'external-event-layers': map.external_event_layers };
  return { config, mapConfig };
}

test('filled templates assemble into a valid dashboard', () => {
  const { config, mapConfig } = assemble(true);
  const r = validate(config, mapConfig, { mapping });
  assert.deepEqual(r.findings.filter(f => f.severity === 'ERROR').map(f => `${f.rule} ${f.message}`), []);
});

test('unfilled templates are rejected by PH-1', () => {
  const { config, mapConfig } = assemble(false);
  const r = validate(config, mapConfig, { mapping });
  assert.ok(r.findings.some(f => f.rule === 'PH-1' && f.severity === 'ERROR'));
});
module.exports = { assemble, fill };
