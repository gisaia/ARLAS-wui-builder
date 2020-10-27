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
import { Config, MapglComponentConfig, ContributorConfig, NormalizationFieldConfig } from '@services/main-form-manager/models-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { importElements } from '@services/main-form-manager/tools';
import { MapLayerFormBuilderService } from '../map-layer-form-builder/map-layer-form-builder.service';
import { LayerSourceConfig, ColorConfig } from 'arlas-web-contributors';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { VISIBILITY, NORMALIZED } from '@services/main-form-manager/config-map-export-helper';
import { GEOMETRY_TYPE, CLUSTER_GEOMETRY_TYPE } from '../map-layer-form-builder/models';
import { PROPERTY_SELECTOR_SOURCE, ProportionedValues } from '@shared-services/property-selector-form-builder/models';
import { KeywordColor, OTHER_KEYWORD } from '@map-config/components/dialog-color-table/models';
import { MapGlobalFormBuilderService } from '../map-global-form-builder/map-global-form-builder.service';
import { COUNT_OR_METRIC } from '@shared-services/property-selector-form-builder/models';
import { VisualisationSetConfig } from 'arlas-web-components';
import { MapVisualisationFormBuilderService } from '../map-visualisation-form-builder/map-visualisation-form-builder.service';
import { CollectionService } from '@services/collection-service/collection.service';

@Injectable({
  providedIn: 'root'
})
export class MapImportService {

  constructor(
    private mainFormService: MainFormService,
    private collectionService: CollectionService,
    private mapGlobalFormBuilder: MapGlobalFormBuilderService,
    private mapLayerFormBuilder: MapLayerFormBuilderService,
    private mapVisualisationFormBuilder: MapVisualisationFormBuilderService
  ) { }
  public doImport(config: Config, mapConfig: MapConfig) {

    const mapgl = config.arlas.web.components.mapgl;
    const mapContrib = config.arlas.web.contributors.find(c => c.identifier === 'mapbox');
    const layersSources = mapContrib.layers_sources;
    const layers = mapConfig.layers;

    const visualisationSets: Array<VisualisationSetConfig> = config.arlas.web.components.mapgl.input.visualisations_sets;

    const collectionName = config.arlas.server.collection.name;
    let layerId = 0;

    this.importMapGlobal(mapgl, mapContrib, collectionName);

    layers.forEach(layer => {
      const layerSource = layersSources.find(s => s.id === layer.id);
      const layerFg = this.importLayer(layer, layerSource, collectionName, layerId++, visualisationSets);
      this.mainFormService.mapConfig.getLayersFa().push(layerFg);
    });

    let visuId = 0;
    visualisationSets.forEach(vs => {
      const visualisationFg = this.importVisualisations(vs, visuId++);
      this.mainFormService.mapConfig.getVisualisationsFa().push(visualisationFg);
    });
  }

  private importMapGlobal(
    mapgl: MapglComponentConfig,
    mapContrib: ContributorConfig,
    collection: string) {

    const mapGlobalForm = this.mainFormService.mapConfig.getGlobalFg();
    mapGlobalForm.customControls.requestGeometries.push(
      this.mapGlobalFormBuilder.buildRequestGeometry(
        collection,
        mapContrib.geo_query_field,
        mapgl.input.idFeatureField
      )
    );
    importElements([
      {
        value: !!mapContrib.geo_query_op ? mapContrib.geo_query_op.toLowerCase() : 'intersects',
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
        value: mapgl.input.initCenter[1],
        control: mapGlobalForm.customControls.initCenterLat
      },
      {
        value: mapgl.input.initCenter[0],
        control: mapGlobalForm.customControls.initCenterLon
      },
      {
        value: mapgl.input.displayScale,
        control: mapGlobalForm.customControls.displayScale
      }
    ]);

    // unmanaged fields
    const unmanagedControls = mapGlobalForm.customControls.unmanagedFields;
    importElements([
      {
        value: mapContrib.icon,
        control: unmanagedControls.icon
      },
      {
        value: mapgl.nbVerticesLimit,
        control: unmanagedControls.nbVerticesLimit
      },
      {
        value: mapgl.input.defaultBasemapStyle,
        control: unmanagedControls.defaultBasemapStyle
      },
      {
        value: mapgl.input.basemapStyles,
        control: unmanagedControls.basemapStyles
      },
      {
        value: mapgl.input.mapLayers.events.zoomOnClick,
        control: unmanagedControls.mapLayers.events.zoomOnClick
      },
      {
        value: mapgl.input.mapLayers.events.emitOnClick,
        control: unmanagedControls.mapLayers.events.emitOnClick
      },
      {
        value: mapgl.input.mapLayers.events.onHover,
        control: unmanagedControls.mapLayers.events.onHover
      },
    ]);

  }

