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
import { MainFormService, ARLAS_ID } from '@services/main-form/main-form.service';
import { importElements } from '@services/main-form-manager/tools';
import { MapLayerFormBuilderService, MapLayerFormGroup } from '../map-layer-form-builder/map-layer-form-builder.service';
import { LayerSourceConfig, ColorConfig } from 'arlas-web-contributors';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { VISIBILITY, NORMALIZED } from '@services/main-form-manager/config-map-export-helper';
import { GEOMETRY_TYPE, CLUSTER_GEOMETRY_TYPE, FILTER_OPERATION } from '../map-layer-form-builder/models';
import { PROPERTY_SELECTOR_SOURCE, ProportionedValues } from '@shared-services/property-selector-form-builder/models';
import { KeywordColor, OTHER_KEYWORD } from '@map-config/components/dialog-color-table/models';
import { MapGlobalFormBuilderService } from '../map-global-form-builder/map-global-form-builder.service';
import { COUNT_OR_METRIC } from '@shared-services/property-selector-form-builder/models';
import { VisualisationSetConfig, BasemapStyle } from 'arlas-web-components';
import { MapVisualisationFormBuilderService } from '../map-visualisation-form-builder/map-visualisation-form-builder.service';
import { FormControl, FormGroup, FormArray, Form } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class MapImportService {

  constructor(
    private mainFormService: MainFormService,
    private mapGlobalFormBuilder: MapGlobalFormBuilderService,
    private mapLayerFormBuilder: MapLayerFormBuilderService,
    private mapVisualisationFormBuilder: MapVisualisationFormBuilderService
  ) { }

  public static removeLastcolor = (value) => value.substring(0, value.lastIndexOf('_arlas__color'));

  public static importPropertySelector(
    inputValues: any,
    propertySelectorValues: any,
    isColor: boolean,
    isAggregated: boolean,
    layerSource: LayerSourceConfig) {
    if (typeof inputValues === 'string' || typeof inputValues === 'number') {
      propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.fix;
      propertySelectorValues.propertyFix = inputValues;

    } else if (inputValues instanceof Array) {
      if (inputValues.length === 2) {
        let field = (inputValues as Array<string>)[1];
        // To deal with old arlas15 config
        if (!field.endsWith('_arlas__color') && field.endsWith('_color')) {
          if (layerSource.provided_fields.filter((pf: ColorConfig) => pf.color.replace(/\./g, '_') === field).length === 1) {

          } else {
            field = field.replace('_color', '_arlas__color');
          }
        }
        if (field.endsWith('_arlas__color') && layerSource.colors_from_fields) {
          propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.generated;
          propertySelectorValues.propertyGeneratedFieldCtrl = layerSource.colors_from_fields
            .find(f => f.replace(/\./g, '_') === this.removeLastcolor(field));
        } else {
          propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.provided;
          const colorProvidedField = layerSource.provided_fields.find((pf: ColorConfig) => pf.color.replace(/\./g, '_') === field);
          propertySelectorValues.propertyProvidedFieldCtrl = colorProvidedField.color;
          if (inputValues.length === 2) {
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

  public static importPropertySelectorManual(inputValues: any, propertySelectorValues: any, layerSource: LayerSourceConfig) {
    propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.manual;
    const keywordsAndColors = (inputValues.slice(2) as Array<string>);
    let manualField = '';
    if (layerSource.include_fields) {
      manualField = layerSource.include_fields.find(f => inputValues[1][1].includes(f.replace(/\./g, '_')));
      if (!manualField && layerSource.provided_fields) {
        const providedField = layerSource.provided_fields
          .filter(f => f.label).find(f => inputValues[1][1].includes(f.label.replace(/\./g, '_')));
        if (providedField) {
          manualField = providedField.label;
        } else {
          throw new Error('Cannot fetch ' + inputValues[1][1] + ' from layer_sources');
        }
      }
    } else {
      if (layerSource.provided_fields) {
        const providedField = layerSource.provided_fields
          .filter(f => f.label).find(f => inputValues[1][1].includes(f.label.replace(/\./g, '_')));
        if (providedField) {
          manualField = providedField.label;
        } else {
          throw new Error('Cannot fetch ' + inputValues[1][1] + ' from layer_sources');
        }
      }
    }
    propertySelectorValues.propertyManualFg = {
      // 'taggable_field_0' includes 'taggable.field'.replace(/\./g, '_')
      propertyManualFieldCtrl: manualField,
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

  public static importPropertySelectorInterpolated(
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

  public static importLayerFg(layer: Layer,
                              layerSource: LayerSourceConfig,
                              collectionName: string,
                              layerId: number,
                              visualisationSets: Array<VisualisationSetConfig>,
                              layerFg: MapLayerFormGroup,
                              filtersFa: FormArray) {
    const type = layer.source.split('-')[0];
    // TODO extract type with toolkit, once it is available (contrary of `getSourceName`)
    const layerMode = layer.source.startsWith('feature-metric') ? LAYER_MODE.featureMetric :
      type === 'feature' ? LAYER_MODE.features :
        type === 'cluster' ? LAYER_MODE.cluster :
          null;
    if (layerSource.id.startsWith(ARLAS_ID)) {
      if (!layerSource.name) {
        layerSource.name = layerSource.id.split(ARLAS_ID)[1].split(':')[0];
      }
    } else {
      // before 15.0.0 configs
      /** If we import a dashboard previous to 15.0.0
       * - the id was the name before so the layerSource.name takes the layerSource.id value
       * - the real id is prefixed with 'arlas_id:'+NAME+creationTimestamp
       * - apply this id changes to the layers list in visualisation set configuration
       */
      layerSource.name = layerSource.id;
      layerSource.id = ARLAS_ID + layerSource.name + ':' + Date.now();
      visualisationSets.forEach(vs => {
        vs.layers = vs.layers.map(l => {
          if (l === layerSource.name) {
            return layerSource.id;
          }
          return l;
        });
      });
    }
    importElements([
      {
        value: layerSource.id,
        control: layerFg.customControls.arlasId
      },
      {
        value: layerSource.name,
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
        filters: new FormArray([])
      },
      styleStep: {
        colorFg: {
        }
      }
    };

    values.styleStep.opacity = {};
    this.importPropertySelector(layer.paint[layer.type + '-opacity'], values.styleStep.opacity, false, isAggregated, layerSource);

    if (layer.type === GEOMETRY_TYPE.line.toString()) {
      values.styleStep.widthFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-width'], values.styleStep.widthFg, false, isAggregated, layerSource);

    } else if (layer.type === GEOMETRY_TYPE.circle.toString()) {
      values.styleStep.radiusFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-radius'], values.styleStep.radiusFg, false, isAggregated, layerSource);

      values.styleStep.strokeWidthFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-stroke-width'], values.styleStep.strokeWidthFg,
        false, isAggregated, layerSource);

      values.styleStep.strokeColorFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-stroke-color'], values.styleStep.strokeColorFg,
        false, isAggregated, layerSource);

      values.styleStep.strokeOpacityFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-stroke-opacity'], values.styleStep.strokeOpacityFg,
        false, isAggregated, layerSource);
    } else if (layer.type === GEOMETRY_TYPE.heatmap.toString()) {
      values.styleStep.intensityFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-intensity'], values.styleStep.intensityFg, false, isAggregated, layerSource);
      values.styleStep.weightFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-weight'], values.styleStep.weightFg, false, isAggregated, layerSource);
      values.styleStep.radiusFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-radius'], values.styleStep.radiusFg, false, isAggregated, layerSource);
    }
    values.visibilityStep.filters = filtersFa;
    const colors = layer.paint[layer.type + '-color'];
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


  public static importLayerFeatures(
    values: any,
    layer: Layer,
    layerSource: LayerSourceConfig
  ) {

    values.geometryStep.geometry = layerSource.returned_geometry;
    values.visibilityStep.featuresMax = layerSource.maxfeatures;
    values.styleStep.geometryType = layer.type;
    values.styleStep.filter = layer.filter;

  }

  public static importLayerFeaturesMetric(
    values: any,
    layer: Layer,
    layerSource: LayerSourceConfig
  ) {
    this.importLayerFeatures(values, layer, layerSource);
    if (!!layerSource.geometry_support) {
      values.geometryStep.geometry = layerSource.geometry_support;
      values.geometryStep.featureMetricSort = null;
    } else {
      values.geometryStep.geometry = layerSource.raw_geometry.geometry;
      values.geometryStep.featureMetricSort = !!layerSource.raw_geometry.sort ? layerSource.raw_geometry.sort : null;
    }
    values.geometryStep.geometryId = layerSource.geometry_id;
    values.geometryStep.granularity = layerSource.granularity;
  }

  public static importLayerCluster(
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

  public doImport(config: Config, mapConfig: MapConfig) {
    const mapgl = config.arlas.web.components.mapgl;
    const mapContrib = config.arlas.web.contributors.find(c => c.identifier === 'mapbox');
    const layersSources = mapContrib.layers_sources;
    const layers = mapConfig.layers
      .filter(ls => !ls.id.startsWith('arlas-hover-'))
      .filter(ls => !ls.id.startsWith('arlas-select-'));

    const visualisationSets: Array<VisualisationSetConfig> = config.arlas.web.components.mapgl.input.visualisations_sets;

    const basemaps: BasemapStyle[] = config.arlas.web.components.mapgl.input.basemapStyles;
    const defaultBasemap: BasemapStyle = config.arlas.web.components.mapgl.input.defaultBasemapStyle;

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

    basemaps.forEach(basemap => {
      this.mainFormService.mapConfig.getBasemapsFg().customControls.basemaps.push(new FormGroup({
        name: new FormControl(basemap.name),
        url: new FormControl(basemap.styleFile)
      }));
    });

    this.importBasemap(defaultBasemap);
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
      },
      {
        value: mapgl.input.displayCurrentCoordinates,
        control: mapGlobalForm.customControls.displayCurrentCoordinates
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

  private importBasemap(defaultBasemap: BasemapStyle) {
    const basemapFg = this.mainFormService.mapConfig.getBasemapsFg();
    importElements([
      {
        value: defaultBasemap.name,
        control: basemapFg.customControls.default
      }
    ]);
    return basemapFg;
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

  public importMapFilters(layerSource: LayerSourceConfig, filtersFa: FormArray) {
    let i = 0;
    if (!!layerSource.filters) {
      layerSource.filters.forEach(f => {
        const mapFilterFg = this.mapLayerFormBuilder.buildMapFilter();
        importElements([
          {
            value: {value: f.field},
            control: mapFilterFg.customControls.filterField
          },
          {
            value: f.op,
            control: mapFilterFg.customControls.filterOperation
          }
        ]);
        if (f.op === FILTER_OPERATION.IN || f.op === FILTER_OPERATION.NOT_IN) {
          importElements([
            {
              value: f.value,
              control: mapFilterFg.customControls.filterInValues
            }
          ]);
          mapFilterFg.customControls.filterInValues.selectedMultipleItems = f.value as string[];
          mapFilterFg.customControls.filterInValues.savedItems = new Set(f.value as string[]);
          mapFilterFg.customControls.filterEqualValues.disable();
        } else if (f.op === FILTER_OPERATION.EQUAL || f.op === FILTER_OPERATION.NOT_EQUAL) {
          importElements([
            {
              value: f.value,
              control: mapFilterFg.customControls.filterEqualValues
            }
          ]);
        } else if (f.op === FILTER_OPERATION.RANGE || f.op === FILTER_OPERATION.OUT_RANGE) {
          const min = +(f.value as string).split(';')[0];
          const max = +(f.value as string).split(';')[1];
          importElements([
            {
              value: min,
              control: mapFilterFg.customControls.filterMinRangeValues
            },
            {
              value: max,
              control: mapFilterFg.customControls.filterMaxRangeValues
            }
          ]);
        }
        filtersFa.insert(i, mapFilterFg);
        i++;
      });
    }
  }

  private importLayer(
    layer: Layer,
    layerSource: LayerSourceConfig,
    collectionName: string,
    layerId: number,
    visualisationSets: Array<VisualisationSetConfig>) {
    const layerFg = this.mapLayerFormBuilder.buildLayer();
    const filtersFa: FormArray = new FormArray([]);
    this.importMapFilters(layerSource, filtersFa);
    return MapImportService.importLayerFg(layer, layerSource, collectionName, layerId, visualisationSets, layerFg, filtersFa);
  }

}
