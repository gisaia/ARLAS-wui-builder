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

import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { ConfigMapExportHelper } from '@services/main-form-manager/config-map-export-helper';
import { MainFormService } from '@services/main-form/main-form.service';
import { StartupService, ZONE_PREVIEW } from '@services/startup/startup.service';
import { MapglComponent } from 'arlas-web-components';
import { MapContributor } from 'arlas-web-contributors';
import {
  ArlasCollaborativesearchService, ArlasColorGeneratorLoader,
  ArlasConfigService, ContributorBuilder, PersistenceService
} from 'arlas-wui-toolkit';
import { merge, Subscription } from 'rxjs';

export interface MapglComponentInput {
  mapglContributors: MapContributor[];
  mapComponentConfig: any;
}

@Component({
  selector: 'arlas-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements AfterViewInit, OnDestroy {

  @Input() public mapComponentConfig: any;
  @Input() public mapglContributors: MapContributor[] = [];
  @ViewChild('map', { static: false }) public mapglComponent: MapglComponent;

  private onMapLoadSub: Subscription;
  public mapDataSources;
  public mapRedrawSources;
  public mapLegendUpdater;
  public mapVisibilityUpdater;
  public mainMapContributor;
  public configId;

  public constructor(
    protected mainFormService: MainFormService,
    private collaborativeService: ArlasCollaborativesearchService,
    private configService: ArlasConfigService,
    private startupService: StartupService,
    private collectionService: CollectionService,
    private colorService: ArlasColorGeneratorLoader,
    private cdr: ChangeDetectorRef,
    private persistenceService: PersistenceService,
    private snackbar: MatSnackBar,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public dataMap: MapglComponentInput
  ) {
    this.configId = this.mainFormService.configurationId;
    if (this.dataMap.mapglContributors !== undefined || this.dataMap.mapComponentConfig !== undefined) {
      this.mapglContributors = dataMap.mapglContributors;
      this.mapComponentConfig = dataMap.mapComponentConfig.input;
    } else {
      // Get contributor conf part for this layer
      const mapConfigGlobal = this.mainFormService.mapConfig.getGlobalFg();
      const mapConfigLayers = this.mainFormService.mapConfig.getLayersFa();
      const mapConfigVisualisations = this.mainFormService.mapConfig.getVisualisationsFa();
      const mapConfigBasemaps = this.mainFormService.mapConfig.getBasemapsFg();
      // Get contributor config for this layer
      // Get config.map part for this layer
      const configMap = ConfigMapExportHelper.process(mapConfigLayers, colorService, this.collectionService.taggableFieldsMap);
      const mapContribConfigs = ConfigExportHelper.getMapContributors(mapConfigGlobal, mapConfigLayers,
        this.mainFormService.getMainCollection(), collectionService);
      // Add contributor part in arlasConfigService
      // Add web contributors in config if not exist
      const currentConfig = this.startupService.getConfigWithInitContrib();
      // clear mapcontributors configs
      currentConfig.arlas.web.contributors = currentConfig.arlas.web.contributors.filter(c => c.type !== 'map');
      // add mapcontributors configs
      currentConfig.arlas.web.contributors = currentConfig.arlas.web.contributors.concat(mapContribConfigs);
      this.configService.setConfig(currentConfig);
      const contributors: MapContributor[] = [];

      mapContribConfigs.forEach(mapConfig => {
        const mapContributor = ContributorBuilder.buildContributor('map',
          mapConfig.identifier,
          this.configService,
          this.collaborativeService,
          this.colorService);
        contributors.push(mapContributor);
      });
      const mapComponentConfig = ConfigExportHelper.getMapComponent(
        mapConfigGlobal,
        mapConfigLayers,
        mapConfigVisualisations,
        mapConfigBasemaps
      );
      mapComponentConfig.input.mapLayers.layers = configMap.layers;

      this.mapglContributors = contributors;
      this.mapComponentConfig = mapComponentConfig.input;
    }
    if (!!this.mapglContributors) {
      this.mapDataSources = this.mapglContributors.map(c => c.dataSources).reduce((set1, set2) => new Set([...set1, ...set2]));
      this.mapRedrawSources = merge(...this.mapglContributors.map(c => c.redrawSource));
      this.mapLegendUpdater = merge(...this.mapglContributors.map(c => c.legendUpdater));
      this.mapVisibilityUpdater = merge(...this.mapglContributors.map(c => c.visibilityUpdater));
      let mainMapContributor = this.mapglContributors.find(c => c.collection === this.mainFormService.getMainCollection());
      if (!mainMapContributor) {
        mainMapContributor = this.mapglContributors[0];
      }
      this.mainMapContributor = mainMapContributor;
    }
  }

  public ngAfterViewInit() {
    this.onMapLoadSub = this.mapglComponent.onMapLoaded.subscribe(isLoaded => {
      if (isLoaded && !!this.mapglContributors) {
        this.mapglContributors.forEach(mapglContributor => {
          mapglContributor.updateData = true;
          mapglContributor.fetchData(null);
          mapglContributor.setSelection(null, this.collaborativeService.getCollaboration(mapglContributor.identifier));
        });
      }
    });
    this.cdr.detectChanges();
  }

  public ngOnDestroy() {
    this.mapglComponent = null;
    this.onMapLoadSub.unsubscribe();
  }

  public changeVisualisation(event) {
    this.mapglContributors.forEach(contrib => contrib.changeVisualisation(event));
  }

  public onChangeAoi(event) {
    const configDebounceTime = this.configService.getValue('arlas.server.debounceCollaborationTime');
    const debounceDuration = configDebounceTime !== undefined ? configDebounceTime : 750;
    this.mapglContributors.forEach((contrib, i) => {
      setTimeout(() => {
        contrib.onChangeAoi(event);
      }, i * (debounceDuration + 100));
    });
  }

  public onMove(event) {
    this.mapglContributors.forEach(contrib => contrib.onMove(event, true));
  }

  public savePreview() {
    let img;
    const mapCanvas = this.mapglComponent.map.getCanvas();
    const maxWidth = 300;
    const maxHeight = 150;
    const widthScale = maxWidth / mapCanvas.width;
    const heightScale = maxHeight / mapCanvas.height;

    if (widthScale > 1 && heightScale > 1) {
      img = mapCanvas.toDataURL('image/png');
    } else {
      const rescaledCanvas = document.createElement('canvas');
      const context = rescaledCanvas.getContext('2d');
      const scale = Math.min(widthScale, heightScale);
      rescaledCanvas.width = mapCanvas.width * scale;
      rescaledCanvas.height = mapCanvas.height * scale;
      rescaledCanvas.style.width = '100%';
      rescaledCanvas.style.height = '100%';
      context.scale(scale, scale);
      context.drawImage(mapCanvas, 0, 0);
      img = rescaledCanvas.toDataURL('image/png');
    }
    this.mapglComponent.map.resize();
    if (!!this.mainFormService.configurationName) {
      const name = this.mainFormService.configurationName.concat('_preview');
      this.persistenceService.existByZoneKey('preview', name).subscribe(
        exist => {
          this.persistenceService.get(this.configId).subscribe({
            next: (currentConfig) => {
              let previewReaders = [];
              let previewWriters = [];
              if (currentConfig.doc_readers) {
                previewReaders = currentConfig.doc_readers.map(reader => reader.replace('config.json', 'preview'));
              }
              if (currentConfig.doc_writers) {
                previewWriters = currentConfig.doc_writers.map(writer => writer.replace('config.json', 'preview'));
              }
              if (exist.exists) {
                this.persistenceService.getByZoneKey('preview', name).subscribe({
                  next: (data) => {
                    this.persistenceService.update(data.id, img, new Date(data.last_update_date).getTime(), name,
                      previewReaders, previewWriters);
                    this.snackbar.open(
                      this.translate.instant('Preview updated !')
                    );
                  },
                  error: (e) => {
                    this.snackbar.open(
                      this.translate.instant('Cannot update the preview')
                    );
                  }
                });
              } else {
                this.persistenceService.create(
                  ZONE_PREVIEW,
                  name,
                  img,
                  previewReaders,
                  previewWriters
                ).subscribe({
                  next: () => {
                    this.snackbar.open(
                      this.translate.instant('Preview saved !')
                    );
                  },
                  error: (e) => {
                    this.snackbar.open(
                      this.translate.instant('Cannot create the preview')
                    );
                  }
                });
              }
            },
            error: (e) => {
              this.snackbar.open(
                this.translate.instant('Cannot fetch current config')
              );
            }
          });


        }
      );
    } else {
      this.snackbar.open(
        this.translate.instant('Cannot save Preview: You need to save the dashboard first')
      );
    }
  }
}
