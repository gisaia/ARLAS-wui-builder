#!/usr/bin/env node
/**
 * CRITIQUE ANALYTIQUE D'UNE CONFIGURATION ARLAS WUI GÉNÉRÉE
 *
 * Complète validate.js (conformité technique : schémas, références, invariants Builder) par une
 * relecture de COHÉRENCE ANALYTIQUE fondée sur SPATIAL_RECIEPE.md et SPATIAL_ARLAS_CAPABILITIES.md :
 * agrégations adaptées à la nature des variables, pas d'agrégation, sémiologie des couches,
 * couleurs, unités, titres, redondances.
 *
 * Usage :
 *   node generative-ui/critique.js <config.json> <config.map.json> [profile.json]
 *
 * Le profil (format de generated/courses.profile.json) donne la nature, la cardinalité et les
 * statistiques des champs. Sans profil, seules les règles structurelles sont appliquées.
 *
 * Sévérités : ERREUR (incohérence à corriger, code de sortie 1), ALERTE (à corriger ou justifier),
 * CONSEIL (amélioration possible).
 */
const fs = require('fs');
const path = require('path');

const [configPath, mapPath, profilePath] = process.argv.slice(2);
if (!configPath || !mapPath) {
  console.error('Usage : node critique.js <config.json> <config.map.json> [profile.json]');
  process.exit(2);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const mapConfig = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const profile = profilePath ? JSON.parse(fs.readFileSync(profilePath, 'utf8')) : null;
const fields = profile?.fields || {};

const findings = [];
const add = (severity, code, where, message) => findings.push({ severity, code, where, message });
const ERR = (...a) => add('ERREUR', ...a);
const WARN = (...a) => add('ALERTE', ...a);
const TIP = (...a) => add('CONSEIL', ...a);

const web = config?.arlas?.web || {};
const contributors = web.contributors || [];
const byId = new Map(contributors.map(c => [c.identifier, c]));
const groups = web.analytics || [];
const nature = f => fields[f]?.nature;

// ---------------------------------------------------------------- utilitaires couleurs
function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
}
function luminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function toLab(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722);
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
function deltaE(a, b) {
  const la = toLab(a), lb = toLab(b);
  if (!la || !lb) return Infinity;
  return Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2]);
}
function colorsOf(expr) {
  if (typeof expr === 'string') return expr.startsWith('#') ? [expr] : [];
  if (!Array.isArray(expr)) return [];
  if (expr[0] === 'match') return expr.slice(2).filter((v, i, arr) => (i % 2 === 1 || i === arr.length - 1) && typeof v === 'string' && v.startsWith('#'));
  if (expr[0] === 'interpolate') return expr.slice(3).filter((v, i) => i % 2 === 1 && typeof v === 'string');
  return [];
}
const unflatten = key => key.replace(/:.*$/, '');
function fieldFromGet(expr, layerSource) {
  const key = Array.isArray(expr) && Array.isArray(expr[2]) && expr[2][0] === 'get' ? expr[2][1]
    : (Array.isArray(expr) && Array.isArray(expr[1]) && expr[1][0] === 'get' ? expr[1][1] : null);
  if (!key) return null;
  const flat = unflatten(key);
  const candidates = [...(layerSource?.include_fields || []), ...((layerSource?.metrics || []).map(m => m.field))];
  return candidates.find(f => f && (f.replace(/\./g, '_') === flat || flat.startsWith(f.replace(/\./g, '_') + '_'))) || null;
}

