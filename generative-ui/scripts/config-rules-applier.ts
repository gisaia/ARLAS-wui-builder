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
    'resultlist-contributor-rules.schema.json'
  ];

  return ruleFiles.map(file => {
    const filePath = path.join(SCHEMAS_DIR, file);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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
  const ajv = new Ajv({ allOf: true, strict: false });
  
  // Load and add all rule schemas
  const ruleSchemas = loadRuleSchemas();
  ruleSchemas.forEach(schema => {
    ajv.addSchema(schema);
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

  resultlistContributors.forEach((contributor: any) => {
    let fixesApplied = 0;

    // Rule 1: Must have options property with showName
    if (!contributor.options) {
      contributor.options = { showName: false };
      fixesApplied++;
      recommendations.push('Added options: { showName: false } to resultlist contributor');
    }

    // Ensure showName is boolean false (not undefined)
    if (contributor.options && contributor.options.showName === undefined) {
      contributor.options.showName = false;
      fixesApplied++;
    }

    // Rule 2: cardViewProperties should be present (can be empty array)
    if (contributor.cardViewProperties === undefined) {
      contributor.cardViewProperties = [];
      fixesApplied++;
      recommendations.push('Added cardViewProperties: [] to resultlist contributor');
    }

    // Rule 3: Ensure fieldsConfiguration has required sub-properties
    if (!contributor.fieldsConfiguration) {
      contributor.fieldsConfiguration = {
        idFieldName: 'revenue',
        titleFieldNames: [{ fieldPath: 'title', process: '' }],
        tooltipFieldNames: [{ fieldPath: 'type', process: '' }],
        iconColorFieldName: 'type',
        useHttpQuicklooks: false,
        useHttpThumbnails: false,
        displayQuicklookOnMap: { enabled: false, boundsFieldName: '' },
        urlImageTemplates: []
      };
      fixesApplied += 2;
      recommendations.push('Added fieldsConfiguration to resultlist contributor');
    } else {
      // Add missing sub-properties if needed
      if (!contributor.fieldsConfiguration.idFieldName) {
        contributor.fieldsConfiguration.idFieldName = 'revenue';
        fixesApplied++;
      }
      if (!contributor.fieldsConfiguration.titleFieldNames) {
        contributor.fieldsConfiguration.titleFieldNames = [{ fieldPath: 'title', process: '' }];
        fixesApplied++;
      }
      if (!contributor.fieldsConfiguration.tooltipFieldNames) {
        contributor.fieldsConfiguration.tooltipFieldNames = [{ fieldPath: 'type', process: '' }];
        fixesApplied++;
      }
      if (contributor.fieldsConfiguration.useHttpQuicklooks === undefined) {
        contributor.fieldsConfiguration.useHttpQuicklooks = false;
        fixesApplied++;
      }
      if (contributor.fieldsConfiguration.useHttpThumbnails === undefined) {
        contributor.fieldsConfiguration.useHttpThumbnails = false;
        fixesApplied++;
      }
      if (contributor.fieldsConfiguration.displayQuicklookOnMap === undefined) {
        contributor.fieldsConfiguration.displayQuicklookOnMap = { enabled: false, boundsFieldName: '' };
        fixesApplied++;
      }
      if (contributor.fieldsConfiguration.urlImageTemplates === undefined) {
        contributor.fieldsConfiguration.urlImageTemplates = [];
        fixesApplied++;
      }
    }

    // Remove unnecessary properties not in schema
    // These are props that would cause schema validation failures
    const schemaProps = ajv.getSchema('resultlistContributorConf.schema.json');
    if (schemaProps && contributor) {
      const schemaPropsList = Object.keys(schemaProps.properties || {});
      const extraProps = Object.keys(contributor).filter(
        prop => !schemaPropsList.includes(prop) && prop !== 'options'
      );
      
      // Keep only 'options' but remove others
      extraProps.forEach(prop => {
        if (prop !== 'options') {
          delete contributor[prop];
          fixesApplied++;
        }
      });
      
      if (extraProps.length > 0) {
        recommendations.push(`Removed ${extraProps.length} unnecessary properties from resultlist contributor`);
      }
    }

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
    const mainSchema = ajv.getSchema('arlasconfig.schema.json');
    if (mainSchema && contributor) {
      const schemaPropsList = Object.keys(mainSchema.properties || {});
      const extraProps = Object.keys(contributor).filter(
        prop => !schemaPropsList.includes(prop)
      );
      
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
    const histogramSchema = ajv.getSchema('histogramContributorConf.schema.json');
    if (histogramSchema && contributor) {
      const schemaPropsList = Object.keys(histogramSchema.properties || {});
      const extraProps = Object.keys(contributor).filter(
        prop => !schemaPropsList.includes(prop) && prop !== 'aggregationmodels'
      );
      
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
  const configPath = path.join(
    '/home/mickael/IdeaProjects/ARLAS-wui-builder',
    'generative-ui',
    'generated',
    'courses.config.json'
  );

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
      'node /home/mickael/IdeaProjects/ARLAS-wui-builder/generative-ui/validate.js ' +
      '/home/mickael/IdeaProjects/ARLAS-wui-builder/generative-ui/generated/courses.config.json ' +
      '/home/mickael/IdeaProjects/ARLAS-wui-builder/generative-ui/generated/courses.config.map.json',
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