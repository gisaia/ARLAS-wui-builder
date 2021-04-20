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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { ImportLayerDialogComponent } from '@map-config/components/import-layer-dialog/import-layer-dialog.component';
import { MapImportService } from '@map-config/services/map-import/map-import.service';
import { MapLayerFormBuilderService, MapLayerFormGroup } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import {
  MapVisualisationFormBuilderService
} from '@map-config/services/map-visualisation-form-builder/map-visualisation-form-builder.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { ConfigMapExportHelper, VISIBILITY } from '@services/main-form-manager/config-map-export-helper';
import { Config } from '@services/main-form-manager/models-config';
import { Layer as LayerMap } from '@services/main-form-manager/models-map-config';
import { ARLAS_ID, MainFormService } from '@services/main-form/main-form.service';
import { StartupService } from '@services/startup/startup.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { camelize } from '@utils/tools';
import { MapglLegendComponent, VisualisationSetConfig } from 'arlas-web-components';
import { ArlasCollaborativesearchService, ArlasColorGeneratorLoader, ArlasConfigService } from 'arlas-wui-toolkit';
import { ContributorBuilder } from 'arlas-wui-toolkit/services/startup/contributorBuilder';
import { Subscription } from 'rxjs';
import { PreviewComponent } from '../preview/preview.component';

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

  public displayedColumns: string[] = ['representation', 'name', 'mode', 'visualisationSet', 'collection', 'zoom', 'nbFeature', 'action'];
  public layersFa: FormArray;
  public visualisationSetFa: FormArray;

  public layerLegend: Map<string, { layer: any, colorLegend: any }> = new Map();

  public layerVs: Map<string, string[]> = new Map();

  private previewSub: Subscription;
  private confirmDeleteSub: Subscription;
  public toUnsubscribe: Array<Subscription> = [];

  constructor(
    protected mainFormService: MainFormService,
    public dialog: MatDialog,
    private collaborativesearchService: ArlasCollaborativesearchService,
    private configService: ArlasConfigService,
    private startupService: StartupService,
    private collectionService: CollectionService,
    private mapImportService: MapImportService,
    private colorService: ArlasColorGeneratorLoader,
    private mapLayerFormBuilder: MapLayerFormBuilderService,
    protected mapVisualisationFormBuilder: MapVisualisationFormBuilderService,
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
        layer.arlasId + '#' + layer.mode,
        { layer: this.getLayer(layer, modeValues, paint), colorLegend: this.getColorLegend(paint) }
      );

      const includeIn = [];
      this.visualisationSetFa.value.forEach(vs => {
        if (!!(vs.layers as string[]).find(l => l === layer.arlasId)) {
          includeIn.push(vs.name);
        }
      });

      this.layerVs.set(layer.arlasId, includeIn);
    });
  }

  public ngOnDestroy() {
    if (this.confirmDeleteSub) { this.confirmDeleteSub.unsubscribe(); }
    if (this.previewSub) { this.previewSub.unsubscribe(); }
    this.toUnsubscribe.forEach(u => u.unsubscribe());
  }

  public getLayer(layerFg, modeValues, paint) {

    const sourceName = layerFg.mode === LAYER_MODE.features ? 'feature' :
      (layerFg.mode === LAYER_MODE.featureMetric ? 'feature-metric' : 'cluster');

    const layer: LayerMap = {
      id: layerFg.arlasId,
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

  public confirmDelete(layerId: number, arlasId: string): void {
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
          layersSet.delete(arlasId);
          /** to preserve layers order */
          const layers = [];
          vs.layers.forEach(l => {
            if (layersSet.has(l)) {
              layers.push(l);
            }
          });
          vs.layers = layers;
        });
        this.visualisationSetFa.setValue(visualisationSetValue);
      }
    });
  }

  public duplicate(layerId: number, arlasId: string): void {
    /** Get the layerFg to duplicatte */
    const formGroupIndex = (this.layersFa.value as any[]).findIndex(el => el.id === layerId);
    const layerFg = this.layersFa.at(formGroupIndex) as MapLayerFormGroup;
    const newId = ARLAS_ID + layerFg.customControls.name.value + ' copy' + ':' + Date.now();
    /** Add the new layer to the same visualisation sets of the original one */
    const visualisationSetValue = this.visualisationSetFa.value;
    visualisationSetValue.forEach(vs => {
      const layersSet = new Set(vs.layers);
      const ls = [];
      /** to preserve layers order */
      vs.layers.forEach(l => {
        if (layersSet.has(l)) {
          ls.push(l);
        }
      });
      /** adds the new duplicated layer add the end of list of layers of the visualisation set */
      if (layersSet.has(arlasId)) {
        ls.push(newId);
      }
      vs.layers = ls;
    });
    /** we now should build a new layer form group for the new one  */
    const newLayerFg = this.mapLayerFormBuilder.buildLayer();
    /** the easiest way I found is to export the original layer and then re-import it in order to initialize correctly
     * all the subcontrols of the layer fg
     */
    const layerSource = ConfigExportHelper.getLayerSourceConfig(layerFg);
    layerSource.id = newId;
    layerSource.name = layerFg.customControls.name.value + ' copy';
    const layer = ConfigMapExportHelper.getLayer(layerFg, this.colorService, this.collectionService.taggableFields);
    layer.id = newId;
    const filtersFa: FormArray = new FormArray([], []);
    this.mapImportService.importMapFilters(layerSource, filtersFa);
    MapImportService.importLayerFg(layer, layerSource,
      this.mainFormService.getCollections()[0], layerId + 1, visualisationSetValue, newLayerFg, filtersFa);
    const modeValues = newLayerFg.customControls.mode.value === LAYER_MODE.features ? newLayerFg.customControls.featuresFg.value :
      (newLayerFg.customControls.mode.value === LAYER_MODE.featureMetric ?
        newLayerFg.customControls.featureMetricFg.value : newLayerFg.customControls.clusterFg.value);
    const paint = ConfigMapExportHelper.getLayerPaint(modeValues,
      newLayerFg.customControls.mode.value, this.colorService, this.collectionService.taggableFields);
    /** Add the duplicated layer to legend set in order to have the icon */
    this.layerLegend.set(
      newId + '#' + newLayerFg.customControls.mode.value,
      { layer: this.getLayer(layer, modeValues, paint), colorLegend: this.getColorLegend(paint) }
    );
    newLayerFg.markAsPristine();
    /** listen to all the ondepencychnage to correctly initiate the controls */
    ConfigFormGroupComponent.listenToAllControlsOnDependencyChange(newLayerFg, this.toUnsubscribe);
    this.layersFa.insert(formGroupIndex + 1, newLayerFg);
    this.layersFa.markAllAsTouched();
    /** reattribute ids to all layers to have id unicity */
    const layers = this.layersFa.value;
    for (let i = 0; i < layers.length; i++) {
      const lfg = this.layersFa.at(i) as MapLayerFormGroup;
      lfg.customControls.id.setValue(i);
      this.layersFa.setControl(i, lfg);
    }
    this.visualisationSetFa.setValue(visualisationSetValue);
  }

  public preview(layerId: number, arlasId: string): void {
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
      mapConfigVisualisations, mapConfigBasemaps, arlasId);
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

  public importLayer() {
    const dialogRef = this.dialog.open(ImportLayerDialogComponent);
    dialogRef.afterClosed().subscribe((data: [LayerMap, Config]) => {
      const layer = data[0];
      const config = data[1];
      if (!!layer) {
        const items = layer.id.split(':');
        const newItems = items.slice(0, items.length - 1);
        newItems.push(Date.now().toString());
        const newId = newItems.join(':');
        const visualisationSetValue = this.visualisationSetFa.value;

        if (this.visualisationSetFa.length === 0) {
          const visualisationFg = this.mapVisualisationFormBuilder.buildVisualisation();
          visualisationFg.customControls.displayed.setValue(true);
          visualisationFg.customControls.name.setValue('All layers');
          visualisationFg.customControls.layers.setValue([newId]);
          visualisationFg.customControls.id.setValue(0);
          this.visualisationSetFa.insert(0, visualisationFg);
        } else {
          visualisationSetValue[0].layers.push(newId);
        }

        const mapContrib = config.arlas.web.contributors.find(c => c.identifier === 'mapbox');
        const layersSources = mapContrib.layers_sources;
        const visualisationSets: Array<VisualisationSetConfig> = config.arlas.web.components.mapgl.input.visualisations_sets;

        let layerFg = this.mapLayerFormBuilder.buildLayer();
        const layerSource = layersSources.find(s => s.id === layer.id);
        layerSource.id = newId;
        const filtersFa: FormArray = new FormArray([], []);
        this.mapImportService.importMapFilters(layerSource, filtersFa);
        layerFg = MapImportService.importLayerFg(
          layer,
          layerSource,
          this.mainFormService.getCollections()[0],
          this.mainFormService.mapConfig.getLayersFa().length + 1,
          visualisationSets,
          layerFg,
          filtersFa
        );
        const modeValues = layerFg.customControls.mode.value === LAYER_MODE.features ? layerFg.customControls.featuresFg.value :
          (layerFg.customControls.mode.value === LAYER_MODE.featureMetric ?
            layerFg.customControls.featureMetricFg.value : layerFg.customControls.clusterFg.value);
        const paint = ConfigMapExportHelper.getLayerPaint(modeValues,
          layerFg.customControls.mode.value, this.colorService, this.collectionService.taggableFields);

        /** Add the duplicated layer to legend set in order to have the icon */
        this.layerLegend.set(
          newId + '#' + layerFg.customControls.mode.value,
          { layer: this.getLayer(layer, modeValues, paint), colorLegend: this.getColorLegend(paint) }
        );
        layerFg.markAsPristine();

        /** listen to all the ondepencychnage to correctly initiate the controls */
        ConfigFormGroupComponent.listenToAllControlsOnDependencyChange(layerFg, this.toUnsubscribe);

        // Add the layer to the list
        this.mainFormService.mapConfig.getLayersFa().push(layerFg);
      }
    });
  }

  public camelize(text: string): string {
    return camelize(text);
  }
}
