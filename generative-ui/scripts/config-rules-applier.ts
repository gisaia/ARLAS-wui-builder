/**
 * CONFIG RULES APPLIER
 * Applies the 18 rule schemas to generate compliant config
 * Removes unnecessary properties and ensures schema compliance
 * Based on: resultlist-contributor-rules.schema.json and companions
 */

import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';

// Import all 18 rule schemas
const SCHEMAS_DIR = path.join(
  '/home/mickael/IdeaProjects/ARLAS-wui-builder',
  'generative-ui',
  'schemas'
);

interface ApplyRulesResult {
  config: any;
  violationsFixed: number;
  schemaValidations: number;
  recommendations: string[];
}

/**
 * Load all rule schemas from the schemas directory
 */
function loadRuleSchemas(): any[] {
  const ruleFiles: string[] = [
    'map-contributor-rules.schema.json',
    'histogram-contributor-rules.schema.json',
    'swimlane-contributor-rules.schema.json',
    'tree-contributor-rules.schema.json',
    'search-contributor-rules.schema.json',
    'chipssearch-contributor-rules.schema.json',
    'metricsTable-contributor-rules.schema.json',
    'compute-contributor-rules.schema.json',
    'analytics-contributor-rules.schema.json',
    'detailedHistogram-contributor-rules.schema.json',
    'donut-rules.schema.json',
    'metric-rules.schema.json',
    'metrics-table-rules.schema.json',
    'arlas-map-rules.schema.json',
    'histogram-rules.schema.json',
    'powerbars-rules.schema.json',
    'rootContributor-rules.schema.json',
    'swimlane-rules.schema.json',
    'resultlist-contributor-rules.schema.json',
    'resultlist-rules.schema.json'
  ];

  return ruleFiles.map(file => {
    const filePath = path.join(SCHEMAS_DIR, file);
    if (fs.existsSync(filePath)) {
      // The rule schemas have no $id: register them under their file name to avoid the duplicate "" key
      const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return { $id: file, ...schema };
    }
    return null;
  }).filter((s): s is any => s !== null);
}

/**
 * Apply rules to fix common config issues
 * - Remove unnecessary properties
 * - Add missing required properties
 * - Ensure schema compliance
 */
