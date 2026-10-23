/**
 * Rule registry for generated ARLAS WUI configurations (config.json + config.map.json).
 *
 * Each rule: { id, section, check(ctx, r), fix?(ctx, f) }
 *   - check reports findings through r.fail / r.warn / r.pass (r is bound to the rule id);
 *   - fix (optional) repairs the config in place through f.set / f.remove, which record every change.
 *
 * Fixes only write values that do not depend on the data (Builder layout constants, empty arrays,
 * values derived from another part of the config). They never write a field name, a collection or a
 * contributor id: f.set throws if it is asked to (see FIELD_LIKE_KEYS). Missing data-dependent values
 * stay ERRORs for the generator to fix.
 *
 * Used by validate.js (checks), normalize.js (fixes) and pipeline.js.
 */
const fs = require('fs');
const path = require('path');

const SCHEMAS_DIR = path.join(__dirname, '..', 'schemas');

const SECTIONS = {
  contributors: '3. Validation Spécifique des Contributeurs',
  schema: '4. Validation Globale du Tableau de Bord (arlasconfig.schema.json)',
  resultlist: '4.bis Règles des Listes de Résultats',
  refs: '5. Intégrité Référentielle et Cohérence Inter-Composants',
  map: '5.bis Carte (config.map.json)',
  fields: '6. Existence des Champs dans la Collection (mapping)'
};

// Keys whose value names data: a fix must never write a non-empty value under one of them.
const FIELD_LIKE_KEYS = new Set([
  'field', 'fieldName', 'fieldPath', 'path', 'termField', 'termfield', 'xAxisField', 'search_field',
  'autocomplete_field', 'idFieldName', 'iconColorFieldName', 'geo_query_field', 'returned_geometry',
  'agg_geo_field', 'include_fields', 'jsonpath', 'annexedContributorId', 'additionalCollections',
  'collection', 'contributorId', 'layers_sources', 'collect_field', 'boundsFieldName'
]);

const CONTRIBUTOR_SCHEMAS = {
  map: 'mapContributorConf.schema.json',
  histogram: 'histogramContributorConf.schema.json',
  detailedhistogram: 'detailedHistogramContributorConf.schema.json',
  swimlane: 'swimlaneContributorConf.schema.json',
  resultlist: 'resultlistContributorConf.schema.json',
  tree: 'treeContributorConf.schema.json',
  search: 'searchContributorConf.schema.json',
  metric: 'computeContributorConf.schema.json',
  metricstable: 'metricsTableContributorConf.schema.json',
  analytics: 'analyticsContributorConf.schema.json'
};

const COMPONENT_SCHEMAS = [
  'rootContributorConf.schema.json', 'chipssearchContributorConf.schema.json',
  ...Object.values(CONTRIBUTOR_SCHEMAS),
  'histogram.schema.json', 'swimlane.schema.json', 'powerbars.schema.json', 'arlas-map.schema.json',
  'donut.schema.json', 'metric.schema.json', 'metrics-table.schema.json', 'resultlist.schema.json'
];

const EXTRA_CONFIGS = [
  { configPath: 'config.map.json', replacedAttribute: 'arlas.web.components.mapgl.input.mapLayers.layers', replacer: 'layers' },
  { configPath: 'config.map.json', replacedAttribute: 'arlas.web.components.mapgl.input.mapLayers.externalEventLayers', replacer: 'external-event-layers' }
];

// Date format the Builder writes on export for the timeline and the detailed timeline.
const TIMELINE_DATE_FORMAT = '%d/%m/%Y %H:%M';

const FORBIDDEN_PROCESS_WORDS = ['document', 'window', 'eval', 'localStorage', 'this', 'function', 'Function'];

// ---------------------------------------------------------------- helpers

const readSchema = file => JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, file), 'utf8'));
const schemaProps = file => {
  const p = path.join(SCHEMAS_DIR, file);
  return fs.existsSync(p) ? Object.keys(readSchema(file).properties || {}) : [];
};
const isPosNum = v => typeof v === 'number' && !Number.isNaN(v) && v > 0;
const nonEmptyString = v => typeof v === 'string' && v.trim().length > 0;
const widgetName = w => w.title || w.input?.chartTitle || w.input?.powerbarTitle || w.contributorId;

/** Allowed keys of a contributor: its schema + the root contributor schema + common keys. */
function allowedContributorKeys(type) {
  const own = CONTRIBUTOR_SCHEMAS[type] ? schemaProps(CONTRIBUTOR_SCHEMAS[type]) : [];
  const extra = type === 'detailedhistogram' ? schemaProps('histogramContributorConf.schema.json') : [];
  return new Set([...own, ...extra, ...schemaProps('rootContributorConf.schema.json'),
    'type', 'identifier', 'name', 'title', 'collection', 'icon', 'aggregationmodels']);
}

/** Ajv instance with the official draft-06 schemas registered (same set as ArlasStartupService). */
let ajvCache = null;
function getAjv() {
  if (ajvCache) return ajvCache;
  const Ajv = require('ajv');
  const ajvKeywords = require('ajv-keywords');
  const ajv = new Ajv({ allowUnionTypes: true, strict: false, allErrors: false });
  ajvKeywords(ajv, 'uniqueItemProperties');
  ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
  const missing = [];
  COMPONENT_SCHEMAS.forEach(file => {
    if (!fs.existsSync(path.join(SCHEMAS_DIR, file))) { missing.push(file); return; }
    const s = readSchema(file);
    if (!ajv.getSchema(s.$id || file)) ajv.addSchema(s, s.$id ? undefined : file);
  });
  const validateFull = ajv.compile(readSchema('arlasconfig.schema.json'));
  ajvCache = { ajv, validateFull, missing };
  return ajvCache;
}

// ---------------------------------------------------------------- mapping

const NUMERIC = new Set(['LONG', 'INTEGER', 'SHORT', 'BYTE', 'DOUBLE', 'FLOAT', 'HALF_FLOAT', 'SCALED_FLOAT', 'UNSIGNED_LONG']);
const GEO = new Set(['GEO_POINT', 'GEO_SHAPE']);

/**
 * Flattens a mapping into Map<path, TYPE>. Accepts the describe_collection output
 * ({ properties, params }), an ES mapping ({ mappings: { properties } }) or a flat { path: type } object.
 */
function flattenMapping(mapping) {
  const out = new Map();
  if (!mapping) return out;
  const root = mapping.properties || mapping.mappings?.properties;
  if (!root) {
    Object.entries(mapping).forEach(([k, v]) => { if (typeof v === 'string') out.set(k, v.toUpperCase()); });
    return out;
  }
  const walk = (props, prefix) => Object.entries(props || {}).forEach(([k, node]) => {
    const p = prefix ? `${prefix}.${k}` : k;
    out.set(p, String(node.type || (node.properties ? 'OBJECT' : 'UNKNOWN')).toUpperCase());
    if (node.properties) walk(node.properties, p);
  });
  walk(root, '');
  return out;
}

/** Expected field kinds and the mapping types they accept. */
const KIND_TYPES = {
  date: t => t === 'DATE' || t === 'DATE_NANOS',
  numeric_or_date: t => NUMERIC.has(t) || t === 'DATE' || t === 'DATE_NANOS',
  numeric: t => NUMERIC.has(t),
  term: t => !['TEXT', 'OBJECT', 'NESTED', 'GEO_SHAPE', 'GEO_POINT'].includes(t),
  cardinality: t => !['TEXT', 'OBJECT', 'NESTED', 'GEO_SHAPE'].includes(t),
  geo: t => GEO.has(t),
  geo_point: t => t === 'GEO_POINT',
  any: () => true
};

function metricKind(metric) {
  const m = String(metric || '').toLowerCase();
  if (['sum', 'avg'].includes(m)) return 'numeric';
  if (['min', 'max'].includes(m)) return 'numeric_or_date';
  if (m === 'cardinality') return 'cardinality';
  if (m.startsWith('geo')) return 'geo';
  return 'any';
}

function aggKind(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'datehistogram') return 'date';
  if (t === 'histogram') return 'numeric_or_date';
  if (t === 'term') return 'term';
  if (['geohash', 'geotile', 'h3'].includes(t)) return 'geo_point';
  return 'any';
}

