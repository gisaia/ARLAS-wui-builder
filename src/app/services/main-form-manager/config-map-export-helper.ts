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
import { FormArray } from '@angular/forms';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import {
  Paint, Layer, MapConfig, ExternalEvent, HOVER_LAYER_PREFIX,
  SELECT_LAYER_PREFIX, FILLSTROKE_LAYER_PREFIX
} from './models-map-config';
import { GEOMETRY_TYPE, FILTER_OPERATION, LINE_TYPE } from '@map-config/services/map-layer-form-builder/models';
import { PROPERTY_SELECTOR_SOURCE, ProportionedValues } from '@shared-services/property-selector-form-builder/models';
import { KeywordColor, OTHER_KEYWORD } from '@map-config/components/dialog-color-table/models';
import { ConfigExportHelper } from './config-export-helper';
import { LayerSourceConfig } from 'arlas-web-contributors';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { LINE_TYPE_VALUES } from '../../modules/map-config/services/map-layer-form-builder/models';
import { MapLayerFormGroup } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import { ARLAS_ID } from '@services/main-form/main-form.service';
import { FillStroke, LayerMetadata, SCROLLABLE_ARLAS_ID} from 'arlas-web-components';
import { FeatureRenderMode } from 'arlas-web-contributors/models/models';
import { Layout } from './models-map-config';
export enum VISIBILITY {
  visible = 'visible',
  none = 'none'
}
export const NORMALIZED = 'normalized';
export class ConfigMapExportHelper {

  public static process(mapConfigLayers: FormArray, colorService: ArlasColorGeneratorLoader,
    taggableFieldsMap?: Map<string, Set<string>>) {
    const fillStrokeLayers = [];
    const scrollableLayers = [];
    const labelLayers = [];
    const layers: Array<[Layer, LAYER_MODE]> = mapConfigLayers.controls.map((layerFg: MapLayerFormGroup) => {
      const taggableFields = taggableFieldsMap.get(layerFg.customControls.collection.value);
      const layer = this.getLayer(layerFg, colorService, taggableFields);
      if (layer.type === GEOMETRY_TYPE.fill.toString() && !!layer.metadata && !!(layer.metadata as LayerMetadata).stroke) {
        const fillStrokeLayer: Layer = {
          source: layer.source,
          id: layer.id.replace(ARLAS_ID, FILLSTROKE_LAYER_PREFIX),
          type: GEOMETRY_TYPE.line.toString(),
          maxzoom: layer.maxzoom,
          filter: layer.filter,
          minzoom: layer.minzoom,
          layout: {
            visibility: layer.layout.visibility
          },
          paint: {
            'line-color': (layer.metadata.stroke as FillStroke).color,
            'line-opacity': (layer.metadata.stroke as FillStroke).opacity,
            'line-width': (layer.metadata.stroke as FillStroke).width
          }
        };
        fillStrokeLayers.push([fillStrokeLayer, layerFg.value.mode as LAYER_MODE]);
      }

      if (!!layer.metadata && !!layer.metadata.isScrollableLayer) {
        const scrollableLayer: Layer = {
          source: layer.source,
          id: layer.id.replace(ARLAS_ID, SCROLLABLE_ARLAS_ID),
          type: layer.type,
          maxzoom: layer.maxzoom,
          minzoom: layer.minzoom,
          metadata: {
            collection: layer.metadata.collection,
            isScrollableLayer: false
          },
          filter: layer.filter,
          layout: {
            visibility: layer.layout.visibility
          },
          paint: Object.assign({}, layer.paint)
        };
        if (layer.type === GEOMETRY_TYPE.fill.toString()) {
        } else if (layer.type === GEOMETRY_TYPE.circle.toString()) {
          scrollableLayer.paint['circle-stroke-width'] = 0;
        } else if (layer.type === GEOMETRY_TYPE.line.toString()) {
          scrollableLayer.paint['line-opacity'] = 0.1;
        }
        scrollableLayers.push([scrollableLayer, layerFg.value.mode as LAYER_MODE]);
      }
      return [layer, layerFg.value.mode as LAYER_MODE];

    });
    let layersHover: Array<[Layer, LAYER_MODE]> = mapConfigLayers.controls.map((layerFg: MapLayerFormGroup) => {
      const taggableFields = taggableFieldsMap.get(layerFg.customControls.collection.value);
      return [this.getLayer(layerFg, colorService, taggableFields), layerFg.value.mode as LAYER_MODE];
    });
    let layersSelect: Array<[Layer, LAYER_MODE]> = mapConfigLayers.controls.map((layerFg: MapLayerFormGroup) => {
      const taggableFields = taggableFieldsMap.get(layerFg.customControls.collection.value);
      return [this.getLayer(layerFg, colorService, taggableFields), layerFg.value.mode as LAYER_MODE];
    });

    layersHover = layersHover.concat(fillStrokeLayers)
      .filter(l => l[1] === LAYER_MODE.features)
      .filter(l => l[0].type === GEOMETRY_TYPE.line || l[0].type === GEOMETRY_TYPE.circle)
      .map(l => {
        const layer = Object.assign({}, l[0]);
        const id = layer.id;
        layer.id = HOVER_LAYER_PREFIX.concat(id);
        layer.layout = { visibility: VISIBILITY.none };
        layer.paint = Object.assign({}, l[0].paint);
        if (layer.type === GEOMETRY_TYPE.line) {
          layer.paint['line-width'] = this.addPixelToWidth(12, l[0].paint['line-width']);
        } else {
          layer.paint['circle-stroke-width'] = this.addPixelToWidth(12, l[0].paint['circle-stroke-width']);
        }
        return [layer, l[1]];
      });

    layersSelect = layersSelect.concat(fillStrokeLayers)
      .filter(l => l[1] === LAYER_MODE.features)
      .filter(l => l[0].type === GEOMETRY_TYPE.line || l[0].type === GEOMETRY_TYPE.circle)
      .map(l => {
        const layer = Object.assign({}, l[0]);
        const id = layer.id;
        layer.id = SELECT_LAYER_PREFIX.concat(id);
        layer.layout = { visibility: VISIBILITY.none };
        layer.paint = Object.assign({}, l[0].paint);
        if (layer.type === GEOMETRY_TYPE.line) {
          layer.paint['line-width'] = this.addPixelToWidth(12, l[0].paint['line-width']);
        } else {
          layer.paint['circle-stroke-width'] = this.addPixelToWidth(12, l[0].paint['circle-stroke-width']);
        }

        return [layer, l[1]];
      });
    const mapConfig: MapConfig = {
      layers: Array.from(new Set(layers.map(l => l[0]).concat(layersSelect.map(l => l[0])).concat(layersHover.map(l => l[0]))
        .concat(fillStrokeLayers.map(l => l[0])).concat(scrollableLayers.map(l => l[0])))).concat(labelLayers.map(l => l[0])),
      externalEventLayers: Array.from(new Set(layersHover.map(lh => ({
        id: lh[0].id,
        on: ExternalEvent.hover
      })).concat(layersSelect.map(lh => ({
        id: lh[0].id,
        on: ExternalEvent.select
      })))))
    };
    return mapConfig;
  }

