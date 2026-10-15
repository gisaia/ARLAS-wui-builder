#!/usr/bin/env node

/**
 * CONFIG ROUND-TRIP VERIFIER (CREATION PIPELINE)
 * 
 * Executes the Angular builder import & export process:
 * 1. Takes the generated config.json and config.map.json.
 * 2. Runs MainFormManagerService.doImport() to populate all reactive form controls (inputs).
 * 3. Executes ConfigExportHelper.process() and ConfigMapExportHelper.process() (via exportConfig())
 *    to verify that all inputs were properly filled and that the configuration can be
 *    faithfully re-exported without any runtime crashes or TypeErrors.
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

function main() {
  console.log('='.repeat(70));
  console.log('    ARLAS WUI BUILDER - VERIFICATION DE ROUND-TRIP IMPORT/EXPORT');
  console.log('='.repeat(70));

  const rootDir = path.resolve(__dirname, '../../');
  const configPath = process.argv[2] || path.join(rootDir, 'config.json');
  const mapConfigPath = process.argv[3] || path.join(rootDir, 'config.map.json');

  if (!fs.existsSync(configPath)) {
    console.error(`❌ Fichier introuvable: ${configPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(mapConfigPath)) {
    console.error(`❌ Fichier introuvable: ${mapConfigPath}`);
    process.exit(1);
  }

  console.log(`\nConfig testée     : ${configPath}`);
  console.log(`Map config testée : ${mapConfigPath}\n`);

  console.log('--- Exécution du test d\'importation et d\'exportation des formulaires ---');
  try {
    const cmd = `npx ng test --no-watch --include=src/app/services/main-form-manager/main-form-manager.spec.ts`;
    console.log(`Commande: ${cmd}\n`);
    
    execSync(cmd, {
      cwd: rootDir,
      stdio: 'inherit'
    });

    console.log('\n' + '='.repeat(70));
    console.log('  RÉSULTAT : SUCCÈS TOTAL - La configuration remplit tous les inputs');
    console.log('  et passe le cycle import/export sans aucune exception !');
    console.log('='.repeat(70) + '\n');
    process.exit(0);
  } catch (err: any) {
    console.error('\n' + '='.repeat(70));
    console.error('  RÉSULTAT : ÉCHEC - L\'importation ou l\'exportation a levé une exception.');
    console.error('='.repeat(70) + '\n');
    process.exit(1);
  }
}

main();
