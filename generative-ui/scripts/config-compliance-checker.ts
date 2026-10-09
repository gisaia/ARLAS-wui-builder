/**
 * CONFIG COMPLIANCE CHECKER
 * Detects properties that could cause app crashes during import
 * Based on analysis of config-export-helper.ts and result-list-import.service.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ConfigIssue {
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  contributor: string;
  property: string;
  suggestion: string;
}

interface ContributorCheck {
  contributor: any;
  type: string;
  issues: ConfigIssue[];
}

/**
 * Checks if a property access would throw TypeError
 * Based on the pattern: input.options.showName !== undefined ? ...
 */
function wouldCauseCrash(contributor: any, propertyPath: string): boolean {
  const parts = propertyPath.split('.');
  let current: any = contributor;

  // Navigate to the parent object
  for (let i = 0; i < parts.length - 1; i++) {
    if (current === undefined || current === null) return true; // Would crash
    current = current[parts[i]];
  }

  // Check if final property access would be safe
  const finalProp = parts[parts.length - 1];
  
  // The dangerous pattern: contributor.options.showName when options is missing
  if (propertyPath === 'options.showName') {
    // Crash if: contributor.options is undefined OR contributor.options.showName is accessed
    return contributor.options === undefined;
  }

  // General: if intermediate object is undefined, crash
  return current === undefined || current === null;
}

/**
 * Checks all contributors for crash-inducing property patterns
 */
function checkContributorCrash Risks(contributor: any, type: string): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  // Pattern 1: options.showName without options existing
  if (wouldCauseCrash(contributor, 'options.showName')) {
    issues.push({
      type: 'CRITICAL',
      message: 'accessing options.showName when options is undefined will throw TypeError',
      contributor: contributor.identifier || 'unknown',
      property: 'options.showName',
      suggestion: 'Add options: { showName: false } to contributor config'
    });
  } else if (contributor.options && contributor.options.showName !== undefined) {
    // OK - showName is defined
    issues.push({
      type: 'INFO',
      message: 'showName is defined, no crash risk',
      contributor: contributor.identifier || 'unknown',
      property: 'options.showName',
      suggestion: 'None'
    });
  }

  // Pattern 2: window_extent_geometry for map contributors
  if (type === 'map' && !contributor.window_extent_geometry) {
    issues.push({
      type: 'CRITICAL',
      message: 'Map contributor missing window_extent_geometry may cause map rendering failures',
      contributor: contributor.identifier || 'unknown',
      property: 'window_extent_geometry',
      suggestion: 'Add window_extent_geometry: { enabled: true, boundsFieldName: "" }'
    });
  }

  // Pattern 3: Missing required properties by type
  if (type === 'resultlist' && !contributor.fieldsConfiguration) {
    issues.push({
      type: 'CRITICAL',
      message: 'Resultlist contributor missing fieldsConfiguration will fail schema validation',
      contributor: contributor.identifier || 'unknown',
      property: 'fieldsConfiguration',
      suggestion: 'Add fieldsConfiguration with idFieldName, titleFieldNames, tooltipFieldNames'
    });
  }

  if (type === 'resultlist' && !contributor.options) {
    issues.push({
      type: 'CRITICAL',
      message: 'Resultlist contributor missing options property import service will crash',
      contributor: contributor.identifier || 'unknown',
      property: 'options',
      suggestion: 'Add options: {} to contributor config'
    });
  }

  if (type === 'map' && !contributor.layers_sources) {
    issues.push({
      type: 'CRITICAL',
      message: 'Map contributor missing layers_sources may fail map initialization',
      contributor: contributor.identifier || 'unknown',
      property: 'layers_sources',
      suggestion: 'Add layers_sources array with at least one layer definition'
    });
  }

  // Pattern 4: Missing identifier
  if (!contributor.identifier) {
    issues.push({
      type: 'CRITICAL',
      message: 'Contributor missing identifier will cause duplicate identifier errors',
      contributor: 'unknown',
      property: 'identifier',
      suggestion: 'Add identifier: "unique-name" to contributor config'
    });
  }

  return issues;
}

/**
 * Main compliance check function
 */
function checkConfigCompliance(config: any): CheckerResult {
  const results: CheckerResult = {
    totalContributors: 0,
    criticalIssues: 0,
    warnings: 0,
    contributors: [] as ContributorCheck[],
    recommendations: [] as string[]
  };

  const contributors = config.arlas?.web?.contributors || [];

  contributors.forEach((contributor: any) => {
    const type = contributor.type;
    results.totalContributors++;

    const issues = checkContributorCrash Risks(contributor, type);
    
    if (issues.length > 0) {
      results.criticalIssues += issues.filter(i => i.type === 'CRITICAL').length;
      results.warnings += issues.filter(i => i.type === 'WARNING').length;
    }

    results.contributors.push({
      contributor,
      type,
      issues
    });

    // Collect recommendations
    issues
      .filter(i => i.type === 'CRITICAL')
      .forEach(issue => {
        if (!results.recommendations.includes(issue.suggestion)) {
          results.recommendations.push(issue.suggestion);
        }
      }
    );
  });

  return results;
}

interface CheckerResult {
  totalContributors: number;
  criticalIssues: number;
  warnings: number;
  contributors: ContributorCheck[];
  recommendations: string[];
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

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const result = checkConfigCompliance(config);

  console.log('='.repeat(70));
  console.log('ARLAS WUI CONFIG COMPLIANCE CHECKER');
  console.log('='.repeat(70));
  console.log();

  console.log(`📊 Total contributors: ${result.totalContributors}`);
  console.log(`🚨 Critical issues: ${result.criticalIssues}`);
  console.log(`⚠️  Warnings: ${result.warnings}`);
  console.log();

  // Summary per contributor
  console.log('--- Contributor Details ---');
  result.contributors.forEach((check: ContributorCheck) => {
    const hasCritical = check.issues.some(i => i.type === 'CRITICAL');
    const criticalCount = check.issues.filter(i => i.type === 'CRITICAL').length;
    
    console.log(`\n📍 ${check.type} contributor: ${check.contributor.identifier || 'unknown'}`);
    console.log(`   Issues: ${criticalCount} critical, ${check.issues.length - criticalCount} warnings/info`);
    
    if (hasCritical) {
      console.log('   🚨 CRITICAL ISSUES:');
      check.issues
        .filter(i => i.type === 'CRITICAL')
        .forEach(issue => {
          console.log(`      - ${issue.message}`);
          console.log(`        → ${issue.suggestion}`);
        }
      );
    }
    
    check.issues
      .filter(i => i.type === 'INFO')
      .forEach(issue => {
        console.log(`   ℹ️  ${issue.message}`);
      }
    );
  });

  console.log();
  console.log('--- Recommendations ---');
  result.recommendations.forEach((rec, i) => {
    console.log(`${i + 1}. ${rec}`);
  });

  console.log();
  
  // Exit code based on critical issues
  if (result.criticalIssues > 0) {
    console.log(`\n❌ ${result.criticalIssues} critical issue(s) found - fix before importing`);
    process.exit(1);
  } else {
    console.log(`\n✅ No critical issues found - config safe for import`);
    process.exit(0);
  }
}

// Run main
main();