// ---------------------------------------------------------------- 1. Agrégations des contributeurs
contributors.forEach(c => {
  const where = `contributeur ${c.identifier}`;
  (c.aggregationmodels || []).forEach(agg => {
    if ((agg.type === 'histogram' || agg.type === 'datehistogram') && agg.interval && c.numberOfBuckets !== undefined && c.type !== 'detailedhistogram') {
      WARN('AGG-1', where, `"interval" et "numberOfBuckets" sont tous deux définis : le Builder ne garde que numberOfBuckets (import en mode BUCKET). Gardez un seul des deux.`);
    }
    if (agg.type === 'histogram' && agg.interval && fields[agg.field]?.min !== undefined) {
      const n = (fields[agg.field].max - fields[agg.field].min) / agg.interval.value;
      if (n < 5) WARN('AGG-2', where, `intervalle ${agg.interval.value} sur [${fields[agg.field].min} ; ${fields[agg.field].max}] : ${n.toFixed(1)} classes seulement (viser 10 à 50).`);
      if (n > 100) WARN('AGG-2', where, `intervalle ${agg.interval.value} : ${Math.round(n)} classes (viser 10 à 50).`);
    }
    if (agg.type === 'datehistogram' && agg.interval && profile?.temporal?.durationSeconds) {
      const unit = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 }[agg.interval.unit];
      if (unit) {
        const n = profile.temporal.durationSeconds / (agg.interval.value * unit);
        if (n < 10 || n > 200) WARN('AGG-3', where, `pas ${agg.interval.value} ${agg.interval.unit} sur ${(profile.temporal.durationSeconds / 3600).toFixed(0)} h : ${Math.round(n)} barres (viser 50 à 100).`);
      }
    }
    if (agg.type === 'term' && fields[agg.field]?.cardinality !== undefined && agg.size < fields[agg.field].cardinality) {
      TIP('AGG-4', where, `top ${agg.size} sur ${fields[agg.field].cardinality} valeurs de ${agg.field} : ${fields[agg.field].cardinality - agg.size} valeur(s) non représentée(s). À assumer explicitement (titre « top N »).`);
    }
    (agg.metrics || []).forEach(m => checkMetric(m.collect_fct || m.metric, m.collect_field || m.field, where));
  });
  (c.metrics || []).forEach(m => checkMetric(m.metric, m.field, where));
  (c.configuration || []).forEach(conf => (conf.metrics || []).forEach(m => {
    checkMetric(m.metric, m.field, where);
    if (m.field && /_(s|ms|m)$/.test(m.field) && ['sum', 'avg', 'max', 'min'].includes(m.metric)) {
      WARN('UNIT-1', where, `${m.metric}(${m.field}) est affiché en unité brute (${m.field.split('_').pop()}) : un tableau de métriques n'a ni conversion ni unité. Préférez un indicateur "metric" avec "function" et "afterValue".`);
    }
  }));
  if (c.type === 'metric' && c.function) {
    const used = [...c.function.matchAll(/m\[(\d+)\]/g)].map(x => +x[1]);
    used.filter(i => i >= (c.metrics || []).length).forEach(i => ERR('MET-1', where, `"function" utilise m[${i}] alors que seules ${(c.metrics || []).length} métriques sont déclarées.`));
    if (/\/\s*m\[\d+\]/.test(c.function) && !/m\[\d+\]\s*(>|!==?)\s*0\s*\?/.test(c.function)) TIP('MET-2', where, `division par une métrique dans "${c.function}" : la valeur est infinie ou NaN si le filtre courant ne retient aucun document.`);
  }
  if (c.type === 'swimlane') {
    (c.swimlanes || []).forEach(s => (s.aggregationmodels || []).filter(a => a.type === 'term').forEach(a => {
      if (a.size > 10) WARN('SWIM-1', where, `${a.size} couloirs : au-delà de 10 le swimlane devient illisible.`);
      if (fields[a.field]?.cardinality !== undefined && a.size < fields[a.field].cardinality) {
        TIP('AGG-4', where, `swimlane limité aux ${a.size} premières valeurs sur ${fields[a.field].cardinality} de ${a.field} : ${fields[a.field].cardinality - a.size} valeur(s) non représentée(s).`);
      }
    }));
  }
});

function checkMetric(metric, field, where) {
  if (!field) return;
  if (!fields[field]) {
    if (profile) WARN('FLD-1', where, `le champ ${field} est absent du profil : vérifiez qu'il existe dans la collection.`);
    return;
  }
  if (metric === 'sum' && nature(field) === 'RELATIVE_RATIO') {
    ERR('SEM-11', where, `sum(${field}) : on n'additionne pas un ratio (vitesse, taux, proportion). Utilisez avg, ou un ratio de sommes.`);
  }
  if (metric === 'avg' && nature(field) === 'ABSOLUTE_STOCK') {
    const f = fields[field];
    if (f.p50 !== undefined && f.avg > 2 * f.p50) {
      WARN('SEM-12', where, `avg(${field}) sur une distribution très asymétrique (moyenne ${f.avg} ≈ ${(f.avg / f.p50).toFixed(1)} × médiane) : la moyenne est tirée par quelques valeurs extrêmes. Préférez sum, ou signalez-le.`);
    }
  }
  if (fields[field].max === 0 && fields[field].min === 0) {
    ERR('FLD-2', where, `${field} vaut toujours 0 dans la collection : la métrique n'apporte aucune information.`);
  }
}

