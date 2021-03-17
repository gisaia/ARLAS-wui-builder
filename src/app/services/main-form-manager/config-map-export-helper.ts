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
import { FormArray, FormGroup, Form } from '@angular/forms';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { Paint, Layer, MapConfig, ExternalEvent } from './models-map-config';
import { GEOMETRY_TYPE, FILTER_OPERATION } from '@map-config/services/map-layer-form-builder/models';
import { PROPERTY_SELECTOR_SOURCE, ProportionedValues } from '@shared-services/property-selector-form-builder/models';
import { KeywordColor, OTHER_KEYWORD } from '@map-config/components/dialog-color-table/models';
import { ConfigExportHelper } from './config-export-helper';
import { LayerSourceConfig } from 'arlas-web-contributors';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { MapFilterFormGroup } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import { equal } from 'assert';

export enum VISIBILITY {
    visible = 'visible',
    none = 'none'
}
export const NORMALIZED = 'normalized';
export class ConfigMapExportHelper {

    public static process(mapConfigLayers: FormArray, colorService: ArlasColorGeneratorLoader, taggableFields?: Set<string>) {

        const layers: Array<[Layer, LAYER_MODE]> = mapConfigLayers.controls.map((layerFg: FormGroup) => {
            return [this.getLayer(layerFg, colorService, taggableFields), layerFg.value.mode as LAYER_MODE];
        });
        let layersHover: Array<[Layer, LAYER_MODE]> = mapConfigLayers.controls.map((layerFg: FormGroup) => {
            return [this.getLayer(layerFg, colorService, taggableFields), layerFg.value.mode as LAYER_MODE];
        });
        let layersSelect: Array<[Layer, LAYER_MODE]> = mapConfigLayers.controls.map((layerFg: FormGroup) => {
            return [this.getLayer(layerFg, colorService, taggableFields), layerFg.value.mode as LAYER_MODE];
        });

        layersHover = layersHover
            .filter(l => l[1] === LAYER_MODE.features)
            .filter(l => l[0].type === GEOMETRY_TYPE.line || l[0].type === GEOMETRY_TYPE.circle)
            .map(l => {
                const id = l[0].id;
                l[0].id = 'arlas-hover-'.concat(id);
                l[0].layout.visibility = VISIBILITY.none;
                l[0].type === GEOMETRY_TYPE.line ? l[0].paint['line-width'] = this.addPixelToWidth(12, l[0].paint['line-width'])
                    : l[0].paint['circle-stroke-width'] = this.addPixelToWidth(12, l[0].paint['circle-stroke-width']);
                return [l[0], l[1]];
            });

        layersSelect = layersSelect
            .filter(l => l[1] === LAYER_MODE.features)
            .filter(l => l[0].type === GEOMETRY_TYPE.line || l[0].type === GEOMETRY_TYPE.circle)
            .map(l => {
                const id = l[0].id;
                l[0].id = 'arlas-select-'.concat(id);
                l[0].layout.visibility = VISIBILITY.none;
                l[0].type === GEOMETRY_TYPE.line ? l[0].paint['line-width'] = this.addPixelToWidth(12, l[0].paint['line-width'])
                    : l[0].paint['circle-stroke-width'] = this.addPixelToWidth(12, l[0].paint['circle-stroke-width']);
                return [l[0], l[1]];
            });
        const mapConfig: MapConfig = {
            layers: Array.from(new Set(layers.map(l => l[0]).concat(layersSelect.map(l => l[0])).concat(layersHover.map(l => l[0])))),
            externalEventLayers: Array.from(new Set(layersHover.map(lh => {
                return {
                    id: lh[0].id,
                    on: ExternalEvent.hover
                };
            }).concat(layersSelect.map(lh => {
                return {
                    id: lh[0].id,
                    on: ExternalEvent.select
                };
            }))))
        };
        return mapConfig;
    }


