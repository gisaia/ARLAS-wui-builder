/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { Injectable } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { updateValueAndValidity } from '@utils/tools';
import * as FileSaver from 'file-saver';
import { NGXLogger } from 'ngx-logger';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { ConfigExportHelper } from './config-export-helper';
import { ConfigMapExportHelper } from './config-map-export-helper';
import { AnalyticsImportService } from '@analytics-config/services/analytics-import/analytics-import.service';
import { Config } from './models-config';
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { SearchInitService } from '@search-config/services/search-init/search-init.service';
import { SearchImportService } from '@search-config/services/search-import/search-import.service';
import { TimelineInitService } from '@timeline-config/services/timeline-init/timeline-init.service';
import { TimelineImportService } from '@timeline-config/services/timeline-import/timeline-import.service';
import { PersistenceService } from '@services/persistence/persistence.service';
import { EnvService } from '../env/env.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MapConfig } from './models-map-config';
import { MapInitService } from '@map-config/services/map-init/map-init.service';
import { MapImportService } from '@map-config/services/map-import/map-import.service';


@Injectable({
  providedIn: 'root'
})
export class MainFormManagerService {

  public isExportExpected = false;

  constructor(
    private logger: NGXLogger,
    private mainFormService: MainFormService,
    private analyticsImportService: AnalyticsImportService,
    private analyticsInitService: AnalyticsInitService,
    private searchInitService: SearchInitService,
    private searchImportService: SearchImportService,
    private timelineInitService: TimelineInitService,
    private timelineImportService: TimelineImportService,
    private persistenceService: PersistenceService,
    private envService: EnvService,
    private snackbar: MatSnackBar,
    private translate: TranslateService,
    private mapInitService: MapInitService,
    private mapImportService: MapImportService,
  ) { }

  /**
   * Init main modules' forms that are required to a global validation
   */
  public initMainModulesForms() {
    // load the modules required forms
    this.analyticsInitService.initModule();
    this.searchInitService.initModule();
    this.timelineInitService.initModule();
    this.mapInitService.initModule();
  }

  public attemptExport() {

    if (!this.isExportExpected) {
      this.isExportExpected = true;
    }

    // update the validity of the whole form
    this.mainFormService.mainForm.markAllAsTouched();
    updateValueAndValidity(this.mainFormService.mainForm, false, false);

    if (this.mainFormService.mainForm.valid) {
      this.doExport();
    } else {
      this.logger.info('Main form is not valid', this.mainFormService.mainForm);
    }
  }

  private doExport() {
    const startingConfig = this.mainFormService.startingConfig.getFg();
    const mapConfigGlobal = this.mainFormService.mapConfig.getGlobalFg();
    const mapConfigLayers = this.mainFormService.mapConfig.getLayersFa();
    const searchConfigGlobal = this.mainFormService.searchConfig.getGlobalFg();
    const timelineConfigGlobal = this.mainFormService.timelineConfig.getGlobalFg();
    const analyticsConfigList = this.mainFormService.analyticsConfig.getListFa();

    const generatedConfig = ConfigExportHelper.process(
      startingConfig,
      mapConfigGlobal,
      mapConfigLayers,
      searchConfigGlobal,
      timelineConfigGlobal,
      analyticsConfigList);

    const generatedMapConfig = ConfigMapExportHelper.process(mapConfigLayers);

    if (this.envService.persistenceUrl !== '') {
      this.persistenceService.create(
        'config.json',
        JSON.stringify(generatedConfig).replace('"layers":[]', '"layers":' + JSON.stringify(
          generatedMapConfig.layers
        ))
      ).subscribe(
        () => {
          this.snackbar.open(this.translate.instant('Configuration saved !'));
        },
        () => {
          this.snackbar.open(this.translate.instant('Error : Configuration not saved'));
        }
      );

    } else {

      this.saveJson(generatedConfig, 'config.json');

      this.saveJson(generatedMapConfig, 'config.map.json', '-');
    }
  }

  public doImport(config: Config, mapConfig: MapConfig) {

    this.mainFormService.startingConfig.getFg().setValue({
      collections: [config.arlas.server.collection.name],
      serverUrl: config.arlas.server.url
    });

    this.analyticsImportService.doImport(config);
    this.searchImportService.doImport(config);
    this.timelineImportService.doImport(config);
    this.mapImportService.doImport(config, mapConfig);
  }

  private saveJson(json: any, filename: string, separator?: string) {
    const blob = new Blob([JSON.stringify(json, (key, value) => {
      if (!!separator && value && typeof value === 'object' && !Array.isArray(value)) {
        // convert keys to snake- or kebab-case (eventually other) according to the separator.
        // In fact we cannot declare a property with a snake-cased name,
        // (so in models interfaces properties are are camel case)
        const replacement = {};
        for (const k in value) {
          if (Object.hasOwnProperty.call(value, k)) {
            replacement[
              k.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                .map(x => x.toLowerCase())
                .join(separator)
            ] = value[k];
          }
        }
        return replacement;
      }
      return value;
    }, 2)], { type: 'application/json;charset=utf-8' });
    FileSaver.saveAs(blob, filename);
  }

}
