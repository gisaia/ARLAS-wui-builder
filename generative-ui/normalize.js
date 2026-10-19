#!/usr/bin/env node
/**
 * Normalizer for a generated ARLAS WUI configuration.
 *
 * Applies the `fix` functions of the rule registry (lib/rules.js): Builder layout constants, empty arrays,
 * values derived from another part of the config, removal of keys unknown to the schemas. It never writes
 * a field name, a collection or a contributor id; those stay validation ERRORs for the generator to fix.
 *
 * Usage:
 *   node generative-ui/normalize.js <config.json> <config.map.json> [--out <normalized.config.json>] [--json]
 *
 * The input is never overwritten. Default output: <name>.normalized.config.json next to the input.
 * Every change is printed (rule, path, before → after).
 */
const fs = require('fs');
const path = require('path');
const { runFixes } = require('./lib/rules');

function defaultOutPath(configPath) {
  const dir = path.dirname(configPath);
  const base = path.basename(configPath).replace(/\.config\.json$|\.json$/, '');
  return path.join(dir, `${base}.normalized.config.json`);
}

/** Returns { config, changes } without touching the given object. */
function normalize(config, mapConfig, options = {}) {
  const copy = JSON.parse(JSON.stringify(config));
  const changes = runFixes(copy, mapConfig, options);
  return { config: copy, changes };
}

const show = v => (v === undefined ? '∅' : JSON.stringify(v).slice(0, 120));

function printChanges(changes) {
  if (!changes.length) {
    console.log('  Aucune correction : la configuration respecte déjà les invariants corrigibles.');
    return;
  }
  changes.forEach(c => console.log(`  [${c.rule}] ${c.path} : ${show(c.before)} → ${show(c.after)}`));
}

function main() {
  const args = process.argv.slice(2);
  const positional = [];
  let out;
  let json = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out') out = args[++i];
    else if (args[i] === '--json') json = true;
    else positional.push(args[i]);
  }
  const [configPath, mapConfigPath] = positional;
  if (!configPath || !mapConfigPath) {
    console.error('Usage : node normalize.js <config.json> <config.map.json> [--out <file>] [--json]');
    process.exit(2);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const mapConfig = JSON.parse(fs.readFileSync(mapConfigPath, 'utf8'));
  const outPath = out || defaultOutPath(configPath);
  if (path.resolve(outPath) === path.resolve(configPath)) {
    console.error('Refus : la sortie ne doit pas écraser la configuration d\'entrée.');
    process.exit(2);
  }

  const result = normalize(config, mapConfig);
  fs.writeFileSync(outPath, JSON.stringify(result.config, null, 2) + '\n');
  if (json) {
    console.log(JSON.stringify({ out: outPath, changes: result.changes }, null, 2));
  } else {
    console.log(`Normalisation de ${configPath}`);
    printChanges(result.changes);
    console.log(`\n${result.changes.length} correction(s) → ${outPath}`);
  }
}

module.exports = { normalize, defaultOutPath, printChanges };
if (require.main === module) main();
