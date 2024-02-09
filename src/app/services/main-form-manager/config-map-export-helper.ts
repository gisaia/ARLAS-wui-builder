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
import { KeywordColor, OTHER_KEYWORD } from '@map-config/components/dialog-color-table/models';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { MapLayerFormGroup } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import { FILTER_OPERATION, GEOMETRY_TYPE, LINE_TYPE } from '@map-config/services/map-layer-form-builder/models';
import { ARLAS_ID } from '@services/main-form/main-form.service';
import { PROPERTY_SELECTOR_SOURCE, ProportionedValues } from '@shared-services/property-selector-form-builder/models';
import { ArlasColorService, FillStroke, LayerMetadata, SCROLLABLE_ARLAS_ID } from 'arlas-web-components';
import { LayerSourceConfig } from 'arlas-web-contributors';
import { FeatureRenderMode } from 'arlas-web-contributors/models/models';
import { LINE_TYPE_VALUES } from '../../modules/map-config/services/map-layer-form-builder/models';
import { ConfigExportHelper } from './config-export-helper';
import {
  ExternalEvent,
  FILLSTROKE_LAYER_PREFIX,
  HOVER_LAYER_PREFIX,
  Layer,
  Layout,
  MapConfig,
  Paint, PaintValue,
  SELECT_LAYER_PREFIX
} from './models-map-config';
import {InterpolatedProperty, ModesValues} from '@shared/interfaces/config-map.interfaces';
import {CIRCLE_HEATMAP_RADIUS_GRANULARITY} from '@shared-models/circle-heat-map-radius-granularity';
export enum VISIBILITY {
  visible = 'visible',
  none = 'none'
}

export const NORMALIZED = 'normalized';
export class ConfigMapExportHelper {

