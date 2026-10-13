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
let structureErrors = 0;

contributors.forEach(c => {
  // A. Contrôle structurel de l'identifiant (Contributor ID Structure)
  if (!c.identifier || typeof c.identifier !== 'string' || c.identifier.trim().length === 0) {
    logFail(`Structure d'identifiant invalide pour le contributeur (${c.type || 'inconnu'}) : l'identifiant doit être une chaîne non vide.`);
    structureErrors++;
  } else if (/\s/.test(c.identifier)) {
    logFail(`Structure d'identifiant invalide pour "${c.identifier}" (${c.type}) : les espaces sont strictement interdits dans les identifiants de contributeurs.`);
    structureErrors++;
  } else if (!/^[a-zA-Z0-9_\-\.:]+$/.test(c.identifier)) {
    logFail(`Structure d'identifiant invalide pour "${c.identifier}" (${c.type}) : caractères spéciaux non autorisés (autorisés: alphanumérique, '-', '_', '.', ':').`);
    structureErrors++;
  } else {
    // Vérifications structurelles spécifiques par type
    if (c.type === 'swimlane' && c.collection && !c.identifier.includes(c.collection)) {
      logFail(`Structure d'identifiant non canonique pour la swimlane "${c.identifier}" : l'identifiant doit intégrer le nom de la collection ("${c.collection}").`);
      structureErrors++;
    }
  }

  // B. Détection des doublons
  if (contributorIds.has(c.identifier)) {
    logFail(`Duplication d'identifiant détectée : "${c.identifier}"`);
    duplicates++;
  } else {
    contributorIds.add(c.identifier);
  }

  // C. Présence d'une icône obligatoire pour le menu et l'interface
  if (!c.icon || typeof c.icon !== 'string' || c.icon.trim().length === 0) {
    logFail(`Contributeur "${c.identifier}" (${c.type}) : "icon" est obligatoire pour éviter l'erreur TypeError dans l'icon-picker.`);
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

if (duplicates === 0 && structureErrors === 0) {
  logPass(`Structure et unicité validées pour les ${contributors.length} identifiants de contributeurs.`);
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
  // Contrôle Anti-Crash Icon Picker : chaque groupe doit déclarer une icône et un titre valides
  if (!group.icon || typeof group.icon !== 'string' || group.icon.trim().length === 0) {
    logFail(`Groupe analytique "${group.title || group.groupId}" : "icon" est obligatoire pour éviter l'erreur config-icon-picker "Cannot read properties of undefined (reading 'length')".`);
  }
  if (!group.title || typeof group.title !== 'string' || group.title.trim().length === 0) {
    logFail(`Groupe analytique "${group.groupId}" : "title" est obligatoire.`);
  }

  (group.components || []).forEach(widget => {
    totalWidgets++;
    if (!contributorIds.has(widget.contributorId)) {
      logFail(`Widget "${widget.title || widget.componentType}" référence un contributeur inexistant: "${widget.contributorId}"`);
      missingWidgets++;
    }

    // Contrôle Anti-Crash Dimensions Graphiques (D3 / SVG) pour TOUS les types de widgets analytics :
    const input = widget.input || {};
    if (widget.componentType === 'histogram' || widget.componentType === 'swimlane') {
      if (!input.chartTitle || typeof input.chartTitle !== 'string' || input.chartTitle.trim().length === 0) {
        logFail(`Widget "${widget.title || widget.contributorId}" (${widget.componentType}) : "input.chartTitle" est obligatoire pour initialiser le titre du formulaire réactif.`);
      }
      if (!input.chartWidth || typeof input.chartWidth !== 'number' || isNaN(input.chartWidth) || input.chartWidth <= 0) {
        logFail(`Widget "${widget.title || widget.contributorId}" (${widget.componentType}) : "input.chartWidth" est obligatoire (> 0, ex: 445) pour éviter l'erreur SVG "<rect> attribute width: NaN".`);
      }
      if (input.barWeight === undefined || typeof input.barWeight !== 'number' || isNaN(input.barWeight) || input.barWeight <= 0) {
        logFail(`Widget "${widget.title || widget.contributorId}" (${widget.componentType}) : "input.barWeight" est obligatoire (> 0 et <= 1, ex: 0.8) pour éviter l'erreur SVG "<rect> attribute width: NaN".`);
      }
    } else if (widget.componentType === 'powerbars') {
      if (!input.chartWidth || typeof input.chartWidth !== 'number' || isNaN(input.chartWidth) || input.chartWidth <= 0) {
        logFail(`Widget "${widget.title || widget.contributorId}" (powerbars) : "input.chartWidth" est obligatoire (> 0, ex: 445 ou 217).`);
      }
    } else if (widget.componentType === 'donut') {
      if (!input.diameter || typeof input.diameter !== 'number' || isNaN(input.diameter) || input.diameter <= 0) {
        logFail(`Widget "${widget.title || widget.contributorId}" (donut) : "input.diameter" est obligatoire (> 0, ex: 170).`);
      }
      if (!input.containerWidth || typeof input.containerWidth !== 'number' || isNaN(input.containerWidth) || input.containerWidth <= 0) {
        logFail(`Widget "${widget.title || widget.contributorId}" (donut) : "input.containerWidth" est obligatoire (> 0, ex: 223).`);
      }
    } else if (widget.componentType === 'resultlist') {
      if (!input.options || typeof input.options.showName !== 'boolean' || typeof input.options.showIcon !== 'boolean') {
        logFail(`Widget "${widget.title || widget.contributorId}" (resultlist) : "input.options.showName" et "showIcon" sont obligatoires.`);
      }
    }
  });
});
if (missingWidgets === 0) {
  logPass(`Tous les ${totalWidgets} widgets du panneau analytics référencent des contributeurs valides.`);
}

// A.bis Composants Globaux (Timeline, DetailedTimeline, ResultLists)
const components = config?.arlas?.web?.components || {};
if (components.timeline?.contributorId) {
  if (!contributorIds.has(components.timeline.contributorId)) {
    logFail(`Composant timeline référence un contributeur inexistant: "${components.timeline.contributorId}"`);
  } else {
    logPass(`Composant timeline lié à un contributeur valide : "${components.timeline.contributorId}".`);
  }
}
if (components.detailedTimeline?.contributorId) {
  if (!contributorIds.has(components.detailedTimeline.contributorId)) {
    logFail(`Composant detailedTimeline référence un contributeur inexistant: "${components.detailedTimeline.contributorId}"`);
  } else {
    logPass(`Composant detailedTimeline lié à un contributeur valide : "${components.detailedTimeline.contributorId}".`);
  }
}

// Contrôles Anti-Crash Formulaires Réactifs Globaux (Tagger & Timeline DateFormat) :
if (config?.arlas?.tagger) {
  if (!config.arlas.tagger.collection || typeof config.arlas.tagger.collection !== 'string') {
    logFail(`Configuration tagger : "collection" est obligatoire lorsque tagger est défini pour que le formulaire SideModules soit valide.`);
  }
}
if (components.timeline?.input && !components.timeline.input.ticksDateFormat) {
  logFail(`Composant timeline : "input.ticksDateFormat" est obligatoire pour initialiser le format de date du formulaire.`);
}
if (components.detailedTimeline?.input && !components.detailedTimeline.input.ticksDateFormat) {
  logFail(`Composant detailedTimeline : "input.ticksDateFormat" est obligatoire pour initialiser le format de date du formulaire.`);
}
if (Array.isArray(components.resultlists)) {
  components.resultlists.forEach((rl, idx) => {
    if (rl.contributorId && !contributorIds.has(rl.contributorId)) {
      logFail(`Composant resultlists[${idx}] référence un contributeur inexistant: "${rl.contributorId}"`);
    }
  });
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