// ---------------------------------------------------------------- 2. Panneau analytics
const seen = new Map();
groups.forEach(g => {
  (g.components || []).forEach(comp => {
    const key = comp.componentType + ':' + comp.contributorId;
    if (seen.has(key)) WARN('DUP-1', `groupe ${g.groupId}`, `widget ${comp.componentType} "${comp.contributorId}" déjà présent dans le groupe ${seen.get(key)} : redondance.`);
    seen.set(key, g.groupId);
    const c = byId.get(comp.contributorId);
    if (comp.componentType === 'donut' && c) {
      const size = c.aggregationmodels?.[0]?.size;
      if (size > 7) ERR('SEM-10', `groupe ${g.groupId}`, `donut sur ${size} modalités (> 7) : utilisez des powerbars.`);
    }
    if (comp.componentType === 'histogram' && c) {
      const f = c.aggregationmodels?.[0]?.field;
      if (fields[f]?.unit !== undefined && comp.input?.xUnit !== undefined && fields[f].unit !== comp.input.xUnit) {
        TIP('UNIT-2', `groupe ${g.groupId}`, `unité affichée "${comp.input.xUnit}" différente de l'unité du champ ${f} ("${fields[f].unit}").`);
      }
    }
  });
});

// DUP-2 : deux listes de résultats sur la même collection dont les colonnes de l'une sont incluses dans l'autre
const listUsages = [
  ...(web.components?.resultlists || []).map(r => ({ where: 'components.resultlists', id: r.contributorId })),
  ...groups.flatMap(g => (g.components || []).filter(x => x.componentType === 'resultlist').map(x => ({ where: `groupe ${g.groupId}`, id: x.contributorId })))
].map(u => ({ ...u, c: byId.get(u.id) })).filter(u => u.c);
for (let i = 0; i < listUsages.length; i++) for (let j = i + 1; j < listUsages.length; j++) {
  const a = listUsages[i], b = listUsages[j];
  if (a.c.collection !== b.c.collection) continue;
  const ca = new Set((a.c.columns || []).map(x => x.fieldName)), cb = new Set((b.c.columns || []).map(x => x.fieldName));
  const aInB = [...ca].every(f => cb.has(f)), bInA = [...cb].every(f => ca.has(f));
  if (aInB || bInA) {
    WARN('DUP-2', `${a.where} / ${b.where}`, `les listes "${a.id}" et "${b.id}" affichent les mêmes documents de ${a.c.collection} et les colonnes de l'une sont incluses dans l'autre : redondance (requête et affichage en double). Gardez une seule liste, de préférence dans components.resultlists.`);
  }
}

// ---------------------------------------------------------------- 3. Carte
const mapContrib = contributors.find(c => c.type === 'map');
const sourceById = new Map((mapContrib?.layers_sources || []).map(ls => [ls.source, ls]));
const layers = mapConfig.layers || [];
const mainLayers = layers.filter(l => !/^arlas-(hover|select)-/.test(l.id));
const sets = web.components?.mapgl?.input?.visualisations_sets || [];
const keysToColors = new Map((web.colorGenerator?.keysToColors || []).map(([k, v]) => [k, v.toLowerCase()]));

