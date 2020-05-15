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
import { MapConfig, Layer } from '@services/main-form-manager/models-map-config';
import { Config, MapglComponentConfig, ContributorConfig } from '@services/main-form-manager/models-config';
import { MapInitService } from '../map-init/map-init.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { importElements } from '@services/main-form-manager/tools';
import { MapLayerFormBuilderService } from '../map-layer-form-builder/map-layer-form-builder.service';
import { LayerSourceConfig } from 'arlas-web-contributors';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { VISIBILITY, NORMALIZED } from '@services/main-form-manager/config-map-export-helper';
import { GEOMETRY_TYPE, CLUSTER_GEOMETRY_TYPE } from '../map-layer-form-builder/models';
import { PROPERTY_SELECTOR_SOURCE, ProportionedValues } from '@shared-services/property-selector-form-builder/models';
import { KeywordColor, OTHER_KEYWORD } from '@map-config/components/dialog-color-table/models';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ConfigFormControl, ConfigFormGroup } from '@shared-models/config-form';

@Injectable({
  providedIn: 'root'
})
export class MapImportService {

  constructor(
    private mapInitService: MapInitService,
    private mainFormService: MainFormService,
    private mapLayerFormBuilder: MapLayerFormBuilderService
  ) { }
  public doImport(config: Config, mapConfig: MapConfig) {

    const mapgl = config.arlas.web.components.mapgl;
    const mapContrib = config.arlas.web.contributors.find(c => c.identifier === 'mapbox');
    const layersSources = mapContrib.layers_sources;
    const layers = mapConfig.layers;
    const collectionName = config.arlas.server.collection.name;
    let layerId = 0;

    this.mapInitService.initModule();
    this.importMapGlobal(mapgl, mapContrib, collectionName);

    layers.forEach(layer => {
      const layerSource = layersSources.find(s => s.id === layer.id);
      const layerFg = this.importLayer(layer, layerSource, collectionName, layerId++);
      this.mainFormService.mapConfig.getLayersFa().push(layerFg);
    });
  }

  private importMapGlobal(
    mapgl: MapglComponentConfig,
    mapContrib: ContributorConfig,
    collection) {

    const mapGlobalForm = this.mainFormService.mapConfig.getGlobalFg();

    mapGlobalForm.customControls.requestGeometries.push(
      this.mapInitService.createRequestGeometry(
        collection,
        mapContrib.geoQueryField,
        mapgl.input.idFeatureField
      )
    );

    importElements([
      {
        value: mapContrib.geoQueryOp,
        control: mapGlobalForm.customControls.geographicalOperator
      },
      {
        value: mapgl.allowMapExtend,
        control: mapGlobalForm.customControls.allowMapExtend
      },
      {
        value: mapgl.input.margePanForLoad,
        control: mapGlobalForm.customControls.margePanForLoad
      },
      {
        value: mapgl.input.margePanForTest,
        control: mapGlobalForm.customControls.margePanForTest
      },
      {
        value: mapgl.input.initZoom,
        control: mapGlobalForm.customControls.initZoom
      },
      {
        value: mapgl.input.initCenter[0],
        control: mapGlobalForm.customControls.initCenterLat
      },
      {
        value: mapgl.input.initCenter[1],
        control: mapGlobalForm.customControls.initCenterLon
      },
      {
        value: mapgl.input.displayScale,
        control: mapGlobalForm.customControls.displayScale
      }
    ]);

  }

