/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { AnalyticsImportService } from '@analytics-config/services/analytics-import/analytics-import.service';
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ExternalNodeImportService } from '@app/modules/external-node-config/services/external-node-import/external-node-import.service';
import { ExternalNodeInitService } from '@app/modules/external-node-config/services/external-node-init/external-node-init.service';
import { LookAndFeelInitService } from '@app/modules/look-and-feel-config/services/look-and-feel-init/look-and-feel-init.service';
import { ResultListImportService } from '@app/modules/result-list-config/services/result-list-import/result-list-import.service';
import { ResultListInitService } from '@app/modules/result-list-config/services/result-list-init/result-list-init.service';
import { SideModulesImportService } from '@app/modules/side-modules-config/services/side-modules-import/side-modules-import.service';
import { SideModulesInitService } from '@app/modules/side-modules-config/services/side-modules-init/side-modules-init.service';
import { LookAndFeelImportService } from '@look-and-feel-config/services/look-and-feel-import/look-and-feel-import.service';
import { MapImportService } from '@map-config/services/map-import/map-import.service';
import { MapInitService } from '@map-config/services/map-init/map-init.service';
import { TranslateService } from '@ngx-translate/core';
import { SearchImportService } from '@search-config/services/search-import/search-import.service';
import { SearchInitService } from '@search-config/services/search-init/search-init.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { StartupService, ZONE_PREVIEW, ZONE_WUI_BUILDER } from '@services/startup/startup.service';
import { InputModalComponent } from '@shared-components/input-modal/input-modal.component';
import { ConfigFormControl, ConfigFormGroup } from '@shared-models/config-form';
import { TimelineImportService } from '@timeline-config/services/timeline-import/timeline-import.service';
import { TimelineInitService } from '@timeline-config/services/timeline-init/timeline-init.service';
import { updateValueAndValidity } from '@utils/tools';
import { ArlasColorGeneratorLoader, ArlasStartupService, PersistenceService } from 'arlas-wui-toolkit';
import * as FileSaver from 'file-saver';
import { NGXLogger } from 'ngx-logger';
import { ConfigExportHelper, EXPORT_TYPE } from './config-export-helper';
import { ConfigMapExportHelper } from './config-map-export-helper';
import { Config } from './models-config';
import { MapConfig } from './models-map-config';
import { importElements } from './tools';
import { ArlasColorService } from 'arlas-web-components';

import { ShortcutsService } from '@analytics-config/services/shortcuts/shortcuts.service';
import { StartingConfigFormGroup } from '@services/starting-config-form-builder/starting-config-form-builder.service';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { DataWithLinks } from 'arlas-persistence-api';
import { ResourcesConfigFormGroup } from '@services/resources-form-builder/resources-config-form-builder.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { marker } from '@colsen1991/ngx-translate-extract-marker';

@Injectable({
  providedIn: 'root'
})
export class MainFormManagerService {

