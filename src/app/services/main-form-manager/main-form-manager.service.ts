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
import { ConfigExportHelper, EXPORT_TYPE } from './config-export-helper';
import { ConfigMapExportHelper } from './config-map-export-helper';
import { AnalyticsImportService } from '@analytics-config/services/analytics-import/analytics-import.service';
import { Config } from './models-config';
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { SearchInitService } from '@search-config/services/search-init/search-init.service';
import { SearchImportService } from '@search-config/services/search-import/search-import.service';
import { TimelineInitService } from '@timeline-config/services/timeline-init/timeline-init.service';
import { TimelineImportService } from '@timeline-config/services/timeline-import/timeline-import.service';
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
import { importElements } from './tools';
import { StartupService, ZONE_WUI_BUILDER } from '@services/startup/startup.service';
import { PersistenceService } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { Router } from '@angular/router';
import { ArlasStartupService } from 'arlas-wui-toolkit/services/startup/startup.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { ResultListImportService } from '@app/modules/result-list-config/services/result-list-import/result-list-import.service';
import { ResultListInitService } from '@app/modules/result-list-config/services/result-list-init/result-list-init.service';
import { ExternalNodeInitService } from '@app/modules/external-node-config/services/external-node-init/external-node-init.service';
import { ExternalNodeImportService } from '@app/modules/external-node-config/services/external-node-import/external-node-import.service';
@Injectable({
  providedIn: 'root'
})
export class MainFormManagerService {

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
    private resultListImportService: ResultListImportService,
    private resultListInitService: ResultListInitService,
    private externalNodeInitService: ExternalNodeInitService,
    private externalNodeImportService: ExternalNodeImportService,
    private persistenceService: PersistenceService,
    private snackbar: MatSnackBar,
    private translate: TranslateService,
    private mapInitService: MapInitService,
    private mapImportService: MapImportService,
    private dialog: MatDialog,
    private startupService: StartupService,
    private collectionService: CollectionService,
    private colorService: ArlasColorGeneratorLoader,
    private router: Router,
    private arlasStartupService: ArlasStartupService
  ) { }

  /**
   * Init main modules' forms that are required to a global validation
   */
  public initMainModulesForms(initCollectionFields: boolean) {
    // load the modules required forms
    this.mapInitService.initModule(initCollectionFields);
    this.timelineInitService.initModule(initCollectionFields);
    this.searchInitService.initModule();
    this.analyticsInitService.initModule();
    this.sideModulesInitService.initModule();
    this.lookAndFeelInitService.initModule();
    this.resultListInitService.initModule();
    this.externalNodeInitService.initModule();

    this.mainFormService.commonConfig.initKeysToColorFa(new FormArray([]));

    this.updateControlsFromOtherControls(this.mainFormService.mainForm);
  }

  public attemptExport(type: EXPORT_TYPE) {

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
    const mapConfigVisualisations = this.mainFormService.mapConfig.getVisualisationsFa();
    const mapConfigBasemaps = this.mainFormService.mapConfig.getBasemapsFg();
    const timelineConfigGlobal = this.mainFormService.timelineConfig.getGlobalFg();
    const searchConfigGlobal = this.mainFormService.searchConfig.getGlobalFg();
    const analyticsConfigList = this.mainFormService.analyticsConfig.getListFa();
    const sideModulesConfigGlobal = this.mainFormService.sideModulesConfig.getGlobalFg();
    const lookAndFeelConfigGlobal = this.mainFormService.lookAndFeelConfig.getGlobalFg();
    const resultLists = this.mainFormService.resultListConfig.getResultListsFa();
    const keysToColorList = this.mainFormService.commonConfig.getKeysToColorFa();
    const externalNodeGlobal = this.mainFormService.externalNodeConfig.getExternalNodeFg();
    const generatedConfig = ConfigExportHelper.process(
      startingConfig,
      mapConfigGlobal,
      mapConfigLayers,
      mapConfigVisualisations,
      mapConfigBasemaps,
      searchConfigGlobal,
      timelineConfigGlobal,
      sideModulesConfigGlobal,
      lookAndFeelConfigGlobal,
      analyticsConfigList,
      resultLists,
      externalNodeGlobal,
      this.colorService,
      this.collectionService
    );

    const generatedMapConfig = ConfigMapExportHelper.process(mapConfigLayers, this.colorService, this.collectionService.taggableFieldsMap);

    const confToValidate: any = JSON.parse(JSON.stringify(generatedConfig).replace('"layers":[]', '"layers":' + JSON.stringify(
      generatedMapConfig.layers
    )));
    this.arlasStartupService.validateConfiguration(confToValidate);

    if (this.persistenceService.isAvailable && type === EXPORT_TYPE.persistence) {


      // remove extraConfigs property if persistence is used
      delete generatedConfig.extraConfigs;
      // transform sets to arrays in order to be stringified
      generatedConfig.arlas.web.components.mapgl.input.visualisations_sets.forEach(vs => vs.layers = Array.from(vs.layers));
      const conf: any = JSON.stringify(generatedConfig).replace('"layers":[]', '"layers":' + JSON.stringify(
        generatedMapConfig.layers
      )).replace('"externalEventLayers":[]', '"externalEventLayers":' + JSON.stringify(
        generatedMapConfig.externalEventLayers
      ));
      if (this.mainFormService.configurationId) {
        // Update existing
        this.persistenceService.get(this.mainFormService.configurationId).subscribe(data => {
          this.persistenceService.update(
            this.mainFormService.configurationId,
            conf,
            new Date(data.last_update_date).getTime(), this.mainFormService.configurationName, data.doc_readers, data.doc_writers
          ).subscribe(
            () => {
              ['i18n', 'tour']
                .forEach(zone => ['fr', 'en']
                  .forEach(lg => this.renameLinkedData(zone, data.doc_key, this.mainFormService.configurationName, lg)));
              this.snackbar.open(
                this.translate.instant('Dashboard updated !') + ' (' + this.mainFormService.configurationName + ')'
              );
            },
            (error) => {
              this.snackbar.open(this.translate.instant('Error : Dashboard not updated'));
              this.raiseError(error);
            }
          );
        });
      } else {
        // Create new config
        if (!!this.mainFormService.configurationName) {
          this.createDashboard(this.mainFormService.configurationName, conf, generatedConfig, generatedMapConfig);
        } else {
          const dialogRef = this.dialog.open(InputModalComponent);
          dialogRef.afterClosed().subscribe(configName => {
            if (!!configName) {
              this.createDashboard(configName, conf, generatedConfig, generatedMapConfig);
            }
          });
        }
      }
    } else {
      this.saveJson(generatedConfig, 'config.json');
      this.saveJson(generatedMapConfig, 'config.map.json', '-');
    }
  }

  public doImport(config: Config, mapConfig: MapConfig) {
    const startingConfigControls = this.mainFormService.startingConfig.getFg().customControls;
    importElements([
      {
        value: config.arlas.server.url,
        control: startingConfigControls.serverUrl
      },
      {
        value: config.arlas.server.collection.name,
        control: startingConfigControls.collection
      },
      {
        value: config.arlas.web.colorGenerator,
        control: startingConfigControls.colorGenerator
      },
      {
        value: config.arlas.server.max_age_cache,
        control: startingConfigControls.unmanagedFields.maxAgeCache
      },
      {
        value: config['arlas-wui'].web.app.name,
        control: startingConfigControls.unmanagedFields.appName
      },
      {
        value: config['arlas-wui'].web.app.name_background_color,
        control: startingConfigControls.unmanagedFields.appNameBackgroundColor
      }
    ]);

    this.initMainModulesForms(false);
    this.startupService.setDefaultCollection(config.arlas.server.collection.name);

    this.mapImportService.doImport(config, mapConfig);
    this.timelineImportService.doImport(config);
    this.searchImportService.doImport(config);
    this.analyticsImportService.doImport(config);
    this.sideModulesImportService.doImport(config);
    this.lookAndFeelImportService.doImport(config);
    this.resultListImportService.doImport(config);
    this.externalNodeImportService.doImport(config);

    // load keys to colors
    if (!!config.arlas.web.colorGenerator && !!config.arlas.web.colorGenerator.keysToColors) {
      this.colorService.setKeysToColors(config.arlas.web.colorGenerator.keysToColors);
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
        control.onDependencyChange(control, true);
      }
    } else if (control instanceof ConfigFormGroup) {
      if (!!control.dependsOn) {
        control.onDependencyChange(control, true);
      }
      if (control.status !== 'DISABLED') {
        // if form group is disabled, k
        Object.values(control.controls).forEach(c => this.updateControlsFromOtherControls(c));
      }
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(c => this.updateControlsFromOtherControls(c));
    }
  }

  private raiseError(error: any) {
    if (error.status === 500) {
      error.json().then(err => {
        if ((err.message as string).indexOf('already exists')) {
          // Open a modal to explain that a dashboard with this name already exists
          const dialogRef = this.dialog.open(InputModalComponent, {
            data: {
              title: 'Invalid dashboard name',
              message: 'Another dashboad already exists with the same name, please choose another one',
              initialValue: this.mainFormService.configurationName,
              noCancel: true
            }
          });
          dialogRef.afterClosed().subscribe(name => {
            this.mainFormService.configurationName = name;
            this.attemptExport(EXPORT_TYPE.persistence);
          });
        }
      });
    }
  }
  private createDashboard(configName, conf, generatedConfig, generatedMapConfig) {
    this.persistenceService.create(
      ZONE_WUI_BUILDER,
      configName,
      conf
    ).subscribe(
      (data) => {
        this.snackbar.open(
          this.translate.instant('Dashboard saved !') + ' (' + configName + ')'
        );
        this.doImport(generatedConfig, generatedMapConfig);
        this.mainFormService.configurationId = data.id;
        this.mainFormService.configChange.next({ id: data.id, name: data.doc_key });
        this.router.navigate(['map-config'], { queryParamsHandling: 'preserve' });
      },
      (error) => {
        this.snackbar.open(this.translate.instant('Error : Dashboard not saved'));
        this.raiseError(error);
      }
    );
  }

  private renameLinkedData(zone: string, key: string, newName: string, lg: string) {
    this.persistenceService.existByZoneKey(zone, key.concat('_').concat(lg)).subscribe(
      exist => {
        if (exist.exists) {
          this.persistenceService.getByZoneKey(zone, key.concat('_').concat(lg))
            .subscribe(i => this.persistenceService.rename(i.id, newName.concat('_').concat(lg)).subscribe(d => { }));
        }
      }
    );
  }
}
