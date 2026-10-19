# generative-ui

Generates ARLAS WUI dashboards (`config.json` + `config.map.json`) with an LLM, then checks them before they reach the Builder.

**Workflow:** save the collection mapping → generate the config from `templates/` → `npm run genui:check` → fix → critique → deliver.

```bash
npm run genui:check -- generated/<name>.config.json generated/<name>.config.map.json \
  --mapping generated/<name>.mapping.json --profile generated/<name>.profile.json
```

## Prompts and reference documents

| File | Purpose |
|---|---|
| `AGENT_PROMPT.md` | System prompt of the generator agent: method, Builder invariants (with rule ids), verification steps, output format. |
| `CRITIC_PROMPT.md` | System prompt of an independent reviewer agent: scores the dashboard on five axes and gives a verdict. |
| `COMPREHENSION.md` | Reference on the ARLAS WUI configuration: structure, fields, analytics panel, result list, tooling. |
| `SPATIAL_RECIEPE.md` | Generic rules of spatial analysis and cartographic semiology (tool-independent). |
| `SPATIAL_ARLAS_CAPABILITIES.md` | What ARLAS can do for each analysis of the recipe (native / partial / not available). |

## Tooling

| File | Purpose |
|---|---|
| `pipeline.js` | Single entry point (`npm run genui:check`): parse → normalize → validate → Builder round-trip → critique. Writes `<name>.normalized.config.json` and `<name>.report.json`. |
| `lib/rules.js` | Registry of every rule (id, check, optional fix), shared by validation and normalization. Fixes never write a field name. |
| `normalize.js` | Applies the data-independent fixes of the registry; never overwrites its input. |
| `validate.js` | Official schemas, Builder invariants, references, map, and field existence/type against the mapping (`--mapping`). |
| `critique.js` | Analytical review: aggregations vs variable nature, colors, units, titles, coverage (needs the profile). |
| `scripts/verify-config-roundtrip.js` | Imports the config into the Builder forms, re-exports it and reports every lost or changed value (`npm run verify:roundtrip`). |
| `roundtrip-allowlist.json` | Differences the Builder makes on purpose on export (canonical ids, group ids…), each with its reason. |
| `scripts/model-critique.sh` | Runs the independent reviewer (`CRITIC_PROMPT.md`) with the Gemini CLI. |

## Inputs and examples

| Folder | Content |
|---|---|
| `schemas/` | The 21 official JSON Schemas (draft-06) of the ARLAS config, contributors and widgets. Reference version: never resync from `node_modules`. |
| `templates/` | One Builder-format skeleton per widget (`dashboard`, `timeline`, `map`, `resultlist`, `search`, `histogram`, `swimlane`, `powerbars`, `donut`, `metric`, `metricstable`). Replace every `<<…>>`. |
| `generated/` | Per collection: `<name>.mapping.json` (from `describe_collection`), `<name>.profile.json`, and the generated dashboards (`courses.v2`, `lines`, `maritime`). |
| `exemple/` | A real config exported by the Builder (`config_real.json`, `config_map_real.json`). |
| `test/` | Tests of the validator, normalizer and templates (`npm run genui:test`). |

The round-trip runs `src/app/services/main-form-manager/generated-config.spec.ts`, which reads the fixtures in `src/app/services/main-form-manager/fixtures/`.