  public static getLayerMetadata(collection: string, mode: LAYER_MODE, modeValues,
    colorService: ArlasColorGeneratorLoader, taggableFields?: Set<string>): LayerMetadata {
    const metadata: LayerMetadata = {
      collection
    };
    if (modeValues.styleStep.geometryType === GEOMETRY_TYPE.fill.toString()) {
      const fillStroke: FillStroke = {
        color: this.getMapProperty(modeValues.styleStep.strokeColorFg, mode, colorService, taggableFields),
        width: this.getMapProperty(modeValues.styleStep.strokeWidthFg, mode, colorService, taggableFields),
        opacity: this.getMapProperty(modeValues.styleStep.strokeOpacityFg, mode, colorService, taggableFields)
      };
      metadata.stroke = fillStroke;
    }
    if (mode === LAYER_MODE.features) {
      metadata.isScrollableLayer = modeValues.visibilityStep.renderMode === FeatureRenderMode.window;
    }
    return metadata;
  }
  public static getLayer(layerFg: MapLayerFormGroup, colorService: ArlasColorGeneratorLoader, taggableFields?: Set<string>): Layer {
    const mode = layerFg.value.mode as LAYER_MODE;
    const modeValues = layerFg.value.mode === LAYER_MODE.features ? layerFg.value.featuresFg :
      (layerFg.value.mode === LAYER_MODE.featureMetric ? layerFg.value.featureMetricFg : layerFg.value.clusterFg);

    const paint = this.getLayerPaint(modeValues, mode, colorService, taggableFields);
    const layout = this.getLayerLayout(modeValues, mode, colorService, taggableFields);
    const layerSource: LayerSourceConfig = ConfigExportHelper.getLayerSourceConfig(layerFg);
    const layer: Layer = {
      id: layerFg.value.arlasId,
      type: modeValues.styleStep.geometryType === 'label' ? 'symbol' : modeValues.styleStep.geometryType,
      source: layerSource.source,
      minzoom: modeValues.visibilityStep.zoomMin,
      maxzoom: modeValues.visibilityStep.zoomMax,
      layout,
      paint,
      metadata: this.getLayerMetadata(layerFg.customControls.collection.value, mode, modeValues, colorService, taggableFields)
    };
    /** 'all' is the operator that allows to apply an "AND" operator in mapbox */
    layer.filter = ['all'];
    const filters = !!modeValues.visibilityStep.filters ? modeValues.visibilityStep.filters.value : undefined;
    if (!!filters) {
      filters.forEach((f) => {
        const fieldPath = this.getArray(this.getFieldPath(f.filterField.value, taggableFields));
        if (f.filterOperation === FILTER_OPERATION.IN) {
          layer.filter.push([f.filterOperation.toLowerCase(), fieldPath, ['literal', f.filterInValues.map(v => v.value)]]);
        } else if (f.filterOperation === FILTER_OPERATION.NOT_IN) {
          layer.filter.push(['!', ['in', fieldPath, ['literal', f.filterInValues.map(v => v.value)]]]);
        } else if (f.filterOperation === FILTER_OPERATION.EQUAL) {
          layer.filter.push(['==', fieldPath, +f.filterEqualValues]);
        } else if (f.filterOperation === FILTER_OPERATION.NOT_EQUAL) {
          layer.filter.push(['!=', fieldPath, +f.filterEqualValues]);
        } else if (f.filterOperation === FILTER_OPERATION.RANGE) {
          layer.filter.push(['>=', fieldPath, +f.filterMinRangeValues]);
          layer.filter.push(['<=', fieldPath, +f.filterMaxRangeValues]);
        } else if (f.filterOperation === FILTER_OPERATION.OUT_RANGE) {
          /** 'any' is the operator that allows to apply a "OR" filter in mapbox  */
          const outRangeExpression: Array<any> = ['any'];
          outRangeExpression.push(['<', fieldPath, +f.filterMinRangeValues]);
          outRangeExpression.push(['>', fieldPath, +f.filterMaxRangeValues]);
          layer.filter.push(outRangeExpression);
        }
      });
    }
    /** This filter is added to layers to avoid metrics having 'Infinity' as a value */
    layer.filter = layer.filter.concat([this.getLayerFilters(modeValues, mode, taggableFields)]);
    return layer;
  }