/** Every field referenced by config.json and config.map.json: [{ field, kind, where }] or { getName, where } for map expressions. */
function collectFieldRefs(config, mapConfig) {
  const refs = [];
  const add = (field, kind, where) => {
    if (field === null || field === undefined || field === '') return;
    if (typeof field !== 'string') { refs.push({ field: String(field), kind: 'invalid', where }); return; }
    refs.push({ field, kind, where });
  };
  const aggs = (list, where) => (list || []).forEach((a, i) => {
    add(a.field, aggKind(a.type), `${where}.aggregationmodels[${i}].field`);
    (a.metrics || []).forEach((m, j) => add(m.collect_field, metricKind(m.collect_fct), `${where}.aggregationmodels[${i}].metrics[${j}].collect_field`));
  });

  (config?.arlas?.web?.contributors || []).forEach(c => {
    const w = `contributor "${c.identifier}"`;
    aggs(c.aggregationmodels, w);
    switch (c.type) {
      case 'metric':
        (c.metrics || []).forEach((m, i) => add(m.field, metricKind(m.metric), `${w}.metrics[${i}].field`));
        break;
      case 'metricstable':
        (Array.isArray(c.configuration) ? c.configuration : []).forEach((conf, i) => {
          add(conf.termfield, 'term', `${w}.configuration[${i}].termfield`);
          (conf.metrics || []).forEach((m, j) => add(m.field, metricKind(m.metric), `${w}.configuration[${i}].metrics[${j}].field`));
        });
        if (c.sort?.metric) add(c.sort.metric.field, metricKind(c.sort.metric.metric), `${w}.sort.metric.field`);
        break;
      case 'swimlane':
        (c.swimlanes || []).forEach((s, i) => {
          add(s.xAxisField, 'numeric_or_date', `${w}.swimlanes[${i}].xAxisField`);
          add(s.termField, 'term', `${w}.swimlanes[${i}].termField`);
          aggs(s.aggregationmodels, `${w}.swimlanes[${i}]`);
        });
        break;
      case 'search':
      case 'chipssearch':
        add(c.search_field, 'any', `${w}.search_field`);
        add(c.autocomplete_field, 'any', `${w}.autocomplete_field`);
        break;
      case 'resultlist': {
        (c.columns || []).forEach((col, i) => add(col.fieldName, 'any', `${w}.columns[${i}].fieldName`));
        (c.details || []).forEach((d, i) => (d.fields || []).forEach((f, j) => add(f.path, 'any', `${w}.details[${i}].fields[${j}].path`)));
        (c.cardViewProperties || []).forEach((cv, i) => add(cv.fieldName, 'any', `${w}.cardViewProperties[${i}].fieldName`));
        (c.includeMetadata || []).forEach((m, i) => add(m, 'any', `${w}.includeMetadata[${i}]`));
        const fc = c.fieldsConfiguration || {};
        add(fc.idFieldName, 'any', `${w}.fieldsConfiguration.idFieldName`);
        add(fc.iconColorFieldName, 'any', `${w}.fieldsConfiguration.iconColorFieldName`);
        ['titleFieldNames', 'tooltipFieldNames'].forEach(k => (fc[k] || []).forEach((t, i) => add(t.fieldPath, 'any', `${w}.fieldsConfiguration.${k}[${i}].fieldPath`)));
        break;
      }
      case 'map':
        add(c.geo_query_field, 'geo', `${w}.geo_query_field`);
        (c.layers_sources || []).forEach((s, i) => {
          const ws = `${w}.layers_sources[${i}] ("${s.id}")`;
          add(s.returned_geometry, 'geo', `${ws}.returned_geometry`);
          add(s.agg_geo_field, 'geo_point', `${ws}.agg_geo_field`);
          (s.include_fields || []).forEach((f, j) => add(f, 'any', `${ws}.include_fields[${j}]`));
          (s.colors_from_fields || []).forEach((f, j) => add(typeof f === 'string' ? f : f?.field, 'any', `${ws}.colors_from_fields[${j}]`));
          (s.provided_fields || []).forEach((f, j) => { add(f?.color, 'any', `${ws}.provided_fields[${j}].color`); add(f?.label, 'any', `${ws}.provided_fields[${j}].label`); });
          (s.normalization_fields || []).forEach((f, j) => { add(f?.on, 'any', `${ws}.normalization_fields[${j}].on`); add(f?.per, 'any', `${ws}.normalization_fields[${j}].per`); });
          (s.metrics || []).forEach((m, j) => add(m.field, metricKind(m.metric), `${ws}.metrics[${j}].field`));
        });
        break;
      default:
    }
  });

  // ["get", name] inside the map layers: feature properties are flattened with "_" by ARLAS.
  (mapConfig?.layers || []).forEach(l => {
    const seen = new Set();
    const walk = node => {
      if (!Array.isArray(node)) {
        if (node && typeof node === 'object') Object.values(node).forEach(walk);
        return;
      }
      if (node[0] === 'get' && typeof node[1] === 'string' && !seen.has(node[1])) {
        seen.add(node[1]);
        refs.push({ getName: node[1], where: `layer "${l.id}" ["get", "${node[1]}"]` });
      }
      node.forEach(walk);
    };
    walk({ paint: l.paint, layout: l.layout, filter: l.filter });
  });
  return refs;
}

/** Resolves a flattened map property ("object_ship_type", "track_duration_s_avg_", "count_:normalized"). */
// Suffixes ARLAS appends to a flattened field: cluster metrics ("<field>_avg_") and generated colors ("<field>_arlas__color").
const GET_SUFFIX = /^_(avg|sum|min|max|cardinality|geocentroid|geobbox)_?$|^_arlas__/;

function resolveGetName(name, flatFields) {
  const base = name.split(':')[0];
  if (['count', 'count_', 'point_count', 'point_count_abbreviated'].includes(base)) return true;
  return flatFields.some(f => base === f || (base.startsWith(f) && GET_SUFFIX.test(base.slice(f.length))));
}

// ---------------------------------------------------------------- context

// Widget (analytics, timeline or detailed timeline) bound to a histogram contributor
function histogramWidgetOf(ctx, contributor) {
  return ctx.widgets.find(({ widget }) => widget.contributorId === contributor.identifier)?.widget
    || Object.values(ctx.components || {}).find(w => w && w.contributorId === contributor.identifier);
}
// Chart types the Builder offers for histograms and timelines (histogram- and timeline-form-builder).
// 'oneDimension' (8 px colour strip, values divided by the largest bucket) is not one of them.
const BUILDER_CHART_TYPES = ['bars', 'area', 'curve'];

function buildContext(config, mapConfig, options = {}) {
  const web = config?.arlas?.web || {};
  const contributors = Array.isArray(web.contributors) ? web.contributors : [];
  const analyticsGroups = Array.isArray(web.analytics) ? web.analytics : [];
  const components = web.components || {};
  const fields = flattenMapping(options.mapping);
  return {
    config, mapConfig: mapConfig || {}, options,
    mapping: options.mapping || null,
    fields,
    // leaf fields only: an object path ("object") must not validate "object_anything"
    flatFields: [...fields.entries()].filter(([, t]) => t !== 'OBJECT').map(([f]) => f.replace(/\./g, '_')),
    web, contributors, analyticsGroups, components,
    contributorIds: new Set(contributors.map(c => c.identifier)),
    byId: new Map(contributors.map(c => [c.identifier, c])),
    widgets: analyticsGroups.flatMap(g => (g.components || []).map(w => ({ group: g, widget: w }))),
    resultlistComponents: [
      ...(Array.isArray(components.resultlists) ? components.resultlists.map((rl, i) => ({ comp: rl, where: `Composant resultlists[${i}]` })) : []),
      ...analyticsGroups.flatMap(g => (g.components || []).filter(w => w.componentType === 'resultlist')
        .map(w => ({ comp: w, where: `Widget analytics "${widgetName(w)}" (resultlist)` })))
    ],
    mapLayers: Array.isArray(mapConfig?.layers) ? mapConfig.layers : [],
    extLayers: Array.isArray(mapConfig?.['external-event-layers']) ? mapConfig['external-event-layers'] : []
  };
}

// ---------------------------------------------------------------- rules

// The Builder validates process / function expressions with validProcess of arlas-web-contributors: use the
// same function when it loads, so that the validation refuses exactly what the Builder forms refuse.
let builderValidProcess = null;
try { ({ validProcess: builderValidProcess } = require('arlas-web-contributors')); } catch (e) { builderValidProcess = null; }
const isValidProcess = (value, variable) => {
  if (typeof value !== 'string' || value.length >= 250 || FORBIDDEN_PROCESS_WORDS.some(w => value.includes(w))) return false;
  if (!builderValidProcess) return true;
  try { return !!builderValidProcess(value, variable); } catch (e) { return false; }
};
const checkProcess = (r, value, where, variable = 'result') => {
  if (!value) return;
  if (!isValidProcess(value, variable)) {
    r.fail(`${where} : expression "${value}" refusée par validProcess du Builder (< 250 caractères, sans ${FORBIDDEN_PROCESS_WORDS.join('/')}, sans notation scientifique comme 1e6 : écrire 1000000).`);
  } else if (!value.includes(variable)) {
    r.warn(`${where} : l'expression n'utilise pas la variable "${variable}" ("${value}").`);
  }
};
const resultlists = ctx => ctx.contributors.filter(c => c.type === 'resultlist');
/** Analytics histograms on a count (no metric) whose collection declares a unit in arlas-wui.web.app.units. */
const countHistograms = ctx => {
  const units = ctx.config?.['arlas-wui']?.web?.app?.units;
  if (!Array.isArray(units)) return [];
  return ctx.widgets.filter(({ widget }) => widget.componentType === 'histogram').map(({ widget }) => {
    const c = ctx.contributors.find(x => x.identifier === widget.contributorId);
    const agg = (c?.aggregationmodels || [])[0] || {};
    const isCount = !Array.isArray(agg.metrics) || agg.metrics.length === 0 || agg.metrics.every(m => /count/i.test(m.collect_fct || ''));
    const unit = units.find(u => u.collection === c?.collection)?.unit;
    return c && isCount && nonEmptyString(unit) ? { widget, unit } : null;
  }).filter(Boolean);
};

