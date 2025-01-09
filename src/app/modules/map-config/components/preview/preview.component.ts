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

import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { ConfigMapExportHelper } from '@services/main-form-manager/config-map-export-helper';
import { MainFormService } from '@services/main-form/main-form.service';
import { StartupService, ZONE_PREVIEW } from '@services/startup/startup.service';
import { FeatureCollection } from '@turf/helpers';
import { ArlasMapComponent, ArlasMapFrameworkService } from 'arlas-map';
import { DataWithLinks } from 'arlas-persistence-api';
import { ArlasColorService } from 'arlas-web-components';
import { MapContributor } from 'arlas-web-contributors';
import { OnMoveResult } from 'arlas-web-contributors/models/models';
import {
  ArlasCollaborativesearchService, ArlasConfigService,
  ArlasSettingsService, ContributorBuilder, PersistenceService
} from 'arlas-wui-toolkit';
import {
  AddLayerObject, CanvasSourceSpecification,
  GeoJSONSource, MapOptions,
  RasterSourceSpecification, SourceSpecification, TypedStyleLayer
} from 'maplibre-gl';
import { MaplibreSourceType } from 'arlas-maplibre';


import { catchError, map, merge, Observable, of, Subscription, throwError } from 'rxjs';
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
  @ViewChild('map', { static: false }) public mapComponent: ArlasMapComponent<TypedStyleLayer | AddLayerObject,
    MaplibreSourceType | GeoJSONSource | RasterSourceSpecification | SourceSpecification | CanvasSourceSpecification, MapOptions>;

  private onMapLoadSub: Subscription;
  public mapDataSources;
  public mapRedrawSources;
  public mapLegendUpdater;
  public mapVisibilityUpdater;
  public mainMapContributor: MapContributor;

  public constructor(
    protected mainFormService: MainFormService,
    public collaborativeService: ArlasCollaborativesearchService,
    private readonly configService: ArlasConfigService,
    private readonly startupService: StartupService,
    private readonly collectionService: CollectionService,
    private readonly colorService: ArlasColorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly persistenceService: PersistenceService,
    private readonly snackbar: MatSnackBar,
    private readonly translate: TranslateService,
    private readonly settingsService: ArlasSettingsService,
    private readonly mapFrameworkService: ArlasMapFrameworkService<TypedStyleLayer | AddLayerObject,
      MaplibreSourceType | GeoJSONSource | RasterSourceSpecification | SourceSpecification | CanvasSourceSpecification, MapOptions>,
    @Inject(MAT_DIALOG_DATA) public dataMap: MapglComponentInput
  ) {
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
      const configMap = ConfigMapExportHelper.process(mapConfigLayers, this.colorService, this.collectionService.taggableFieldsMap);
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
        console.log(mapConfig);
        this.collaborativeService.describe('courses').subscribe();
        console.log(this.collaborativeService)

        const mapContributor = ContributorBuilder.buildContributor('map',
          mapConfig.identifier,
          this.configService,
          this.collaborativeService,
          this.settingsService,
          this.colorService);
        console.log(mapContributor);
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
      this.mapDataSources = this.mapglContributors.map(c => c.dataSources).reduce((set1, set2) => new Set([...set1, ...set2]), new Set());
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
    this.onMapLoadSub = this.mapComponent.onMapLoaded.subscribe(isLoaded => {
      if (isLoaded && !!this.mapglContributors) {
        this.mapComponent.map.resize();
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
    this.mapComponent = null;
    this.onMapLoadSub.unsubscribe();
  }

  public changeVisualisation(event: Set<string>) {
    this.mapglContributors.forEach(contrib => contrib.changeVisualisation(event));
  }

  public onChangeAoi(event: FeatureCollection<GeoJSON.Geometry>) {
    const configDebounceTime = this.configService.getValue('arlas.server.debounceCollaborationTime');
    const debounceDuration = configDebounceTime !== undefined ? configDebounceTime : 750;
    this.mapglContributors.forEach((contrib, i) => {
      setTimeout(() => {
        contrib.onChangeAoi(event as FeatureCollection);
      }, i * (debounceDuration + 100));
    });
  }

  public onMove(event: OnMoveResult) {
    this.mapglContributors.forEach(contrib => contrib.onMove(event, true));
  }

  public savePreview() {
    let img;
    const mapCanvas = this.mapFrameworkService.getCanvas(this.mapComponent.map);
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
    const jsonifiedImg = JSON.stringify({ img });
    this.mapComponent.map.resize();
    const resourcesConfig = this.mainFormService.resourcesConfig.getFg();
    const previewId = resourcesConfig.customControls.resources.previewId.value;
    if (!!this.mainFormService.configurationId) {
      this.persistenceService.get(this.mainFormService.configurationId).pipe(
        map((currentConfig: DataWithLinks) => {
          const name = this.mainFormService.configurationName.concat('_preview');
          const pGroups = this.persistenceService.dashboardToResourcesGroups(currentConfig.doc_readers, currentConfig.doc_writers);
          return this.previewExists$(previewId)
            .pipe(
              map(exists => this.createOrUpdatePreview$(exists, previewId, jsonifiedImg, name, pGroups.readers, pGroups.writers)))
            .subscribe({
              complete: () => this.snackbar.open(this.translate.instant('Preview saved !'))
            });
        })
      ).subscribe();
    } else {
      resourcesConfig.customControls.resources.previewValue.setValue(jsonifiedImg);
      this.snackbar.open(
        this.translate.instant('Preview saved temporarily. Save the dashboard to validate the preview too.')
      );
    }
  }

  private previewExists$(previewId): Observable<boolean> {
    if (!previewId || previewId === '') {
      return of(false);
    } else {
      return this.persistenceService.exists(previewId).pipe(map(r => r.exists));
    }
  }

  private createOrUpdatePreview$(previewExists: boolean, previewId: string, img, name: string, previewReaders?, previewWriters?) {
    const resourcesConfig = this.mainFormService.resourcesConfig.getFg();
    resourcesConfig.customControls.resources.previewValue.setValue(img);
    if (previewExists) {
      this.persistenceService.updateResource(previewId, previewReaders, previewWriters, img);
      resourcesConfig.customControls.resources.previewId.setValue(previewId);
    } else {
      this.persistenceService.create(ZONE_PREVIEW, name, img, previewReaders, previewWriters)
        .pipe(map((p: DataWithLinks) => {
          resourcesConfig.customControls.resources.previewId.setValue(p.id);
          return p;
        }))
        .pipe(catchError((err) => this.catchPreviewError(err, 'Cannot update the preview'))).subscribe();
    }
  }

  private catchPreviewError(err, msg) {
    this.snackbar.open(
      this.translate.instant(msg)
    );
    return throwError(() => new Error(err));
  }

}
