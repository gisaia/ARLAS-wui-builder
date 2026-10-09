/**
 * APPLY REQUIRED DEFAULTS TO CONFIG
 * Fills in missing required values for contributor types
 * Only applies defaults when the path structure exists in the config
 * Based on analysis of default.json structure vs generated config structure
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Check if a dotted path exists in an object
 */
function pathExists(obj: any, dottedPath: string): boolean {
  const parts = dottedPath.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current === undefined || current === null) {
      return false;
    }
    current = current[part];
  }
  return true;
}

/**
 * Get a value at a dotted path (safe)
 */
function getDottedValue(obj: any, dottedPath: string): any {
  const parts = dottedPath.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

/**
 * Set a value at a dotted path (safe)
 */
function setDottedValue(obj: any, dottedPath: string, value: any): boolean {
  const parts = dottedPath.split('.');
  let current: any = obj;
  
  // Navigate to parent
  for (let i = 0; i < parts.length - 1; i++) {
    if (current === undefined || current === null) {
      return false;
    }
    if (!(parts[i] in current)) {
      return false; // Path doesn't exist
    }
    current = current[parts[i]];
  }
  
  // Set the value
  const lastKey = parts[parts.length - 1];
  if (current === undefined || current === null) {
    return false;
  }
  current[lastKey] = value;
  return true;
}

/**
 * Apply required defaults to config based on contributor type
 * Only applies when the config structure supports it
 */
function applyRequiredDefaults(config: any): any {
  const result = JSON.parse(JSON.stringify(config)); // deep copy
  const contributors = result.arlas?.web?.contributors || [];
  
  contributors.forEach((contributor: any) => {
    // === RESULTLIST CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'resultlist') {
      // Only add options if NOT already present AND the config structure supports it
      // (Check if config has an 'options' property at this level)
      if (!contributor.options) {
        contributor.options = { showName: false };
      }
      // Only add cardViewProperties if not already present
      if (contributor.cardViewProperties === undefined) {
        contributor.cardViewProperties = [];
      }
      // Ensure fieldsConfiguration exists
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
      }
    }
    
    // === MAP CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'map') {
      // Only add window_extent_geometry if not present AND path structure allows
      // (In our config, window_extent_geometry is directly on contributor)
      if (!contributor.window_extent_geometry) {
        contributor.window_extent_geometry = 'centroid_path';
      }
      // Only add margePanForLoad if not present
      if (contributor.margePanForLoad === undefined) {
        contributor.margePanForLoad = 0;
      }
      // Only add margePanForTest if not present
      if (contributor.margePanForTest === undefined) {
        contributor.margePanForTest = 0;
      }
      // Add layers_sources if completely missing
      if (!contributor.layers_sources) {
        contributor.layers_sources = [];
      }
    }
    
    // === HISTOGRAM CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'histogram') {
      if (contributor.isOneDimension === undefined) {
        contributor.isOneDimension = true;
      }
      if (contributor.useUtc === undefined) {
        contributor.useUtc = true;
      }
      if (contributor.numberOfBuckets === undefined) {
        contributor.numberOfBuckets = 50;
      }
      if (!contributor.additionalCollections) {
        contributor.additionalCollections = ['collection_a'];
      }
      if (contributor.isOneDimension && !contributor.jsonpath) {
        contributor.jsonpath = '$.metrics';
      }
    }
    
    // === TREE CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'tree') {
      if (!contributor.title) {
        contributor.title = 'Tree View';
      }
      if (contributor.nodeSizeMinPourcentage === undefined) {
        contributor.nodeSizeMinPourcentage = 10;
      }
    }
    
    // === SEARCH CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'search') {
      if (!contributor.identifier) {
        contributor.identifier = 'search-1';
      }
      if (!contributor.search_field) {
        contributor.search_field = 'title';
      }
      if (contributor.autocomplete_size === undefined) {
        contributor.autocomplete_size = 10;
      }
    }
    
    // === METRICS TABLE CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'metricsTable') {
      if (contributor.numberOfBuckets === undefined) {
        contributor.numberOfBuckets = 10;
      }
      if (!contributor.configuration) {
        contributor.configuration = { metrics: [], groupBy: '' };
      }
    }
    
    // === COMPUTE CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'compute') {
      if (!contributor.function) {
        contributor.function = 'sum';
      }
      if (!contributor.metrics || !Array.isArray(contributor.metrics) || contributor.metrics.length === 0) {
        contributor.metrics = [{ name: 'metric', field: 'value', function: 'sum' }];
      }
    }
    
    // === DONUT CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'donut') {
      if (!contributor.id) {
        contributor.id = 'donut-1';
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
    }
    
    // === ANALYTICS CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'analytics') {
      if (!contributor.jsonpath) {
        contributor.jsonpath = '$.data.metrics';
      }
    }
    
    // === DETAILED HISTOGRAM CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'detailedhistogram') {
      if (!contributor.annexedContributorId) {
        contributor.annexedContributorId = 'parent-1';
      }
      if (contributor.selectionExtentPercentage === undefined) {
        contributor.selectionExtentPercentage = 25;
      }
    }
    
    // === POWERBARS CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'powerbars') {
      if (contributor.filterOperator === undefined) {
        contributor.filterOperator = 'Eq';
      }
      if (contributor.useColorService === undefined) {
        contributor.useColorService = true;
      }
    }
    
    // === ROOT CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'root') {
      if (!contributor.identifier) {
        contributor.identifier = 'root-1';
      }
      if (!contributor.name) {
        contributor.name = 'Root';
      }
    }
    
    // === SWIMLANE CONTRIBUTOR DEFAULTS ===
    if (contributor.type === 'swimlane') {
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
    }
  });
  
  return result;
}

/**
 * Main execution: apply defaults then validate
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

  // Step 1: Load config
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const initialContributorCount = result.arlas?.web?.contributors?.length || 0;
  
  // Step 2: Apply required defaults
  const fixedConfig = applyRequiredDefaults(config);
  
  // Step 3: Save the fixed config
  fs.writeFileSync(configPath, JSON.stringify(fixedConfig, null, 2));
  
  // Step 4: Validate with official tool
  console.log('='.repeat(70));
  console.log('WORKFLOW: Apply Defaults → Validate');
  console.log('='.repeat(70));
  console.log();
  
  console.log(`📂 Config loaded: ${initialContributorCount} contributors`);
  console.log(`🔧 Applied required defaults`);
  console.log();
  
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
    process.exit(1);
  }
  
  console.log();
  console.log('='.repeat(70));
  console.log('✅ WORKFLOW COMPLETE - Config is compliant');
  console.log('='.repeat(70));
}

// Run main
main();