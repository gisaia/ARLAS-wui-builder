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
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { ImportLayerDialogComponent } from '@map-config/components/import-layer-dialog/import-layer-dialog.component';
import { MapImportService } from '@map-config/services/map-import/map-import.service';
import { MapLayerFormBuilderService, MapLayerFormGroup } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import {
  MapVisualisationFormBuilderService
} from '@map-config/services/map-visualisation-form-builder/map-visualisation-form-builder.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { ConfigMapExportHelper } from '@services/main-form-manager/config-map-export-helper';
import { Config } from '@services/main-form-manager/models-config';
import { Layer as LayerMap } from '@services/main-form-manager/models-map-config';
import { ARLAS_ID, MainFormService } from '@services/main-form/main-form.service';
import { StartupService } from '@services/startup/startup.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { camelize } from '@utils/tools';
import { ArlasColorService, LayerMetadata, MapglLegendComponent, VisualisationSetConfig } from 'arlas-web-components';
import { MapContributor } from 'arlas-web-contributors';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasSettingsService, ContributorBuilder } from 'arlas-wui-toolkit';
import { Subscription } from 'rxjs';
import { PreviewComponent } from '../preview/preview.component';
import { MapGlobalFormBuilderService } from '@map-config/services/map-global-form-builder/map-global-form-builder.service';

export interface Layer {
  id: string;
  name: string;
  mode: string;
}

@Component({
  selector: 'arlas-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss']
})
export class LayersComponent implements OnInit, OnDestroy {

  public displayedColumns: string[] = ['representation', 'name', 'mode', 'visualisationSet', 'collection', 'zoom', 'nbFeature', 'action'];
  public layersFa: FormArray;
  public visualisationSetFa: FormArray;

  public layerLegend: Map<string, { layer: any; colorLegend: any; strokeColorLegend: any; lineDashArray: any; }> = new Map();

  public layerVs: Map<string, string[]> = new Map();

  private previewSub: Subscription;
  private confirmDeleteSub: Subscription;
  public toUnsubscribe: Array<Subscription> = [];

  public dataSource: MatTableDataSource<any>;
  public enableAddLayer = true;
  @ViewChild(MatSort, { static: true }) public sort: MatSort;

  public constructor(
    protected mainFormService: MainFormService,
    public dialog: MatDialog,
    private collaborativesearchService: ArlasCollaborativesearchService,
    private configService: ArlasConfigService,
    private startupService: StartupService,
    private collectionService: CollectionService,
    private mapImportService: MapImportService,
    private colorService: ArlasColorService,
    private mapLayerFormBuilder: MapLayerFormBuilderService,
    private mapGlobalFormBuilder: MapGlobalFormBuilderService,
    protected mapVisualisationFormBuilder: MapVisualisationFormBuilderService,
    private settingsService: ArlasSettingsService
  ) {
    this.layersFa = this.mainFormService.mapConfig.getLayersFa();
    this.visualisationSetFa = this.mainFormService.mapConfig.getVisualisationsFa();
    const collectionsWithCentroid = this.collectionService.getCollectionsWithCentroid();
    this.enableAddLayer = (!!collectionsWithCentroid && collectionsWithCentroid.length > 0);
  }

  public ngOnInit() {
    this.layersFa.value.map(layer => {
      const modeValues = layer.mode === LAYER_MODE.features ? layer.featuresFg :
        (layer.mode === LAYER_MODE.featureMetric ? layer.featureMetricFg : layer.clusterFg);
      const taggableFields = this.collectionService.taggableFieldsMap.get(layer.collection);
      const paint = ConfigMapExportHelper.getLayerPaint(modeValues, layer.mode, this.colorService, taggableFields);
      const layout = ConfigMapExportHelper.getLayerLayout(modeValues, layer.mode, this.colorService, taggableFields);
      const exportedLayer = this.getLayer(layer, modeValues, paint, layout, layer.collection, layer.collectionDisplayName,
        this.colorService, taggableFields);
      this.layerLegend.set(
        layer.arlasId + '#' + layer.mode,
        {
          layer: exportedLayer,
          colorLegend: this.getColorLegend(paint),
          strokeColorLegend: this.getStrokeColorLegend(paint, exportedLayer.metadata), lineDashArray: this.getLineDashArray(paint)
        }
      );

      const includeIn = [];
      this.visualisationSetFa.value.forEach(vs => {
        if (!!(vs.layers as string[]).find(l => l === layer.arlasId)) {
          includeIn.push(vs.name);
        }
      });

      this.layerVs.set(layer.arlasId, includeIn);
      layer.zoom = '[ ' + modeValues.visibilityStep.zoomMin + ' - ' + modeValues.visibilityStep.zoomMax + ' ]';
    });
    this.initDataSource();
  }