mainLayers.forEach(l => {
  const ls = sourceById.get(l.source);
  const where = `couche ${l.id}`;
  Object.entries(l.paint || {}).forEach(([prop, expr]) => {
    if (!Array.isArray(expr)) return;
    const field = fieldFromGet(expr, ls);
    if (expr[0] === 'interpolate' && prop.endsWith('-color')) {
      const stops = expr.slice(3).filter((v, i) => i % 2 === 0);
      if (stops.some((v, i) => i > 0 && v <= stops[i - 1])) ERR('MAP-1', where, `${prop} : arrêts d'interpolation non croissants (${stops.join(', ')}).`);
      const lum = colorsOf(expr).map(luminance).filter(v => v !== null);
      const increasing = lum.every((v, i) => i === 0 || v >= lum[i - 1]);
      const decreasing = lum.every((v, i) => i === 0 || v <= lum[i - 1]);
      if (lum.length > 2 && !increasing && !decreasing) WARN('SEM-07', where, `${prop} : luminance non monotone (palette de type arc-en-ciel) sur une variable ordonnée.`);
      if (field && fields[field]?.min !== undefined) {
        if (stops[0] > fields[field].max || stops[stops.length - 1] < fields[field].min) {
          ERR('MAP-2', where, `${prop} : les arrêts [${stops[0]} ; ${stops[stops.length - 1]}] sont hors de la plage réelle de ${field} [${fields[field].min} ; ${fields[field].max}] : couleur uniforme.`);
        }
      }
      if (field && nature(field) === 'NOMINAL') WARN('SEM-06', where, `${prop} : dégradé sur une variable nominale (${field}).`);
      if (l.type === 'fill' && field && nature(field) === 'ABSOLUTE_STOCK' && ls?.source?.startsWith('feature-')) {
        ERR('SEM-01', where, `aplat de couleur sur le stock brut ${field} : normalisez (densité, taux) ou utilisez des symboles proportionnels.`);
      }
    }
    if (expr[0] === 'match' && prop.endsWith('-color')) {
      const pairs = expr.slice(2, -1);
      if (pairs.length / 2 > 7) ERR('SEM-05', where, `${prop} : ${pairs.length / 2} couleurs qualitatives (> 7).`);
      for (let i = 0; i < pairs.length; i += 2) {
        const expected = keysToColors.get(String(pairs[i]));
        if (expected && expected !== String(pairs[i + 1]).toLowerCase()) {
          WARN('COL-2', where, `"${pairs[i]}" vaut ${pairs[i + 1]} sur la carte mais ${expected} dans colorGenerator.keysToColors : la légende des widgets différera de la carte.`);
        }
      }
      const cols = colorsOf(expr);
      for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) {
        if (deltaE(cols[i], cols[j]) < 15) WARN('COL-3', where, `${prop} : ${cols[i]} et ${cols[j]} sont presque indiscernables (ΔE ${deltaE(cols[i], cols[j]).toFixed(0)}).`);
      }
    }
  });
  if (!sets.some(s => (s.layers || []).includes(l.id))) WARN('MAP-3', where, `couche absente de tout visualisations_sets : elle ne sera jamais affichée.`);
});

// Couleurs visibles en même temps (jeux activés par défaut)
const enabledLayerIds = new Set(sets.filter(s => s.enabled).flatMap(s => s.layers || []));
const visible = mainLayers.filter(l => enabledLayerIds.has(l.id))
  .map(l => ({ id: l.id, colors: Object.entries(l.paint || {}).filter(([p]) => p.endsWith('-color') && !p.includes('stroke')).flatMap(([, e]) => colorsOf(e)) }));
for (let i = 0; i < visible.length; i++) for (let j = i + 1; j < visible.length; j++) {
  visible[i].colors.forEach(a => visible[j].colors.forEach(b => {
    if (deltaE(a, b) < 20) WARN('COL-1', `couches ${visible[i].id} / ${visible[j].id}`, `${a} et ${b} (ΔE ${deltaE(a, b).toFixed(0)}) sont affichées en même temps et se confondent : distinguez les couches par une teinte neutre ou un autre signe.`);
  }));
}
sets.filter(s => s.enabled).forEach(s => {
  const thematic = (s.layers || []).filter(id => {
    const l = mainLayers.find(x => x.id === id);
    return l && Object.values(l.paint || {}).some(e => Array.isArray(e) && ['match', 'interpolate'].includes(e[0]));
  });
  if (thematic.length > 2) WARN('SEM-15', `jeu « ${s.name} »`, `${thematic.length} couches thématiques visibles ensemble (> 2).`);
});

// ---------------------------------------------------------------- 4. Couverture du profil
if (profile) {
  const used = new Set(JSON.stringify(config).match(/"[a-zA-Z0-9_.]+"/g).map(s => s.slice(1, -1)));
  Object.entries(fields).forEach(([f, meta]) => {
    if (!used.has(f) && !meta.note && ['RELATIVE_RATIO', 'ABSOLUTE_STOCK', 'NOMINAL'].includes(meta.nature)) {
      TIP('COV-1', 'profil', `le champ ${f} (${meta.nature}) n'est exploité par aucune analyse.`);
    }
  });
}