  public static getLayerPaint(modeValues, mode, colorService: ArlasColorGeneratorLoader, taggableFields?: Set<string>) {
    const paint: Paint = {};
    const color = this.getMapProperty(modeValues.styleStep.colorFg, mode, colorService, taggableFields);
    const opacity = this.getMapProperty(modeValues.styleStep.opacity, mode, colorService, taggableFields);
    switch (modeValues.styleStep.geometryType) {
      case GEOMETRY_TYPE.fill: {
        paint['fill-opacity'] = opacity;
        paint['fill-color'] = color;
        break;
      }
      case GEOMETRY_TYPE.line: {
        paint['line-opacity'] = opacity;
        paint['line-color'] = color;
        paint['line-width'] = this.getMapProperty(modeValues.styleStep.widthFg, mode, colorService, taggableFields);
        const lineType = modeValues.styleStep.lineType;
        if (lineType !== LINE_TYPE.solid) {
          paint['line-dasharray'] = LINE_TYPE_VALUES.get(lineType);
        } else {
          delete paint['line-dasharray'];
        }
        break;
      }
      case GEOMETRY_TYPE.circle: {
        paint['circle-opacity'] = opacity;
        paint['circle-color'] = color;
        paint['circle-radius'] = this.getMapProperty(modeValues.styleStep.radiusFg, mode, colorService, taggableFields);
        paint['circle-stroke-width'] = this.getMapProperty(modeValues.styleStep.strokeWidthFg, mode, colorService, taggableFields);
        paint['circle-stroke-color'] = this.getMapProperty(modeValues.styleStep.strokeColorFg, mode, colorService, taggableFields);
        paint['circle-stroke-opacity'] = this.getMapProperty(modeValues.styleStep.strokeOpacityFg,
          mode, colorService, taggableFields);
        break;
      }
      case GEOMETRY_TYPE.heatmap: {
        paint['heatmap-color'] = color;
        paint['heatmap-opacity'] = opacity;
        paint['heatmap-intensity'] = this.getMapProperty(modeValues.styleStep.intensityFg, mode, colorService, taggableFields);
        paint['heatmap-weight'] = this.getMapProperty(modeValues.styleStep.weightFg, mode, colorService, taggableFields);
        paint['heatmap-radius'] = this.getMapProperty(modeValues.styleStep.radiusFg, mode, colorService, taggableFields);
        break;
      }
      case GEOMETRY_TYPE.label: {
        paint['text-color'] = color;
        paint['text-opacity']= opacity;
        paint['text-halo-color'] = this.getMapProperty(modeValues.styleStep.labelHaloColorFg, mode, colorService, taggableFields);
        paint['text-halo-width'] = this.getMapProperty(modeValues.styleStep.labelHaloWidthFg, mode, colorService, taggableFields);
        paint['text-halo-blur'] = this.getMapProperty(modeValues.styleStep.labelHaloBlurFg, mode, colorService, taggableFields);
        paint['text-translate'] = [+modeValues.styleStep.labelOffsetFg.dx, +modeValues.styleStep.labelOffsetFg.dy];

        break;
      }
    }
    return paint;
  }

