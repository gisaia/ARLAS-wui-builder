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
import { Config, Contributor, LayerSource, ChipSearch, AggregationModel, TimelineComponent } from './models-config';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-components/property-selector/models';
import { CLUSTER_GEOMETRY_TYPE } from '@map-config/components/edit-layer-mode-form/models';

export class ConfigExportHelper {

    public static process(
        mapConfigGlobal: FormGroup,
        mapConfigLayers: FormArray,
        searchConfigGlobal: FormGroup,
        timelineConfigGlobal: FormGroup,
        sourceByMode: Map<string, string>, ): any {

        const chipssearch: ChipSearch = {
            name: searchConfigGlobal.value.name,
            icon: searchConfigGlobal.value.icon
        };

        const config: Config = {
            arlas: {
                web: {
                    contributors: [],
                    components: {
                        timeline: this.getTimelineComponent(timelineConfigGlobal.controls.timeline.value),
                        detailedTimeline: this.getTimelineComponent(timelineConfigGlobal.controls.detailedTimeline.value)
                    }
                }
            },
            arlasWui: {
                web: {
                    app: {
                        components: {
                            chipssearch
                        }
                    }
                }
            }
        };

        config.arlas.web.contributors.push(this.getMapContributor(mapConfigGlobal, mapConfigLayers, sourceByMode));
        config.arlas.web.contributors.push(this.getChipsearchContributor(searchConfigGlobal));

        config.arlas.web.contributors.push(this.getTimelineContributor(timelineConfigGlobal.controls.timeline.value));
        if (timelineConfigGlobal.value.useDetailedTimeline) {
            config.arlas.web.contributors.push(this.getTimelineContributor(timelineConfigGlobal.controls.detailedTimeline.value));
        }

        return config;
    }

    private static getMapContributor(
        mapConfigGlobal: FormGroup,
        mapConfigLayers: FormArray,
        sourceByMode: Map<string, string>): Contributor {

        const mapContributor: Contributor = {
            type: 'map',
            identifier: 'mapbox',
            geoQueryOp: mapConfigGlobal.value.geographicalOperator,
            geoQueryField: mapConfigGlobal.value.requestGeometries[0].requestGeom,
            layers_sources: []
        };

        const layersSources: Array<LayerSource> = mapConfigLayers.controls.map((layerFg: FormGroup) => {
            const layerValues = layerFg.value;
            const modeValues = layerFg.value.mode === LAYER_MODE.features ? layerFg.value.featuresFg :
                (layerFg.value.mode === LAYER_MODE.featureMetric ? layerFg.value.featureMetricFg : layerFg.value.clusterFg);
            const layerSource: LayerSource = {
                id: layerValues.name,
                source: sourceByMode.get(layerFg.value.mode),
                minzoom: modeValues.visibilityStep.zoomMin,
                maxzoom: modeValues.visibilityStep.zoomMax,
                include_fields: [],
                normalization_fields: [],
                metrics: []
            };

            switch (layerValues.mode) {
                case LAYER_MODE.features: {
                    layerSource.maxfeatures = modeValues.visibilityStep.featuresMax;
                    break;
                }
                case LAYER_MODE.featureMetric: {
                    layerSource.maxfeatures = modeValues.visibilityStep.featuresMax;
                    layerSource.geometry_support = modeValues.geometryStep.geometry;
                    layerSource.geometry_id = modeValues.geometryStep.geometryId;
                    break;
                }
                case LAYER_MODE.cluster: {

                    layerSource.agg_geo_field = modeValues.geometryStep.aggGeometry;
                    layerSource.granularity = modeValues.geometryStep.granularity;
                    layerSource.minfeatures = modeValues.visibilityStep.featuresMin;
                    if (modeValues.geometryStep.clusterGeometryType === CLUSTER_GEOMETRY_TYPE.aggregated_geometry) {
                        layerSource.aggregated_geometry = modeValues.geometryStep.aggregatedGeometry;
                    } else {
                        layerSource.raw_geometry = {
                            geometry: modeValues.geometryStep.rawGeometry,
                            sort: !!modeValues.geometryStep.clusterSort ? modeValues.geometryStep.clusterSort : ''
                        };
                    }
                }
            }

            this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.colorFg, layerValues.mode);

            if (!!modeValues.styleStep.widthFg) {
                this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.widthFg, layerValues.mode);
            }

            if (!!modeValues.styleStep.radiusFg) {
                this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.radiusFg, layerValues.mode);
            }