// ---------------------------------------------------------------- 5. Cohérence titres ↔ données affichées
// Le titre visible doit annoncer exactement ce qui est affiché : variables (libellés du profil), agrégation, troncature.
const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const labelsOf = f => (fields[f]?.labels || profile?.geometries?.[f]?.labels || []).map(norm);
const docLabels = (profile?.documentLabels || []).map(norm);
const mentions = (text, f) => labelsOf(f).some(l => norm(text).includes(l));
const AGG_WORDS = {
  avg: ['moyen', 'moyenne'], max: ['max', 'maximum', 'maximal', 'pointe'], min: ['min', 'minimum', 'minimal'],
  sum: ['total', 'somme', 'cumul', 'effectif'], cardinality: ['distinct', 'different', 'nombre de']
};
function describeComponent(comp) {
  const c = byId.get(comp.contributorId);
  if (!c) return null;
  const used = []; // { field, metric }
  if (comp.componentType === 'metric') (c.metrics || []).forEach(m => used.push({ field: m.field, metric: m.metric }));
  if (comp.componentType === 'metricstable') (c.configuration || []).forEach(conf => {
    used.push({ field: conf.termfield, metric: 'term' });
    (conf.metrics || []).forEach(m => used.push({ field: m.field, metric: m.metric }));
  });
  if (['histogram', 'powerbars', 'donut'].includes(comp.componentType)) (c.aggregationmodels || []).forEach(a => used.push({ field: a.field, metric: a.type, size: a.size }));
  if (comp.componentType === 'swimlane') (c.swimlanes || []).forEach(sl => (sl.aggregationmodels || []).forEach(a => used.push({ field: a.field, metric: a.type, size: a.size })));
  const derived = comp.componentType === 'metric' && (c.metrics || []).length > 1;
  const own = comp.input?.chartTitle || comp.input?.powerbarTitle || (comp.componentType === 'donut' ? c.name : '') || '';
  return { c, used, derived, own };
}
if (profile) {
  groups.forEach(g => {
    const descs = (g.components || []).map(comp => ({ comp, d: describeComponent(comp) })).filter(x => x.d);
    const groupFields = new Set(descs.flatMap(x => x.d.used.map(u => u.field)).filter(Boolean));
    descs.forEach(({ comp, d }) => {
      const text = `${g.title || ''} ${d.own}`;
      const where = `groupe ${g.groupId} (${comp.componentType})`;
      // TITLE-1 : chaque variable affichée est nommée dans le titre
      d.used.forEach(u => {
        if (u.field === null || u.field === '' || u.field === undefined) {
          if (u.metric === 'count' && docLabels.length && !docLabels.some(l => norm(text).includes(l)) && !norm(text).includes('nombre')) {
            WARN('TITLE-1', where, `le titre « ${text.trim()} » ne dit pas qu'il compte des ${docLabels[0]}.`);
          }
          return;
        }
        if (labelsOf(u.field).length && !mentions(text, u.field)) {
          WARN('TITLE-1', where, `${u.metric} de ${u.field} est affiché mais le titre « ${text.trim()} » ne le nomme pas (attendu : ${labelsOf(u.field).join(' / ')}).`);
        }
      });
      // TITLE-3 / TITLE-4 : agrégation annoncée ↔ agrégation calculée (indicateurs simples et tableaux)
      if (!d.derived && ['metric', 'metricstable'].includes(comp.componentType)) {
        const metrics = new Set(d.used.map(u => u.metric));
        Object.entries(AGG_WORDS).forEach(([m, words]) => {
          const said = words.some(wd => norm(text).includes(wd));
          if (said && !metrics.has(m) && !(m === 'cardinality' && metrics.has('count'))) {
            WARN('TITLE-3', where, `le titre annonce « ${words.find(wd => norm(text).includes(wd))} » mais aucune métrique ${m} n'est calculée.`);
          }
          if (!said && metrics.has(m)) {
            WARN('TITLE-4', where, `une métrique ${m} est affichée mais le titre « ${text.trim()} » ne l'annonce pas (${words.join(', ')}).`);
          }
        });
      }
      // TITLE-5 : troncature top N annoncée
      d.used.filter(u => u.metric === 'term' && u.size && fields[u.field]?.cardinality > u.size).forEach(u => {
        if (!new RegExp(`\\b${u.size}\\b|top|premier`).test(norm(text))) {
          WARN('TITLE-5', where, `seules ${u.size} valeurs sur ${fields[u.field].cardinality} de ${u.field} sont affichées : le titre doit l'annoncer (« ${u.size} premiers… », « top ${u.size} »).`);
        }
      });
    });
    // TITLE-2 : le titre du groupe ne promet pas une variable qu'aucun widget du groupe n'affiche
    if (descs.length && !descs.some(x => x.d.derived)) {
      const usedLabels = new Set([...groupFields].flatMap(labelsOf));
      // masque d'abord les expressions des champs affichés (« type de navire », « distance parcourue »…)
      let rest = norm(g.title);
      [...usedLabels].sort((x, y) => y.length - x.length).forEach(l => { rest = rest.split(l).join(' '); });
      Object.keys(fields).filter(f => !groupFields.has(f)).forEach(f => {
        labelsOf(f).filter(l => !usedLabels.has(l) && rest.includes(l)).forEach(l => {
          WARN('TITLE-2', `groupe ${g.groupId}`, `le titre « ${g.title} » annonce « ${l} » (${f}) mais aucun widget du groupe n'affiche ce champ.`);
        });
      });
    }
  });
  // TITLE-6 : jeux de visualisation de la carte
  sets.forEach(s => (s.layers || []).forEach(id => {
    const l = mainLayers.find(x => x.id === id);
    if (!l) return;
    const ls = sourceById.get(l.source);
    const text = `${s.name} ${ls?.name || ''}`;
    const used = new Set([ls?.returned_geometry, ls?.agg_geo_field].filter(Boolean));
    Object.values(l.paint || {}).forEach(e => { const f = fieldFromGet(e, ls); if (f) used.add(f); });
    used.forEach(f => {
      if (labelsOf(f).length && !mentions(text, f)) WARN('TITLE-6', `jeu « ${s.name} »`, `la couche ${l.id} représente ${f} mais ni le jeu ni la couche ne le nomment (attendu : ${labelsOf(f).join(' / ')}).`);
    });
  }));
}

