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
import { FormGroup, FormArray } from '@angular/forms';
import { Config, Contributor, LayerSource } from './models-config';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-components/property-selector/models';

export class ConfigExportHelper {

    public static process(mapConfigGlobal: FormGroup, mapConfigLayers: FormArray, sourceByMode: Map<string, string>): any {
        const config: Config = {
            arlas: {
                web: {
                    contributors: []
                }
            }
        };

        const mapContributor: Contributor = {
            type: 'map',
            identifier: 'mapbox',
            geoQueryOp: mapConfigGlobal.value.geographicalOperator,
            geoQueryField: mapConfigGlobal.value.requestGeometries[0].requestGeom,
            layers_sources: []
        };

        const layersSources: Array<LayerSource> = mapConfigLayers.controls.map((layerFg: FormGroup) => {
            const layerValues = layerFg.value;
            const modeValues = layerValues.modeFg;
            const layerSource: LayerSource = {
                id: layerValues.name,
                source: sourceByMode.get(layerFg.value.mode),
                minzoom: modeValues.visibilityStep.zoomMinCtrl,
                maxzoom: modeValues.visibilityStep.zoomMaxCtrl,
                maxfeatures: modeValues.visibilityStep.featuresMaxCtrl,
                include_fields: [],
                normalization_fields: [],
                metrics: []
            };

            switch (layerValues.mode) {
                case LAYER_MODE.features: {
                    break;
                }
                case LAYER_MODE.featureMetric: {
                    layerSource.geometry_support = modeValues.geometryStep.geometryCtrl;
                    layerSource.geometry_id = modeValues.geometryStep.geometryIdCtrl;
                    break;
                }
            }

            this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.colorFg, layerValues.mode);

            if (!!modeValues.styleStep.widthFg) {
                this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.widthFg, layerValues.mode);
            }

            if (!!modeValues.styleStep.radiusFg) {
                this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.radiusFg, layerValues.mode);
            }

            return layerSource;
        });

        mapContributor.layers_sources = layersSources;
        config.arlas.web.contributors.push(mapContributor);

        return config;
    }

    private static addLayerSourceInterpolationData(layerSource: LayerSource, layerValues: any, mode: LAYER_MODE) {
        switch (layerValues.propertySourceCtrl) {
            case PROPERTY_SELECTOR_SOURCE.fix: {
                break;
            }
            case PROPERTY_SELECTOR_SOURCE.provided: {
                layerSource.include_fields.push(layerValues.propertyProvidedFieldCtrl);
                break;
            }
            case PROPERTY_SELECTOR_SOURCE.generated: {
                layerSource.color_from_field = layerValues.propertyGeneratedFieldCtrl;
                break;
            }
            case PROPERTY_SELECTOR_SOURCE.manual: {
                layerSource.include_fields.push(layerValues.propertyManualFg.propertyManualFieldCtrl);
                break;
            }
            case PROPERTY_SELECTOR_SOURCE.interpolated: {
                const interpolatedValues = layerValues.propertyInterpolatedFg;

                if (mode === LAYER_MODE.features) {
                    if (interpolatedValues.propertyInterpolatedNormalizeCtrl) {
                        layerSource.normalization_fields.push(
                            {
                                on: interpolatedValues.propertyInterpolatedFieldCtrl,
                                per: interpolatedValues.propertyInterpolatedNormalizeLocalFieldCtrl,
                                scope: interpolatedValues.propertyInterpolatedScopeCtrl
                            });
                    } else {
                        layerSource.include_fields.push(interpolatedValues.propertyInterpolatedFieldCtrl);
                    }
                } else {
                    layerSource.metrics.push({
                        field: interpolatedValues.propertyInterpolatedFieldCtrl,
                        metrics: interpolatedValues.propertyInterpolatedMetricCtrl,
                        normalize: interpolatedValues.propertyInterpolatedScopeCtrl
                    });
                }
                break;
            }
        }
    }


}
