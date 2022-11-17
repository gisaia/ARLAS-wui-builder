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
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { KeywordColor, OTHER_KEYWORD } from '@map-config/components/dialog-color-table/models';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { NORMALIZED, VISIBILITY } from '@services/main-form-manager/config-map-export-helper';
import { Config, ContributorConfig, MapglComponentConfig, NormalizationFieldConfig } from '@services/main-form-manager/models-config';
import { isTechnicalArlasLayer, Layer, MapConfig } from '@services/main-form-manager/models-map-config';
import { importElements } from '@services/main-form-manager/tools';
import { ARLAS_ID, MainFormService } from '@services/main-form/main-form.service';
import { COUNT_OR_METRIC, PROPERTY_SELECTOR_SOURCE, ProportionedValues } from '@shared-services/property-selector-form-builder/models';
import { BasemapStyle, LayerMetadata, VisualisationSetConfig } from 'arlas-web-components';
import { ColorConfig, DEFAULT_FETCH_NETWORK_LEVEL, LayerSourceConfig, MetricConfig } from 'arlas-web-contributors';
import { ClusterAggType, FeatureRenderMode } from 'arlas-web-contributors/models/models';
import { MapGlobalFormBuilderService } from '@map-config/services/map-global-form-builder/map-global-form-builder.service';
import { MapLayerFormBuilderService, MapLayerFormGroup, MAX_ZOOM }
  from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import {
  CLUSTER_GEOMETRY_TYPE, FILTER_OPERATION, GEOMETRY_TYPE, LINE_TYPE, LINE_TYPE_VALUES,
  LABEL_ALIGNMENT,
  LABEL_PLACEMENT
} from '@map-config/services/map-layer-form-builder/models';
import { MapVisualisationFormBuilderService } from '@map-config/services/map-visualisation-form-builder/map-visualisation-form-builder.service';

@Injectable({
  providedIn: 'root'
})
export class MapImportService {

  public constructor(
    private mainFormService: MainFormService,
    private mapGlobalFormBuilder: MapGlobalFormBuilderService,
    private mapLayerFormBuilder: MapLayerFormBuilderService,
    private mapVisualisationFormBuilder: MapVisualisationFormBuilderService
  ) { }

  public static removeLastcolor = (value) => value.substring(0, value.lastIndexOf('_arlas__color'));

