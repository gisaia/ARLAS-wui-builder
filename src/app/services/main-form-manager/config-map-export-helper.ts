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
import { FormArray, FormGroup } from '@angular/forms';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { Paint, Layer, MapConfig } from './models-map-config';
import { GEOMETRY_TYPE } from '@map-config/components/edit-layer-mode-form/models';
import { PROPERTY_SELECTOR_SOURCE, ProportionedValues } from '@shared-components/property-selector/models';
import { KeywordColor, OTHER_KEYWORD } from '@map-config/components/dialog-color-table/models';
import { ConfigExportHelper } from './config-export-helper';
import { LayerSourceConfig } from 'arlas-web-contributors';

export enum VISIBILITY {
    visible = 'visible',
    none = 'none'
}
export const NORMALIZED = 'normalized';
export class ConfigMapExportHelper {

    public static process(mapConfigLayers: FormArray) {

        const layers: Array<Layer> = mapConfigLayers.controls.map((layerFg: FormGroup) => {
            const mode = layerFg.value.mode as LAYER_MODE;
            const modeValues = layerFg.value.mode === LAYER_MODE.features ? layerFg.value.featuresFg :
                (layerFg.value.mode === LAYER_MODE.featureMetric ? layerFg.value.featureMetricFg : layerFg.value.clusterFg);

            const paint: Paint = {};
            const colorOpacity = modeValues.styleStep.opacity;
            const color = this.getMapProperty(modeValues.styleStep.colorFg, mode);

            switch (modeValues.styleStep.geometryType) {
                case GEOMETRY_TYPE.fill: {
                    paint['fill-opacity'] = colorOpacity;
                    paint['fill-color'] = color;
                    break;
                }
                case GEOMETRY_TYPE.line: {
                    paint['line-opacity'] = colorOpacity;
                    paint['line-color'] = color;
                    paint['line-width'] = this.getMapProperty(modeValues.styleStep.widthFg, mode);
                    break;
                }
                case GEOMETRY_TYPE.circle: {
                    paint['circle-opacity'] = colorOpacity;
                    paint['circle-color'] = color;
                    paint['circle-radius'] = +this.getMapProperty(modeValues.styleStep.radiusFg, mode);
                    break;
                }
                case GEOMETRY_TYPE.heatmap: {
                    paint['heatmap-color'] = color;
                    paint['heatmap-intensity'] = this.getMapProperty(modeValues.styleStep.intensityFg, mode);
                    paint['heatmap-weight'] = this.getMapProperty(modeValues.styleStep.weightFg, mode);
                    paint['heatmap-radius'] = this.getMapProperty(modeValues.styleStep.radiusFg, mode);
                }
            }
            const layerSource: LayerSourceConfig = ConfigExportHelper.getLayerSourceConfig(layerFg);
            const layer: Layer = {
                id: layerFg.value.name,
                type: modeValues.styleStep.geometryType,
                source: layerSource.source,
                minzoom: modeValues.visibilityStep.zoomMin,
                maxzoom: modeValues.visibilityStep.zoomMax,
                layout: {
                    visibility: modeValues.visibilityStep.visible ? VISIBILITY.visible : VISIBILITY.none
                },
                paint,
            };

            return layer;
        });

        const mapConfig: MapConfig = {
            layers
        };

        return mapConfig;
    }

    private static getMapProperty(fgValues: any, mode: LAYER_MODE) {
        switch (fgValues.propertySource) {
            case PROPERTY_SELECTOR_SOURCE.fix:
                return fgValues.propertyFix;
            case PROPERTY_SELECTOR_SOURCE.provided:
                return this.getArray(fgValues.propertyProvidedFieldCtrl);
            case PROPERTY_SELECTOR_SOURCE.generated:
                return this.getArray(fgValues.propertyGeneratedFieldCtrl + '_color');
            case PROPERTY_SELECTOR_SOURCE.manual:
                return [
                    'match',
                    this.getArray(fgValues.propertyManualFg.propertyManualFieldCtrl)
                ].concat(
                    (fgValues.propertyManualFg.propertyManualValuesCtrl as Array<KeywordColor>)
                        .flatMap(kc => kc.keyword !== OTHER_KEYWORD ? [kc.keyword, kc.color] : [kc.color])
                );
            case PROPERTY_SELECTOR_SOURCE.interpolated: {

                const interpolatedValues = fgValues.propertyInterpolatedFg;
                let interpolatedColor: Array<string | Array<string | number>>;
                const getField = () => (mode === LAYER_MODE.features) ? interpolatedValues.propertyInterpolatedFieldCtrl :
                    interpolatedValues.propertyInterpolatedFieldCtrl + '_' +
                    (interpolatedValues.propertyInterpolatedMetricCtrl as string).toLowerCase() + '_';

                if (mode !== LAYER_MODE.features && !interpolatedValues.propertyInterpolatedCountOrMetricCtrl) {
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
                return densityColor.concat((interpolatedValues.propertyInterpolatedValuesCtrl as Array<ProportionedValues>)
                    .flatMap(pc => [(pc.proportion === 0 ? 0.000000000001 : pc.proportion), pc.value]));
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

}
