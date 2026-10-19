#!/usr/bin/env node
/**
 * One command to check a generated ARLAS WUI configuration:
 *
 *   parse → normalize → validate → round-trip (Builder) → critique
 *
 * Stops at the first stage that fails. Writes next to the input:
 *   <name>.normalized.config.json  the config after the automatic, data-independent corrections (input untouched)
 *   <name>.report.json             every finding by stage, with its rule id
 *
 * Usage:
 *   node generative-ui/pipeline.js <config.json> <config.map.json> --mapping <mapping.json> [--profile <profile.json>]
 *                                  [--no-roundtrip] [--keep-colors]
 *   npm run genui:check -- <config.json> <config.map.json> --mapping <mapping.json> --profile <profile.json>
 *
 * --mapping      output of the describe_collection MCP tool, saved as generated/<name>.mapping.json (required).
 * --profile      data profile (generated/<name>.profile.json); without it the critique only applies structural rules.
 * --no-roundtrip skip the Builder round-trip (about 1 min, runs `ng test`).
 * --keep-colors  do not neutralize "match" colors and colorGenerator before the round-trip (the test mocks have no
 *                color service, so the import fails with them).
 * Exit code: 1 if any stage fails, 0 otherwise.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { normalize, defaultOutPath, printChanges } = require('./normalize');
const { validate } = require('./validate');
const { verifyRoundtrip } = require('./scripts/verify-config-roundtrip');

function parseArgs(argv) {
  const positional = [];
  const opts = { roundtrip: true, stripColors: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mapping') opts.mapping = argv[++i];
    else if (a === '--profile') opts.profile = argv[++i];
    else if (a === '--no-roundtrip') opts.roundtrip = false;
    else if (a === '--keep-colors') opts.stripColors = false;
    else positional.push(a);
  }
  return { positional, opts };
}

const banner = title => console.log(`\n${'='.repeat(70)}\n${title}\n${'='.repeat(70)}`);

function main() {
  const { positional, opts } = parseArgs(process.argv.slice(2));
  const [configPath, mapPath] = positional;
  if (!configPath || !mapPath || !opts.mapping) {
    console.error('Usage : node pipeline.js <config.json> <config.map.json> --mapping <mapping.json> [--profile <profile.json>] [--no-roundtrip] [--keep-colors]');
    process.exit(2);
  }
  const base = path.basename(configPath).replace(/\.config\.json$|\.json$/, '');
  const reportPath = path.join(path.dirname(configPath), `${base}.report.json`);
  const report = { config: configPath, map: mapPath, mapping: opts.mapping, profile: opts.profile || null, date: new Date().toISOString(), stages: {} };
  const finish = ok => {
    report.result = ok ? 'SUCCESS' : 'FAILURE';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
    banner(`RÉSULTAT : ${ok ? 'SUCCÈS' : 'ÉCHEC'} — rapport : ${reportPath}`);
    process.exit(ok ? 0 : 1);
  };

  // 1. parse
  banner('1/5 Lecture des fichiers');
  const inputs = {};
  const parseErrors = [];
  [['config', configPath], ['map', mapPath], ['mapping', opts.mapping], ['profile', opts.profile]].forEach(([k, f]) => {
    if (!f) return;
    try { inputs[k] = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { parseErrors.push(`${f} : ${e.message}`); }
  });
  report.stages.parse = { ok: !parseErrors.length, errors: parseErrors };
  parseErrors.forEach(e => console.error(`  [FAIL] ${e}`));
  if (parseErrors.length) finish(false);
  console.log('  [OK] JSON valides.');

  // 2. normalize
  banner('2/5 Normalisation (corrections indépendantes des données)');
  const normalizedPath = defaultOutPath(configPath);
  let normalized;
  try {
    normalized = normalize(inputs.config, inputs.map, { mapping: inputs.mapping });
  } catch (e) {
    report.stages.normalize = { ok: false, error: e.message };
    console.error(`  [FAIL] ${e.message}`);
    finish(false);
  }
  fs.writeFileSync(normalizedPath, JSON.stringify(normalized.config, null, 2) + '\n');
  printChanges(normalized.changes);
  console.log(`  → ${normalizedPath}`);
  report.stages.normalize = { ok: true, output: normalizedPath, changes: normalized.changes };

  // 3. validate
  banner('3/5 Validation (schémas, invariants du Builder, références, champs)');
  const v = validate(normalized.config, inputs.map, { mapping: inputs.mapping });
  v.findings.filter(f => f.severity !== 'PASS').forEach(f => console.log(`  [${f.severity === 'ERROR' ? 'FAIL' : 'WARN'}] [${f.rule}] ${f.message}`));
  console.log(`  ${v.errors} erreur(s), ${v.warnings} alerte(s).`);
  report.stages.validate = { ok: v.errors === 0, errors: v.errors, warnings: v.warnings, findings: v.findings.filter(f => f.severity !== 'PASS') };
  if (v.errors) finish(false);

  // 4. round-trip
  banner('4/5 Round-trip Builder (import → formulaires → ré-export)');
  if (!opts.roundtrip) {
    console.log('  Ignoré (--no-roundtrip).');
    report.stages.roundtrip = { ok: true, skipped: true };
  } else {
    if (opts.stripColors) console.log('  Couleurs "match" et colorGenerator neutralisées pour le test (mocks sans service de couleurs).');
    const rt = verifyRoundtrip(normalized.config, inputs.map, inputs.mapping, { stripColors: opts.stripColors, quiet: true });
    const failures = rt.output.split('\n').filter(l => /^\s*[×✗]|^\+\s+"|AssertionError|Error:/.test(l)).map(l => l.trim());
    const summary = rt.output.split('\n').find(l => /Tests\s+\d/.test(l));
    if (summary) console.log(`  ${summary.trim()}`);
    failures.forEach(l => console.log(`  ${l}`));
    report.stages.roundtrip = { ok: rt.ok, strippedColors: opts.stripColors, failures };
    if (!rt.ok) finish(false);
  }

  // 5. critique
  banner('5/5 Critique analytique (critique.js)');
  const args = [path.join(__dirname, 'critique.js'), normalizedPath, mapPath, ...(opts.profile ? [opts.profile] : [])];
  const c = spawnSync(process.execPath, args, { encoding: 'utf8' });
  process.stdout.write(c.stdout || '');
  process.stderr.write(c.stderr || '');
  const lines = (c.stdout || '').split('\n');
  report.stages.critique = {
    ok: c.status === 0,
    findings: lines.filter(l => /\[(ERREUR|ALERTE|CONSEIL)\]/.test(l)).map(l => l.trim()),
    summary: (lines.find(l => /Bilan/.test(l)) || '').trim()
  };
  finish(c.status === 0);
}

main();