  private importVisualisations(visualisationSet: VisualisationSetConfig, visuId: number) {
    const visualisationFg = this.mapVisualisationFormBuilder.buildVisualisation();
    importElements([
      {
        value: visualisationSet.name,
        control: visualisationFg.customControls.name
      },
      {
        value: visualisationSet.enabled,
        control: visualisationFg.customControls.displayed
      },
      {
        value: visualisationSet.layers,
        control: visualisationFg.customControls.layers
      },
      {
        value: visuId,
        control: visualisationFg.customControls.id
      }
    ]);
    return visualisationFg;
  }
  private importLayer(
    layer: Layer,
    layerSource: LayerSourceConfig,
    collectionName: string,
    layerId: number,
    visualisationSets: Array<VisualisationSetConfig>) {

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
        value: visualisationSets,
        control: layerFg.customControls.visualisation
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

    const minzoom = !!layer.minzoom ? layer.minzoom : (!!layerSource.minzoom ? layerSource.minzoom : 0);
    const maxzoom = !!layer.maxzoom ? layer.maxzoom : (!!layerSource.maxzoom ? layerSource.maxzoom : 22);
    const values: any = {
      collectionStep: {
        collection: collectionName
      },
      geometryStep: {
      },
      visibilityStep: {
        visible: (!!layer.layout && !!layer.layout.visibility) ? layer.layout.visibility === VISIBILITY.visible : true,
        zoomMin: minzoom,
        zoomMax: maxzoom,
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
      this.importPropertySelector(layer.paint[layer.type + '-width'], values.styleStep.widthFg, false, isAggregated, layerSource);

    } else if (layer.type === GEOMETRY_TYPE.circle.toString()) {
      values.styleStep.radiusFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-radius'], values.styleStep.radiusFg, false, isAggregated, layerSource);

    } else if (layer.type === GEOMETRY_TYPE.heatmap.toString()) {
      values.styleStep.intensityFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-intensity'], values.styleStep.intensityFg, false, isAggregated, layerSource);
      values.styleStep.weightFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-weight'], values.styleStep.weightFg, false, isAggregated, layerSource);
      values.styleStep.radiusFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-radius'], values.styleStep.radiusFg, false, isAggregated, layerSource);
    }

    const colors = layer.paint[layer.type + '-color'];
    const providedFields = layerSource.provided_fields;
    if (!!providedFields && providedFields.length > 0 && providedFields[0].label) {
      colors.push(providedFields[0].label);
    }
    values.styleStep.colorFg = {};
    this.importPropertySelector(colors, values.styleStep.colorFg, true, isAggregated, layerSource);

    layerMode === LAYER_MODE.features ? this.importLayerFeatures(values, layer, layerSource) :
      layerMode === LAYER_MODE.featureMetric ? this.importLayerFeaturesMetric(values, layer, layerSource) :
        layerMode === LAYER_MODE.cluster ? this.importLayerCluster(values, layer, layerSource) :
          (() => { })();

    typeFg.patchValue(values);

    // populate manual values FormArray
    const manualValues = (((values.styleStep || {}).colorFg || {}).propertyManualFg || {}).propertyManualValuesCtrl as Array<KeywordColor>;
    (manualValues || []).forEach(kc =>
      typeFg.colorFg.addToColorManualValuesCtrl(kc));

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
    values.styleStep.filter = layer.filter;

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
    values.styleStep.filter = layer.filter;

  }

  private importPropertySelector(
    inputValues: any,
    propertySelectorValues: any,
    isColor: boolean,
    isAggregated: boolean,
    layerSource: LayerSourceConfig) {
    if (typeof inputValues === 'string' || typeof inputValues === 'number') {
      propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.fix;
      propertySelectorValues.propertyFix = inputValues;

    } else if (inputValues instanceof Array) {
      if (inputValues.length === 2 || inputValues.length === 3) {
        const field = (inputValues as Array<string>)[1];
        let label = '';
        if (inputValues.length === 3) {
          label = (inputValues as Array<string>)[2];
        }
        if (field.endsWith('_color')) {
          propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.generated;
          const colorField = layerSource.colors_from_fields.find(f => f.replace(/\./g, '_') === this.removeLastcolor(field));
          propertySelectorValues.propertyGeneratedFieldCtrl = colorField;
        } else {
          propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.provided;
          const colorProvidedField = layerSource.provided_fields.find((pf: ColorConfig) => pf.color.replace(/\./g, '_') === field);
          propertySelectorValues.propertyProvidedFieldCtrl = colorProvidedField.color;
          if (inputValues.length === 3) {
            propertySelectorValues.propertyProvidedFieldLabelCtrl = colorProvidedField.label;
          }
        }
      } else if (inputValues[0] === 'match') {
        this.importPropertySelectorManual(inputValues, propertySelectorValues, layerSource);
      } else if (inputValues[0] === 'interpolate') {
        this.importPropertySelectorInterpolated(inputValues, propertySelectorValues, isColor, isAggregated, layerSource);
      }
    }
  }

  private importPropertySelectorManual(inputValues: any, propertySelectorValues: any, layerSource: LayerSourceConfig) {
    propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.manual;
    const keywordsAndColors = (inputValues.slice(2) as Array<string>);
    propertySelectorValues.propertyManualFg = {
      // 'taggable_field_0' includes 'taggable.field'.replace(/\./g, '_')
      propertyManualFieldCtrl: layerSource.include_fields.find(f => inputValues[1][1].includes(f.replace(/\./g, '_'))),
      propertyManualValuesCtrl: new Array<KeywordColor>()
    };
    for (let i = 0; i < keywordsAndColors.length - 1; i = i + 2) {
      propertySelectorValues.propertyManualFg.propertyManualValuesCtrl.push({
        keyword: keywordsAndColors[i] + '',
        color: keywordsAndColors[i + 1]
      });
    }

    propertySelectorValues.propertyManualFg.propertyManualValuesCtrl.push({
      keyword: OTHER_KEYWORD,
      color: keywordsAndColors.pop()
    }
    );
  }

  private importPropertySelectorInterpolated(
    inputValues: any,
    propertySelectorValues: any,
    isColor: boolean,
    isAggregated: boolean,
    layerSource: LayerSourceConfig) {
      if ((inputValues[2] as Array<string>)[0] === 'heatmap-density') {
        propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.heatmap_density;
        propertySelectorValues.propertyInterpolatedFg = {};

      } else {
        propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.interpolated;
        const getValue = (inputValues[2] as Array<string>)[1];
        if (getValue.startsWith('count')) {
          propertySelectorValues.propertyInterpolatedFg = {
            propertyInterpolatedCountOrMetricCtrl: COUNT_OR_METRIC.COUNT,
            propertyInterpolatedCountNormalizeCtrl: getValue.endsWith('_:normalized')
          };

        } else {
          const isNormalize = getValue.split(':')[1] === NORMALIZED;
          propertySelectorValues.propertyInterpolatedFg = {
            propertyInterpolatedNormalizeCtrl: isNormalize,
            propertyInterpolatedNormalizeByKeyCtrl: isNormalize ? getValue.split(':').length === 3 : null,
          };

          if (isAggregated) {
            propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl = COUNT_OR_METRIC.METRIC;
            propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMetricCtrl =
              layerSource.metrics[0].metric.toString().toUpperCase();
            propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedFieldCtrl = layerSource.metrics[0].field;
          } else {
            let field;
            if (isNormalize) {
              field = layerSource.normalization_fields
                .find((nf: NormalizationFieldConfig) => nf.on.replace(/\./g, '_') === getValue.split(':')[0]).on;
              if (getValue.split(':').length > 2) {
                const perfield = layerSource.normalization_fields
                .find((nf: NormalizationFieldConfig) => !!nf.per && nf.per.replace(/\./g, '_') === getValue.split(':')[2]).per;
                propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedNormalizeLocalFieldCtrl = perfield;

              }
            } else {
              field = layerSource.include_fields.find(f => f.replace(/\./g, '_') === getValue);
            }
            propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedFieldCtrl = field;
          }
          if (!propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedNormalizeCtrl) {
            propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMinFieldValueCtrl = inputValues[3];
            propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMaxFieldValueCtrl = inputValues[inputValues.length - 2];
          }
        }
      }
      propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedValuesCtrl = new Array<ProportionedValues>();
      for (let i = 3; i < inputValues.length; i = i + 2) {
        propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedValuesCtrl.push({
          proportion: inputValues[i],
          value: inputValues[i + 1]
        });
      }
      propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMinValueCtrl = inputValues[4];
      propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMaxValueCtrl = inputValues.pop();
  }

  private replaceUnderscore = (value) => value.replace(/\_/g, '.');
  private removeLastcolor = (value) => value.substring(0, value.lastIndexOf('_color'));

}