  private importLayer(
    layer: Layer,
    layerSource: LayerSourceConfig,
    collectionName: string,
    layerId: number) {

    const type = layer.source.split('-')[0];
    // TODO extract type with toolkit, once it is available (contrary of `getSourceName`)
    const layerMode = layer.source.startsWith('feature-metric') ? LAYER_MODE.featureMetric :
      type === 'feature' ? LAYER_MODE.features :
        type === 'cluster' ? LAYER_MODE.cluster :
          null;

    const layerFg = this.mapLayerFormBuilder.buildLayer();

    importElements([
      {
        value: layer.id,
        control: layerFg.customControls.name
      },
      {
        value: layerMode,
        control: layerFg.customControls.mode
      },
      {
        value: layerId,
        control: layerFg.customControls.id
      }
    ]);

    const typeFg = layerMode === LAYER_MODE.features ? layerFg.customControls.featuresFg :
      layerMode === LAYER_MODE.featureMetric ? layerFg.customControls.featureMetricFg :
        layerMode === LAYER_MODE.cluster ? layerFg.customControls.clusterFg :
          null;
    const isAggregated = layerMode !== LAYER_MODE.features;

    typeFg.enable();

    const values: any = {
      collectionStep: {
        collection: collectionName
      },
      geometryStep: {
      },
      visibilityStep: {
        visible: layer.layout.visibility === VISIBILITY.visible,
        zoomMin: layer.minzoom,
        zoomMax: layer.maxzoom,
      },
      styleStep: {
        colorFg: {
        }
      }
    };

    if ([GEOMETRY_TYPE.circle.toString(), GEOMETRY_TYPE.fill.toString(), GEOMETRY_TYPE.line.toString()].indexOf(layer.type) >= 0) {
      values.styleStep.opacity = layer.paint[layer.type + '-opacity'];
    }

    if (layer.type === GEOMETRY_TYPE.line.toString()) {
      values.styleStep.widthFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-width'], values.styleStep.widthFg, false, isAggregated);

    } else if (layer.type === GEOMETRY_TYPE.circle.toString()) {
      values.styleStep.radiusFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-radius'], values.styleStep.radiusFg, false, isAggregated);

    } else if (layer.type === GEOMETRY_TYPE.heatmap.toString()) {
      values.styleStep.intensityFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-intensity'], values.styleStep.intensityFg, false, isAggregated);
      values.styleStep.weightFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-weight'], values.styleStep.weightFg, false, isAggregated);
      values.styleStep.radiusFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-radius'], values.styleStep.radiusFg, false, isAggregated);
    }

    const colors = layer.paint[layer.type + '-color'];
    values.styleStep.colorFg = {};
    this.importPropertySelector(colors, values.styleStep.colorFg, true, isAggregated);

    layerMode === LAYER_MODE.features ? this.importLayerFeatures(values, layer, layerSource) :
      layerMode === LAYER_MODE.featureMetric ? this.importLayerFeaturesMetric(values, layer, layerSource) :
        layerMode === LAYER_MODE.cluster ? this.importLayerCluster(values, layer, layerSource) :
          (() => { })();

    typeFg.patchValue(values);

    return layerFg;
  }



  private importLayerFeatures(
    values: any,
    layer: Layer,
    layerSource: LayerSourceConfig
  ) {

    values.geometryStep.geometry = layerSource.returned_geometry;
    values.visibilityStep.featuresMax = layerSource.maxfeatures;
    values.styleStep.geometryType = layer.type;
  }

  private importLayerFeaturesMetric(
    values: any,
    layer: Layer,
    layerSource: LayerSourceConfig
  ) {
    this.importLayerFeatures(values, layer, layerSource);
    values.geometryStep.geometry = layerSource.geometry_support;
    values.geometryStep.geometryId = layerSource.geometry_id;
    values.geometryStep.granularity = layerSource.granularity;

  }

  private importLayerCluster(
    values: any,
    layer: Layer,
    layerSource: LayerSourceConfig
  ) {
    values.geometryStep.aggGeometry = layerSource.agg_geo_field;
    values.geometryStep.granularity = layerSource.granularity;

    const isGeometryTypeRaw = !!layerSource.raw_geometry && Object.keys(layerSource.raw_geometry).length > 0;
    values.geometryStep.clusterGeometryType =
      isGeometryTypeRaw ? CLUSTER_GEOMETRY_TYPE.raw_geometry : CLUSTER_GEOMETRY_TYPE.aggregated_geometry;
    values.geometryStep.aggregatedGeometry = !isGeometryTypeRaw ? layerSource.aggregated_geometry : null;
    values.geometryStep.rawGeometry = isGeometryTypeRaw ? layerSource.raw_geometry.geometry : null;
    values.geometryStep.clusterSort = isGeometryTypeRaw ? layerSource.raw_geometry.sort : null;
    values.visibilityStep.featuresMin = layerSource.minfeatures;
    values.styleStep.geometryType = layer.type;
  }