  public static importPropertySelector(
    inputValues: any,
    propertySelectorValues: any,
    fixType: PROPERTY_SELECTOR_SOURCE,
    isAggregated: boolean,
    layerSource: LayerSourceConfig) {
    if (typeof inputValues === 'string' || typeof inputValues === 'number') {
      propertySelectorValues.propertySource = fixType;
      if (fixType === PROPERTY_SELECTOR_SOURCE.fix_color) {
        propertySelectorValues.propertyFixColor = inputValues;
      } else if (fixType === PROPERTY_SELECTOR_SOURCE.fix_slider) {
        propertySelectorValues.propertyFixSlider = inputValues + '';
      }

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
          propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.provided_color;
          const colorProvidedField = layerSource.provided_fields.find((pf: ColorConfig) => pf.color.replace(/\./g, '_') === field);
          propertySelectorValues.propertyProvidedColorFieldCtrl = colorProvidedField.color;
          if (inputValues.length === 2) {
            propertySelectorValues.propertyProvidedColorLabelCtrl = colorProvidedField.label;
          }
        }
      } else if (inputValues[0] === 'match') {
        this.importPropertySelectorManual(inputValues, propertySelectorValues, layerSource);
      } else if (inputValues[0] === 'interpolate') {
        this.importPropertySelectorInterpolated(inputValues, propertySelectorValues, isAggregated, layerSource);
      }
    }
  }


  public static importPropertySelectorForLabel(
    inputValues: any,
    propertySelectorValues: any,
    isAggregated: boolean,
    layerSource: LayerSourceConfig,
    fixType: PROPERTY_SELECTOR_SOURCE.fix_input | PROPERTY_SELECTOR_SOURCE.fix_slider,
    displayable: boolean,
    numeric: boolean) {
    if (typeof inputValues === 'string' || typeof inputValues === 'number') {
      propertySelectorValues.propertySource = fixType;
      if (fixType === PROPERTY_SELECTOR_SOURCE.fix_input) {
        propertySelectorValues.propertyFixInput = inputValues;
      } else if (fixType === PROPERTY_SELECTOR_SOURCE.fix_slider) {
        propertySelectorValues.propertyFixSlider = inputValues + '';
      }
    } else if (inputValues instanceof Array) {
      if (inputValues.length === 2) {
        const flatField = (inputValues as Array<string>)[1];
        if (isAggregated) {
          const isFetchedHits = !!layerSource.fetched_hits && !!layerSource.fetched_hits.fields
            && layerSource.fetched_hits.fields.length > 0;
          const hasMetricForLabels = !!layerSource.metrics && layerSource.metrics.filter(m => m.short_format !== undefined).length > 0;
          if (isFetchedHits) {
            const providedField = layerSource.fetched_hits.fields.find(f => f.replace(/\./g, '_') === flatField ||
              (f.replace(/\./g, '_') + ':_arlas__short_format') === flatField);
            propertySelectorValues.propertySource = PROPERTY_SELECTOR_SOURCE.provided_field_for_agg;
            if (providedField) {
              propertySelectorValues.propertyProvidedFieldAggFg = {
                propertyProvidedFieldAggCtrl: providedField,
                propertyProvidedFieldSortCtrl: layerSource.fetched_hits.sorts.join(',')
              };
              if (flatField.includes(':_arlas__short_format') && !!layerSource.fetched_hits.short_form_fields) {
                propertySelectorValues.propertyProvidedFieldAggFg.propertyShortFormatCtrl = true;

              }
            }
          } else if (hasMetricForLabels) {
            const getFlatMetric = (m: MetricConfig) => {
              let flatMetric = '';
              if (m.metric === 'count') {
                flatMetric = 'count';
              } else {
                flatMetric = `${m.field.replace(/\./g, '_')}_${m.metric.toString().toLowerCase()}_`;
              }
              if (m.short_format) {
                if (flatMetric === 'count') {
                  flatMetric += `_:_arlas__short_format`;
                } else {
                  flatMetric += `:_arlas__short_format`;
                }
              }
              return flatMetric;
            };
            const metric = layerSource.metrics
              .filter(m => m.short_format !== undefined)
              .find(m => getFlatMetric(m) === flatField);
            if (!!metric) {
              propertySelectorValues.propertySource = displayable ? PROPERTY_SELECTOR_SOURCE.displayable_metric_on_field :
                PROPERTY_SELECTOR_SOURCE.metric_on_field;
              propertySelectorValues.propertyCountOrMetricFg = {
                propertyCountOrMetricCtrl: metric.metric === 'count' ? COUNT_OR_METRIC.COUNT : COUNT_OR_METRIC.METRIC,
                propertyMetricCtrl: metric.metric === 'count' ? undefined : metric.metric.toString().toUpperCase(),
                propertyFieldCtrl: metric.metric === 'count' ? undefined : metric.field,
                propertyShortFormatCtrl: metric.short_format
              };
            }
          }
        } else {
          const providedField = layerSource.include_fields.find(f => f.replace(/\./g, '_') === flatField ||
            (f.replace(/\./g, '_') + ':_arlas__short_format') === flatField);
          propertySelectorValues.propertySource = numeric ? PROPERTY_SELECTOR_SOURCE.provided_numeric_field_for_feature :
            PROPERTY_SELECTOR_SOURCE.provided_field_for_feature;
          propertySelectorValues.propertyProvidedFieldFeatureFg = {
            propertyProvidedFieldFeatureCtrl: providedField
          };
          if (flatField.includes(':_arlas__short_format') && layerSource.short_form_fields) {
            propertySelectorValues.propertyProvidedFieldFeatureFg.propertyShortFormatCtrl = true;

          }
        }
      } else if (inputValues[0] === 'interpolate') {
        this.importPropertySelectorInterpolated(inputValues, propertySelectorValues, isAggregated, layerSource);
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
          const findMetric = layerSource.metrics.find(m => {
            let flatMetric = m.field.replace(/\./g, '_') + '_' + m.metric.toString().toLowerCase() + '_';
            if (m.normalize) {
              flatMetric += ':normalized';
            }
            return flatMetric === getValue;
          });
          if (findMetric) {
            propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMetricCtrl = findMetric.metric.toString().toUpperCase();
            propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedFieldCtrl = findMetric.field;
          }
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
    if (propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedCountOrMetricCtrl === COUNT_OR_METRIC.COUNT) {
      const interpolatedValues = propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedValuesCtrl;
      if (!!interpolatedValues && Array.isArray(interpolatedValues) && interpolatedValues.length > 0) {
        propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedCountValueCtrl =
          interpolatedValues[interpolatedValues.length - 1].proportion;
      }
    }
    const min = inputValues[4];
    const max = inputValues.pop();
    propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMinValueCtrl = min === 0 ? '0' : min;
    propertySelectorValues.propertyInterpolatedFg.propertyInterpolatedMaxValueCtrl = max === 0 ? '0' : max;
  }

  public static importLayerFg(
    layer: Layer,
    layerSource: LayerSourceConfig,
    collectionName: string,
    layerId: number,
    visualisationSets: Array<VisualisationSetConfig>,
    layerFg: MapLayerFormGroup,
    filtersFa: FormArray
  ) {
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
        value: collectionName,
        control: layerFg.customControls.collection
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
    const maxzoom = !!layer.maxzoom ? layer.maxzoom : (!!layerSource.maxzoom ? layerSource.maxzoom : MAX_ZOOM);
    const renderMode = !!layerSource.render_mode ? layerSource.render_mode : FeatureRenderMode.wide;
    const values: any = {
      geometryStep: {
      },
      visibilityStep: {
        visible: (!!layer.layout && !!layer.layout.visibility) ? layer.layout.visibility === VISIBILITY.visible : true,
        renderMode,
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
    this.importPropertySelector(layer.paint[(layer.type === 'symbol' ? 'text' : layer.type) + '-opacity'], values.styleStep.opacity,
      PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

    if (layer.type === GEOMETRY_TYPE.line.toString()) {
      values.styleStep.widthFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-width'], values.styleStep.widthFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

      if (!!layer.paint['line-dasharray']) {
        switch (layer.paint['line-dasharray'].toString()) {
          case LINE_TYPE_VALUES.get(LINE_TYPE.dashed).toString():
            values.styleStep.lineType = LINE_TYPE.dashed;
            break;
          case LINE_TYPE_VALUES.get(LINE_TYPE.dotted).toString():
            values.styleStep.lineType = LINE_TYPE.dotted;
            break;
          case LINE_TYPE_VALUES.get(LINE_TYPE.mixed).toString():
            values.styleStep.lineType = LINE_TYPE.mixed;
            break;
          default:
            values.styleStep.lineType = LINE_TYPE.solid;
        }
      } else {
        values.styleStep.lineType = LINE_TYPE.solid;
      }

    } else if (layer.type === GEOMETRY_TYPE.circle.toString()) {
      values.styleStep.radiusFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-radius'], values.styleStep.radiusFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

      values.styleStep.strokeWidthFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-stroke-width'], values.styleStep.strokeWidthFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

      values.styleStep.strokeColorFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-stroke-color'], values.styleStep.strokeColorFg,
        PROPERTY_SELECTOR_SOURCE.fix_color, isAggregated, layerSource);

      values.styleStep.strokeOpacityFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-stroke-opacity'], values.styleStep.strokeOpacityFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
    } else if (layer.type === GEOMETRY_TYPE.heatmap.toString()) {
      values.styleStep.intensityFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-intensity'], values.styleStep.intensityFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
      values.styleStep.weightFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-weight'], values.styleStep.weightFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
      values.styleStep.radiusFg = {};
      this.importPropertySelector(layer.paint[layer.type + '-radius'], values.styleStep.radiusFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
    } else if (layer.type === GEOMETRY_TYPE.fill.toString()) {
      if (!!layer.metadata && !!(layer.metadata as LayerMetadata).stroke) {
        values.styleStep.strokeWidthFg = {};
        this.importPropertySelector((layer.metadata as LayerMetadata).stroke.width, values.styleStep.strokeWidthFg,
          PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

        values.styleStep.strokeColorFg = {};
        this.importPropertySelector((layer.metadata as LayerMetadata).stroke.color, values.styleStep.strokeColorFg,
          PROPERTY_SELECTOR_SOURCE.fix_color, isAggregated, layerSource);

        values.styleStep.strokeOpacityFg = {};
        this.importPropertySelector((layer.metadata as LayerMetadata).stroke.opacity, values.styleStep.strokeOpacityFg,
          PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);

      }
    }
    values.visibilityStep.filters = filtersFa;
    const colors = layer.paint[(layer.type === 'symbol' ? 'text' : layer.type) + '-color'];
    values.styleStep.colorFg = {};
    this.importPropertySelector(colors, values.styleStep.colorFg,
      PROPERTY_SELECTOR_SOURCE.fix_color, isAggregated, layerSource);
    if (layer.type === 'symbol') {
      values.styleStep.labelSizeFg = {};
      values.styleStep.labelRotationFg = {};
      values.styleStep.labelContentFg = {};
      values.styleStep.labelHaloColorFg = {};
      values.styleStep.labelHaloBlurFg = {};
      values.styleStep.labelHaloWidthFg = {};
      const size = layer.layout['text-size'];
      const content = layer.layout['text-field'];
      const haloColor = layer.paint['text-halo-color'];
      const haloBlur = layer.paint['text-halo-blur'];
      const haloWidth = layer.paint['text-halo-width'];
      const rotation = layer.layout['text-rotate'];
      const overlap = layer.layout['text-allow-overlap'];
      const alignment = layer.layout['text-anchor'];
      const placement = layer.layout['symbol-placement'];
      values.styleStep.labelOverlapFg = !!overlap;
      this.importPropertySelector(size, values.styleStep.labelSizeFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
      this.importPropertySelectorForLabel(rotation, values.styleStep.labelRotationFg, isAggregated, layerSource,
        PROPERTY_SELECTOR_SOURCE.fix_slider, /** dsplayable */ false, /** numeric */ true);
      this.importPropertySelectorForLabel(content, values.styleStep.labelContentFg, isAggregated, layerSource,
        PROPERTY_SELECTOR_SOURCE.fix_input, /** dsplayable */ true, /** numeric */ false);
      this.importPropertySelector(haloColor, values.styleStep.labelHaloColorFg,
        PROPERTY_SELECTOR_SOURCE.fix_color, isAggregated, layerSource);
      this.importPropertySelector(haloBlur, values.styleStep.labelHaloBlurFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
      this.importPropertySelector(haloWidth, values.styleStep.labelHaloWidthFg,
        PROPERTY_SELECTOR_SOURCE.fix_slider, isAggregated, layerSource);
      const offset = layer.paint['text-translate'];
      if (offset) {
        values.styleStep.labelOffsetFg = {
          dx: offset[0] + '',
          dy: offset[1] + ''
        };
      }
      if (!!placement) {
        values.styleStep.labelPlacementCtrl = placement;
      } else {
        values.styleStep.labelPlacementCtrl = LABEL_PLACEMENT.point.toString();
      }
      if (!!alignment) {
        values.styleStep.labelAlignmentCtrl = alignment;
      } else {
        values.styleStep.labelAlignmentCtrl = LABEL_ALIGNMENT.center.toString();
      }
    }
    if (layerMode === LAYER_MODE.features) {
      this.importLayerFeatures(values, layer, layerSource);
    } else if (layerMode === LAYER_MODE.featureMetric) {
      this.importLayerFeaturesMetric(values, layer, layerSource);
    } else if (layerMode === LAYER_MODE.cluster) {
      this.importLayerCluster(values, layer, layerSource);
    }


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
    values.styleStep.geometryType = layer.type === 'symbol' ? 'label' : layer.type;
    values.styleStep.filter = layer.filter;

  }

  public static importLayerFeaturesMetric(
    values: any,
    layer: Layer,
    layerSource: LayerSourceConfig
  ) {
    this.importLayerFeatures(values, layer, layerSource);
    /** retro compatibility code : migrate from [geometry_support] to [raw_geometry] */
    if (!!layerSource.geometry_support) {
      values.geometryStep.geometry = layerSource.geometry_support;
      values.geometryStep.featureMetricSort = null;
    } else {
      values.geometryStep.geometry = layerSource.raw_geometry.geometry;
      values.geometryStep.featureMetricSort = !!layerSource.raw_geometry.sort ? layerSource.raw_geometry.sort : null;
    }
    values.geometryStep.geometryId = layerSource.geometry_id;
    values.visibilityStep.networkFetchingLevel = layerSource.network_fetching_level !== undefined ?
      layerSource.network_fetching_level : DEFAULT_FETCH_NETWORK_LEVEL;
  }

  public static importLayerCluster(
    values: any,
    layer: Layer,
    layerSource: LayerSourceConfig
  ) {
    values.geometryStep.aggGeometry = layerSource.agg_geo_field;
    values.geometryStep.granularity = layerSource.granularity;
    values.geometryStep.aggType = layerSource.aggType ? layerSource.aggType : ClusterAggType.geohash;

    const isGeometryTypeRaw = !!layerSource.raw_geometry && Object.keys(layerSource.raw_geometry).length > 0;
    values.geometryStep.clusterGeometryType =
      isGeometryTypeRaw ? CLUSTER_GEOMETRY_TYPE.raw_geometry : CLUSTER_GEOMETRY_TYPE.aggregated_geometry;
    // To Import old dashboard before ARLAS 17
    if (!!layerSource.aggregated_geometry) {
      if (layerSource.aggregated_geometry === 'geohash') {
        layerSource.aggregated_geometry = 'cell';
      }
      if (layerSource.aggregated_geometry === 'geohash_center') {
        layerSource.aggregated_geometry = 'cell_center';
      }
    }
    values.geometryStep.aggregatedGeometry = !isGeometryTypeRaw ? layerSource.aggregated_geometry : null;
    values.geometryStep.rawGeometry = isGeometryTypeRaw ? layerSource.raw_geometry.geometry : null;
    values.geometryStep.clusterSort = isGeometryTypeRaw ? layerSource.raw_geometry.sort : null;
    values.visibilityStep.featuresMin = layerSource.minfeatures;
    values.styleStep.geometryType = layer.type === 'symbol' ? 'label' : layer.type;
    values.styleStep.filter = layer.filter;

  }

  public doImport(config: Config, mapConfig: MapConfig) {
    const mapgl = config.arlas.web.components.mapgl;
    const visualisationSets: Array<VisualisationSetConfig> = mapgl.input.visualisations_sets;
    const basemaps: BasemapStyle[] = mapgl.input.basemapStyles;
    const defaultBasemap: BasemapStyle = mapgl.input.defaultBasemapStyle;
    const defaultCollection = config.arlas.server.collection.name;

    let defaultMapContributor = config.arlas.web.contributors.find(c => c.type === 'map' &&
      (c.collection === defaultCollection || !c.collection));
    if (!defaultMapContributor) {
      /** if there is no map contributor that has the default collection, we take the first map contributor
       * this is unlikely to happen as with the builder we will always create a map contributor that has the default collection
       * it's just precaution in case we load a config file that doesn't respect this condition
       */
      defaultMapContributor = config.arlas.web.contributors.find(c => c.type === 'map');
    }
    if (!defaultMapContributor) {
      defaultMapContributor = {
        type: 'map',
        identifier: defaultCollection,
        name: 'Map ' + defaultCollection,
        collection: defaultCollection,
        geo_query_op: 'Intersects',
        geo_query_field: '',
        icon: 'check_box_outline_blank',
        layers_sources: []
      };
    }
    const mapcontributors = config.arlas.web.contributors.filter(c => c.type === 'map');

    const mapGlobalForm = this.mainFormService.mapConfig.getGlobalFg();
    mapGlobalForm.collectionGeoFiltersMap.clear();
    mapcontributors.forEach(mc => {
      if (mc.layers_sources && mc.layers_sources.length > 0) {
        mapGlobalForm.addGeoFilter(mc.collection, this.mapGlobalFormBuilder.buildRequestGeometry(
          mc.collection,
          mc.geo_query_field,
          mc.geo_query_op.toLowerCase()
        ));
      } else {
        mapGlobalForm.collectionGeoFiltersMap.set(mc.collection, {
          geoField: mc.geo_query_field,
          geoOp: mc.geo_query_op.toLowerCase()
        });
      }
    });
    this.importMapGlobal(mapgl, defaultMapContributor, defaultMapContributor.collection);

    const mapContributors = config.arlas.web.contributors.filter(c => c.type === 'map');
    const layers = mapConfig.layers
      .filter(ls => !isTechnicalArlasLayer(ls.id));
    let layerId = 0;
    mapContributors.forEach(mapCont => {
      if (!mapCont.collection) {
        mapCont.collection = defaultCollection;
      }
      mapCont.layers_sources.forEach(ls => {
        const layer = layers.find(l => l.id === ls.id);
        const layerFg = this.importLayer(layer, ls, mapCont.collection, layerId++, visualisationSets);
        this.mainFormService.mapConfig.getLayersFa().push(layerFg);
      });
    });
    let visuId = 0;
    visualisationSets.forEach(vs => {
      const visualisationFg = this.importVisualisations(vs, visuId++);
      this.mainFormService.mapConfig.getVisualisationsFa().push(visualisationFg);
    });

    basemaps.forEach(basemap => {
      this.mainFormService.mapConfig.getBasemapsFg().customControls.basemaps.push(new FormGroup({
        name: new FormControl(basemap.name),
        url: new FormControl(basemap.styleFile),
        image: new FormControl(basemap.image)
      }));
    });

    this.importBasemap(defaultBasemap);
  }



  private importMapGlobal(
    mapgl: MapglComponentConfig,
    mapContrib: ContributorConfig,
    collection: string) {

    const mapGlobalForm = this.mainFormService.mapConfig.getGlobalFg();
    importElements([
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

  public importMapFilters(layerSource: LayerSourceConfig, filtersFa: FormArray, collection: string) {
    let i = 0;
    if (!!layerSource.filters) {
      layerSource.filters.forEach(f => {
        const mapFilterFg = this.mapLayerFormBuilder.buildMapFilter(collection);
        importElements([
          {
            value: { value: f.field },
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
              value: (f.value as string[]).map(v => ({ value: v })),
              control: mapFilterFg.customControls.filterInValues
            }
          ]);
          mapFilterFg.customControls.filterInValues.selectedMultipleItems = (f.value as string[]).map(v => ({ value: v }));
          mapFilterFg.customControls.filterInValues.savedItems = new Set((f.value as string[]));
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
        } else if (f.op === FILTER_OPERATION.IS) {
          importElements([
            {
              value: f.value,
              control: mapFilterFg.customControls.filterBoolean
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
    const layerFg = this.mapLayerFormBuilder.buildLayer(collectionName);
    const filtersFa: FormArray = new FormArray([]);
    this.importMapFilters(layerSource, filtersFa, collectionName);
    return MapImportService.importLayerFg(layer, layerSource, collectionName, layerId, visualisationSets, layerFg, filtersFa);
  }

}
