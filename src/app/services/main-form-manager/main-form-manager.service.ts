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
import { updateValueAndValidity, LOCALSTORAGE_CONFIG_ID_KEY } from '@utils/tools';
import * as FileSaver from 'file-saver';
import { NGXLogger } from 'ngx-logger';
import { ConfigExportHelper, EXPORT_TYPE } from './config-export-helper';
import { ConfigMapExportHelper } from './config-map-export-helper';
import { AnalyticsImportService } from '@analytics-config/services/analytics-import/analytics-import.service';
import { Config, ConfigPersistence } from './models-config';
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
import { AbstractControl, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ConfigFormControl, ConfigFormGroup } from '@shared-models/config-form';
import { MatDialog } from '@angular/material/dialog';
import { InputModalComponent } from '@shared-components/input-modal/input-modal.component';
import { LookAndFeelInitService } from '@app/modules/look-and-feel-config/services/look-and-feel-init/look-and-feel-init.service';
import { LookAndFeelImportService } from '@look-and-feel-config/services/look-and-feel-import/look-and-feel-import.service';
import { SideModulesInitService } from '@app/modules/side-modules-config/services/side-modules-init/side-modules-init.service';
import { SideModulesImportService } from '@app/modules/side-modules-config/services/side-modules-import/side-modules-import.service';


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
    private sideModulesInitService: SideModulesInitService,
    private sideModulesImportService: SideModulesImportService,
    private lookAndFeelInitService: LookAndFeelInitService,
    private lookAndFeelImportService: LookAndFeelImportService,
    private timelineInitService: TimelineInitService,
    private timelineImportService: TimelineImportService,
    private persistenceService: PersistenceService,
    private snackbar: MatSnackBar,
    private translate: TranslateService,
    private mapInitService: MapInitService,
    private mapImportService: MapImportService,
    private dialog: MatDialog
  ) { }

  /**
   * Init main modules' forms that are required to a global validation
   */
  public initMainModulesForms(initCollectionFields: boolean) {
    // load the modules required forms
    this.mapInitService.initModule(initCollectionFields);
    this.timelineInitService.initModule();
    this.searchInitService.initModule();
    this.analyticsInitService.initModule();
    this.sideModulesInitService.initModule();
    this.lookAndFeelInitService.initModule();

    this.mainFormService.commonConfig.initKeysToColorFa(new FormArray([]));

    this.updateControlsFromOtherControls(this.mainFormService.mainForm);
  }

  public attemptExport(type: EXPORT_TYPE) {

    if (!this.isExportExpected) {
      this.isExportExpected = true;
    }

    // update the validity of the whole form
    this.mainFormService.mainForm.markAllAsTouched();
    updateValueAndValidity(this.mainFormService.mainForm, false, false);

    if (this.mainFormService.mainForm.valid) {
      this.doExport(type);
    } else {
      this.logger.info('Main form is not valid', this.mainFormService.mainForm);
    }
  }

  private doExport(type: EXPORT_TYPE) {
    const startingConfig = this.mainFormService.startingConfig.getFg();
    const mapConfigGlobal = this.mainFormService.mapConfig.getGlobalFg();
    const mapConfigLayers = this.mainFormService.mapConfig.getLayersFa();
    const timelineConfigGlobal = this.mainFormService.timelineConfig.getGlobalFg();
    const searchConfigGlobal = this.mainFormService.searchConfig.getGlobalFg();
    const analyticsConfigList = this.mainFormService.analyticsConfig.getListFa();
    const sideModulesConfigGlobal = this.mainFormService.sideModulesConfig.getGlobalFg();
    const lookAndFeelConfigGlobal = this.mainFormService.lookAndFeelConfig.getGlobalFg();
    const keysToColorList = this.mainFormService.commonConfig.getKeysToColorFa();

    const generatedConfig = ConfigExportHelper.process(
      startingConfig,
      mapConfigGlobal,
      mapConfigLayers,
      searchConfigGlobal,
      timelineConfigGlobal,
      sideModulesConfigGlobal,
      lookAndFeelConfigGlobal,
      analyticsConfigList,
      keysToColorList,
    );

    const generatedMapConfig = ConfigMapExportHelper.process(mapConfigLayers);

    if (this.persistenceService.isAvailable && type === EXPORT_TYPE.persistence) {

      const configObject: ConfigPersistence = {
        name: 'New config',
        config: JSON.stringify(generatedConfig).replace('"layers":[]', '"layers":' + JSON.stringify(
          generatedMapConfig.layers
        ))
      };

      if (localStorage.getItem(LOCALSTORAGE_CONFIG_ID_KEY)) {
        // Update existing
        this.persistenceService.get(localStorage.getItem(LOCALSTORAGE_CONFIG_ID_KEY)).subscribe(data => {
          configObject.name = (JSON.parse(data.doc_value) as ConfigPersistence).name;
          this.persistenceService.update(
            localStorage.getItem(LOCALSTORAGE_CONFIG_ID_KEY),
            JSON.stringify(configObject)
          ).subscribe(
            () => {
              this.snackbar.open(
                this.translate.instant('Configuration updated !') + ' (' + configObject.name + ')'
              );
            },
            () => {
              this.snackbar.open(this.translate.instant('Error : Configuration not updated'));
            }
          );
        });
      } else {
        // Create new config
        const dialogRef = this.dialog.open(InputModalComponent);
        dialogRef.afterClosed().subscribe(configName => {
          if (configName) {
            configObject.name = configName;
          }
          this.persistenceService.create(
            JSON.stringify(configObject)
          ).subscribe(
            () => {
              this.snackbar.open(
                this.translate.instant('Configuration saved !') + ' (' + configObject.name + ')'
              );
            },
            () => {
              this.snackbar.open(this.translate.instant('Error : Configuration not saved'));
            }
          );
        });

      }


    } else {
      this.saveJson(generatedConfig, 'config.json');
      this.saveJson(generatedMapConfig, 'config.map.json', '-');
    }
  }

  public doImport(config: Config, mapConfig: MapConfig) {

    this.mapImportService.doImport(config, mapConfig);
    this.timelineImportService.doImport(config);
    this.searchImportService.doImport(config);
    this.analyticsImportService.doImport(config);
    this.sideModulesImportService.doImport(config);
    this.lookAndFeelImportService.doImport(config);

    // load keys to colors
    if (!!config.arlas.web.colorGenerator && !!config.arlas.web.colorGenerator.keysToColors) {

      const keysToColor = new FormArray([]);
      config.arlas.web.colorGenerator.keysToColors.forEach(kc =>
        keysToColor.push(new FormGroup({
          keyword: new FormControl(kc[0]),
          color: new FormControl(kc[1])
        }))
      );
      this.mainFormService.commonConfig.initKeysToColorFa(keysToColor);
    }

    this.updateControlsFromOtherControls(this.mainFormService.mainForm);
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

  /**
   * For each ConfigFormControl/Group that depends on other fields (its value or its status),
   * update the field. It is also done by displaying a ConfigFormGroup
   */
  private updateControlsFromOtherControls(control: AbstractControl) {
    if (control instanceof ConfigFormControl) {
      if (!!control.dependsOn) {
        control.onDependencyChange(control);
      }
    } else if (control instanceof ConfigFormGroup) {
      if (!!control.dependsOn) {
        control.onDependencyChange(control);
      }
      if (control.status !== 'DISABLED') {
        // if form group is disabled, k
        Object.values(control.controls).forEach(c => this.updateControlsFromOtherControls(c));
      }
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(c => this.updateControlsFromOtherControls(c));
    }
  }

}