  public static getLayerLayout(modeValues, mode, colorService: ArlasColorGeneratorLoader, taggableFields?: Set<string>) {
    const layout: Layout = {};
    layout.visibility = modeValues.visibilityStep.visible ? VISIBILITY.visible : VISIBILITY.none;
    switch (modeValues.styleStep.geometryType) {
      case GEOMETRY_TYPE.line: {
        layout['line-cap'] = 'round';
        layout['line-join'] = 'round';
        break;
      }
      case GEOMETRY_TYPE.label: {
        layout['text-field'] = this.getMapProperty(modeValues.styleStep.labelContentFg, mode, colorService, taggableFields);
        layout['text-font'] = ['Open Sans Bold','Arial Unicode MS Bold'];
        layout['text-size'] = this.getMapProperty(modeValues.styleStep.labelSizeFg, mode, colorService, taggableFields);
        layout['text-rotate'] = this.getMapProperty(modeValues.styleStep.labelRotationFg, mode, colorService, taggableFields);
        layout['text-allow-overlap'] = modeValues.styleStep.labelOverlapFg;
        layout['text-anchor'] = modeValues.styleStep.labelAlignmentCtrl;
        break;
      }
    }
    return layout;
  }

  public static getLayerFilters(modeValues, mode, taggableFields?: Set<string>) {
    let filterLayer: Array<any> = ['all'];
    const colorFilter = this.getFilter(modeValues.styleStep.colorFg, mode, taggableFields);
    if (colorFilter) {
      filterLayer = filterLayer.concat(colorFilter);
    }
    switch (modeValues.styleStep.geometryType) {
      case GEOMETRY_TYPE.line: {
        const lineFilter = this.getFilter(modeValues.styleStep.widthFg, mode, taggableFields);
        if (lineFilter) {
          filterLayer = filterLayer.concat(lineFilter);
        }
        break;
      }
      case GEOMETRY_TYPE.circle: {
        const circleFilter = this.getFilter(modeValues.styleStep.radiusFg, mode, taggableFields);
        if (circleFilter) {
          filterLayer = filterLayer.concat(circleFilter);
        }
        break;
      }
      case GEOMETRY_TYPE.heatmap: {
        const intensityFilter = this.getFilter(modeValues.styleStep.intensityFg, mode, taggableFields);
        if (intensityFilter) {
          filterLayer = filterLayer.concat(intensityFilter);
        }
        const weightFilter = this.getFilter(modeValues.styleStep.weightFg, mode, taggableFields);
        if (weightFilter) {
          filterLayer = filterLayer.concat(weightFilter);
        }
        const radiusFilter = this.getFilter(modeValues.styleStep.radiusFg, mode, taggableFields);
        if (radiusFilter) {
          filterLayer = filterLayer.concat(radiusFilter);
        }
        break;
      }
    }
    return filterLayer;
  }