  public initDataSource() {
    this.dataSource = new MatTableDataSource(this.layersFa.value);
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data, filter: string) => {
      const dataStr = Object.keys(data)
        .reduce(
          (currentTerm: string, key: string) => {
            let value = (data as { [key: string]: any; })[key];
            if (key === 'visualisation') {
              value = (data as { [key: string]: any; })[key].filter(vs => vs.include).map(vs => vs.name).join(' ');
            }
            // Use an obscure Unicode character to delimit the words in the concatenated string.
            // This avoids matches where the values of two columns combined will match the user's query
            // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
            // that has a very low chance of being typed in by somebody in a text field. This one in
            // particular is "White up-pointing triangle with dot" from
            // https://en.wikipedia.org/wiki/List_of_Unicode_characters
            return currentTerm + value + '◬';
          },
          ''
        )
        .toLowerCase();

      // Transform the filter by converting it to lowercase and removing whitespace.
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) !== -1;
    };
  }

  public ngOnDestroy() {
    if (this.confirmDeleteSub) {
      this.confirmDeleteSub.unsubscribe();
    }
    if (this.previewSub) {
      this.previewSub.unsubscribe();
    }
    this.toUnsubscribe.forEach(u => u.unsubscribe());
  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public getLayer(layerFg, modeValues, paint, layout, collection: string, collectionDisplayName: string, colorService, taggableFields) {
    const sourceName = layerFg.mode === LAYER_MODE.features ? 'feature' :
      (layerFg.mode === LAYER_MODE.featureMetric ? 'feature-metric' : 'cluster');

    const layer: LayerMap = {
      id: layerFg.arlasId,
      type: modeValues.styleStep.geometryType === 'label' ? 'symbol' : modeValues.styleStep.geometryType,
      source: sourceName,
      minzoom: modeValues.visibilityStep.zoomMin,
      maxzoom: modeValues.visibilityStep.zoomMax,
      layout,
      paint,
      filter: modeValues.styleStep.filter,
      metadata: ConfigMapExportHelper.getLayerMetadata(collection, collectionDisplayName,
        layerFg.mode, modeValues, colorService, taggableFields)
    };
    return layer;
  }

  public getColorLegend(paint) {
    const styleColor = paint['circle-color'] || paint['heatmap-color'] || paint['fill-color'] || paint['line-color'] || paint['text-color'];
    const colorLegend = MapglLegendComponent.buildColorLegend(styleColor as any, true, null);
    return colorLegend[0];
  }

  public getStrokeColorLegend(paint, metadata: LayerMetadata) {
    const circleStyleColor = paint['circle-stroke-color'];
    if (!!circleStyleColor) {
      const colorLegend = MapglLegendComponent.buildColorLegend(circleStyleColor as any, true, null);
      return colorLegend[0];
    } else if (!!metadata && !!metadata.stroke) {
      const colorLegend = MapglLegendComponent.buildColorLegend(metadata.stroke.color as any, true, null);
      return colorLegend[0];
    }
  }

  public getLineDashArray(paint) {
    return paint['line-dasharray'];
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
        this.dataSource.data = this.layersFa.value;
        const mapGlobalFg = this.mainFormService.mapConfig.getGlobalFg();

        /** clean geofilters forms and rebuild them based on the left list of layers
         * if no layer is left, we keep the geo-filter related to the main collection
         */
        mapGlobalFg.updateGeoFiltersMap();
        mapGlobalFg.customControls.requestGeometries.clear();
        const declaredCollections = this.layersFa.value.map(l => l.collection);
        Array.from((new Set(declaredCollections))).sort().forEach((c: string) => {
          const collectionGeoFilter = mapGlobalFg.collectionGeoFiltersMap.get(c);
          mapGlobalFg.addGeoFilter(c, this.mapGlobalFormBuilder.buildRequestGeometry(
            c,
            collectionGeoFilter.geoField,
            collectionGeoFilter.geoOp
          ));
        });
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
    const newLayerFg = this.mapLayerFormBuilder.buildLayer(layerFg.customControls.collection.value);
    /** the easiest way I found is to export the original layer and then re-import it in order to initialize correctly
     * all the subcontrols of the layer fg
     */
    const layerSource = ConfigExportHelper.getLayerSourceConfig(layerFg);
    layerSource.id = newId;
    layerSource.name = layerFg.customControls.name.value + ' copy';
    const taggableFields = this.collectionService.taggableFieldsMap.get(layerFg.customControls.collection.value);
    const layer = ConfigMapExportHelper.getLayer(layerFg, this.colorService, taggableFields);
    layer.id = newId;
    const filtersFa: FormArray = new FormArray([], []);
    this.mapImportService.importMapFilters(layerSource, filtersFa, layerFg.customControls.collection.value);
    MapImportService.importLayerFg(layer, layerSource,
      layerFg.customControls.collection.value, layerId + 1, visualisationSetValue, newLayerFg, filtersFa);
    const modeValues = newLayerFg.customControls.mode.value === LAYER_MODE.features ? newLayerFg.customControls.featuresFg.value :
      (newLayerFg.customControls.mode.value === LAYER_MODE.featureMetric ?
        newLayerFg.customControls.featureMetricFg.value : newLayerFg.customControls.clusterFg.value);
    const paint = ConfigMapExportHelper.getLayerPaint(modeValues,
      newLayerFg.customControls.mode.value, this.colorService, taggableFields);
    const layout = ConfigMapExportHelper.getLayerLayout(modeValues,
      newLayerFg.customControls.mode.value, this.colorService, taggableFields);
    /** Add the duplicated layer to legend set in order to have the icon */
    const exportedLayer = this.getLayer(layer, modeValues, paint, layout, layerFg.customControls.collection.value,
      layerFg.customControls.collectionDisplayName.value,
      this.colorService, taggableFields);
    this.layerLegend.set(
      newId + '#' + newLayerFg.customControls.mode.value,
      {
        layer: exportedLayer, colorLegend: this.getColorLegend(paint),
        strokeColorLegend: this.getStrokeColorLegend(paint, exportedLayer.metadata), lineDashArray: this.getLineDashArray(paint)
      }
    );
    newLayerFg.markAsPristine();
    /** listen to all the ondepencychnage to correctly initiate the controls */
    ConfigFormGroupComponent.listenToAllControlsOnDependencyChange(newLayerFg, this.toUnsubscribe);
    this.layersFa.insert(formGroupIndex + 1, newLayerFg);
    this.layersFa.markAsUntouched();
    /** reattribute ids to all layers to have id unicity */
    const layers = this.layersFa.value;
    for (let i = 0; i < layers.length; i++) {
      const lfg = this.layersFa.at(i) as MapLayerFormGroup;
      lfg.customControls.id.setValue(i);
      this.layersFa.setControl(i, lfg);
    }
    this.visualisationSetFa.setValue(visualisationSetValue);
    /** redraw the list of layers */
    this.ngOnInit();
  }

  public preview(layerId: number, arlasId: string, collection: string): void {
    // Get contributor conf part for this layer
    const formGroupIndex = (this.layersFa.value as any[]).findIndex(el => el.id === layerId);
    const mapConfigGlobal = this.mainFormService.mapConfig.getGlobalFg();
    const mapConfigLayers = new FormArray([this.layersFa.at(formGroupIndex)]);
    const mapConfigVisualisations = this.mainFormService.mapConfig.getVisualisationsFa();
    const mapConfigBasemaps = this.mainFormService.mapConfig.getBasemapsFg();
    // Get config.map part for this layer
    const configMap = ConfigMapExportHelper.process(mapConfigLayers, this.colorService, this.collectionService.taggableFieldsMap);
    // Get contributor config for this layer
    const mapContribConfigs = ConfigExportHelper.getMapContributors(mapConfigGlobal, mapConfigLayers,
      collection, this.collectionService);
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
        this.collaborativesearchService,
        this.settingsService,
        this.colorService);
      contributors.push(mapContributor);
    });
    const mapComponentConfigValue = ConfigExportHelper.getMapComponent(mapConfigGlobal, mapConfigLayers,
      mapConfigVisualisations, mapConfigBasemaps, arlasId, true);
    mapComponentConfigValue.input.mapLayers.layers = configMap.layers;
    const dialogRef = this.dialog.open(PreviewComponent, {
      panelClass: 'map-preview',
      width: '80%',
      height: '80%',
      data: {
        mapglContributors: contributors,
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

        const mapContribs = config.arlas.web.contributors.filter(c => c.type === 'map');
        let layersSources = [];
        let collection;
        mapContribs.forEach(mapContrib => {
          layersSources = layersSources.concat(mapContrib.layers_sources);
          if (!collection) {
            const layerContributor = mapContrib.layers_sources.find(ls => ls.id === layer.id);
            if (!!layerContributor) {
              collection = mapContrib.collection;
            }
          }
        });
        const visualisationSets: Array<VisualisationSetConfig> = config.arlas.web.components.mapgl.input.visualisations_sets;
        let layerFg = this.mapLayerFormBuilder.buildLayer(collection);
        const layerSource = Object.assign({}, layersSources.find(s => s.id === layer.id));
        layerSource.id = newId;
        const filtersFa: FormArray = new FormArray([], []);
        this.mapImportService.importMapFilters(layerSource, filtersFa, collection);
        layerFg = MapImportService.importLayerFg(
          layer,
          layerSource,
          collection,
          this.mainFormService.mapConfig.getLayersFa().length + 1,
          visualisationSets,
          layerFg,
          filtersFa
        );
        const modeValues = layerFg.customControls.mode.value === LAYER_MODE.features ? layerFg.customControls.featuresFg.value :
          (layerFg.customControls.mode.value === LAYER_MODE.featureMetric ?
            layerFg.customControls.featureMetricFg.value : layerFg.customControls.clusterFg.value);
        const taggableFields = this.collectionService.taggableFieldsMap.get(layerFg.customControls.collection.value);
        const paint = ConfigMapExportHelper.getLayerPaint(modeValues,
          layerFg.customControls.mode.value, this.colorService, taggableFields);
        const layout = ConfigMapExportHelper.getLayerLayout(modeValues,
          layerFg.customControls.mode.value, this.colorService, taggableFields);

        /** Add the duplicated layer to legend set in order to have the icon */
        const exportedLayer = this.getLayer(layer, modeValues, paint, layout,
          collection, layerFg.customControls.collectionDisplayName.value, this.colorService, taggableFields);
        this.layerLegend.set(
          newId + '#' + layerFg.customControls.mode.value,
          {
            layer: exportedLayer, colorLegend: this.getColorLegend(paint),
            strokeColorLegend: this.getStrokeColorLegend(paint, exportedLayer.metadata), lineDashArray: this.getLineDashArray(paint)
          }
        );
        layerFg.markAsPristine();

        /** listen to all the ondepencychnage to correctly initiate the controls */
        ConfigFormGroupComponent.listenToAllControlsOnDependencyChange(layerFg, this.toUnsubscribe);

        // Add the layer to the list
        this.mainFormService.mapConfig.getLayersFa().push(layerFg);
        // add the collection to the list of geofilters
        const collectionParams = this.collectionService.collectionParamsMap.get(collection);
        const requestGeometryFg = this.mapGlobalFormBuilder.buildRequestGeometry(
          collection,
          collectionParams.params.centroid_path,
          'intersects'
        );
        const mapGlobalFg = this.mainFormService.mapConfig.getGlobalFg();
        mapGlobalFg.addGeoFilter(collection, requestGeometryFg);
        this.ngOnInit();
      }
    });
  }

  public camelize(text: string): string {
    return camelize(text);
  }
}