  public constructor(
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
    private colorService: ArlasColorService,
    private router: Router,
    private arlasStartupService: ArlasStartupService,
    private shortcutsService: ShortcutsService,
    private spinner: NgxSpinnerService,
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
    const resourcesConfig = this.mainFormService.resourcesConfig.getFg();
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
      resourcesConfig,
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
      this.collectionService,
      this.shortcutsService
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
      if (this.mainFormService.configurationId) {
        // Update existing
        this.spinner.show('saveconfig');
        this.updateDashboard(generatedConfig, generatedMapConfig, resourcesConfig);
      } else {
        // Create new config
        if (!!this.mainFormService.configurationName) {
          this.spinner.show('saveconfig');
          this.createDashboard(this.mainFormService.configurationName, generatedConfig, generatedMapConfig);
        } else {
          const dialogRef = this.dialog.open(InputModalComponent);
          dialogRef.afterClosed().subscribe(configName => {
            if (!!configName) {
              this.spinner.show('saveconfig');
              this.createDashboard(configName, generatedConfig, generatedMapConfig);
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
    const resourcesConfigControls = this.mainFormService.resourcesConfig.getFg().customControls;
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
        value: config['arlas-wui'].web.app.name,
        control: startingConfigControls.unmanagedFields.appName
      },
      {
        value: config?.resources?.previewId,
        control: resourcesConfigControls.resources.previewId
      }
    ]);

    this.initMainModulesForms(false);
    this.startupService.setDefaultCollection(config.arlas.server.collection.name);
    this.shortcutsService.doImport(config);
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
      (this.colorService.colorGenerator as ArlasColorGeneratorLoader).setKeysToColors(config.arlas.web.colorGenerator.keysToColors);
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

  /**
   * The preview should be created if the a preview image has been captured by the user but no identifier has yet been created.
   * @param startForm The form where the preview image is stored
   * @returns Whether we should create the preview in persistence or not
   */
  private shouldCreatePreview(startForm: ResourcesConfigFormGroup) {
    const hasPreviewImage = startForm.hasPreviewImage();
    const hasPreviewId = startForm.hasPreviewId();
    return hasPreviewImage && !hasPreviewId;
  }

  private stringifyGeneratedConfig(generatedConfig: Config, generatedMapConfig: MapConfig): string {
    return JSON.stringify(generatedConfig).replace('"layers":[]', '"layers":' + JSON.stringify(
      generatedMapConfig.layers
    )).replace('"externalEventLayers":[]', '"externalEventLayers":' + JSON.stringify(
      generatedMapConfig.externalEventLayers
    ));
  }

  private updateDashboard(generatedConfig: Config, generatedMapConfig: MapConfig, resourcesConfig: ResourcesConfigFormGroup) {
    this.persistenceService.get(this.mainFormService.configurationId).subscribe(data => {
      this.persistenceService.update(
        this.mainFormService.configurationId,
        this.stringifyGeneratedConfig(generatedConfig, generatedMapConfig),
        new Date(data.last_update_date).getTime(), this.mainFormService.configurationName, data.doc_readers, data.doc_writers
      ).subscribe({
        next: () => {
          if (resourcesConfig.hasPreviewId()) {
            const previewGroups = this.persistenceService.dashboardToResourcesGroups(data.doc_readers, data.doc_writers);
            this.persistenceService.updateResource(generatedConfig.resources.previewId, previewGroups.readers, previewGroups.writers);
          }
          this.spinner.hide('saveconfig');
          this.snackbar.open(
            this.translate.instant('Dashboard updated !') + ' (' + this.mainFormService.configurationName + ')'
          );
        },
        error: (error) => {
          this.spinner.hide('saveconfig');
          this.snackbar.open(this.translate.instant('Error : Dashboard not updated'));
          this.raiseError(error);
        }
      });
    });
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
              title: marker('Invalid dashboard name'),
              message: marker('Another dashboad already exists with the same name, please choose another one'),
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
  private createDashboard(configName, generatedConfig, generatedMapConfig) {
    this.createPreview$(configName, generatedConfig)
      .pipe(
        tap((g: Config) => {
          const conf = this.stringifyGeneratedConfig(g, generatedMapConfig);
          this.persistenceService.create(
            ZONE_WUI_BUILDER,
            configName,
            conf
          ).subscribe({
            next: (data) => {
              this.snackbar.open(
                this.translate.instant('Dashboard saved !') + ' (' + configName + ')'
              );
              this.spinner.hide('saveconfig');
              this.doImport(generatedConfig, generatedMapConfig);
              this.mainFormService.configurationId = data.id;
              this.mainFormService.configChange.next({ id: data.id, name: data.doc_key });
              this.router.navigate(['map-config'], { queryParamsHandling: 'preserve' });
            },
            error: (error) => {
              this.spinner.hide('saveconfig');
              this.snackbar.open(this.translate.instant('Error : Dashboard not saved'));
              this.raiseError(error);
            }
          }
          );
        })
      ).subscribe();
  }

  /** Creates the preview associated to the dashbord if the user has already created one
   * @returns The config object enriched with the preview id.
   */
  private createPreview$(name: string, generatedConfig: Config): Observable<Config> {
    const resourcesConfig = this.mainFormService.resourcesConfig.getFg();
    if (this.shouldCreatePreview(resourcesConfig)) {
      const img = resourcesConfig.customControls.resources.previewValue.value;
      return this.persistenceService.create(ZONE_PREVIEW, name.concat('_preview'), img)
        .pipe(tap((p: DataWithLinks) => resourcesConfig.customControls.resources.previewId.setValue(p.id)))
        .pipe(tap((p: DataWithLinks) => generatedConfig.resources.previewId = p.id))
        .pipe(map((p: DataWithLinks) => generatedConfig))
        .pipe(catchError((err) => of(generatedConfig)));
    } else {
      return of(generatedConfig);
    }
  }
}
