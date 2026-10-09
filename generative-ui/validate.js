#!/usr/bin/env node

/**
 * Script de validation officiel pour la configuration ARLAS WUI (config.json et config.map.json).
 * 
 * Recommence et exécute la logique de validation de `ArlasStartupService.validateConfiguration()`
 * basée sur Ajv, les métamodèles JSON Schema draft-06 officiels (arlasconfig.schema.json,
 * contributeurs et composants graphiques) ainsi que les règles sémantiques et d'intégrité référentielle.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const ajvKeywords = require('ajv-keywords');

// Résolution des chemins de fichiers
const baseDir = __dirname;
const schemasDir = path.join(baseDir, 'schemas');

const configPath = process.argv[2] || (fs.existsSync(path.join(baseDir, 'config.json')) 
  ? path.join(baseDir, 'config.json') 
  : path.join(process.cwd(), 'config.json'));

const mapConfigPath = process.argv[3] || (fs.existsSync(path.join(baseDir, 'config.map.json')) 
  ? path.join(baseDir, 'config.map.json') 
  : path.join(process.cwd(), 'config.map.json'));

console.log('================================================================');
console.log('         VALIDATEUR OFFICIEL DE CONFIGURATION ARLAS WUI         ');
console.log('================================================================');
console.log(`Config cible      : ${configPath}`);
console.log(`Map config cible  : ${mapConfigPath}`);
console.log(`Répertoire schémas: ${schemasDir}\n`);

let hasErrors = false;

function logPass(msg) {
  console.log(`  [OK] ${msg}`);
}

function logFail(msg) {
  console.error(`  [FAIL] ${msg}`);
  hasErrors = true;
}

function logSection(title) {
  console.log(`\n--- ${title} ---`);
}

// 1. Contrôle Syntaxique
logSection('1. Validation Syntaxique (JSON strict)');
let config, mapConfig;
try {
  const rawConfig = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(rawConfig);
  logPass(`${path.basename(configPath)} : JSON syntaxiquement valide.`);
} catch (e) {
  logFail(`Erreur de syntaxe JSON dans ${configPath} : ${e.message}`);
}

try {
  const rawMapConfig = fs.readFileSync(mapConfigPath, 'utf8');
  mapConfig = JSON.parse(rawMapConfig);
  logPass(`${path.basename(mapConfigPath)} : JSON syntaxiquement valide.`);
} catch (e) {
  logFail(`Erreur de syntaxe JSON dans ${mapConfigPath} : ${e.message}`);
}

if (hasErrors) {
  console.error('\nÉchec de la validation syntaxique initiale.');
  process.exit(1);
}

// 2. Initialisation du moteur JSON Schema (Ajv)
logSection('2. Chargement des Métamodèles JSON Schema (Draft-06)');
const ajv = new Ajv({ allowUnionTypes: true, strict: false });
ajvKeywords(ajv, 'uniqueItemProperties');
const draft06 = require('ajv/lib/refs/json-schema-draft-06.json');
ajv.addMetaSchema(draft06);

const schemaList = [
  'rootContributorConf.schema.json',
  'mapContributorConf.schema.json',
  'histogramContributorConf.schema.json',
  'detailedHistogramContributorConf.schema.json',
  'swimlaneContributorConf.schema.json',
  'resultlistContributorConf.schema.json',
  'treeContributorConf.schema.json',
  'searchContributorConf.schema.json',
  'chipssearchContributorConf.schema.json',
  'metricsTableContributorConf.schema.json',
  'computeContributorConf.schema.json',
  'analyticsContributorConf.schema.json',
  'histogram.schema.json',
  'swimlane.schema.json',
  'powerbars.schema.json',
  'arlas-map.schema.json',
  'donut.schema.json',
  'metric.schema.json',
  'metrics-table.schema.json'
];

schemaList.forEach(file => {
  const sPath = path.join(schemasDir, file);
  if (fs.existsSync(sPath)) {
    const sContent = JSON.parse(fs.readFileSync(sPath, 'utf8'));
    ajv.addSchema(sContent);
  } else {
    logFail(`Schéma requis manquant : ${file}`);
  }
});
logPass(`${schemaList.length} sous-schémas enregistrés dans le compilateur Ajv.`);

// 3. Validation unitaire de chaque contributeur
logSection('3. Validation Spécifique des Contributeurs');
const contributors = config?.arlas?.web?.contributors || [];
const contributorIds = new Set();
let duplicates = 0;

contributors.forEach(c => {
  if (contributorIds.has(c.identifier)) {
    logFail(`Duplication d'identifiant détectée : "${c.identifier}"`);
    duplicates++;
  } else {
    contributorIds.add(c.identifier);
  }

  let schemaId = null;
  switch (c.type) {
    case 'map': schemaId = 'mapContributorConf.schema.json'; break;
    case 'histogram': schemaId = 'histogramContributorConf.schema.json'; break;
    case 'swimlane': schemaId = 'swimlaneContributorConf.schema.json'; break;
    case 'resultlist': schemaId = 'resultlistContributorConf.schema.json'; break;
    case 'tree': schemaId = 'treeContributorConf.schema.json'; break;
    case 'search': schemaId = 'searchContributorConf.schema.json'; break;
    case 'detailedhistogram': schemaId = 'detailedHistogramContributorConf.schema.json'; break;
    case 'metric': schemaId = 'computeContributorConf.schema.json'; break;
    case 'metricstable': schemaId = 'metricsTableContributorConf.schema.json'; break;
    case 'analytics': schemaId = 'analyticsContributorConf.schema.json'; break;
    case 'chipssearch':
      logFail(`Contributeur "${c.identifier}" utilise le type déprécié "chipssearch". Utilisez "search".`);
      break;
    default:
      logFail(`Type de contributeur non reconnu : "${c.type}" pour "${c.identifier}"`);
  }

  if (schemaId) {
    const valid = ajv.validate(schemaId, c);
    if (!valid) {
      logFail(`Contributeur "${c.identifier}" (${c.type}) non conforme : ${JSON.stringify(ajv.errors)}`);
    }
  }
});

if (duplicates === 0) {
  logPass(`Unicité validée pour les ${contributors.length} contributeurs.`);
}

// 4. Validation globale arlasconfig (comme ArlasStartupService.validateConfiguration)
logSection('4. Validation Globale du Tableau de Bord (arlasconfig.schema.json)');
const fullSchemaPath = path.join(schemasDir, 'arlasconfig.schema.json');
if (!fs.existsSync(fullSchemaPath)) {
  logFail(`Schéma racine introuvable : ${fullSchemaPath}`);
} else {
  const fullSchema = JSON.parse(fs.readFileSync(fullSchemaPath, 'utf8'));
  const validateFull = ajv.compile(fullSchema);

  // Reconstitution de la configuration complète (avec layers externalisées injectées)
  const fullConfigToValidate = JSON.parse(JSON.stringify(config));
  if (fullConfigToValidate?.arlas?.web?.components?.mapgl?.input?.mapLayers) {
    fullConfigToValidate.arlas.web.components.mapgl.input.mapLayers.layers = mapConfig.layers || [];
    fullConfigToValidate.arlas.web.components.mapgl.input.mapLayers.externalEventLayers = mapConfig['external-event-layers'] || [];
  }

  const isValidFull = validateFull(fullConfigToValidate);
  if (!isValidFull) {
    validateFull.errors.forEach(err => {
      logFail(`Erreur de schéma arlasconfig : ${err.instancePath || err.schemaPath} ${err.message}`);
    });
  } else {
    logPass('Configuration complète validée avec succès contre arlasconfig.schema.json.');
  }
}

// 5. Intégrité Référentielle et Dépendances
logSection('5. Intégrité Référentielle et Cohérence Inter-Composants');

// A. Widgets Analytics
const analyticsGroups = config?.arlas?.web?.analytics || [];
let totalWidgets = 0;
let missingWidgets = 0;

analyticsGroups.forEach(group => {
  (group.components || []).forEach(widget => {
    totalWidgets++;
    if (!contributorIds.has(widget.contributorId)) {
      logFail(`Widget "${widget.title || widget.componentType}" référence un contributeur inexistant: "${widget.contributorId}"`);
      missingWidgets++;
    }
  });
});
if (missingWidgets === 0) {
  logPass(`Tous les ${totalWidgets} widgets du panneau analytics référencent des contributeurs valides.`);
}

// B. Timeline Détaillée
const detailedTimeline = contributors.find(c => c.type === 'detailedhistogram');
if (detailedTimeline) {
  const parentId = detailedTimeline.annexedContributorId;
  const parent = contributors.find(c => c.identifier === parentId);
  if (!parent || parent.type !== 'histogram') {
    logFail(`detailedhistogram "${detailedTimeline.identifier}" pointe vers un annexedContributorId invalide : "${parentId}"`);
  } else {
    logPass(`detailedhistogram "${detailedTimeline.identifier}" est correctement lié à l'histogramme parent "${parentId}".`);
  }
}

// C. extraConfigs
const extraConfigs = config?.extraConfigs || [];
const mapConfigExtra = extraConfigs.find(e => e.configPath === 'config.map.json');
if (!mapConfigExtra) {
  logFail('La clé extraConfigs ne référence pas "config.map.json".');
} else {
  logPass('Délégation modulaire extraConfigs vers "config.map.json" vérifiée.');
}

// D. Map Layer Sources vs Config Map Layers
const mapContrib = contributors.find(c => c.type === 'map');
const mapLayers = mapConfig?.layers || [];
const mapLayerIds = new Set(mapLayers.map(l => l.id));

if (mapContrib) {
  const sources = mapContrib.layers_sources || [];
  let sourcesMissing = 0;
  sources.forEach(s => {
    if (!mapLayerIds.has(s.id)) {
      logFail(`La source de couche "${s.id}" déclarée dans le contributeur map est absente de config.map.json.`);
      sourcesMissing++;
    }
  });
  if (sourcesMissing === 0) {
    logPass(`Les ${sources.length} sources de couches cartographiques sont synchronisées avec config.map.json.`);
  }
}

// E. External Event Layers
const extLayers = mapConfig?.['external-event-layers'] || [];
let invalidExtEvents = 0;
extLayers.forEach(el => {
  if (!mapLayerIds.has(el.id)) {
    logFail(`external-event-layer "${el.id}" est introuvable dans layers.`);
    invalidExtEvents++;
  }
  if (!['hover', 'select'].includes(el.on)) {
    logFail(`external-event-layer "${el.id}" a un mode d'événement invalide : "${el.on}". Attendu: "hover" | "select"`);
    invalidExtEvents++;
  }
});
if (invalidExtEvents === 0) {
  logPass(`Les ${extLayers.length} couches d'événements externes sont valides et cohérentes.`);
}

// F. Options et Règles Prohibitives
const options = config?.arlas?.web?.options || {};
if ('zoom_to_data' in options) {
  logFail('La propriété "zoom_to_data" est obsolète/prohibée. Utilisez "zoom_to_strategy: centroid | bbox".');
} else if (options.zoom_to_strategy) {
  logPass(`Stratégie de zoom conforme : "${options.zoom_to_strategy}".`);
}

// 6. Conclusion
console.log('\n================================================================');
if (hasErrors) {
  console.error('  RÉSULTAT : ÉCHEC - Des erreurs ou incohérences ont été détectées.');
  console.log('================================================================\n');
  process.exit(1);
} else {
  console.log('  RÉSULTAT : SUCCÈS TOTAL - Configuration ARLAS WUI 100% conforme !');
  console.log('================================================================\n');
  process.exit(0);
}