    public static getLayer(layerFg: FormGroup, colorService: ArlasColorGeneratorLoader, taggableFields?: Set<string>): Layer {
        const mode = layerFg.value.mode as LAYER_MODE;
        const modeValues = layerFg.value.mode === LAYER_MODE.features ? layerFg.value.featuresFg :
            (layerFg.value.mode === LAYER_MODE.featureMetric ? layerFg.value.featureMetricFg : layerFg.value.clusterFg);

        const paint = this.getLayerPaint(modeValues, mode, colorService, taggableFields);
        const layerSource: LayerSourceConfig = ConfigExportHelper.getLayerSourceConfig(layerFg);
        const layer: Layer = {
            id: layerFg.value.arlasId,
            type: modeValues.styleStep.geometryType,
            source: layerSource.source,
            minzoom: modeValues.visibilityStep.zoomMin,
            maxzoom: modeValues.visibilityStep.zoomMax,
            layout: {
                visibility: modeValues.visibilityStep.visible ? VISIBILITY.visible : VISIBILITY.none
            },
            paint
        };
        if (modeValues.styleStep.geometryType === GEOMETRY_TYPE.line) {
            layer.layout['line-cap'] = 'round';
            layer.layout['line-join'] = 'round';
        }
        /** 'all' is the operator that allows to apply an "AND" operator in mapbox */
        layer.filter = ['all'];
        const filters = !!modeValues.visibilityStep.filters ? modeValues.visibilityStep.filters.value : undefined;
        if (!!filters) {
            filters.forEach((f) => {
                const fieldPath = this.getArray(this.getFieldPath(f.filterField.value, taggableFields));
                if (f.filterOperation === FILTER_OPERATION.IN) {
                    layer.filter.push([f.filterOperation.toLowerCase(), fieldPath, ['literal', f.filterInValues]]);
                } else if (f.filterOperation === FILTER_OPERATION.NOT_IN) {
                    layer.filter.push(['!', ['in', fieldPath, ['literal', f.filterInValues]]]);
                } else if (f.filterOperation === FILTER_OPERATION.EQUAL) {
                    layer.filter.push(['==', fieldPath, f.filterEqualValues]);
                } else if (f.filterOperation === FILTER_OPERATION.NOT_EQUAL) {
                    layer.filter.push(['!=', fieldPath, f.filterEqualValues]);
                } else if (f.filterOperation === FILTER_OPERATION.RANGE) {
                    layer.filter.push(['>=', fieldPath, f.filterMinRangeValues]);
                    layer.filter.push(['<=', fieldPath, f.filterMaxRangeValues]);
                } else if (f.filterOperation === FILTER_OPERATION.OUT_RANGE) {
                    /** 'any' is the operator that allows to apply a "OR" filter in mapbox  */
                    const outRangeExpression: Array<any> = ['any'];
                    outRangeExpression.push(['<', fieldPath, f.filterMinRangeValues]);
                    outRangeExpression.push(['>', fieldPath, f.filterMaxRangeValues]);
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
        const opacity = modeValues.styleStep.opacity;
        const color = this.getMapProperty(modeValues.styleStep.colorFg, mode, colorService, taggableFields);
        switch (modeValues.styleStep.geometryType) {
            case GEOMETRY_TYPE.fill: {
                paint['fill-opacity'] = this.getMapProperty(modeValues.styleStep.opacity, mode, colorService, taggableFields);
                paint['fill-color'] = color;
                break;
            }
            case GEOMETRY_TYPE.line: {
                paint['line-opacity'] = this.getMapProperty(modeValues.styleStep.opacity, mode, colorService, taggableFields);
                paint['line-color'] = color;
                paint['line-width'] = this.getMapProperty(modeValues.styleStep.widthFg, mode, colorService, taggableFields);
                break;
            }
            case GEOMETRY_TYPE.circle: {
                paint['circle-opacity'] = this.getMapProperty(modeValues.styleStep.opacity, mode, colorService, taggableFields);
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
                paint['heatmap-opacity'] = this.getMapProperty(modeValues.styleStep.opacity, mode, colorService, taggableFields);
                paint['heatmap-intensity'] = this.getMapProperty(modeValues.styleStep.intensityFg, mode, colorService, taggableFields);
                paint['heatmap-weight'] = this.getMapProperty(modeValues.styleStep.weightFg, mode, colorService, taggableFields);
                paint['heatmap-radius'] = this.getMapProperty(modeValues.styleStep.radiusFg, mode, colorService, taggableFields);
            }
        }
        return paint;
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
            case PROPERTY_SELECTOR_SOURCE.fix:
                return fgValues.propertyFix;
            case PROPERTY_SELECTOR_SOURCE.provided:
                return this.getArray(fgValues.propertyProvidedFieldCtrl);
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
                        ['get', 'count' + (!!interpolatedValues.propertyInterpolatedCountNormalizeCtrl ? '_:normalized' : '')]
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
                let densityColor: Array<string | number | Array<string | number>>;
                densityColor = [
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
            case PROPERTY_SELECTOR_SOURCE.fix:
                break;
            case PROPERTY_SELECTOR_SOURCE.provided:
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
                    return [['<', [ 'get', normalizedFlatField], Infinity],
                    ['>', [ 'get', normalizedFlatField], -Infinity]]
                        ;
                } else {
                    // if we don't normalize
                    return [['<', ['get', getField().replace(/\./g, '_')], Infinity],
                         ['>', ['get', getField().replace(/\./g, '_')], -Infinity]];
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
            return value.map((v, i) =>  (i > 2 && i % 2 === 0) ? v as number + nbPixel : v );
        } else {
            return value as number + nbPixel;
        }
    }
}
