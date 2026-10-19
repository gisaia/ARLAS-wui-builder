#!/usr/bin/env node
/**
 * Validator for a generated ARLAS WUI configuration (config.json + config.map.json).
 *
 * Runs the rule registry (lib/rules.js): official draft-06 schemas (like ArlasStartupService.validateConfiguration),
 * Builder import/export invariants, referential integrity, map consistency and, with --mapping, the existence
 * and type of every referenced field.
 *
 * Usage:
 *   node generative-ui/validate.js <config.json> <config.map.json> [--mapping <mapping.json>] [--json]
 *
 * --mapping : output of the describe_collection MCP tool (e.g. generated/courses.mapping.json).
 * --json    : print the findings as JSON instead of the text report.
 * Exit code : 1 if any ERROR, 0 otherwise.
 */
const fs = require('fs');
const path = require('path');
const { runChecks, SECTIONS } = require('./lib/rules');

function parseArgs(argv) {
  const positional = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--mapping') opts.mapping = argv[++i];
    else if (argv[i] === '--json') opts.json = true;
    else positional.push(argv[i]);
  }
  return { positional, opts };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Validates config objects; returns { findings, errors, warnings }. Used by pipeline.js. */
function validate(config, mapConfig, options = {}) {
  const findings = runChecks(config, mapConfig, options);
  return {
    findings,
    errors: findings.filter(f => f.severity === 'ERROR').length,
    warnings: findings.filter(f => f.severity === 'WARN').length
  };
}

function printReport(findings) {
  const tag = { ERROR: '[FAIL]', WARN: '[WARN]', PASS: '[OK]' };
  Object.entries(SECTIONS).forEach(([key, title]) => {
    const inSection = findings.filter(f => f.section === key);
    if (!inSection.length) return;
    console.log(`\n--- ${title} ---`);
    inSection.forEach(f => {
      const line = `  ${tag[f.severity]} [${f.rule}] ${f.message}`;
      if (f.severity === 'ERROR') console.error(line);
      else if (f.severity === 'WARN') console.warn(line);
      else console.log(line);
    });
  });
}

function main() {
  const { positional, opts } = parseArgs(process.argv.slice(2));
  const baseDir = __dirname;
  const pick = (arg, name) => arg || (fs.existsSync(path.join(baseDir, name)) ? path.join(baseDir, name) : path.join(process.cwd(), name));
  const configPath = pick(positional[0], 'config.json');
  const mapConfigPath = pick(positional[1], 'config.map.json');

  let config, mapConfig, mapping;
  const parseErrors = [];
  [[configPath, c => (config = c)], [mapConfigPath, c => (mapConfig = c)], [opts.mapping, c => (mapping = c)]].forEach(([file, set]) => {
    if (!file) return;
    try { set(readJson(file)); } catch (e) { parseErrors.push(`${file} : ${e.message}`); }
  });

  if (!opts.json) {
    console.log('================================================================');
    console.log('         VALIDATEUR DE CONFIGURATION ARLAS WUI                  ');
    console.log('================================================================');
    console.log(`Config cible      : ${configPath}`);
    console.log(`Map config cible  : ${mapConfigPath}`);
    console.log(`Mapping           : ${opts.mapping || '(aucun)'}`);
    console.log('\n--- 1. Validation Syntaxique (JSON strict) ---');
    parseErrors.forEach(e => console.error(`  [FAIL] [JSON] ${e}`));
    if (!parseErrors.length) console.log('  [OK] [JSON] Fichiers JSON syntaxiquement valides.');
  }
  if (parseErrors.length) {
    if (opts.json) console.log(JSON.stringify({ findings: parseErrors.map(m => ({ rule: 'JSON', section: 'syntax', severity: 'ERROR', message: m })) }, null, 2));
    process.exit(1);
  }

  const result = validate(config, mapConfig, { mapping });
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printReport(result.findings);
    console.log('\n================================================================');
    console.log(`  Bilan : ${result.errors} erreur(s), ${result.warnings} alerte(s).`);
    console.log(result.errors ? '  RÉSULTAT : ÉCHEC' : '  RÉSULTAT : SUCCÈS');
    console.log('================================================================\n');
  }
  process.exit(result.errors ? 1 : 0);
}

module.exports = { validate };
if (require.main === module) main();