  public static process(mapConfigLayers: FormArray, colorService: ArlasColorService,
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
            collectionDisplayName: layer.metadata.collectionDisplayName,
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

  public static getLayerMetadata(collection: string, collectionDisplayName: string,
    mode: LAYER_MODE, modeValues,
    colorService: ArlasColorService, taggableFields?: Set<string>): LayerMetadata {
    const metadata: LayerMetadata = {
      collection,
      collectionDisplayName
    };

    // with this prop we ll be able to restore the good geomType when we ll reload the layer;
    if (metadata.hasOwnProperty('hiddenProps')) {
      delete metadata['hiddenProps'];
    }

    if(modeValues.styleStep.geometryType === GEOMETRY_TYPE.circleHeat) {
      metadata.hiddenProps = {geomType: GEOMETRY_TYPE.circleHeat};
    }


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
  public static getLayer(layerFg: MapLayerFormGroup, colorService: ArlasColorService, taggableFields?: Set<string>): Layer {
    const mode = layerFg.value.mode as LAYER_MODE;
    const modeValues = layerFg.value.mode === LAYER_MODE.features ? layerFg.value.featuresFg :
      (layerFg.value.mode === LAYER_MODE.featureMetric ? layerFg.value.featureMetricFg : layerFg.value.clusterFg);

    const paint = this.getLayerPaint(modeValues, mode, colorService, taggableFields);
    const layout = this.getLayerLayout(modeValues, mode, colorService, taggableFields);
    const layerSource: LayerSourceConfig = ConfigExportHelper.getLayerSourceConfig(layerFg);
    const layer: Layer = {
      id: layerFg.value.arlasId,
      type: this.getLayerType(modeValues.styleStep.geometryType),
      source: layerSource.source,
      minzoom: modeValues.visibilityStep.zoomMin,
      maxzoom: modeValues.visibilityStep.zoomMax,
      layout,
      paint,
      metadata: this.getLayerMetadata(layerFg.customControls.collection.value, layerFg.customControls.collectionDisplayName.value,
        mode, modeValues, colorService, taggableFields)
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
        } else if (f.filterOperation === FILTER_OPERATION.IS) {
          layer.filter.push(['in', fieldPath, ['literal', [f.filterBoolean, `${f.filterBoolean.toString()}`]]]);
        }
      });
    }
    /** This filter is added to layers to avoid metrics having 'Infinity' as a value */
    layer.filter = layer.filter.concat([this.getLayerFilters(modeValues, mode, taggableFields)]);
    return layer;
  }

  /**
   * set the correct layer type before we save it.
   * @param geometryType
   */
  public static getLayerType(geometryType: GEOMETRY_TYPE): GEOMETRY_TYPE | string {
    /** we change the type of circle heat map  to keep the compatibility with mapbox **/
    if(geometryType === GEOMETRY_TYPE.circleHeat){
      return GEOMETRY_TYPE.circle;
    }

    return geometryType === 'label' ? 'symbol' : geometryType;
  }

  public static getLayerPaint(modeValues, mode, colorService: ArlasColorService, taggableFields?: Set<string>) {
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
        paint['text-opacity'] = opacity;
        paint['text-halo-color'] = this.getMapProperty(modeValues.styleStep.labelHaloColorFg, mode, colorService, taggableFields);
        paint['text-halo-width'] = this.getMapProperty(modeValues.styleStep.labelHaloWidthFg, mode, colorService, taggableFields);
        paint['text-halo-blur'] = this.getMapProperty(modeValues.styleStep.labelHaloBlurFg, mode, colorService, taggableFields);
        paint['text-translate'] = [+modeValues.styleStep.labelOffsetFg.dx, +modeValues.styleStep.labelOffsetFg.dy];

        break;
      }
      case GEOMETRY_TYPE.circleHeat: {
        paint['circle-stroke-opacity'] = 0;
        paint['circle-stroke-color'] = color;
        paint['circle-opacity'] = opacity;
        paint['circle-color'] = color;
        paint['circle-radius'] = this.getRadPropFromGranularity(modeValues as ModesValues);
        paint['circle-blur'] = 1;
        break;
      }
    }
    return paint;
  }

  public static getLayerLayout(modeValues, mode, colorService: ArlasColorService, taggableFields?: Set<string>) {
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
        layout['text-font'] = ['Open Sans Bold', 'Arial Unicode MS Bold'];
        layout['text-size'] = this.getMapProperty(modeValues.styleStep.labelSizeFg, mode, colorService, taggableFields);
        layout['text-rotate'] = this.getMapProperty(modeValues.styleStep.labelRotationFg, mode, colorService, taggableFields);
        layout['text-allow-overlap'] = modeValues.styleStep.labelOverlapFg;
        layout['text-anchor'] = modeValues.styleStep.labelAlignmentCtrl;
        layout['symbol-placement'] = modeValues.styleStep.labelPlacementCtrl;
        break;
      }
      case GEOMETRY_TYPE.circleHeat: {
        layout['circle-sort-key'] = this.getCircleHeatMapSortKey(modeValues.styleStep.colorFg, mode);
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
      case GEOMETRY_TYPE.label: {
        const orientationFilter = this.getFilter(modeValues.styleStep.labelRotationFg, mode, taggableFields);
        if (orientationFilter) {
          filterLayer = filterLayer.concat(orientationFilter);
        }
        const sizeFilter = this.getFilter(modeValues.styleStep.labelSizeFg, mode, taggableFields);
        if (sizeFilter) {
          filterLayer = filterLayer.concat(sizeFilter);
        }
        const haloWidthFilter = this.getFilter(modeValues.styleStep.labelHaloWidthFg, mode, taggableFields);
        if (haloWidthFilter) {
          filterLayer = filterLayer.concat(haloWidthFilter);
        }
        const haloBlurFilter = this.getFilter(modeValues.styleStep.labelHaloBlurFg, mode, taggableFields);
        if (haloBlurFilter) {
          filterLayer = filterLayer.concat(haloBlurFilter);
        }
      }
    }
    return filterLayer;
  }

  public static getMapProperty(fgValues: any, mode: LAYER_MODE, colorService: ArlasColorService, taggableFields?: Set<string>) {
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
        const values = (interpolatedValues.propertyInterpolatedValuesCtrl as Array<ProportionedValues>)
          .flatMap(pc => [pc.proportion, pc.value]);
        return this.buildPropsValuesFromInterpolatedValues(interpolatedValues, mode, values);
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

  /**
   * Build the correct array from interpolated values to obtain an array that respects the MapBox expression format
   * https://docs.mapbox.com/style-spec/reference/expressions/
   * @param interpolatedValues interpolated properties that determine the type of array we build ( count, normalize )
   * @param mode
   * @param valuesToInsert the value to insert at the end of the array
   * @private
   */
  private static buildPropsValuesFromInterpolatedValues(interpolatedValues: InterpolatedProperty,
    mode: LAYER_MODE,
    valuesToInsert?: (string | number)[]){
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

    if (valuesToInsert) {
      return interpolatedColor.concat(valuesToInsert);
    }

    return interpolatedColor;
  }

  /**
   *  Method used to construct the key props.
   *  based on color props.
   */
  public static getCircleHeatMapSortKey(fgValues: any, mode: LAYER_MODE): PaintValue {
    switch (fgValues.propertySource) {
      case PROPERTY_SELECTOR_SOURCE.fix_color:
        return 1;
      case PROPERTY_SELECTOR_SOURCE.interpolated:
        const interpolatedValues = fgValues.propertyInterpolatedFg as InterpolatedProperty;
        const minValue = interpolatedValues.propertyInterpolatedValuesCtrl[0].proportion;
        const maxValue = interpolatedValues
          .propertyInterpolatedValuesCtrl[interpolatedValues.propertyInterpolatedValuesCtrl.length - 1]
          .proportion;
        // those values ([minValue, 0, maxValue, 8]) don't have a special meaning and made to guarantee the interpolation of the circle sort key
        return <PaintValue> this.buildPropsValuesFromInterpolatedValues(interpolatedValues, mode, [minValue, 0, maxValue, 8]);
    }
  }

  /**
   *  set default Radius according to granularity. WARNING : only for circle-heatMap
   */
  public static getRadPropFromGranularity(modeValues: ModesValues): PaintValue {
    const granularity = modeValues.geometryStep.granularity?.toLowerCase();
    const aggType = modeValues.geometryStep.aggType?.toLowerCase();
    const radiusSteps = CIRCLE_HEATMAP_RADIUS_GRANULARITY[aggType][granularity] || [];
    return [
      'interpolate',
      [
        'linear'
      ],
      ['zoom'],
      ...radiusSteps
    ];
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
      case PROPERTY_SELECTOR_SOURCE.metric_on_field:
        if (fgValues.propertyCountOrMetricFg && fgValues.propertyCountOrMetricFg.propertyCountOrMetricCtrl
          && fgValues.propertyCountOrMetricFg.propertyCountOrMetricCtrl === 'metric') {
          const flatField = fgValues.propertyCountOrMetricFg.propertyFieldCtrl.replace(/\./g, '_');
          const metric = (fgValues.propertyCountOrMetricFg.propertyMetricCtrl as string).toLowerCase();
          const layerField = `${flatField}_${metric}_`;
          return [['<', ['get', layerField], Number.MAX_VALUE], ['>', ['get', layerField], -Number.MAX_VALUE]];
        }
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
