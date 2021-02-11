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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { PreviewComponent } from '../preview/preview.component';
import { ContributorBuilder } from 'arlas-wui-toolkit/services/startup/contributorBuilder';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { FormArray } from '@angular/forms';
import { StartupService } from '@services/startup/startup.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { ConfigMapExportHelper, VISIBILITY } from '@services/main-form-manager/config-map-export-helper';
import { camelize } from '@utils/tools';
import { MapglLegendComponent } from 'arlas-web-components';
import { Layer as LayerMap } from '@services/main-form-manager/models-map-config';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { CollectionService } from '@services/collection-service/collection.service';
import { Subscription } from 'rxjs';

export interface Layer {
  id: string;
  name: string;
  mode: string;
}

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss']
})
export class LayersComponent implements OnInit, OnDestroy {

  public displayedColumns: string[] = ['representation', 'name', 'mode', 'collection', 'zoom', 'nbFeature', 'action'];
  public layersFa: FormArray;
  public visualisationSetFa: FormArray;

  public layerLegend: Map<string, { layer: any, colorLegend: any }> = new Map();

  private previewSub: Subscription;
  private confirmDeleteSub: Subscription;

  constructor(
    protected mainFormService: MainFormService,
    public dialog: MatDialog,
    private collaborativesearchService: ArlasCollaborativesearchService,
    private configService: ArlasConfigService,
    private startupService: StartupService,
    private collectionService: CollectionService,
    private colorService: ArlasColorGeneratorLoader

  ) {
    this.layersFa = this.mainFormService.mapConfig.getLayersFa();
    this.visualisationSetFa = this.mainFormService.mapConfig.getVisualisationsFa();
  }

  public ngOnInit() {
    this.layersFa.value.map(layer => {
      const modeValues = layer.mode === LAYER_MODE.features ? layer.featuresFg :
        (layer.mode === LAYER_MODE.featureMetric ? layer.featureMetricFg : layer.clusterFg);
      const paint = ConfigMapExportHelper.getLayerPaint(modeValues, layer.mode, this.colorService, this.collectionService.taggableFields);
      this.layerLegend.set(
        layer.name + '#' + layer.mode,
        { layer: this.getLayer(layer, modeValues, paint), colorLegend: this.getColorLegend(paint) }
      );
    });
  }

  public ngOnDestroy() {
    if (this.confirmDeleteSub) { this.confirmDeleteSub.unsubscribe(); }
    if (this.previewSub) { this.previewSub.unsubscribe(); }
  }

  public getLayer(layerFg, modeValues, paint) {

    const sourceName = layerFg.mode === LAYER_MODE.features ? 'feature' :
      (layerFg.mode === LAYER_MODE.featureMetric ? 'feature-metric' : 'cluster');

    const layer: LayerMap = {
      id: layerFg.name,
      type: modeValues.styleStep.geometryType,
      source: sourceName,
      minzoom: modeValues.visibilityStep.zoomMin,
      maxzoom: modeValues.visibilityStep.zoomMax,
      layout: {
        visibility: modeValues.visibilityStep.visible ? VISIBILITY.visible : VISIBILITY.none
      },
      paint,
      filter: modeValues.styleStep.filter
    };
    return layer;
  }

  public getColorLegend(paint) {
    const styleColor = paint['circle-color'] || paint['heatmap-color'] || paint['fill-color'] || paint['line-color'];
    const colorLegend = MapglLegendComponent.buildColorLegend(styleColor as any, true, null);
    return colorLegend[0];
  }

  public confirmDelete(layerId: number, layerName: string): void {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: 'delete the layer' }
    });

    this.confirmDeleteSub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const formGroupIndex = (this.layersFa.value as any[]).findIndex(el => el.id === layerId);
        this.layersFa.removeAt(formGroupIndex);
        // remove layer from visualisation set
        const visualisationSetValue = this.visualisationSetFa.value;
        visualisationSetValue.forEach(vs => {
          const layersSet = new Set(vs.layers);
          layersSet.delete(layerName);
          vs.layers = Array.from(layersSet);
        });
        this.visualisationSetFa.setValue(visualisationSetValue);
      }
    });
  }

  public preview(layerId: number, layerName: string): void {
    // Get contributor conf part for this layer
    const formGroupIndex = (this.layersFa.value as any[]).findIndex(el => el.id === layerId);
    const mapConfigGlobal = this.mainFormService.mapConfig.getGlobalFg();
    const mapConfigLayers = new FormArray([this.layersFa.at(formGroupIndex)]);
    const mapConfigVisualisations = this.mainFormService.mapConfig.getVisualisationsFa();
    const mapConfigBasemaps = this.mainFormService.mapConfig.getBasemapsFg();
    // Get config.map part for this layer
    const configMap = ConfigMapExportHelper.process(mapConfigLayers, this.colorService, this.collectionService.taggableFields);
    // Get contributor config for this layer
    const contribConfig = ConfigExportHelper.getMapContributor(mapConfigGlobal, mapConfigLayers);
    // Add contributor part in arlasConfigService
    // Add web contributors in config if not exist
    const currentConfig = this.startupService.getConfigWithInitContrib();
    // update arlasConfigService with layer info
    // Create mapcontributor
    const mapContributor = currentConfig.arlas.web.contributors.find(c => c.type = 'map');
    if (mapContributor) {
      currentConfig.arlas.web.contributors.splice(currentConfig.arlas.web.contributors.indexOf(mapContributor), 1);
    }
    currentConfig.arlas.web.contributors.push(contribConfig);
    this.configService.setConfig(currentConfig);
    const contributor = ContributorBuilder.buildContributor('map',
      'mapbox',
      this.configService,
      this.collaborativesearchService,
      this.colorService);
    const mapComponentConfigValue = ConfigExportHelper.getMapComponent(mapConfigGlobal, mapConfigLayers,
      mapConfigVisualisations, mapConfigBasemaps, layerName);
    mapComponentConfigValue.input.mapLayers.layers = configMap.layers;
    const dialogRef = this.dialog.open(PreviewComponent, {
      panelClass: 'map-preview',
      width: '80%',
      height: '80%',
      data: {
        mapglContributor: contributor,
        mapComponentConfig: mapComponentConfigValue
      }
    });
    this.previewSub = dialogRef.afterClosed().subscribe(() => {
      // TODO Clean ArlasConfigService
      this.collaborativesearchService.registry.clear();
    });
  }

  public camelize(text: string): string {
    return camelize(text);
  }
}