// TITLE-7 : titres courts et évocateurs (cible ≈ 55 caractères)
const TITLE_MAX = 60;
const checkLength = (text, where) => {
  if (text && text.length > TITLE_MAX) WARN('TITLE-7', where, `titre de ${text.length} caractères (cible ≈ 55, maximum ${TITLE_MAX}) : « ${text} ». Raccourcissez en gardant la variable, l'agrégation et le périmètre.`);
};
groups.forEach(g => {
  checkLength(g.title, `groupe ${g.groupId}`);
  (g.components || []).forEach(x => checkLength(x.input?.chartTitle || x.input?.powerbarTitle, `groupe ${g.groupId} (${x.componentType})`));
});
sets.forEach(st => checkLength(st.name, `jeu « ${st.name} »`));
['timeline', 'detailedTimeline'].forEach(k => checkLength(web.components?.[k]?.input?.chartTitle, `composant ${k}`));

// ---------------------------------------------------------------- Rapport
const order = { ERREUR: 0, ALERTE: 1, CONSEIL: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.code.localeCompare(b.code));
console.log('================================================================');
console.log('        CRITIQUE ANALYTIQUE DE LA CONFIGURATION ARLAS WUI        ');
console.log('================================================================');
console.log(`Config  : ${path.basename(configPath)}   Carte : ${path.basename(mapPath)}   Profil : ${profilePath ? path.basename(profilePath) : '(aucun)'}\n`);
if (findings.length === 0) {
  console.log('  Aucune incohérence détectée.');
} else {
  findings.forEach(f => console.log(`  [${f.severity}] ${f.code} — ${f.where} : ${f.message}`));
}
const count = s => findings.filter(f => f.severity === s).length;
console.log(`\n  Bilan : ${count('ERREUR')} erreur(s), ${count('ALERTE')} alerte(s), ${count('CONSEIL')} conseil(s).`);
console.log('================================================================');
process.exit(count('ERREUR') > 0 ? 1 : 0);