const RULES = [
  // ======================================================== 3. contributors
  {
    // templates/*.json use <<…>> for every data-dependent value
    id: 'PH-1', section: 'contributors',
    check(ctx, r) {
      const walk = (node, p) => {
        if (typeof node === 'string') { if (/<<[^>]*>>/.test(node)) r.fail(`${p} : valeur de gabarit non remplacée ("${node}").`); return; }
        if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${p}[${i}]`));
        else if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => walk(v, `${p}.${k}`));
      };
      walk(ctx.config, 'config');
      walk(ctx.mapConfig, 'config.map');
    }
  },
  {
    id: 'ID-1', section: 'contributors',
    check(ctx, r) {
      ctx.contributors.forEach(c => {
        if (!nonEmptyString(c.identifier)) r.fail(`Contributeur (${c.type || 'inconnu'}) : l'identifiant doit être une chaîne non vide.`);
        else if (/\s/.test(c.identifier)) r.fail(`Identifiant "${c.identifier}" (${c.type}) : les espaces sont interdits.`);
        else if (!/^[a-zA-Z0-9_\-.:]+$/.test(c.identifier)) r.fail(`Identifiant "${c.identifier}" (${c.type}) : caractères autorisés : alphanumérique, '-', '_', '.', ':'.`);
      });
    }
  },
  {
    id: 'ID-2', section: 'contributors',
    check(ctx, r) {
      const seen = new Set();
      ctx.contributors.forEach(c => {
        if (seen.has(c.identifier)) r.fail(`Identifiant dupliqué : "${c.identifier}".`);
        seen.add(c.identifier);
      });
      if (seen.size === ctx.contributors.length) r.pass(`${ctx.contributors.length} identifiants de contributeurs uniques.`);
    }
  },
  {
    id: 'ID-3', section: 'contributors',
    check(ctx, r) {
      ctx.contributors.filter(c => c.type === 'swimlane' && c.collection && nonEmptyString(c.identifier) && !c.identifier.includes(c.collection))
        .forEach(c => r.fail(`Swimlane "${c.identifier}" : l'identifiant canonique doit contenir le nom de la collection ("${c.collection}").`));
    }
  },
  {
    id: 'ICON-1', section: 'contributors',
    check(ctx, r) {
      ctx.contributors.filter(c => !nonEmptyString(c.icon))
        .forEach(c => r.fail(`Contributeur "${c.identifier}" (${c.type}) : "icon" est obligatoire (sinon TypeError dans l'icon-picker).`));
    },
    fix(ctx, f) {
      ctx.contributors.filter(c => !nonEmptyString(c.icon)).forEach(c => f.set(c, 'icon', 'short_text', `contributor "${c.identifier}"`));
    }
  },
  {
    id: 'TYPE-1', section: 'contributors',
    check(ctx, r) {
      ctx.contributors.forEach(c => {
        if (c.type === 'chipssearch') r.fail(`Contributeur "${c.identifier}" : type déprécié "chipssearch", utilisez "search".`);
        else if (!CONTRIBUTOR_SCHEMAS[c.type]) r.fail(`Contributeur "${c.identifier}" : type non reconnu "${c.type}" (attendus : ${Object.keys(CONTRIBUTOR_SCHEMAS).join(', ')}).`);
      });
    }
  },
  {
    id: 'SCH-1', section: 'contributors',
    check(ctx, r) {
      const { ajv } = getAjv();
      ctx.contributors.forEach(c => {
        const schemaId = CONTRIBUTOR_SCHEMAS[c.type];
        if (schemaId && !ajv.validate(schemaId, c)) {
          r.fail(`Contributeur "${c.identifier}" (${c.type}) non conforme à ${schemaId} : ${ajv.errorsText(ajv.errors)}`);
        }
      });
    }
  },
  {
    id: 'KEY-1', section: 'contributors',
    check(ctx, r) {
      ctx.contributors.filter(c => CONTRIBUTOR_SCHEMAS[c.type]).forEach(c => {
        const allowed = allowedContributorKeys(c.type);
        const extra = Object.keys(c).filter(k => !allowed.has(k) && !(c.type === 'resultlist' && k === 'options'));
        if (extra.length) r.warn(`Contributeur "${c.identifier}" (${c.type}) : propriété(s) inconnue(s) des schémas, ignorées ou perdues par le Builder : ${extra.join(', ')}.`);
      });
    },
    fix(ctx, f) {
      ctx.contributors.filter(c => CONTRIBUTOR_SCHEMAS[c.type]).forEach(c => {
        const allowed = allowedContributorKeys(c.type);
        Object.keys(c).filter(k => !allowed.has(k) && !(c.type === 'resultlist' && k === 'options'))
          .forEach(k => f.remove(c, k, `contributor "${c.identifier}"`));
      });
    }
  },
  {
    id: 'MAP-0', section: 'contributors',
    check(ctx, r) {
      ctx.contributors.filter(c => c.type === 'map' && c.window_extent_geometry !== undefined
        && !['geometry_path', 'centroid_path'].includes(c.window_extent_geometry))
        .forEach(c => r.fail(`Contributeur map "${c.identifier}" : window_extent_geometry doit valoir "geometry_path" ou "centroid_path" (un objet fait planter l'import : .toLowerCase()).`));
    },
    fix(ctx, f) {
      ctx.contributors.filter(c => c.type === 'map' && c.window_extent_geometry !== undefined
        && !['geometry_path', 'centroid_path'].includes(c.window_extent_geometry))
        .forEach(c => f.set(c, 'window_extent_geometry', 'geometry_path', `contributor "${c.identifier}"`));
    }
  },
  {
    id: 'HIST-1', section: 'contributors',
    check(ctx, r) {
      ctx.contributors.filter(c => ['histogram', 'detailedhistogram'].includes(c.type)).forEach(c => {
        if (c.useUtc === undefined) r.warn(`Contributeur ${c.type} "${c.identifier}" : useUtc absent (le Builder l'exporte toujours).`);
        // isOneDimension divides every bucket by the largest one (HistogramContributor.setData): y axis 0–1 instead of counts.
        // It only makes sense with chartType oneDimension, which the Builder does not offer: always false.
        if (c.isOneDimension !== false) r.fail(`Contributeur ${c.type} "${c.identifier}" : isOneDimension doit valoir false (true ramène l'axe Y à 0–1 au lieu des effectifs ; le graphique oneDimension n'existe pas dans le Builder).`);
        const chartType = histogramWidgetOf(ctx, c)?.input?.chartType;
        if (chartType !== undefined && !BUILDER_CHART_TYPES.includes(chartType)) r.fail(`Contributeur ${c.type} "${c.identifier}" : chartType "${chartType}" absent du Builder (${BUILDER_CHART_TYPES.join(', ')}).`);
      });
    },
    fix(ctx, f) {
      ctx.contributors.filter(c => ['histogram', 'detailedhistogram'].includes(c.type)).forEach(c => {
        if (c.useUtc === undefined) f.set(c, 'useUtc', true, `contributor "${c.identifier}"`);
        if (c.isOneDimension !== false) f.set(c, 'isOneDimension', false, `contributor "${c.identifier}"`);
        const w = histogramWidgetOf(ctx, c);
        if (w?.input?.chartType !== undefined && !BUILDER_CHART_TYPES.includes(w.input.chartType)) f.set(w.input, 'chartType', 'bars', `widget "${c.identifier}"`);
      });
    }
  },
  {
    id: 'MET-1', section: 'contributors',
    check(ctx, r) {
      ctx.contributors.filter(c => c.type === 'metric')
        .forEach(c => checkProcess(r, c.function, `Contributeur metric "${c.identifier}" function`, 'm'));
    }
  },
  {
    id: 'SEARCH-1', section: 'contributors',
    check(ctx, r) {
      ctx.contributors.filter(c => c.type === 'search').forEach(c => {
        if (!nonEmptyString(c.search_field)) r.fail(`Contributeur search "${c.identifier}" : search_field est obligatoire (champ de la collection, jamais inventé).`);
        if (c.autocomplete_size === undefined) r.warn(`Contributeur search "${c.identifier}" : autocomplete_size absent (10 par défaut dans le Builder).`);
      });
    },
    fix(ctx, f) {
      ctx.contributors.filter(c => c.type === 'search' && c.autocomplete_size === undefined)
        .forEach(c => f.set(c, 'autocomplete_size', 10, `contributor "${c.identifier}"`));
    }
  },

  // ======================================================== 4. full schema
  {
    id: 'SCH-2', section: 'schema',
    check(ctx, r) {
      const { validateFull, missing } = getAjv();
      missing.forEach(m => r.fail(`Schéma requis manquant : ${m}`));
      const full = JSON.parse(JSON.stringify(ctx.config));
      const input = full?.arlas?.web?.components?.mapgl?.input;
      if (input?.mapLayers) {
        input.mapLayers.layers = ctx.mapLayers;
        input.mapLayers.externalEventLayers = ctx.extLayers;
      }
      if (validateFull(full)) r.pass('Configuration complète validée contre arlasconfig.schema.json.');
      else validateFull.errors.forEach(e => r.fail(`Erreur de schéma arlasconfig : ${e.instancePath || e.schemaPath} ${e.message}`));
    }
  },

  // ======================================================== 4.bis resultlist (R = contributor, C = component)
  {
    id: 'R1', section: 'resultlist',
    check(ctx, r) {
      resultlists(ctx).filter(c => !Array.isArray(c.columns) || c.columns.length === 0)
        .forEach(c => r.fail(`Contributeur resultlist "${c.identifier}" : au moins une colonne est requise ; sans colonne, hasListView est faux et la table ne s'affiche pas.`));
    }
  },
  {
    id: 'R2', section: 'resultlist',
    check(ctx, r) {
      resultlists(ctx).forEach(c => (c.columns || []).forEach((col, i) => {
        const where = `Contributeur resultlist "${c.identifier}" columns[${i}]`;
        if (!col.columnName || !col.fieldName) r.fail(`${where} : columnName et fieldName sont obligatoires.`);
        if (col.sort !== undefined && !['asc', 'desc', ''].includes(col.sort)) r.fail(`${where} : sort doit valoir "asc", "desc" ou "".`);
      }));
    }
  },
  {
    // A date field shown without process prints its raw stored value (epoch seconds or milliseconds).
    id: 'DATE-1', section: 'resultlist',
    check(ctx, r) {
      if (!ctx.mapping) return;
      const isDate = f => ['DATE', 'DATE_NANOS'].includes(ctx.fields.get(f));
      const formatOf = f => {
        let node = { properties: ctx.mapping.properties };
        for (const k of f.split('.')) node = node?.properties?.[k];
        return String(node?.format || '');
      };
      const hint = f => {
        const fmt = formatOf(f);
        if (fmt.includes('epoch_second')) return "new Date(result*1000).toISOString().slice(0,16).replace('T',' ')";
        return "new Date(result).toISOString().slice(0,16).replace('T',' ')";
      };
      resultlists(ctx).forEach(c => {
        const w = `Contributeur resultlist "${c.identifier}"`;
        const check = (field, process, where) => {
          if (field && isDate(field) && !process) r.warn(`${w} ${where} : la date "${field}" s'affiche en valeur brute (${formatOf(field) || 'format inconnu'}) ; formate-la avec process, ex. "${hint(field)}" et « (UTC) » dans le nom de la colonne.`);
        };
        (c.columns || []).forEach((col, i) => check(col.fieldName, col.process, `columns[${i}] « ${col.columnName} »`));
        (c.details || []).forEach((d, i) => (d.fields || []).forEach((fl, j) => check(fl.path, fl.process, `details[${i}].fields[${j}] « ${fl.label} »`)));
      });
    }
  },
  {
    id: 'R3', section: 'resultlist',
    check(ctx, r) {
      resultlists(ctx).forEach(c => {
        const w = `Contributeur resultlist "${c.identifier}"`;
        (c.columns || []).forEach((col, i) => checkProcess(r, col.process, `${w} columns[${i}]`));
        (c.details || []).forEach((d, i) => (d.fields || []).forEach((fl, j) => checkProcess(r, fl.process, `${w} details[${i}].fields[${j}]`)));
        (c.cardViewProperties || []).forEach((cv, i) => checkProcess(r, cv.process, `${w} cardViewProperties[${i}]`));
        ['titleFieldNames', 'tooltipFieldNames'].forEach(k => (c.fieldsConfiguration?.[k] || []).forEach((t, i) => checkProcess(r, t.process, `${w} fieldsConfiguration.${k}[${i}]`)));
      });
    }
  },
  {
    id: 'R4', section: 'resultlist',
    check(ctx, r) {
      resultlists(ctx).filter(c => typeof c.search_size === 'number' && (c.search_size < 50 || c.search_size > 500))
        .forEach(c => r.warn(`Contributeur resultlist "${c.identifier}" : search_size=${c.search_size} hors de la plage du Builder (50–500) ; < 50 est remonté à 50 à l'import.`));
    }
  },
  {
    id: 'R5', section: 'resultlist',
    check(ctx, r) {
      resultlists(ctx).filter(c => c.max_pages !== undefined)
        .forEach(c => r.warn(`Contributeur resultlist "${c.identifier}" : max_pages n'est pas exporté par le Builder et sera perdu après un round-trip.`));
    }
  },
  {
    id: 'R6', section: 'resultlist',
    check(ctx, r) {
      resultlists(ctx).forEach(c => {
        const fc = c.fieldsConfiguration || {};
        const w = `Contributeur resultlist "${c.identifier}"`;
        ['titleFieldNames', 'tooltipFieldNames'].forEach(k => {
          if (Array.isArray(fc[k]) && fc[k].length > 1) r.warn(`${w} : fieldsConfiguration.${k} contient ${fc[k].length} éléments ; le Builder ne conserve que le premier.`);
        });
        if (!nonEmptyString(fc.idFieldName)) r.fail(`${w} : fieldsConfiguration.idFieldName est obligatoire (= id_path de la collection).`);
        const idPath = ctx.mapping?.params?.id_path;
        if (idPath && nonEmptyString(fc.idFieldName) && fc.idFieldName !== idPath) {
          r.fail(`${w} : fieldsConfiguration.idFieldName ("${fc.idFieldName}") doit être l'id_path de la collection ("${idPath}").`);
        }
      });
    },
    fix(ctx, f) {
      const defaults = {
        titleFieldNames: [{ fieldPath: '', process: '' }],
        tooltipFieldNames: [{ fieldPath: '', process: '' }],
        useHttpQuicklooks: false,
        useHttpThumbnails: false,
        displayQuicklookOnMap: { enabled: false, boundsFieldName: '' },
        urlImageTemplates: []
      };
      resultlists(ctx).forEach(c => {
        const where = `contributor "${c.identifier}"`;
        if (!c.fieldsConfiguration || typeof c.fieldsConfiguration !== 'object') f.set(c, 'fieldsConfiguration', {}, where);
        Object.entries(defaults).forEach(([k, v]) => {
          if (c.fieldsConfiguration[k] === undefined) f.set(c.fieldsConfiguration, k, v, `${where}.fieldsConfiguration`);
        });
      });
    }
  },
  {
    id: 'R7', section: 'resultlist',
    check(ctx, r) {
      resultlists(ctx).forEach(c => (c.details || []).forEach((d, i) => {
        if (!Array.isArray(d.fields) || d.fields.length === 0) r.fail(`Contributeur resultlist "${c.identifier}" : details[${i}] ("${d.name}") doit contenir au moins un champ.`);
      }));
    }
  },
  {
    id: 'R8', section: 'resultlist',
    check(ctx, r) {
      resultlists(ctx).forEach(c => (c.cardViewProperties || []).forEach((cv, i) => {
        if (!cv.fieldName || !cv.prettyName || typeof cv.lineNumber !== 'number') {
          r.fail(`Contributeur resultlist "${c.identifier}" : cardViewProperties[${i}] doit définir fieldName, prettyName et lineNumber.`);
        }
      }));
    }
  },
  {
    id: 'R9', section: 'resultlist',
    check(ctx, r) {
      resultlists(ctx).forEach(c => {
        const w = `Contributeur resultlist "${c.identifier}"`;
        if (c.options !== undefined) r.fail(`${w} : la clé "options" n'est jamais exportée par le Builder sur le contributeur ; elle va dans input.options du composant.`);
        ['includeMetadata', 'cardViewProperties', 'details'].forEach(k => {
          if (!Array.isArray(c[k])) r.warn(`${w} : ${k} absent ; le Builder exporte toujours un tableau.`);
        });
      });
      r.pass(`${resultlists(ctx).length} contributeur(s) resultlist contrôlé(s) (R1–R9).`);
    },
    fix(ctx, f) {
      resultlists(ctx).forEach(c => {
        const where = `contributor "${c.identifier}"`;
        if (c.options !== undefined) f.remove(c, 'options', where);
        ['includeMetadata', 'cardViewProperties', 'details'].forEach(k => { if (!Array.isArray(c[k])) f.set(c, k, [], where); });
      });
    }
  },
  {
    id: 'C1', section: 'resultlist',
    check(ctx, r) {
      ctx.resultlistComponents.filter(({ comp }) => comp.input?.id !== comp.contributorId)
        .forEach(({ comp, where }) => r.fail(`${where} : input.id ("${comp.input?.id}") doit être égal à contributorId ("${comp.contributorId}").`));
    },
    fix(ctx, f) {
      ctx.resultlistComponents.forEach(({ comp, where }) => {
        if (!comp.input || typeof comp.input !== 'object') f.set(comp, 'input', {}, where);
        if (comp.input.id !== comp.contributorId && nonEmptyString(comp.contributorId)) f.set(comp.input, 'id', comp.contributorId, `${where}.input`);
      });
    }
  },
  {
    id: 'C2', section: 'resultlist',
    check(ctx, r) {
      ctx.resultlistComponents.forEach(({ comp, where }) => {
        const input = comp.input || {};
        const contrib = ctx.byId.get(comp.contributorId);
        const hasColumns = !!contrib && Array.isArray(contrib.columns) && contrib.columns.length > 0;
        const hasCards = !!contrib && Array.isArray(contrib.cardViewProperties) && contrib.cardViewProperties.length > 0;
        ['hasListView', 'hasGridView', 'hasCardView'].forEach(flag => {
          if (typeof input[flag] !== 'boolean') r.fail(`${where} : input.${flag} est obligatoire (booléen, false si la vue n'est pas utilisée).`);
        });
        if (typeof input.hasListView === 'boolean' && input.hasListView !== hasColumns) r.fail(`${where} : input.hasListView doit valoir ${hasColumns}.`);
        if (typeof input.hasCardView === 'boolean' && input.hasCardView !== hasCards) r.fail(`${where} : input.hasCardView doit valoir ${hasCards}.`);
        if (input.hasGridView === true && contrib) {
          const fc = contrib.fieldsConfiguration || {};
          if (!fc.urlThumbnailTemplate) r.warn(`${where} : hasGridView est vrai mais fieldsConfiguration.urlThumbnailTemplate est vide : tuiles sans image.`);
          if (!fc.titleFieldNames?.[0]?.fieldPath) r.warn(`${where} : hasGridView est vrai mais titleFieldNames[0].fieldPath est vide : tuiles sans titre.`);
        }
      });
    },
    fix(ctx, f) {
      ctx.resultlistComponents.forEach(({ comp, where }) => {
        if (!comp.input || typeof comp.input !== 'object') f.set(comp, 'input', {}, where);
        const input = comp.input;
        const contrib = ctx.byId.get(comp.contributorId);
        if (!contrib) return;
        const hasColumns = Array.isArray(contrib.columns) && contrib.columns.length > 0;
        const hasCards = Array.isArray(contrib.cardViewProperties) && contrib.cardViewProperties.length > 0;
        if (input.hasListView !== hasColumns) f.set(input, 'hasListView', hasColumns, `${where}.input`);
        if (input.hasCardView !== hasCards) f.set(input, 'hasCardView', hasCards, `${where}.input`);
        if (typeof input.hasGridView !== 'boolean') f.set(input, 'hasGridView', false, `${where}.input`);
      });
    }
  },
  {
    id: 'C3', section: 'resultlist',
    check(ctx, r) {
      ctx.resultlistComponents.forEach(({ comp, where }) => {
        const input = comp.input || {};
        const contrib = ctx.byId.get(comp.contributorId);
        const hasCards = !!contrib && Array.isArray(contrib.cardViewProperties) && contrib.cardViewProperties.length > 0;
        const mode = input.defaultMode ?? input.defautMode;
        if (mode === undefined) r.fail(`${where} : input.defaultMode est absent ("list", "grid" ou "card").`);
        else if (['grid', '1'].includes(String(mode)) && !input.hasGridView) r.fail(`${where} : defaultMode "grid" exige hasGridView: true.`);
        else if (['card', '2'].includes(String(mode)) && !hasCards) r.fail(`${where} : defaultMode "card" exige des cardViewProperties sur le contributeur.`);
      });
    },
    fix(ctx, f) {
      ctx.resultlistComponents.forEach(({ comp, where }) => {
        const input = comp.input || {};
        const contrib = ctx.byId.get(comp.contributorId);
        const hasCards = !!contrib && Array.isArray(contrib.cardViewProperties) && contrib.cardViewProperties.length > 0;
        const mode = input.defaultMode ?? input.defautMode;
        if (mode === undefined || (['grid', '1'].includes(String(mode)) && !input.hasGridView) || (['card', '2'].includes(String(mode)) && !hasCards)) {
          f.set(input, 'defaultMode', 'list', `${where}.input`);
        }
      });
    }
  },
  {
    id: 'C4', section: 'resultlist',
    check(ctx, r) {
      ctx.resultlistComponents.filter(({ comp }) => ![445, 217, 143, 211, 137].includes(comp.input?.tableWidth))
        .forEach(({ comp, where }) => r.fail(`${where} : input.tableWidth (${comp.input?.tableWidth}) doit valoir 445, 217 ou 143 selon le nombre de widgets par ligne.`));
    },
    fix(ctx, f) {
      ctx.resultlistComponents.filter(({ comp }) => comp.input && comp.input.tableWidth === undefined)
        .forEach(({ comp, where }) => f.set(comp.input, 'tableWidth', 445, `${where}.input`));
    }
  },
  {
    id: 'C5', section: 'resultlist',
    check(ctx, r) {
      ctx.resultlistComponents.forEach(({ comp, where }) => {
        const o = comp.input?.options;
        if (!o || typeof o.showName !== 'boolean' || typeof o.showIcon !== 'boolean') r.fail(`${where} : input.options.showName et input.options.showIcon sont obligatoires.`);
      });
    },
    fix(ctx, f) {
      ctx.resultlistComponents.forEach(({ comp, where }) => {
        if (!comp.input) return;
        const contrib = ctx.byId.get(comp.contributorId);
        if (!comp.input.options || typeof comp.input.options !== 'object') f.set(comp.input, 'options', {}, `${where}.input`);
        const defaults = {
          showActionsOnhover: 'true', showDetailIconName: 'keyboard_arrow_down', hideDetailIconName: 'keyboard_arrow_up',
          icon: contrib?.icon || 'short_text', showName: true, showIcon: true
        };
        Object.entries(defaults).forEach(([k, v]) => { if (comp.input.options[k] === undefined) f.set(comp.input.options, k, v, `${where}.input.options`); });
      });
    }
  },
  {
    id: 'C6', section: 'resultlist',
    check(ctx, r) {
      ctx.resultlistComponents.forEach(({ comp, where }) => {
        const contrib = ctx.byId.get(comp.contributorId);
        if (contrib && comp.input?.searchSize !== contrib.search_size) r.warn(`${where} : input.searchSize (${comp.input?.searchSize}) diffère de search_size du contributeur (${contrib.search_size}).`);
      });
    },
    fix(ctx, f) {
      ctx.resultlistComponents.forEach(({ comp, where }) => {
        const contrib = ctx.byId.get(comp.contributorId);
        if (contrib && comp.input && contrib.search_size !== undefined && comp.input.searchSize !== contrib.search_size) f.set(comp.input, 'searchSize', contrib.search_size, `${where}.input`);
      });
    }
  },
  {
    id: 'C7', section: 'resultlist',
    check(ctx, r) {
      ctx.resultlistComponents.forEach(({ comp, where }) => {
        const contrib = ctx.byId.get(comp.contributorId);
        if (comp.input?.cellBackgroundStyle !== undefined && !(contrib?.columns || []).some(col => col.useColorService)) {
          r.warn(`${where} : cellBackgroundStyle n'a d'effet que si une colonne a useColorService: true.`);
        }
      });
    }
  },
  {
    id: 'C10', section: 'resultlist',
    check(ctx, r) {
      ctx.resultlistComponents.filter(({ comp }) => comp.usage !== undefined && !['analytics', 'shortcuts', 'both'].includes(comp.usage))
        .forEach(({ where }) => r.fail(`${where} : usage doit valoir "analytics", "shortcuts" ou "both".`));
    }
  },
  {
    id: 'C11', section: 'resultlist',
    check(ctx, r) {
      const main = Array.isArray(ctx.components.resultlists) ? ctx.components.resultlists : [];
      ctx.widgets.filter(({ widget }) => widget.componentType === 'resultlist' && main.some(rl => rl.contributorId === widget.contributorId))
        .forEach(({ widget }) => r.warn(`Liste "${widget.contributorId}" utilisée à la fois dans components.resultlists et dans analytics avec le même contributeur : utilisez un contributeur distinct (ou supprimez la copie d'analytics).`));
    }
  },

  // ======================================================== 5. references and analytics
  {
    id: 'REF-1', section: 'refs',
    check(ctx, r) {
      let missing = 0;
      ctx.widgets.forEach(({ widget }) => {
        if (!ctx.contributorIds.has(widget.contributorId)) { missing++; r.fail(`Widget "${widgetName(widget)}" référence un contributeur inexistant : "${widget.contributorId}".`); }
      });
      if (!missing) r.pass(`Les ${ctx.widgets.length} widgets du panneau analytics référencent des contributeurs valides.`);
    }
  },
  {
    id: 'REF-2', section: 'refs',
    check(ctx, r) {
      ['timeline', 'detailedTimeline'].forEach(k => {
        const id = ctx.components[k]?.contributorId;
        if (id && !ctx.contributorIds.has(id)) r.fail(`Composant ${k} référence un contributeur inexistant : "${id}".`);
      });
      (Array.isArray(ctx.components.resultlists) ? ctx.components.resultlists : []).forEach((rl, i) => {
        if (rl.contributorId && !ctx.contributorIds.has(rl.contributorId)) r.fail(`Composant resultlists[${i}] référence un contributeur inexistant : "${rl.contributorId}".`);
      });
    }
  },
  {
    id: 'REF-3', section: 'refs',
    check(ctx, r) {
      ctx.contributors.filter(c => c.type === 'detailedhistogram').forEach(c => {
        const parent = ctx.byId.get(c.annexedContributorId);
        if (!parent || parent.type !== 'histogram') r.fail(`detailedhistogram "${c.identifier}" : annexedContributorId invalide ("${c.annexedContributorId}"), doit désigner un contributeur histogram.`);
        else r.pass(`detailedhistogram "${c.identifier}" lié à l'histogramme "${c.annexedContributorId}".`);
      });
    }
  },
  {
    id: 'GRP-1', section: 'refs',
    check(ctx, r) {
      ctx.analyticsGroups.forEach(g => {
        if (!nonEmptyString(g.icon)) r.fail(`Groupe analytique "${g.title || g.groupId}" : "icon" est obligatoire (sinon erreur config-icon-picker).`);
        if (!nonEmptyString(g.title)) r.fail(`Groupe analytique "${g.groupId}" : "title" est obligatoire.`);
      });
    },
    fix(ctx, f) {
      ctx.analyticsGroups.filter(g => !nonEmptyString(g.icon)).forEach(g => f.set(g, 'icon', 'short_text', `analytics group "${g.groupId}"`));
    }
  },
  {
    id: 'DIM-1', section: 'refs',
    check(ctx, r) {
      ctx.widgets.forEach(({ widget }) => {
        const input = widget.input || {};
        const n = `Widget "${widgetName(widget)}" (${widget.componentType})`;
        if (['histogram', 'swimlane'].includes(widget.componentType)) {
          if (!nonEmptyString(input.chartTitle)) r.fail(`${n} : input.chartTitle est obligatoire.`);
          if (!isPosNum(input.chartWidth)) r.fail(`${n} : input.chartWidth est obligatoire (> 0, ex. 445) ; sinon "<rect> attribute width: NaN".`);
          if (!(isPosNum(input.barWeight) && input.barWeight <= 1)) r.fail(`${n} : input.barWeight est obligatoire (0 < barWeight <= 1, ex. 0.8).`);
          if (!['time', 'numeric'].includes(input.dataType)) r.fail(`${n} : input.dataType doit valoir "time" ou "numeric" (sinon identifiant canonique faux).`);
        } else if (widget.componentType === 'powerbars') {
          if (!isPosNum(input.chartWidth)) r.fail(`${n} : input.chartWidth est obligatoire (> 0, ex. 445 ou 217).`);
        } else if (widget.componentType === 'donut') {
          if (!isPosNum(input.diameter)) r.fail(`${n} : input.diameter est obligatoire (> 0, ex. 170).`);
          if (!isPosNum(input.containerWidth)) r.fail(`${n} : input.containerWidth est obligatoire (> 0, ex. 223).`);
        }
      });
    },
    fix(ctx, f) {
      ctx.widgets.forEach(({ widget }) => {
        const where = `widget "${widgetName(widget)}" (${widget.componentType}).input`;
        if (!['histogram', 'swimlane', 'powerbars', 'donut'].includes(widget.componentType)) return;
        if (!widget.input || typeof widget.input !== 'object') f.set(widget, 'input', {}, where);
        const input = widget.input;
        if (['histogram', 'swimlane', 'powerbars'].includes(widget.componentType) && !isPosNum(input.chartWidth)) f.set(input, 'chartWidth', 445, where);
        if (['histogram', 'swimlane'].includes(widget.componentType)) {
          if (!(isPosNum(input.barWeight) && input.barWeight <= 1)) f.set(input, 'barWeight', 0.8, where);
          if (!isPosNum(input.chartHeight)) f.set(input, 'chartHeight', 120, where);
        }
        if (widget.componentType === 'donut') {
          if (!isPosNum(input.diameter)) f.set(input, 'diameter', 170, where);
          if (!isPosNum(input.containerWidth)) f.set(input, 'containerWidth', 223, where);
        }
      });
    }
  },
  {
    // On export, the Builder sets input.yUnit of a count histogram to the unit of its collection
    // (arlas-wui.web.app.units): any other value is rewritten.
    id: 'HIST-2', section: 'refs',
    check(ctx, r) {
      countHistograms(ctx).forEach(({ widget, unit }) => {
        if (widget.input?.yUnit !== undefined && widget.input.yUnit !== unit) r.fail(`Widget "${widgetName(widget)}" (histogram de comptage) : input.yUnit doit valoir l'unité de la collection "${unit}" (le Builder la réécrit à l'export).`);
      });
    },
    fix(ctx, f) {
      countHistograms(ctx).forEach(({ widget, unit }) => {
        if (widget.input && widget.input.yUnit !== undefined && widget.input.yUnit !== unit) f.set(widget.input, 'yUnit', unit, `widget "${widgetName(widget)}" (histogram).input`);
      });
    }
  },
  {
    id: 'TL-1', section: 'refs',
    check(ctx, r) {
      [['timeline', 'histogram-timeline'], ['detailedTimeline', 'histogram-detailed-timeline']].forEach(([key, expectedId]) => {
        const tl = ctx.components[key];
        if (!tl) return;
        const inp = tl.input || {};
        if (inp.dataType !== 'time') r.fail(`Composant ${key} : input.dataType doit valoir "time" (sinon les barres ne s'affichent pas).`);
        if (!(isPosNum(inp.barWeight) && inp.barWeight <= 1)) r.fail(`Composant ${key} : input.barWeight est obligatoire (0 < barWeight <= 1, ex. 0.8).`);
        if (!isPosNum(inp.chartHeight)) r.fail(`Composant ${key} : input.chartHeight est obligatoire (128 pour la timeline, 60 pour la détaillée).`);
        ['ticksDateFormat', 'valuesDateFormat'].forEach(k => {
          if (inp[k] !== TIMELINE_DATE_FORMAT) r.fail(`Composant ${key} : input.${k} doit valoir "${TIMELINE_DATE_FORMAT}" (le Builder réécrit toute autre valeur).`);
        });
        if (tl.componentType !== 'histogram') r.warn(`Composant ${key} : componentType "histogram" attendu.`);
        if (inp.id !== expectedId) r.warn(`Composant ${key} : input.id "${expectedId}" attendu, trouvé "${inp.id}".`);
        if (ctx.contributorIds.has(tl.contributorId)) r.pass(`Composant ${key} lié au contributeur "${tl.contributorId}".`);
      });
    },
    fix(ctx, f) {
      [['timeline', 'histogram-timeline', 128], ['detailedTimeline', 'histogram-detailed-timeline', 60]].forEach(([key, expectedId, height]) => {
        const tl = ctx.components[key];
        if (!tl) return;
        const where = `components.${key}`;
        if (!tl.input || typeof tl.input !== 'object') f.set(tl, 'input', {}, where);
        const inp = tl.input;
        if (inp.dataType !== 'time') f.set(inp, 'dataType', 'time', `${where}.input`);
        if (!(isPosNum(inp.barWeight) && inp.barWeight <= 1)) f.set(inp, 'barWeight', 0.8, `${where}.input`);
        if (!isPosNum(inp.chartHeight)) f.set(inp, 'chartHeight', height, `${where}.input`);
        ['ticksDateFormat', 'valuesDateFormat'].forEach(k => { if (inp[k] !== TIMELINE_DATE_FORMAT) f.set(inp, k, TIMELINE_DATE_FORMAT, `${where}.input`); });
        if (tl.componentType !== 'histogram') f.set(tl, 'componentType', 'histogram', where);
        if (inp.id !== expectedId) f.set(inp, 'id', expectedId, `${where}.input`);
      });
    }
  },
  {
    id: 'TAB-1', section: 'refs',
    check(ctx, r) {
      if (!ctx.analyticsGroups.length) return;
      const declared = ctx.web.options?.tabs;
      const used = [...new Set(ctx.analyticsGroups.map(g => g.tab).filter(t => t !== undefined))];
      if (!Array.isArray(declared) || declared.length === 0) {
        r.warn(`arlas.web.options.tabs est absent : onglets affichés en mode rétrocompatible (icône "short_text", sans nom). Déclarez { name, icon, showIcon, showName } pour : ${used.join(', ')}.`);
        return;
      }
      const names = new Set(declared.map(t => t.name));
      used.filter(t => !names.has(t)).forEach(t => r.fail(`L'onglet "${t}" utilisé par des groupes analytics n'est pas déclaré dans arlas.web.options.tabs : il sera masqué.`));
      declared.filter(t => !used.includes(t.name)).forEach(t => r.warn(`L'onglet "${t.name}" est déclaré dans options.tabs mais aucun groupe ne l'utilise.`));
    },
    fix(ctx, f) {
      if (!ctx.analyticsGroups.length || !ctx.config?.arlas?.web) return;
      const web = ctx.config.arlas.web;
      if (!web.options || typeof web.options !== 'object') f.set(web, 'options', {}, 'arlas.web');
      if (!Array.isArray(web.options.tabs)) f.set(web.options, 'tabs', [], 'arlas.web.options');
      const names = new Set(web.options.tabs.map(t => t.name));
      [...new Set(ctx.analyticsGroups.map(g => g.tab).filter(t => t !== undefined))].filter(t => !names.has(t)).forEach(t => {
        f.set(web.options.tabs, web.options.tabs.length, { name: t, icon: 'short_text', showIcon: true, showName: true }, 'arlas.web.options.tabs');
      });
    }
  },
  {
    id: 'TITLE-0', section: 'refs',
    check(ctx, r) {
      ctx.analyticsGroups.forEach(g => {
        const untitled = (g.components || []).filter(c => ['metric', 'metricstable', 'resultlist'].includes(c.componentType));
        if (untitled.length > 1) r.warn(`Groupe "${g.groupId}" : ${untitled.length} composants ${[...new Set(untitled.map(c => c.componentType))].join('/')} ; seul group.title est affiché. Un indicateur par groupe titré.`);
        (g.components || []).filter(c => c.title !== undefined).forEach(c => r.warn(`Groupe "${g.groupId}" : "title" du composant ${c.componentType} "${c.contributorId}" n'est jamais affiché (group.title, input.chartTitle ou input.powerbarTitle).`));
      });
    }
  },
  {
    // analytics-import.service.ts (getPowerbarWidgetData / getDonutWidgetData) reads the title from contributor.title,
    // and config-export-helper writes it back to input.chartTitle / input.powerbarTitle.
    id: 'TITLE-P', section: 'refs',
    check(ctx, r) {
      ctx.widgets.filter(({ widget }) => ['powerbars', 'donut'].includes(widget.componentType)).forEach(({ widget }) => {
        const contrib = ctx.byId.get(widget.contributorId);
        if (!contrib) return;
        const n = `Widget ${widget.componentType} "${widget.contributorId}"`;
        if (!nonEmptyString(contrib.title)) { r.fail(`${n} : le contributeur doit avoir un "title" : c'est le titre affiché par le Builder.`); return; }
        ['powerbarTitle', 'chartTitle'].filter(k => widget.input?.[k] !== undefined && widget.input[k] !== contrib.title)
          .forEach(k => r.warn(`${n} : input.${k} ("${widget.input[k]}") sera remplacé par le title du contributeur ("${contrib.title}") à la première sauvegarde du Builder.`));
      });
    },
    fix(ctx, f) {
      ctx.widgets.filter(({ widget }) => ['powerbars', 'donut'].includes(widget.componentType) && widget.input).forEach(({ widget }) => {
        const contrib = ctx.byId.get(widget.contributorId);
        if (!nonEmptyString(contrib?.title)) return;
        ['powerbarTitle', 'chartTitle'].filter(k => widget.input[k] !== undefined && widget.input[k] !== contrib.title)
          .forEach(k => f.set(widget.input, k, contrib.title, `widget ${widget.componentType} "${widget.contributorId}".input`));
      });
    }
  },
  {
    id: 'TAG-1', section: 'refs',
    check(ctx, r) {
      if (ctx.config?.arlas?.tagger && !nonEmptyString(ctx.config.arlas.tagger.collection)) r.fail('Configuration tagger : "collection" est obligatoire lorsque tagger est défini.');
    }
  },
  {
    id: 'XC-1', section: 'refs',
    check(ctx, r) {
      const xc = Array.isArray(ctx.config?.extraConfigs) ? ctx.config.extraConfigs : [];
      const missing = EXTRA_CONFIGS.filter(e => !xc.some(x => x.configPath === e.configPath && x.replacedAttribute === e.replacedAttribute && x.replacer === e.replacer));
      if (missing.length) missing.forEach(e => r.fail(`extraConfigs : délégation manquante "${e.replacedAttribute}" ← config.map.json#${e.replacer}.`));
      else r.pass('Délégation extraConfigs vers "config.map.json" vérifiée.');
    },
    fix(ctx, f) {
      if (!ctx.config) return;
      if (!Array.isArray(ctx.config.extraConfigs)) f.set(ctx.config, 'extraConfigs', [], '(racine)');
      EXTRA_CONFIGS.forEach(e => {
        if (!ctx.config.extraConfigs.some(x => x.configPath === e.configPath && x.replacedAttribute === e.replacedAttribute && x.replacer === e.replacer)) {
          f.set(ctx.config.extraConfigs, ctx.config.extraConfigs.length, { ...e }, 'extraConfigs');
        }
      });
    }
  },
  {
    id: 'XC-2', section: 'refs',
    check(ctx, r) {
      const ml = ctx.components.mapgl?.input?.mapLayers;
      if (!ml) { r.fail('components.mapgl.input.mapLayers est absent.'); return; }
      ['layers', 'externalEventLayers'].forEach(k => {
        if (!Array.isArray(ml[k]) || ml[k].length > 0) r.fail(`components.mapgl.input.mapLayers.${k} doit être un tableau vide [] (remplacé au runtime par extraConfigs).`);
      });
    },
    fix(ctx, f) {
      const ml = ctx.components.mapgl?.input?.mapLayers;
      if (!ml) return;
      ['layers', 'externalEventLayers'].forEach(k => {
        if (!Array.isArray(ml[k]) || ml[k].length > 0) f.set(ml, k, [], 'components.mapgl.input.mapLayers');
      });
    }
  },
  {
    id: 'OPT-1', section: 'refs',
    check(ctx, r) {
      const o = ctx.web.options || {};
      if ('zoom_to_data' in o) r.fail('La propriété "zoom_to_data" est prohibée. Utilisez "zoom_to_strategy": "centroid" | "bbox".');
      else if (o.zoom_to_strategy) r.pass(`Stratégie de zoom : "${o.zoom_to_strategy}".`);
    },
    fix(ctx, f) {
      const o = ctx.web.options;
      if (o && 'zoom_to_data' in o) {
        f.remove(o, 'zoom_to_data', 'arlas.web.options');
        if (!o.zoom_to_strategy) f.set(o, 'zoom_to_strategy', 'centroid', 'arlas.web.options');
      }
    }
  },

  // ======================================================== 5.bis map config
  {
    id: 'MAP-1', section: 'map',
    check(ctx, r) {
      const layerById = new Map(ctx.mapLayers.map(l => [l.id, l]));
      ctx.contributors.filter(c => c.type === 'map').forEach(c => {
        let bad = 0;
        (c.layers_sources || []).forEach(s => {
          const layer = layerById.get(s.id);
          if (!layer) { bad++; r.fail(`La source de couche "${s.id}" du contributeur map est absente de config.map.json.`); }
          else if (s.source && layer.source !== s.source) { bad++; r.fail(`Couche "${s.id}" : source "${layer.source}" dans config.map.json, "${s.source}" dans layers_sources.`); }
        });
        if (!bad) r.pass(`Les ${(c.layers_sources || []).length} sources de couches sont synchronisées avec config.map.json.`);
      });
    }
  },
  {
    // render_mode "window": the Builder disables maxfeatures and marks the layer as scrollable
    // (metadata.is-scrollable-layer = true, plus a scrollable_ copy it rebuilds itself); "wide": not scrollable.
    id: 'MAP-7', section: 'map',
    check(ctx, r) {
      const layerById = new Map(ctx.mapLayers.map(l => [l.id, l]));
      ctx.contributors.filter(c => c.type === 'map').forEach(c => (c.layers_sources || [])
        .filter(s => typeof s.source === 'string' && s.source.startsWith('feature-') && !s.source.startsWith('feature-metric-'))
        .forEach(s => {
          const window = s.render_mode === 'window';
          if (window && s.maxfeatures !== undefined) r.fail(`Source "${s.id}" : render_mode "window" n'a pas de maxfeatures (le Builder le supprime).`);
          const meta = layerById.get(s.id)?.metadata;
          if (meta && meta['is-scrollable-layer'] !== undefined && meta['is-scrollable-layer'] !== window) {
            r.fail(`Couche "${s.id}" : metadata.is-scrollable-layer doit valoir ${window} (render_mode "${s.render_mode}").`);
          } else if (meta && window && meta['is-scrollable-layer'] === undefined) {
            r.fail(`Couche "${s.id}" : metadata.is-scrollable-layer doit valoir true (render_mode "window").`);
          }
        }));
    },
    fix(ctx, f) {
      ctx.contributors.filter(c => c.type === 'map').forEach(c => (c.layers_sources || [])
        .filter(s => s.render_mode === 'window' && s.maxfeatures !== undefined)
        .forEach(s => f.remove(s, 'maxfeatures', `contributor "${c.identifier}".layers_sources "${s.id}"`)));
    }
  },
  {
    // The Builder builds hover / select copies only for "features" layers of type line or circle, and for the
    // arlas-fill_stroke- outline of a fill layer that declares metadata.stroke. Cluster and feature-metric layers
    // have none.
    id: 'MAP-8', section: 'map',
    check(ctx, r) {
      const byId = new Map(ctx.mapLayers.map(l => [l.id, l]));
      ctx.extLayers.forEach(el => {
        const base = typeof el.id === 'string' ? el.id.replace(/^arlas-(hover|select)-/, '') : '';
        const layer = byId.get(base);
        if (!layer) return;
        const src = String(layer.source || '');
        const features = src.startsWith('feature-') && !src.startsWith('feature-metric-');
        if (!features) {
          r.fail(`external-event-layer "${el.id}" : la couche "${base}" n'est pas en mode features (${src.split('-')[0]}) ; le Builder ne crée de survol / sélection que pour les couches features.`);
        } else if (layer.type === 'fill') {
          r.fail(`external-event-layer "${el.id}" : une couche fill n'a pas de survol / sélection ; déclare metadata.stroke et vise son contour "${base.replace(/^arlas_id:/, 'arlas-fill_stroke-')}".`);
        } else if (!['line', 'circle'].includes(layer.type)) {
          r.fail(`external-event-layer "${el.id}" : type "${layer.type}" sans survol / sélection dans le Builder (line ou circle seulement).`);
        }
      });
    }
  },
  {
    // The Builder disables layer filters on cluster layers (map-layer-form-builder: filters enabled only when
    // type !== 'cluster'): a filtered aggregation is lost on save.
    id: 'MAP-9', section: 'map',
    check(ctx, r) {
      const trivial = f => f === undefined || JSON.stringify(f) === '["all"]' || JSON.stringify(f) === '["all",["all"]]';
      ctx.mapLayers.filter(l => String(l.source || '').startsWith('cluster-') && !/^arlas-(hover|select)-/.test(l.id) && !trivial(l.filter))
        .forEach(l => r.fail(`Couche "${l.id}" : filtre sur une couche cluster, ignoré par le Builder ; filtre plutôt par la sélection (widgets) ou utilise une couche features.`));
      ctx.contributors.filter(c => c.type === 'map').forEach(c => (c.layers_sources || [])
        .filter(s => String(s.source || '').startsWith('cluster-') && Array.isArray(s.filters) && s.filters.length)
        .forEach(s => r.fail(`Source "${s.id}" : filters sur une source cluster, ignorés par le Builder.`)));
    }
  },
  {
    id: 'MAP-2', section: 'map',
    check(ctx, r) {
      const ids = new Set(ctx.mapLayers.map(l => l.id));
      let bad = 0;
      ctx.extLayers.forEach(el => {
        if (!ids.has(el.id)) { bad++; r.fail(`external-event-layer "${el.id}" est introuvable dans layers.`); }
        if (!['hover', 'select'].includes(el.on)) { bad++; r.fail(`external-event-layer "${el.id}" : mode "${el.on}" invalide (hover | select).`); }
      });
      if (!bad) r.pass(`Les ${ctx.extLayers.length} couches d'événements externes sont cohérentes.`);
    }
  },
  {
    id: 'MAP-3', section: 'map',
    check(ctx, r) {
      const sourced = new Set(ctx.contributors.filter(c => c.type === 'map').flatMap(c => (c.layers_sources || []).map(s => s.id)));
      ctx.mapLayers.filter(l => sourced.has(l.id)).forEach(l => {
        if (!String(l.id).startsWith('arlas_id:')) r.warn(`Couche "${l.id}" : l'identifiant devrait suivre "arlas_id:<Nom>:<clé>" pour être réimporté avec son nom.`);
        if (!/^(feature-|feature-metric-|cluster-)/.test(String(l.source))) r.warn(`Couche "${l.id}" : la source "${l.source}" devrait commencer par "feature-" ou "cluster-".`);
      });
      const input = ctx.components.mapgl?.input || {};
      ['visualisations_sets', 'basemapStyles', 'initCenter', 'initZoom'].filter(k => input[k] === undefined)
        .forEach(k => r.warn(`components.mapgl.input.${k} est absent.`));
    }
  },

  {
    // config-map-export-helper buildPropsValuesFromInterpolatedValues: for a normalized count / metric the Builder
    // rebuilds evenly spaced stops between the first and last value.
    id: 'MAP-5', section: 'map',
    check(ctx, r) {
      ctx.mapLayers.forEach(l => Object.entries({ ...l.paint, ...l.layout }).forEach(([prop, v]) => {
        if (!Array.isArray(v) || v[0] !== 'interpolate' || !Array.isArray(v[2]) || v[2][0] !== 'get' || !String(v[2][1]).includes(':normalized')) return;
        const stops = v.slice(3).filter((_, i) => i % 2 === 0);
        const step = stops.length > 2 ? (stops[stops.length - 1] - stops[0]) / (stops.length - 1) : 0;
        const uneven = stops.length > 2 && stops.some((s, i) => Math.abs(s - (stops[0] + i * step)) > 1e-6);
        if (uneven) r.warn(`Couche "${l.id}" ${prop} : arrêts non équidistants (${stops.join(', ')}) sur une valeur normalisée ; le Builder les recalcule à pas constant à la première sauvegarde (une échelle en √ est perdue).`);
      }));
    }
  },
  {
    id: 'MAP-6', section: 'map',
    check(ctx, r) {
      ctx.mapLayers.forEach(l => Object.keys(l.layout || {}).filter(k => /-sort-key$/.test(k))
        .forEach(k => r.warn(`Couche "${l.id}" : layout.${k} n'est pas géré par le Builder et sera perdu à la première sauvegarde.`)));
    }
  },

  // ======================================================== 6. fields
  {
    id: 'FLD-0', section: 'fields',
    check(ctx, r) {
      if (!ctx.mapping) {
        r.warn('Aucun mapping fourni (--mapping) : l\'existence et le type des champs ne sont pas vérifiés.');
        return;
      }
      const refs = collectFieldRefs(ctx.config, ctx.mapConfig);
      let bad = 0;
      refs.forEach(ref => {
        if (ref.getName !== undefined) {
          if (!resolveGetName(ref.getName, ctx.flatFields)) { bad++; r.fail(`${ref.where} : aucune propriété de ce nom ne correspond à un champ de la collection.`); }
          return;
        }
        if (ref.kind === 'invalid') { bad++; r.fail(`${ref.where} : nom de champ invalide (${ref.field}).`); return; }
        const type = ctx.fields.get(ref.field);
        if (!type) { bad++; r.fail(`${ref.where} : le champ "${ref.field}" n'existe pas dans la collection.`); return; }
        if (!KIND_TYPES[ref.kind](type)) { bad++; r.fail(`${ref.where} : le champ "${ref.field}" est de type ${type}, incompatible avec cet usage (${ref.kind}).`); }
      });
      const coll = ctx.mapping.collection_name;
      if (coll) ctx.contributors.filter(c => c.collection && c.collection !== coll)
        .forEach(c => r.warn(`Contributeur "${c.identifier}" : collection "${c.collection}" différente de la collection du mapping ("${coll}") ; ses champs sont vérifiés contre ce mapping.`));
      if (!bad) r.pass(`${refs.length} références de champs vérifiées contre le mapping de "${coll || '?'}".`);
    }
  }
];

