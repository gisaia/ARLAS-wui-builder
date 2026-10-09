/**
 * APPLY DEFAULTS FROM default.json
 * Fills in missing required values from default.json if not present in generated config
 * Ensures path exists before adding value (same structure)
 */

import * as fs from 'fs';
import * as path from 'path';

interface DefaultValue {
  path: string;      // Dotted path like "map.global.margePanForLoad"
  value: any;
  description: string;
}

/**
 * Recursively set a value at a dotted path in an object
 */
function setDottedValue(obj: any, dottedPath: string, value: any): any {
  const parts = dottedPath.split('.');
  let current: any = obj;

  // Navigate to the parent object
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] === undefined) {
      // Path doesn't exist, can't set value
      return false;
    }
    current = current[parts[i]];
  }

  // Set the value at the final key
  const lastKey = parts[parts.length - 1];
  current[lastKey] = value;
  return true;
}

/**
 * Get a value at a dotted path in an object
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
 * Apply defaults from default.json to the generated config
 */
function applyDefaults(config: any, defaults: any): {
  config: any;
  appliedDefaults: number;
  skippedDefaults: number;
} {
  // Load the rule schemas to know which properties are required
  // (We'll use a simplified approach: apply any default that makes sense)

  const appliedDefaults: number = 0;
  const skippedDefaults: number = 0;
  const defaultsToApply: { path: string; value: any }[] = [];

  // Extract all defaults from the default.json structure
  // We need to walk through the object and find leaf values with their paths
  function extractDefaults(obj: any, currentPath: string): void {
    for (const key of Object.keys(obj)) {
      const fullPath = currentPath ? `${currentPath}.${key}` : key;
      const val = obj[key];

      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        // Recurse into nested objects
        extractDefaults(obj[key], fullPath);
      } else {
        // Leaf value - record it as a potential default
        defaultsToApply.push({
          path: fullPath,
          value: val
        });
      }
    }
  }

  extractDefaults(defaults, '');

  // Now apply defaults to the config
  let applied = 0;
  let skipped = 0;

  for (const defaultEntry of defaultsToApply) {
    // Check if the value is already set in the config
    const existingValue = getDottedValue(config, defaultEntry.path);

    if (existingValue === undefined) {
      // Value is not set - apply the default
      const setResult = setDottedValue(config, defaultEntry.path, defaultEntry.value);
      if (setResult) {
        applied++;
      } else {
        skipped++;
      }
    } else {
      // Value already exists - skip
      skipped++;
    }
  }

  return {
    config,
    appliedDefaults: applied,
    skippedDefaults: skipped
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
  const defaultPath = path.join(
    '/home/mickael/IdeaProjects/ARLAS-wui-builder',
    'generative-ui',
    'default.json'
  );

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Config not found at: ${configPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(defaultPath)) {
    console.error(`❌ Default file not found at: ${defaultPath}`);
    process.exit(1);
  }

  // Load config and defaults
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const defaults = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));

  console.log('='.repeat(70));
  console.log('APPLY DEFAULTS FROM default.json');
  console.log('='.repeat(70));
  console.log();

  // Apply defaults
  const result = applyDefaults(config, defaults);

  console.log(`📂 Config loaded: ${config.arlas?.web?.contributors?.length || 0} contributors`);
  console.log(`📂 Defaults file loaded from: default.json`);
  console.log(`📊 Defaults applied: ${result.appliedDefaults}`);
  console.log(`   Skipped (already set): ${result.skippedDefaults}`);
  console.log();

  // Display what was applied
  // Focus on the most critical ones for our use case
  const criticalDefaults = ['map.global.margePanForLoad', 'map.global.margePanForTest', 'map.global.geographicalOperator'];

  console.log('--- Defaults Applied ---');
  for (const defaultEntry of [...Object.keys(defaults?.map || {}).reduce((acc: any, key) => {
    // This is just to show some defaults
    return acc;
  }, [])]) {
    // We'll check specific critical ones
  }

  // Specifically check the map defaults we fixed earlier
  const mapLoad = getDottedValue(config, 'map.global.margePanForLoad');
  const mapTest = getDottedValue(config, 'map.global.margePanForTest');
  const geoOp = getDottedValue(config, 'map.global.geographicalOperator');

  console.log('Map defaults status:');
  console.log(`  margePanForLoad: ${mapLoad} ${mapLoad === 5 ? '✅ (from default)' : ''}`);
  console.log(`  margePanForTest: ${mapTest} ${mapTest === 5 ? '✅ (from default)' : ''}`);
  console.log(`  geographicalOperator: ${geoOp} ${geoOp === 'intersects' ? '✅ (from default)' : ''}`);

  // Save the updated config
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log();
  console.log('✅ Config saved with applied defaults');

  // Run validation
  console.log();
  console.log('--- Running Official Validation ---');
  const { execSync } = require('child_process');
  try {
    const output = execSync(
      'node /home/mickael/IdeaProjects/ARLAS-wui-builder/generative-ui/validate.js ' +
      '/home/mickael/IdeaProjects/ARLAS-wui-builder/generative-ui/generated/courses.config.json ' +
      '/home/mickael/IdeaProjects/ARLAS-wui-builder/generative-ui/generated/courses.config.map.json',
      { cwd: '/home/mickael/IdeaProjects/ARLAS-wui-builder/generative-ui', stdio: 'pipe' }
    ).toString();

    // Check for success
    if (output.includes('SUCCÈS TOTAL')) {
      console.log(output);
      console.log('✅ Validation passed after applying defaults');
    } else {
      console.log(output);
    }
  } catch (e: any) {
    console.error('Validation failed:');
    console.error(e.status ? `Exit code: ${e.status}` : e.message);
  }

  console.log();
  console.log('='.repeat(70));
  console.log('DEFAULT APPLICATION PIPELINE COMPLETE');
  console.log('='.repeat(70));
}

// Run main
main();