            if (!!modeValues.styleStep.weightFg) {
                this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.weightFg, layerValues.mode);
            }

            return layerSource;
        });

        mapContributor.layers_sources = layersSources;
        return mapContributor;
    }

    private static addLayerSourceInterpolationData(layerSource: LayerSource, layerValues: any, mode: LAYER_MODE) {
        switch (layerValues.propertySource) {
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
                        metric: interpolatedValues.propertyInterpolatedMetricCtrl,
                        normalize: interpolatedValues.propertyInterpolatedScopeCtrl
                    });
                }
                break;
            }
        }
    }

    private static getChipsearchContributor(searchConfigGlobal: FormGroup): Contributor {
        const searchValues = searchConfigGlobal.value;
        return {
            type: 'chipssearch',
            identifier: 'chipssearch',
            search_field: searchValues.searchField,
            name: searchValues.name,
            icon: searchValues.icon,
            autocomplete_field: searchValues.autocompleteField,
            autocomplete_size: searchValues.autocompleteSize,
        };
    }

    private static getTimelineContributor(timelineValues: any): Contributor {
        const isDetailed = timelineValues.isDetailedTimeline;
        const contributor: Contributor = {
            type: isDetailed ? 'detailedhistogram' : 'histogram',
            identifier: isDetailed ? 'detailedTimeline' : 'timeline',
            name: 'Timeline',
            icon: 'watch_later',
            isOneDimension: false
        };

        const aggregationModel: AggregationModel = {
            type: 'datehistogram',
            field: timelineValues.field
        };

        if (timelineValues.bucketOrInterval) {
            aggregationModel.interval = {
                value: timelineValues.intervalSize,
                unit: timelineValues.intervalUnit
            };
        } else {
            contributor.numberOfBuckets = timelineValues.bucketsNumber;
        }

        contributor.aggregationmodels = [aggregationModel];

        if (isDetailed) {
            contributor.annexedContributorId = 'timeline';
            contributor.selectionExtentPercentage = timelineValues.selectionExtentPercent / 100;
        }

        return contributor;
    }

    private static getTimelineComponent(timelineValues: any): TimelineComponent {
        const isDetailed = timelineValues.isDetailedTimeline;
        const timelineComponent: TimelineComponent = {
            contributorId: isDetailed ? 'detailedTimeline' : 'timeline',
            componentType: 'histogram',
            input: {
                id: isDetailed ? 'histogram-detailed-timeline' : 'histogram-timeline',
                xTicks: isDetailed ? 5 : 9,
                yTicks: 2,
                xLabels: isDetailed ? 5 : 9,
                yLabels: 2,
                chartTitle: timelineValues.chartTitle,
                customizedCssClass: isDetailed ? 'arlas-detailed-timeline' : 'arlas-timeline',
                chartHeight: isDetailed ? 60 : 128,
                multiselectable: isDetailed ? false : timelineValues.isMultiselectable,
                brushHandlesHeightWeight: 0.8,
                dataType: 'time',
                isHistogramSelectable: true,
                ticksDateFormat: timelineValues.dateFormat,
                chartType: timelineValues.chartType,
                chartWidth: null,
                xAxisPosition: isDetailed ? 'top' : 'bottom',
                yAxisStartsFromZero: true,
                descriptionPosition: isDetailed ? 'bottom' : 'top',
                showXTicks: true,
                showYTicks: true,
                showXLabels: true,
                showYLabels: true,
                showHorizontalLines: false,
                isSmoothedCurve: true,
                barWeight: 0.8
            }
        };

        if (!isDetailed) {
            timelineComponent.input.topOffsetRemoveInterval = 10;
        }

        return timelineComponent;
    }

}
