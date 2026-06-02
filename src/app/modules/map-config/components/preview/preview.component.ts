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
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { ConfigMapExportHelper } from '@services/main-form-manager/config-map-export-helper';
import { MapComponentInputConfig, MapglComponentConfig } from '@services/main-form-manager/models-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { StartupService, ZONE_PREVIEW } from '@services/startup/startup.service';
import { ArlasLayer, ArlasSource } from '@utils/tools';
import { ArlasDataLayer, ArlasMapComponent, ArlasMapFrameworkService } from 'arlas-map';
import { DataWithLinks } from 'arlas-persistence-api';
import { ArlasColorService } from 'arlas-web-components';
import { MapContributor } from 'arlas-web-contributors';
import { ArlasGeometry } from 'arlas-web-contributors/contributors/MapContributor';
import { OnMoveResult } from 'arlas-web-contributors/models/models';
import {
  ArlasCollaborativesearchService, ArlasConfigService,
  ArlasSettingsService, ContributorBuilder, PersistenceService
} from 'arlas-wui-toolkit';
import { FeatureCollection, Geometry } from 'geojson';
import {
  MapOptions
} from 'maplibre-gl';
import { catchError, map, merge, Observable, of, Subscription, throwError } from 'rxjs';

export interface MapglComponentInput {
  mapglContributors: MapContributor[];
  mapComponentConfig: MapglComponentConfig;
}

@Component({
  selector: 'arlas-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  imports: [
    ArlasMapComponent,
    MatButtonModule,
    MatTooltipModule,
    TranslatePipe,
    MatIconModule
  ]
})
export class PreviewComponent implements AfterViewInit, OnDestroy {