  private importPropertySelector(inputValues: any, propertySelectorValues: any, isColor: boolean, isAggregated: boolean) {

    if (typeof inputValues === 'string' || typeof inputValues === 'number') {
      propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.fix;
      propertySelectorValues.propertyFix = inputValues;

    } else if (inputValues instanceof Array) {
      if (inputValues.length === 2) {
        const field = (inputValues as Array<string>)[1];

        if (field.endsWith('_color')) {
          propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.generated;
          propertySelectorValues.propertyGeneratedFieldCtrl = this.replaceUnderscore(this.removeLastcolor(field));
        } else {
          propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.provided;
          propertySelectorValues.propertyProvidedFieldCtrl = this.replaceUnderscore(field);
        }
      } else if (inputValues[0] === 'match') {
        this.importPropertySelectorManual(inputValues, propertySelectorValues);
      } else if (inputValues[0] === 'interpolate') {
        this.importPropertySelectorInterpolated(inputValues, propertySelectorValues, isColor, isAggregated);
      }
    }
  }

  private importPropertySelectorManual(inputValues: any, propertySelectorValues: any) {
    propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.manual;

    const keywordsAndColors = (inputValues.slice(2) as Array<string>);

    propertySelectorValues.propertyManualFg = {
      propertyManualFieldCtrl: this.replaceUnderscore(inputValues[1][1]),
      propertyManualValuesCtrl: new Array<KeywordColor>()
    };

    for (let i = 0; i < keywordsAndColors.length - 1; i = i + 2) {
      propertySelectorValues.propertyManualFg.propertyManualValuesCtrl.push({
        keyword: keywordsAndColors[i],
        color: keywordsAndColors[i + 1]
      });
    }

    propertySelectorValues.propertyManualFg.propertyManualValuesCtrl.push({
      keyword: OTHER_KEYWORD,
      color: keywordsAndColors.pop()
    }
    );
  }

  private importPropertySelectorInterpolated(inputValues: any, propertySelectorValues: any, isColor: boolean, isAggregated: boolean) {

    if ((inputValues[2] as Array<string>)[0] === 'heatmap-density') {
      propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.heatmap_density;
      propertySelectorValues.propertyInterpolatedFg = {};

    } else {
      propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.interpolated;
      const getValue = (inputValues[2] as Array<string>)[1];

      if (getValue.startsWith('count')) {
        propertySelectorValues.propertyInterpolatedFg = {
          propertyInterpolatedCountOrMetricCtrl: false,
          propertyInterpolatedCountNormalizeCtrl: getValue.endsWith('_:normalized')
        };

      } else {
        const isNormalize = getValue.split(':')[1] === NORMALIZED;

        propertySelectorValues.propertyInterpolatedFg = {
          propertyInterpolatedNormalizeCtrl: isNormalize,
          propertyInterpolatedNormalizeByKeyCtrl: isNormalize ? getValue.split(':').length === 3 : null,
        };

        if (isAggregated) {
          propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl = true;
          const getValueParts = getValue.split('_');
          propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMetricCtrl =
            getValueParts[getValueParts.length - 2].toUpperCase();
          propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedFieldCtrl =
            getValueParts.splice(0, getValueParts.length - 2).join('.');
        } else {
          propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedFieldCtrl = this.replaceUnderscore(getValue.split(':')[0]);

          if (isNormalize && getValue.split(':').length > 2) {
            propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedNormalizeLocalFieldCtrl =
              this.replaceUnderscore(getValue.split(':')[2]);
          }
        }

        if (!propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl) {
          propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl = inputValues[3];
          propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl = inputValues[inputValues.length - 2];
        }
      }
    }

    if (isColor) {
      propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedValuesCtrl = new Array<ProportionedValues>();
      for (let i = 3; i < inputValues.length; i = i + 2) {
        propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedValuesCtrl.push({
          proportion: inputValues[i],
          value: inputValues[i + 1]
        });
      }
    } else {
      propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMinValueCtrl = inputValues[4];
      propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMaxValueCtrl = inputValues.pop();
    }
  }

  private replaceUnderscore = (value) => value.replace(/\_/g, '.');
  private removeLastcolor = (value) => value.substring(0, value.lastIndexOf('_color'));

}