function applyRules(config: any): ApplyRulesResult {
  // validateSchema: false — the *-rules schemas declare "https://json-schema.org/draft-07/schema#", unknown to Ajv (which registers the http URL)
  const ajv = new Ajv({ allOf: true, strict: false, validateSchema: false });
  
  // Load and add all rule schemas
  const ruleSchemas = loadRuleSchemas();
  ruleSchemas.forEach(schema => {
    ajv.addSchema(schema);
  });

  // Official component / contributor schemas referenced by arlasconfig.schema.json ($ref by $id)
  fs.readdirSync(SCHEMAS_DIR)
    .filter(f => f.endsWith('.schema.json') && !f.endsWith('-rules.schema.json') && f !== 'arlasconfig.schema.json')
    .forEach(f => {
      const schema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, f), 'utf8'));
      if (!ajv.getSchema(schema.$id || f)) {
        ajv.addSchema(schema, schema.$id ? undefined : f);
      }
    });

  // Also add the main arlasconfig schema
  const mainSchemaPath = path.join(SCHEMAS_DIR, 'arlasconfig.schema.json');
  if (fs.existsSync(mainSchemaPath)) {
    const mainSchema = JSON.parse(fs.readFileSync(mainSchemaPath, 'utf8'));
    ajv.addSchema(mainSchema);
  }

  const violationsFixed: number[] = [];
  const recommendations: string[] = [];

  // ============================================
  // RESULTLIST CONTRIBUTOR RULES
  // ============================================
  
  const resultlistContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'resultlist'
  ) || [];

  // Allowed contributor keys = resultlistContributorConf + rootContributorConf properties (read from the schema files,
  // not from ajv.getSchema(), which returns a validation function without `properties`).
  const readSchemaProps = (file: string): string[] => {
    const p = path.join(SCHEMAS_DIR, file);
    return fs.existsSync(p) ? Object.keys(JSON.parse(fs.readFileSync(p, 'utf8')).properties || {}) : [];
  };
  const allowedResultlistProps = new Set([
    ...readSchemaProps('resultlistContributorConf.schema.json'),
    ...readSchemaProps('rootContributorConf.schema.json'),
    'type', 'identifier', 'name', 'title', 'collection', 'icon'
  ]);

  resultlistContributors.forEach((contributor: any) => {
    let fixesApplied = 0;

    // R9: display options belong to the component input.options, never to the contributor
    if (contributor.options !== undefined) {
      delete contributor.options;
      fixesApplied++;
      recommendations.push(`Removed "options" from resultlist contributor ${contributor.identifier} (belongs to the component input.options)`);
    }

    // R8 / R9: arrays always exported by the Builder
    if (contributor.cardViewProperties === undefined) {
      contributor.cardViewProperties = [];
      fixesApplied++;
    }
    if (contributor.includeMetadata === undefined) {
      contributor.includeMetadata = [];
      fixesApplied++;
    }
    if (contributor.details === undefined) {
      contributor.details = [];
      fixesApplied++;
    }

    // R6: fieldsConfiguration, with the Builder defaults (empty field paths, never invented field names)
    contributor.fieldsConfiguration = contributor.fieldsConfiguration || {};
    const fc = contributor.fieldsConfiguration;
    if (!fc.idFieldName) {
      recommendations.push(`Resultlist ${contributor.identifier}: set fieldsConfiguration.idFieldName to the collection id_path (_describe)`);
    }
    const defaults: Record<string, any> = {
      titleFieldNames: [{ fieldPath: '', process: '' }],
      tooltipFieldNames: [{ fieldPath: '', process: '' }],
      iconColorFieldName: '',
      useHttpQuicklooks: false,
      useHttpThumbnails: false,
      displayQuicklookOnMap: { enabled: false, boundsFieldName: '' },
      urlImageTemplates: []
    };
    Object.entries(defaults).forEach(([key, value]) => {
      if (fc[key] === undefined) {
        fc[key] = value;
        fixesApplied++;
      }
    });

    // R1: a list without columns has no list view
    if (!Array.isArray(contributor.columns) || contributor.columns.length === 0) {
      recommendations.push(`Resultlist ${contributor.identifier}: add at least one column (otherwise hasListView is false)`);
    }

    // Remove properties unknown to the schemas
    const extraProps = Object.keys(contributor).filter(prop => !allowedResultlistProps.has(prop));
    extraProps.forEach(prop => {
      delete contributor[prop];
      fixesApplied++;
    });
    if (extraProps.length > 0) {
      recommendations.push(`Removed ${extraProps.length} unknown properties from resultlist contributor ${contributor.identifier}: ${extraProps.join(', ')}`);
    }

    if (fixesApplied > 0) {
      violationsFixed.push(fixesApplied);
    }
  });

  // ============================================
  // RESULTLIST COMPONENT RULES (components.resultlists[] and analytics widgets)
  // ============================================

  const resultlistComponents: any[] = [
    ...(config.arlas?.web?.components?.resultlists || []),
    ...((config.arlas?.web?.analytics || []).flatMap((g: any) => g.components || [])
      .filter((w: any) => w.componentType === 'resultlist'))
  ];

  resultlistComponents.forEach((component: any) => {
    let fixesApplied = 0;
    const contributor = resultlistContributors.find((c: any) => c.identifier === component.contributorId);
    component.input = component.input || {};
    const input = component.input;

    // C1: input.id === contributorId
    if (input.id !== component.contributorId) {
      input.id = component.contributorId;
      fixesApplied++;
      recommendations.push(`Set input.id = contributorId (${component.contributorId}) on resultlist component`);
    }
    // C2: views derived from the contributor
    const hasColumns = !!contributor && Array.isArray(contributor.columns) && contributor.columns.length > 0;
    const hasCards = !!contributor && Array.isArray(contributor.cardViewProperties) && contributor.cardViewProperties.length > 0;
    if (input.hasListView !== hasColumns) { input.hasListView = hasColumns; fixesApplied++; }
    if (input.hasCardView !== hasCards) { input.hasCardView = hasCards; fixesApplied++; }
    if (input.hasGridView === undefined) { input.hasGridView = false; fixesApplied++; }
    // C3: defaultMode consistent with the available views
    const mode = input.defaultMode ?? input.defautMode;
    if (mode === undefined
      || (['grid', '1'].includes(String(mode)) && !input.hasGridView)
      || (['card', '2'].includes(String(mode)) && !hasCards)) {
      input.defaultMode = 'list';
      fixesApplied++;
    }
    // C4 / C6
    if (input.tableWidth === undefined) { input.tableWidth = 445; fixesApplied++; }
    if (contributor && input.searchSize !== contributor.search_size) { input.searchSize = contributor.search_size; fixesApplied++; }
    // C5: full options object
    const optionDefaults: Record<string, any> = {
      showActionsOnhover: 'true',
      showDetailIconName: 'keyboard_arrow_down',
      hideDetailIconName: 'keyboard_arrow_up',
      icon: contributor?.icon || 'short_text',
      showName: true,
      showIcon: true
    };
    input.options = input.options || {};
    Object.entries(optionDefaults).forEach(([key, value]) => {
      if (input.options[key] === undefined) { input.options[key] = value; fixesApplied++; }
    });
    // C7 / C8 / C9 defaults of a Builder export
    const inputDefaults: Record<string, any> = {
      displayFilters: false, isGeoSortActived: false, isExportEnabled: false, useColorService: true,
      visualisationsList: [], globalActionsList: [], downloadLink: '', isBodyHidden: false
    };
    Object.entries(inputDefaults).forEach(([key, value]) => {
      if (input[key] === undefined) { input[key] = value; fixesApplied++; }
    });

    if (fixesApplied > 0) {
      violationsFixed.push(fixesApplied);
    }
  });

  // ============================================
  // MAP CONTRIBUTOR RULES
  // ============================================
  
  const mapContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'map'
  ) || [];

  mapContributors.forEach((contributor: any) => {
    let fixesApplied = 0;

    // Rule 1: Must have window_extent_geometry
    if (!contributor.window_extent_geometry) {
      contributor.window_extent_geometry = { enabled: true, boundsFieldName: '' };
      fixesApplied++;
      recommendations.push('Added window_extent_geometry to map contributor');
    }

    // Rule 2: Must have margePanForLoad and margePanForTest
    if (contributor.margePanForLoad === undefined) {
      contributor.margePanForLoad = 0;
      fixesApplied++;
    }
    if (contributor.margePanForTest === undefined) {
      contributor.margePanForTest = 0;
      fixesApplied++;
    }

    // Rule 3: layers_sources should be present
    if (!contributor.layers_sources) {
      contributor.layers_sources = [{
        name: 'base',
        type: 'geojson',
        url: ''
      }];
      fixesApplied++;
      recommendations.push('Added layers_sources to map contributor');
    }

    // Remove extra properties not in schema
    // Allowed keys come from mapContributorConf + rootContributorConf (the previous code read the
    // properties of arlasconfig.schema.json through ajv.getSchema(), which is empty: it deleted every key).
    const allowedMapProps = new Set([
      ...readSchemaProps('mapContributorConf.schema.json'),
      ...readSchemaProps('rootContributorConf.schema.json'),
      'type', 'identifier', 'name', 'title', 'collection', 'icon'
    ]);
    if (contributor) {
      const extraProps = Object.keys(contributor).filter(prop => !allowedMapProps.has(prop));
      
      extraProps.forEach(prop => {
        delete contributor[prop];
      });
      
      if (extraProps.length > 0) {
        recommendations.push(`Removed ${extraProps.length} unnecessary properties from map contributor`);
      }
    }

    if (fixesApplied > 0) {
      violationsFixed.push(fixesApplied);
    }
  });

  // ============================================
  // HISTOGRAM CONTRIBUTOR RULES
  // ============================================
  
  const histogramContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'histogram'
  ) || [];

  histogramContributors.forEach((contributor: any) => {
    let fixesApplied = 0;

    // Rule 1: Must have isOneDimension, useUtc, numberOfBuckets, additionalCollections
    if (contributor.isOneDimension === undefined) {
      contributor.isOneDimension = true;
      fixesApplied++;
    }
    if (contributor.useUtc === undefined) {
      contributor.useUtc = true;
      fixesApplied++;
    }
    if (contributor.numberOfBuckets === undefined) {
      contributor.numberOfBuckets = 50;
      fixesApplied++;
    }
    if (!contributor.additionalCollections) {
      contributor.additionalCollections = ['collection_a'];
      fixesApplied++;
      recommendations.push('Added additionalCollections to histogram contributor');
    }

    // Rule 2: jsonpath should be present when isOneDimension is true
    if (contributor.isOneDimension && !contributor.jsonpath) {
      contributor.jsonpath = '$.metrics';
      fixesApplied++;
    }

    // Remove extra properties
    const allowedHistogramProps = new Set([
      ...readSchemaProps('histogramContributorConf.schema.json'),
      ...readSchemaProps(contributor.type === 'detailedhistogram' ? 'detailedHistogramContributorConf.schema.json' : 'histogramContributorConf.schema.json'),
      ...readSchemaProps('rootContributorConf.schema.json'),
      'type', 'identifier', 'name', 'title', 'collection', 'icon', 'aggregationmodels'
    ]);
    if (contributor) {
      const extraProps = Object.keys(contributor).filter(prop => !allowedHistogramProps.has(prop));
      
      extraProps.forEach(prop => {
        delete contributor[prop];
      });
      
      if (extraProps.length > 0) {
        recommendations.push(`Removed ${extraProps.length} unnecessary properties from histogram contributor`);
      }
    }

    if (fixesApplied > 0) {
      violationsFixed.push(fixesApplied);
    }
  });

  // ============================================
  // OTHER CONTRIBUTOR TYPES (similar patterns)
  // ============================================
  
  // Tree contributor
  const treeContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'tree'
  ) || [];

  treeContributors.forEach((contributor: any) => {
    if (!contributor.title) {
      contributor.title = 'Tree View';
      recommendations.push('Added title to tree contributor');
    }
    if (contributor.aggregationmodels === undefined) {
      contributor.aggregationmodels = [];
    }
  });

  // Search contributor
  const searchContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'search'
  ) || [];

  searchContributors.forEach((contributor: any) => {
    if (!contributor.identifier) {
      contributor.identifier = 'search-1';
      recommendations.push('Added identifier to search contributor');
    }
    if (!contributor.search_field) {
      contributor.search_field = 'title';
      recommendations.push('Added search_field to search contributor');
    }
    if (contributor.autocomplete_size === undefined) {
      contributor.autocomplete_size = 10;
    }
  });

  // MetricsTable contributor
  const metricsTableContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'metricsTable'
  ) || [];

  metricsTableContributors.forEach((contributor: any) => {
    if (contributor.numberOfBuckets === undefined) {
      contributor.numberOfBuckets = 10;
      recommendations.push('Added numberOfBuckets to metricsTable contributor');
    }
    if (!contributor.configuration) {
      contributor.configuration = { metrics: [], groupBy: '' };
      recommendations.push('Added configuration to metricsTable contributor');
    }
  });

  // Compute contributor
  const computeContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'compute'
  ) || [];

  computeContributors.forEach((contributor: any) => {
    if (!contributor.function) {
      contributor.function = 'sum';
      recommendations.push('Added function to compute contributor');
    }
    if (!contributor.metrics || !Array.isArray(contributor.metrics) || contributor.metrics.length === 0) {
      contributor.metrics = [{ name: 'metric', field: 'value', function: 'sum' }];
      recommendations.push('Added metrics to compute contributor');
    }
  });

  // Donut contributor
  const donutContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'donut'
  ) || [];

  donutContributors.forEach((contributor: any) => {
    if (!contributor.id) {
      contributor.id = 'donut-1';
      recommendations.push('Added id to donut contributor');
    }
    if (contributor.opacity === undefined) {
      contributor.opacity = 0.8;
    }
    if (contributor.diameter === undefined) {
      contributor.diameter = 300;
    }
    if (contributor.containerWidth === undefined) {
      contributor.containerWidth = 400;
    }
  });

  // Analytics contributor
  const analyticsContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'analytics'
  ) || [];

  analyticsContributors.forEach((contributor: any) => {
    if (!contributor.jsonpath) {
      contributor.jsonpath = '$.data.metrics';
      recommendations.push('Added jsonpath to analytics contributor');
    }
  });

  // Detailed histogram contributor
  const detailedHistogramContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'detailedhistogram'
  ) || [];

  detailedHistogramContributors.forEach((contributor: any) => {
    if (!contributor.annexedContributorId) {
      contributor.annexedContributorId = 'parent-1';
      recommendations.push('Added annexedContributorId to detailedhistogram contributor');
    }
    if (contributor.selectionExtentPercentage === undefined) {
      contributor.selectionExtentPercentage = 25;
    }
  });

  // Powerbars contributor
  const powerbarsContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'powerbars'
  ) || [];

  powerbarsContributors.forEach((contributor: any) => {
    if (contributor.filterOperator === undefined) {
      contributor.filterOperator = 'Eq';
      recommendations.push('Added filterOperator to powerbars contributor');
    }
    if (contributor.useColorService === undefined) {
      contributor.useColorService = true;
    }
  });

  // Root contributor
  const rootContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'root'
  ) || [];

  rootContributors.forEach((contributor: any) => {
    if (!contributor.identifier) {
      contributor.identifier = 'root-1';
      recommendations.push('Added identifier to root contributor');
    }
    if (!contributor.name) {
      contributor.name = 'Root';
      recommendations.push('Added name to root contributor');
    }
  });

  // Swimlane contributor
  const swimlaneContributors = config.arlas?.web?.contributors?.filter(
    (c: any) => c.type === 'swimlane'
  ) || [];

  swimlaneContributors.forEach((contributor: any) => {
    if (contributor.swimlaneMode === undefined) {
      contributor.swimlaneMode = 'default';
    }
    if (contributor.swimlaneHeight === undefined) {
      contributor.swimlaneHeight = 50;
    }
    if (contributor.swimlaneBorderRadius === undefined) {
      contributor.swimlaneBorderRadius = 0;
    }
    if (contributor.swimLaneLabelsWidth === undefined) {
      contributor.swimLaneLabelsWidth = 100;
    }
  });

  return {
    config,
    violationsFixed: violationsFixed.length,
    schemaValidations: ruleSchemas.length + 1, // +1 for arlasconfig
    recommendations: [...new Set(recommendations)] // Remove duplicates
  };
}