  @Input() public mapComponentConfig: MapComponentInputConfig;
  @Input() public mapglContributors: MapContributor[] = [];
  @ViewChild('map', { static: false }) public mapComponent: ArlasMapComponent<ArlasLayer, ArlasSource, MapOptions>;

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
    private readonly mapFrameworkService: ArlasMapFrameworkService<ArlasLayer, ArlasSource, MapOptions>,
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
        const mapContributor = ContributorBuilder.buildContributor('map',
          mapConfig.identifier,
          this.configService,
          this.collaborativeService,
          this.settingsService,
          this.colorService);
        contributors.push(mapContributor);
      });
      const mapComponentConfig = ConfigExportHelper.getMapComponent(
        mapConfigGlobal,
        mapConfigLayers,
        mapConfigVisualisations,
        mapConfigBasemaps
      );
      mapComponentConfig.input.mapLayers.layers = configMap.layers as ArlasDataLayer[];

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

  public onChangeAoi(event: FeatureCollection<Geometry>) {
    const configDebounceTime = this.configService.getValue('arlas.server.debounceCollaborationTime');
    const debounceDuration = configDebounceTime !== undefined ? configDebounceTime : 750;
    this.mapglContributors.forEach((contrib, i) => {
      setTimeout(() => {
        contrib.onChangeAoi(event as FeatureCollection<ArlasGeometry>);
      }, i * (debounceDuration + 100));
    });
  }

  public onMove(event: OnMoveResult) {
    this.mapglContributors.forEach(contrib => contrib.onMove(event, true));
  }

  public savePreview() {
    const mapCanvas = this.mapFrameworkService.getCanvas(this.mapComponent.map);
    const img = this.exportPreviewWithProgressiveDownscale(mapCanvas, 484, 150, 2);
    const jsonifiedImg = JSON.stringify({ img });
    this.mapComponent.map.resize();
    const resourcesConfig = this.mainFormService.resourcesConfig.getFg();
    const previewId = resourcesConfig.customControls.resources.previewId.value;

    if (this.mainFormService.configurationId) {
      this.persistenceService.get(this.mainFormService.configurationId).pipe(
        map((currentConfig: DataWithLinks) => {
          const name = this.mainFormService.configurationName.concat('_preview');
          const alreadySaved = !!JSON.parse(currentConfig.doc_value).resources?.previewId;
          const pGroups = this.persistenceService.dashboardToResourcesGroups(currentConfig.doc_readers, currentConfig.doc_writers);
          return this.previewExists$(previewId)
            .pipe(
              map(exists => this.createOrUpdatePreview$(exists, previewId, jsonifiedImg, name, pGroups.readers, pGroups.writers)))
            .subscribe({
              complete: () => {
                if (alreadySaved) {
                  this.snackbar.open(this.translate.instant('Preview saved !'));
                } else {
                  this.snackbar.open(this.translate.instant('Preview saved temporarily. Save the dashboard to validate the preview too.'));
                }
              }
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

  private previewExists$(previewId: string): Observable<boolean> {
    if (!previewId) {
      return of(false);
    } else {
      return this.persistenceService.exists(previewId).pipe(map(r => r.exists));
    }
  }

  private createOrUpdatePreview$(previewExists: boolean, previewId: string, img: string,
    name: string, previewReaders: string[], previewWriters: string[]
  ) {
    const resourcesConfig = this.mainFormService.resourcesConfig.getFg();
    resourcesConfig.customControls.resources.previewValue.setValue(img);
    if (previewExists) {
      this.persistenceService.updateResource(previewId, previewReaders, previewWriters, img);
      resourcesConfig.customControls.resources.previewId.setValue(previewId);
      resourcesConfig.customControls.resources.previewValue.setValue(img);
    } else {
      this.persistenceService.create(ZONE_PREVIEW, name, img, previewReaders, previewWriters)
        .pipe(map((p: DataWithLinks) => {
          resourcesConfig.customControls.resources.previewId.setValue(p.id);
          resourcesConfig.customControls.resources.previewValue.setValue(img);
          return p;
        }))
        .pipe(catchError((err) => this.catchPreviewError(err, marker('Cannot update the preview')))).subscribe();
    }
  }

  private catchPreviewError(err, msg: string) {
    this.snackbar.open(
      this.translate.instant(msg)
    );
    return throwError(() => new Error(err));
  }

  private exportPreviewWithProgressiveDownscale(
    mapCanvas: HTMLCanvasElement,
    // 484 is the max width size of an image in css of the hub
    targetCssWidth = 484,
    // 150 is the height size of an image in css of the hub
    targetCssHeight = 150,
    // enhance resolution by factor 2
    pixelRatio = 2
  ): string {
    // Final exported size
    const finalWidth = Math.round(targetCssWidth * pixelRatio);
    const finalHeight = Math.round(targetCssHeight * pixelRatio);
    // Source canvas size
    const srcWidth = mapCanvas.width;
    const srcHeight = mapCanvas.height;
    // Compare source ratio with destination ratio
    const srcRatio = srcWidth / srcHeight;
    const dstRatio = finalWidth / finalHeight;
    // Crop the source canvas so it matches the preview ratio exactly
    // A perfect match between ratios allows to remove object-fit css rule in hub (This can make the image blurry. )
    let sx = 0;
    let sy = 0;
    let sw = srcWidth;
    let sh = srcHeight;
    if (srcRatio > dstRatio) {
      // Source is wider than destination ratio:
      // crop left and right sides
      sw = Math.round(srcHeight * dstRatio);
      sx = Math.round((srcWidth - sw) / 2);
    } else if (srcRatio < dstRatio) {
      // Source is taller than destination ratio:
      // crop top and bottom
      sh = Math.round(srcWidth / dstRatio);
      sy = Math.round((srcHeight - sh) / 2);
    }
    // Draw the cropped area into an intermediate canvas
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = sw;
    croppedCanvas.height = sh;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) {
      throw new Error('Canvas 2D context unavailable');
    }
    croppedCtx.imageSmoothingEnabled = true;
    croppedCtx.imageSmoothingQuality = 'high';
    croppedCtx.drawImage(
      mapCanvas,
      sx, sy, sw, sh,
      0, 0, sw, sh
    );
    // Downscale progressively for better quality on image
    const resizedCanvas = this.downscaleCanvasProgressively(croppedCanvas, finalWidth, finalHeight);
    // Export to PNG data url
    return resizedCanvas.toDataURL('image/png');
  }

  private downscaleCanvasProgressively(
    sourceCanvas: HTMLCanvasElement,
    targetWidth: number,
    targetHeight: number
  ): HTMLCanvasElement {
    // Copy the source canvas
    let currentCanvas = document.createElement('canvas');
    currentCanvas.width = sourceCanvas.width;
    currentCanvas.height = sourceCanvas.height;
    const initialCtx = currentCanvas.getContext('2d');
    if (!initialCtx) {
      throw new Error('Canvas 2D context unavailable');
    }
    initialCtx.imageSmoothingEnabled = true;
    initialCtx.imageSmoothingQuality = 'high';
    initialCtx.drawImage(sourceCanvas, 0, 0);
    // Reduce the image by half repeatedly until we get close to the target size.
    // This usually gives a better result than one single large resize.
    while (
      currentCanvas.width / 2 > targetWidth &&
      currentCanvas.height / 2 > targetHeight
    ) {
      const nextCanvas = document.createElement('canvas');
      nextCanvas.width = Math.max(targetWidth, Math.round(currentCanvas.width / 2));
      nextCanvas.height = Math.max(targetHeight, Math.round(currentCanvas.height / 2));
      const nextCtx = nextCanvas.getContext('2d');
      if (!nextCtx) {
        throw new Error('Canvas 2D context unavailable');
      }
      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(
        currentCanvas,
        0, 0, currentCanvas.width, currentCanvas.height,
        0, 0, nextCanvas.width, nextCanvas.height
      );

      currentCanvas = nextCanvas;
    }
    // Final resize to the exact requested output size
    if (currentCanvas.width !== targetWidth || currentCanvas.height !== targetHeight) {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) {
        throw new Error('Canvas 2D context unavailable');
      }
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';
      finalCtx.drawImage(
        currentCanvas,
        0, 0, currentCanvas.width, currentCanvas.height,
        0, 0, targetWidth, targetHeight
      );
      return finalCanvas;
    }
    return currentCanvas;
  }

}