  public static getMapProperty(fgValues: any, mode: LAYER_MODE, colorService: ArlasColorGeneratorLoader, taggableFields?: Set<string>) {
    switch (fgValues.propertySource) {
      case PROPERTY_SELECTOR_SOURCE.fix_color:
        return fgValues.propertyFixColor;
      case PROPERTY_SELECTOR_SOURCE.fix_slider:
        return +fgValues.propertyFixSlider;
      case PROPERTY_SELECTOR_SOURCE.fix_input:
        return fgValues.propertyFixInput;
      case PROPERTY_SELECTOR_SOURCE.provided_color:
        return this.getArray(fgValues.propertyProvidedColorFieldCtrl);
      case PROPERTY_SELECTOR_SOURCE.provided_field_for_agg:
        let suffix = '';
        if (fgValues.propertyProvidedFieldAggFg.propertyShortFormatCtrl) {
          suffix = ':_arlas__short_format';
        }
        return this.getArray(fgValues.propertyProvidedFieldAggFg.propertyProvidedFieldAggCtrl + suffix);
      case PROPERTY_SELECTOR_SOURCE.provided_field_for_feature:
      case PROPERTY_SELECTOR_SOURCE.provided_numeric_field_for_feature:
        let featureSuffix = '';
        if (fgValues.propertyProvidedFieldFeatureFg.propertyShortFormatCtrl) {
          featureSuffix = ':_arlas__short_format';
        }
        return this.getArray(fgValues.propertyProvidedFieldFeatureFg.propertyProvidedFieldFeatureCtrl + featureSuffix);
      case PROPERTY_SELECTOR_SOURCE.generated:
        return this.getArray(fgValues.propertyGeneratedFieldCtrl + '_arlas__color');
      case PROPERTY_SELECTOR_SOURCE.manual:
        const otherKC = (fgValues.propertyManualFg.propertyManualValuesCtrl as Array<KeywordColor>)
          .find(kc => kc.keyword === OTHER_KEYWORD);
        // always keep OTHER_KEYWORD at the end of the list
        const manualValues = !otherKC ? (fgValues.propertyManualFg.propertyManualValuesCtrl as Array<KeywordColor>) :
          (fgValues.propertyManualFg.propertyManualValuesCtrl as Array<KeywordColor>)
            .filter(kc => kc.keyword !== OTHER_KEYWORD).concat(otherKC);
        const manualField = this.getFieldPath(fgValues.propertyManualFg.propertyManualFieldCtrl, taggableFields);
        return [
          'match',
          this.getArray(manualField)
        ].concat(
          manualValues.flatMap(kc => kc.keyword !== OTHER_KEYWORD ?
            [kc.keyword, colorService.getColor(kc.keyword)] : [kc.color])
        );
      case PROPERTY_SELECTOR_SOURCE.displayable_metric_on_field:
      case PROPERTY_SELECTOR_SOURCE.metric_on_field: {
        const countMetricFg = fgValues.propertyCountOrMetricFg;
        let field = '';
        if (countMetricFg.propertyCountOrMetricCtrl === 'count') {
          field = 'count';
        } else {
          field = `${countMetricFg.propertyFieldCtrl.replace(/\./g, '_')}_${countMetricFg.propertyMetricCtrl.toLowerCase()}_`;
        }
        if (countMetricFg.propertyShortFormatCtrl) {
          if (field === 'count') {
            field = `${field}_:_arlas__short_format`;
          } else {
            field = `${field}:_arlas__short_format`;
          }
        }
        return [
          'get',
          field
        ];
      }
      case PROPERTY_SELECTOR_SOURCE.interpolated: {
        const interpolatedValues = fgValues.propertyInterpolatedFg;
        let interpolatedColor: Array<string | Array<string | number>>;
        const getField = () =>
          (interpolatedValues.propertyInterpolatedCountOrMetricCtrl === 'metric')
            ? interpolatedValues.propertyInterpolatedFieldCtrl + '_' +
            (interpolatedValues.propertyInterpolatedMetricCtrl as string).toLowerCase() + '_' :
            interpolatedValues.propertyInterpolatedFieldCtrl;

        if (mode !== LAYER_MODE.features && interpolatedValues.propertyInterpolatedCountOrMetricCtrl === 'count') {
          // for types FEATURE-METRIC and CLUSTER, if we interpolate by count
          interpolatedColor = [
            'interpolate',
            ['linear'],
            ['get', 'count' + (!!interpolatedValues.propertyInterpolatedCountNormalizeCtrl ? `_:${NORMALIZED}` : '')]
          ];
        } else if (interpolatedValues.propertyInterpolatedNormalizeCtrl) {
          // otherwise if we normalize
          interpolatedColor = [
            'interpolate',
            ['linear'],
            this.getArray(
              getField()
                .concat(':' + NORMALIZED)
                .concat(interpolatedValues.propertyInterpolatedNormalizeByKeyCtrl ?
                  ':' + interpolatedValues.propertyInterpolatedNormalizeLocalFieldCtrl : ''))
          ];
        } else {
          // if we don't normalize
          interpolatedColor = [
            'interpolate',
            ['linear'],
            this.getArray(getField())
          ];
        }
        return interpolatedColor.concat((interpolatedValues.propertyInterpolatedValuesCtrl as Array<ProportionedValues>)
          .flatMap(pc => [pc.proportion, pc.value]));
      }
      case PROPERTY_SELECTOR_SOURCE.heatmap_density: {
        const interpolatedValues = fgValues.propertyInterpolatedFg;
        const densityColor: Array<string | number | Array<string | number>> = [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(0, 0, 0, 0)',

        ];
        const hasNearZero = (interpolatedValues.propertyInterpolatedValuesCtrl as Array<ProportionedValues>)
          .filter(pc => pc.proportion > 0 && pc.proportion <= 0.01).length > 0;
        return densityColor.concat((interpolatedValues.propertyInterpolatedValuesCtrl as Array<ProportionedValues>)
          .filter(pc => hasNearZero ? pc.proportion > 0 : pc.proportion >= 0)
          .flatMap(pc => [(pc.proportion === 0 ? 0.000000000001 : pc.proportion), pc.value]));
      }
    }
  }

