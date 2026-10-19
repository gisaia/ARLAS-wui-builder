#!/usr/bin/env node
/**
 * Builder import/export round-trip of a generated configuration.
 *
 * Copies the given files over src/app/services/main-form-manager/fixtures/generated.*.json, runs
 * generated-config.spec.ts (MainFormManagerService.doImport → exportConfig, form validity, fidelity diff),
 * then ALWAYS restores the committed fixtures. The repo-root config.json / config.map.json are never touched.
 *
 * Usage:
 *   node generative-ui/scripts/verify-config-roundtrip.js <config.json> <config.map.json> --mapping <mapping.json> [--strip-colors]
 *
 * --strip-colors : the spec mocks have no ARLAS server nor color service, so ["match", ...] colors and
 *                  arlas.web.colorGenerator make the import fail; this replaces each "match" by its default
 *                  value and removes colorGenerator in the tested copy only.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const FIXTURES = path.join(ROOT, 'src/app/services/main-form-manager/fixtures');
const SPEC = 'src/app/services/main-form-manager/generated-config.spec.ts';
const TARGETS = { config: 'generated.config.json', map: 'generated.config.map.json', mapping: 'generated.mapping.json' };

function stripColors(config, mapConfig) {
  const c = JSON.parse(JSON.stringify(config));
  const m = JSON.parse(JSON.stringify(mapConfig));
  if (c?.arlas?.web?.colorGenerator) delete c.arlas.web.colorGenerator;
  const replaceMatch = node => {
    if (Array.isArray(node)) {
      if (node[0] === 'match' && node.length >= 4) return replaceMatch(node[node.length - 1]);
      return node.map(replaceMatch);
    }
    if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, replaceMatch(v)]));
    return node;
  };
  (m.layers || []).forEach(l => {
    if (l.paint) l.paint = replaceMatch(l.paint);
    if (l.layout) l.layout = replaceMatch(l.layout);
  });
  return { config: c, mapConfig: m };
}

/** Runs the round-trip; returns { ok, output }. */
function verifyRoundtrip(config, mapConfig, mapping, { stripColors: strip = false, quiet = false } = {}) {
  let tested = { config, mapConfig };
  if (strip) tested = stripColors(config, mapConfig);

  const files = {
    [TARGETS.config]: tested.config,
    [TARGETS.map]: tested.mapConfig,
    [TARGETS.mapping]: mapping
  };
  const backups = {};
  Object.keys(files).forEach(f => { backups[f] = fs.readFileSync(path.join(FIXTURES, f), 'utf8'); });
  try {
    Object.entries(files).forEach(([f, content]) => {
      if (content !== undefined) fs.writeFileSync(path.join(FIXTURES, f), JSON.stringify(content, null, 2) + '\n');
    });
    const res = spawnSync('npx', ['ng', 'test', '--no-watch', `--include=${SPEC}`], {
      cwd: ROOT, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' }, maxBuffer: 64 * 1024 * 1024
    });
    const output = `${res.stdout || ''}${res.stderr || ''}`.split('\n').filter(l => !/^Sourcemap for /.test(l)).join('\n');
    if (!quiet) process.stdout.write(output);
    return { ok: res.status === 0, output };
  } finally {
    Object.entries(backups).forEach(([f, content]) => fs.writeFileSync(path.join(FIXTURES, f), content));
  }
}

function main() {
  const args = process.argv.slice(2);
  const positional = [];
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mapping') opts.mapping = args[++i];
    else if (args[i] === '--strip-colors') opts.stripColors = true;
    else positional.push(args[i]);
  }
  const [configPath, mapPath] = positional;
  if (!configPath || !mapPath || !opts.mapping) {
    console.error('Usage : node verify-config-roundtrip.js <config.json> <config.map.json> --mapping <mapping.json> [--strip-colors]');
    process.exit(2);
  }
  const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log(`Round-trip Builder : ${configPath} + ${mapPath}${opts.stripColors ? ' (couleurs "match" neutralisées)' : ''}`);
  const { ok } = verifyRoundtrip(read(configPath), read(mapPath), read(opts.mapping), opts);
  console.log(ok ? '\nRÉSULTAT : SUCCÈS — import, formulaires et ré-export fidèles.' : '\nRÉSULTAT : ÉCHEC — voir les tests en échec ci-dessus.');
  process.exit(ok ? 0 : 1);
}

module.exports = { verifyRoundtrip, stripColors };
if (require.main === module) main();