// ---------------------------------------------------------------- runners

/** Runs every check. Returns findings [{ rule, section, severity: 'ERROR'|'WARN'|'PASS', message }]. */
function runChecks(config, mapConfig, options = {}) {
  const ctx = buildContext(config, mapConfig, options);
  const findings = [];
  RULES.forEach(rule => {
    const push = severity => message => findings.push({ rule: rule.id, section: rule.section, severity, message });
    const r = { fail: push('ERROR'), warn: push('WARN'), pass: push('PASS') };
    try {
      rule.check(ctx, r);
    } catch (e) {
      r.fail(`La règle a levé une exception (configuration malformée ?) : ${e.message}`);
    }
  });
  return findings;
}

function assertNoFieldValue(key, value, where) {
  const bad = [];
  const walk = (k, v) => {
    if (FIELD_LIKE_KEYS.has(k) && !(v === '' || v === null || (Array.isArray(v) && v.length === 0) || typeof v === 'boolean')) bad.push(k);
    if (v && typeof v === 'object') Object.entries(v).forEach(([ck, cv]) => walk(ck, cv));
  };
  walk(String(key), value);
  if (bad.length) throw new Error(`Refus d'écrire une valeur de donnée (${bad.join(', ')}) dans ${where} : un correctif ne doit jamais inventer un champ.`);
}

/** Applies every fix in place. Returns changes [{ rule, path, before, after }]. */
function runFixes(config, mapConfig, options = {}) {
  const changes = [];
  RULES.filter(rule => rule.fix).forEach(rule => {
    const ctx = buildContext(config, mapConfig, options);
    const f = {
      set(obj, key, value, where) {
        assertNoFieldValue(key, value, where);
        const before = obj[key];
        if (JSON.stringify(before) === JSON.stringify(value)) return;
        obj[key] = value;
        const clone = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
        changes.push({ rule: rule.id, path: `${where}.${key}`, before: clone(before), after: clone(value) });
      },
      remove(obj, key, where) {
        if (!(key in obj)) return;
        changes.push({ rule: rule.id, path: `${where}.${key}`, before: obj[key], after: undefined });
        delete obj[key];
      }
    };
    rule.fix(ctx, f);
  });
  return changes;
}

module.exports = {
  RULES, SECTIONS, FIELD_LIKE_KEYS, EXTRA_CONFIGS,
  runChecks, runFixes, buildContext, flattenMapping, collectFieldRefs, resolveGetName, assertNoFieldValue
};