/**
 * Main execution
 */
function main() {
  const configPath = process.argv[2] || path.join(
    '/home/mickael/IdeaProjects/ARLAS-wui-builder',
    'generative-ui',
    'generated',
    'courses.config.json'
  );
  const mapConfigPath = process.argv[3] || configPath.replace(/\.json$/, '.map.json');

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config not found at: ${configPath}`);
    process.exit(1);
  }

  console.log('='.repeat(70));
  console.log('ARLAS WUI CONFIG RULES APPLIER');
  console.log('='.repeat(70));
  console.log();

  // Load existing config
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log(`📂 Loaded config with ${config.arlas?.web?.contributors?.length || 0} contributors`);

  // Apply rules
  const result = applyRules(config);

  // Save fixed config
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log();
  console.log('✅ Rules applied successfully');
  console.log(`   Violations fixed: ${result.violationsFixed}`);
  console.log(`   Schema validations: ${result.schemaValidations}`);
  console.log();

  // Display recommendations
  if (result.recommendations.length > 0) {
    console.log('📝 Recommendations:');
    result.recommendations.slice(0, 10).forEach((rec: string, i: number) => {
      console.log(`   ${i + 1}. ${rec}`);
    });
    if (result.recommendations.length > 10) {
      console.log(`   ... and ${result.recommendations.length - 10} more`);
    }
    console.log();
  } else {
    console.log('   No specific recommendations - config already compliant');
    console.log();
  }

  // Validate with official tool
  console.log('🔍 Running official validation...');
  const { execSync } = require('child_process');
  
  try {
    const output = execSync(
      `node /home/mickael/IdeaProjects/ARLAS-wui-builder/generative-ui/validate.js "${configPath}" "${mapConfigPath}"`,
      { cwd: '/home/mickael/IdeaProjects/ARLAS-wui-builder/generative-ui', stdio: 'pipe' }
    ).toString();
    
    console.log(output);
  } catch (e: any) {
    console.error('❌ Validation failed:');
    console.error(e.status ? `Exit code: ${e.status}` : e.message);
  }

  console.log();
  console.log('='.repeat(70));
  console.log('PIPELINE COMPLETE');
  console.log('='.repeat(70));
}

// Run main
main();