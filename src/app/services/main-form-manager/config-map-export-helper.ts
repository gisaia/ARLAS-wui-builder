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
import { GEOMETRY_TYPE, CLUSTER_GEOMETRY_TYPE } from '@map-config/components/edit-layer-mode-form/models';
import { PROPERTY_SELECTOR_SOURCE, ProportionedValues } from '@shared-components/property-selector/models';
import { KeywordColor } from '@map-config/components/dialog-color-table/models';

export class ConfigMapExportHelper {

    public static process(mapConfigLayers: FormArray, sourceByMode: Map<string, string>) {

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
                    paint.lineOpacity = colorOpacity;
                    paint['line-color'] = color;
                    paint.lineWidth = this.getMapProperty(modeValues.styleStep.widthFg, mode);
                    break;
                }
                case GEOMETRY_TYPE.circle: {
                    paint['circle-opacity'] = colorOpacity;
                    paint['circle-color'] = color;
                    paint['circle-radius'] = +this.getMapProperty(modeValues.styleStep.radiusFg, mode);
                    break;
                }
                case GEOMETRY_TYPE.heatmap: {
                    paint.heatmapColor = color;
                    paint.heatmapIntensity = this.getMapProperty(modeValues.styleStep.intensityFg, mode);
                    paint.heatmapWeight = this.getMapProperty(modeValues.styleStep.weightFg, mode);
                    paint.heatmapRadius = this.getMapProperty(modeValues.styleStep.radiusFg, mode);
                }
            }

            const layer: Layer = {
                id: layerFg.value.name,
                type: modeValues.styleStep.geometryType,
                source: sourceByMode.get(layerFg.value.mode),
                minzoom: modeValues.visibilityStep.zoomMin,
                maxzoom: modeValues.visibilityStep.zoomMax,
                layout: {
                    visibility: modeValues.visibilityStep.visible ? 'visible' : 'none'
                },
                paint,
                filter: null
            };

            switch (mode) {
                case LAYER_MODE.features: {
                    layer.filter = [
                        'all',
                        [
                            '==',
                            'geometry_path',
                            modeValues.geometryStep.geometry,
                        ],
                        [
                            '==',
                            'feature_type',
                            'hit'
                        ]
                    ];
                    break;
                }
                case LAYER_MODE.featureMetric: {
                    layer.filter = [
                        'all',
                        [
                            '==',
                            'geometry_ref',
                            modeValues.geometryStep.geometry,
                        ],
                        [
                            '==',
                            'geometry_type',
                            'raw'
                        ],
                        [
                            '==',
                            'feature_type',
                            'aggregation'
                        ]
                    ];
                    break;
                }
                case LAYER_MODE.cluster: {
                    const clusterType = modeValues.geometryStep.clusterGeometryType;
                    layer.filter = [
                        'all',
                        [
                            '==',
                            'geometry_ref',
                            clusterType === CLUSTER_GEOMETRY_TYPE.raw_geometry ?
                                modeValues.geometryStep.rawGeometry : modeValues.geometryStep.aggregatedGeometry
                        ],
                        [
                            '==',
                            'geometry_type',
                            clusterType === CLUSTER_GEOMETRY_TYPE.raw_geometry ? 'raw' : 'aggregated'
                        ],
                        [
                            '==',
                            'feature_type',
                            'aggregation'
                        ]
                    ];
                    break;
                }
            }

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
                    this.getArray(fgValues.propertyManualFg.propertyManualFieldCtrl + '_color')
                ].concat(
                    (fgValues.propertyManualFg.propertyManualValuesCtrl as Array<KeywordColor>)
                        .flatMap(kc => kc.keyword !== 'OTHER' ? [kc.keyword, kc.color] : [kc.color])
                );
            case PROPERTY_SELECTOR_SOURCE.interpolated: {

                const interpolatedValues = fgValues.propertyInterpolatedFg;
                let interpolatedColor: Array<string | Array<string | number>>;
                const getField = (mode === LAYER_MODE.features) ? interpolatedValues.propertyInterpolatedFieldCtrl :
                    interpolatedValues.propertyInterpolatedFieldCtrl + '_' + interpolatedValues.propertyInterpolatedMetricCtrl + '_';

                if (interpolatedValues.propertyInterpolatedNormalizeCtrl) {
                    if (interpolatedValues.propertyInterpolatedCountOrMetricCtrl) {
                        interpolatedColor = [
                            'interpolate',
                            ['linear'],
                            this.getArray(
                                getField
                                    .concat(':')
                                    .concat(interpolatedValues.propertyInterpolatedScopeCtrl)
                                    .concat(interpolatedValues.propertyInterpolatedNormalizeByKeyCtrl ?
                                        ':' + interpolatedValues.propertyInterpolatedNormalizeLocalFieldCtrl : ''))
                        ];
                    } else {
                        let pointCountNormalzedColor: Array<string | Array<string | number>>;
                        pointCountNormalzedColor = [
                            'interpolate',
                            ['linear'],
                            ['get', 'point_count_normalized']
                        ];
                        return pointCountNormalzedColor
                            .concat((interpolatedValues.propertyInterpolatedValuesCtrl as Array<ProportionedValues>)
                                .flatMap(pc => [pc.proportion, pc.value]));
                    }
                } else {

                    interpolatedColor = [
                        'interpolate',
                        ['linear'],
                        this.getArray(getField)
                    ];
                }
                return interpolatedColor.concat((interpolatedValues.propertyInterpolatedValuesCtrl as Array<ProportionedValues>)
                    .flatMap(pc => [pc.proportion, pc.value]));
            }
            case PROPERTY_SELECTOR_SOURCE.heatmap_density: {
                const interpolatedValues = fgValues.propertyInterpolatedFg;
                let densityColor: Array<string | Array<string | number>>;
                densityColor = [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    '0',
                    'rgba(0, 0, 0, 0)',

                ];
                return densityColor.concat((interpolatedValues.propertyInterpolatedValuesCtrl as Array<ProportionedValues>)
                    .flatMap(pc => [(pc.proportion === 0 ? '0.000000000001' : pc.proportion), pc.value]));
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