  public static getFieldPath(field: string, taggableFields: Set<string>): string {
    return (taggableFields && taggableFields.has(field)) ? field + '.0' : field;
  }

  public static getFilter(fgValues: any, mode: LAYER_MODE, taggableFields?: Set<string>) {
    switch (fgValues.propertySource) {
      case PROPERTY_SELECTOR_SOURCE.fix_color:
      case PROPERTY_SELECTOR_SOURCE.fix_input:
      case PROPERTY_SELECTOR_SOURCE.fix_slider:
        break;
      case PROPERTY_SELECTOR_SOURCE.provided_color:
        return null;
      case PROPERTY_SELECTOR_SOURCE.generated:
        return null;
      case PROPERTY_SELECTOR_SOURCE.manual:
        return null;
      case PROPERTY_SELECTOR_SOURCE.interpolated: {

        const interpolatedValues = fgValues.propertyInterpolatedFg;
        const getField = () =>
          (interpolatedValues.propertyInterpolatedCountOrMetricCtrl === 'metric')
            ? interpolatedValues.propertyInterpolatedFieldCtrl + '_' +
            (interpolatedValues.propertyInterpolatedMetricCtrl as string).toLowerCase() + '_' :
            interpolatedValues.propertyInterpolatedFieldCtrl;

        if (mode !== LAYER_MODE.features && interpolatedValues.propertyInterpolatedCountOrMetricCtrl === 'count') {
          // for types FEATURE-METRIC and CLUSTER, if we interpolate by count
          return null;
        } else if (interpolatedValues.propertyInterpolatedNormalizeCtrl) {
          // otherwise if we normalize
          const normalizedFlatField = getField()
            .concat(':' + NORMALIZED)
            .concat(interpolatedValues.propertyInterpolatedNormalizeByKeyCtrl ?
              ':' + interpolatedValues.propertyInterpolatedNormalizeLocalFieldCtrl.replace(/\./g, '_') : '');
          return [['<', ['get', normalizedFlatField.replace(/\./g, '_')], Number.MAX_VALUE],
            ['>', ['get', normalizedFlatField.replace(/\./g, '_')], -Number.MAX_VALUE]];
        } else {
          // if we don't normalize
          return [['<', ['get', getField().replace(/\./g, '_')], Number.MAX_VALUE],
            ['>', ['get', getField().replace(/\./g, '_')], -Number.MAX_VALUE]];
        }
      }
      case PROPERTY_SELECTOR_SOURCE.heatmap_density: {
        return null;
      }
    }
  }

  private static getArray(value: string) {
    return [
      'get',
      // flatten the fields
      value.replace(/\./g, '_')
    ];
  }
  private static addPixelToWidth(nbPixel: number, value: any): Array<string | Array<string> | number> | number {
    if (value instanceof Array) {
      const newValues = [];
      value.forEach((v, i) => (i > 2 && i % 2 === 0) ? newValues.push(v as number + nbPixel) : newValues.push(v));
      return newValues;
    } else {
      return value as number + nbPixel;
    }
  }
}
