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
import {
    Config, ChipSearchConfig, ContributorConfig, AggregationModelConfig,
    AnalyticComponentConfig, AnalyticComponentHistogramInputConfig, SwimlaneConfig,
    AnalyticConfig, AnalyticComponentInputConfig, AnalyticComponentSwimlaneInputConfig,
    AnalyticComponentSwimlaneInputOptionsConfig,
    MapglComponentConfig,
    JSONPATH_METRIC,
    JSONPATH_COUNT,
    CHIPSEARCH_TYPE,
    CHIPSEARCH_IDENTIFIER
} from './models-config';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-components/property-selector/models';
import { CLUSTER_GEOMETRY_TYPE } from '@map-config/components/edit-layer-mode-form/models';
import { WIDGET_TYPE } from '@analytics-config/components/edit-group/models';
import { DEFAULT_METRIC_VALUE } from '@analytics-config/services/metric-form-builder/metric-form-builder.service';
import { CollectionReferenceDescriptionProperty } from 'arlas-api';
import { MapComponentInputConfig, MapComponentInputMapLayersConfig, MapComponentInputLayersSetsConfig } from './models-config';
import { Layer } from './models-map-config';

import { LayerSourceConfig, getSourceName } from 'arlas-web-contributors';
export class ConfigExportHelper {

    public static process(
        startingConfig: FormGroup,
        mapConfigGlobal: FormGroup,
        mapConfigLayers: FormArray,
        searchConfigGlobal: FormGroup,
        timelineConfigGlobal: FormGroup,
        analyticsConfigList: FormArray ): any {

        const chipssearch: ChipSearchConfig = {
            name: searchConfigGlobal.value.name,
            icon: searchConfigGlobal.value.icon
        };

        const config: Config = {
            arlas: {
                web: {
                    contributors: [],
                    components: {
                        timeline: this.getTimelineComponent(timelineConfigGlobal.controls.timeline.value),
                        mapgl: this.getMapComponent(mapConfigGlobal, mapConfigLayers)
                    },
                    analytics: []
                },
                server: {
                    url: startingConfig.value.serverUrl,
                    maxAgeCache: 120,
                    collection: {
                        name: startingConfig.value.collections[0],
                        id: 'id'
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

        config.arlas.web.contributors.push(this.getMapContributor(mapConfigGlobal, mapConfigLayers));
        config.arlas.web.contributors.push(this.getChipsearchContributor(searchConfigGlobal));

        config.arlas.web.contributors.push(this.getTimelineContributor(timelineConfigGlobal.controls.timeline.value));

        if (timelineConfigGlobal.value.useDetailedTimeline) {
            config.arlas.web.components.detailedTimeline = this.getTimelineComponent(timelineConfigGlobal.controls.detailedTimeline.value);
            config.arlas.web.contributors.push(this.getTimelineContributor(timelineConfigGlobal.controls.detailedTimeline.value));
        }

        if (!!analyticsConfigList) {
            (analyticsConfigList.value as Array<any>).forEach(tab => {
                tab.contentFg.groupsFa.forEach(group => {
                    group.content.forEach(widget => {
                        config.arlas.web.contributors.push(this.getAnalyticsContributor(widget.widgetType, widget.widgetData, group.icon));
                    });
                });
            });

            (analyticsConfigList.value as Array<any>).forEach(tab => {
                tab.contentFg.groupsFa.forEach((group: any, groupIndex: number) => {
                    config.arlas.web.analytics.push(this.getAnalyticsGroup(tab.tabName, group, groupIndex));
                });
            });
        }

        return config;
    }

    public static getLayerSourceConfig(layerFg: FormGroup): LayerSourceConfig {
        const layerValues = layerFg.value;
        const modeValues = layerFg.value.mode === LAYER_MODE.features ? layerFg.value.featuresFg :
            (layerFg.value.mode === LAYER_MODE.featureMetric ? layerFg.value.featureMetricFg : layerFg.value.clusterFg);
        const layerSource: LayerSourceConfig = {
            id: layerValues.name,
            source: '',
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
        layerSource.source = getSourceName(layerSource);
        return layerSource;
    }
    public static getMapContributor(
        mapConfigGlobal: FormGroup,
        mapConfigLayers: FormArray): ContributorConfig {

        const mapContributor: ContributorConfig = {
            type: 'map',
            identifier: 'mapbox',
            geoQueryOp: mapConfigGlobal.value.geographicalOperator,
            geoQueryField: mapConfigGlobal.value.requestGeometries[0].requestGeom,
            layers_sources: []
        };

        const layersSources: Array<LayerSourceConfig> = mapConfigLayers.controls.map((layerFg: FormGroup) => {
            return this.getLayerSourceConfig(layerFg);
        });

        mapContributor.layers_sources = layersSources;
        return mapContributor;
    }

    private static addLayerSourceInterpolationData(layerSource: LayerSourceConfig, layerValues: any, mode: LAYER_MODE) {
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
                                per: interpolatedValues.propertyInterpolatedNormalizeLocalFieldCtrl
                            });
                    } else {
                        layerSource.include_fields.push(interpolatedValues.propertyInterpolatedFieldCtrl);
                    }
                } else {
                    layerSource.metrics.push({
                        field: interpolatedValues.propertyInterpolatedFieldCtrl,
                        metric: interpolatedValues.propertyInterpolatedMetricCtrl,
                        // todo : `normalize` is now a boolean
                        normalize: interpolatedValues.propertyInterpolatedScopeCtrl
                    });
                }
                break;
            }
        }
    }

    private static getChipsearchContributor(searchConfigGlobal: FormGroup): ContributorConfig {
        const searchValues = searchConfigGlobal.value;
        return {
            type: CHIPSEARCH_TYPE,
            identifier: CHIPSEARCH_IDENTIFIER,
            search_field: searchValues.searchField,
            name: searchValues.name,
            icon: searchValues.icon,
            autocomplete_field: searchValues.autocompleteField,
            autocomplete_size: searchValues.autocompleteSize,
        };
    }

    // TODO put in common with getAnalyticsContributor ?
    private static getTimelineContributor(timelineValues: any): ContributorConfig {
        const isDetailed = timelineValues.isDetailedTimeline;
        const contributor: ContributorConfig = {
            type: isDetailed ? 'detailedhistogram' : 'histogram',
            identifier: isDetailed ? 'detailedTimeline' : 'timeline',
            name: 'Timeline',
            icon: 'watch_later',
            isOneDimension: false
        };

        const aggregationModel: AggregationModelConfig = {
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

    private static getMapComponent(mapConfigGlobal: any, mapConfigLayers: FormArray): MapglComponentConfig {

        const visualisations = {};
        const layers: string[] = new Array<string>();
        mapConfigLayers.controls.map(layer => {
            layers.push(layer.value.name);
        });
        // tslint:disable-next-line: no-string-literal
        visualisations['set1'] = layers;

        const visualisationsSets: MapComponentInputLayersSetsConfig = {
            visualisations,
            default: ['set1']
        };

        const mapComponent: MapglComponentConfig = {
            allowMapExtend: mapConfigGlobal.value.allowMapExtend,
            nbVerticesLimit: 100,
            input: {
                defaultBasemapStyle: {
                    name: 'Positron',
                    styleFile: 'https://api.maptiler.com/maps/positron/style.json?key=xIhbu1RwgdbxfZNmoXn4'
                },
                basemapStyles: [
                    {
                        name: 'Positron',
                        styleFile: 'https://api.maptiler.com/maps/positron/style.json?key=xIhbu1RwgdbxfZNmoXn4'
                    }
                ],
                margePanForLoad: mapConfigGlobal.value.margePanForLoad,
                margePanForTest: mapConfigGlobal.value.margePanForTest,
                initZoom: mapConfigGlobal.value.initZoom,
                initCenter: [
                    mapConfigGlobal.value.initCenterLat,
                    mapConfigGlobal.value.initCenterLon
                ],
                displayScale: mapConfigGlobal.value.displayScale,
                idFeatureField: mapConfigGlobal.value.requestGeometries[0].idFeatureField,
                mapLayers: {
                    layers: [],
                    events: {
                        zoomOnClick: [],
                        emitOnClick: [],
                        onHover: [],
                    },
                    externalEventLayers: new Array<{ id: string, on: string }>(),
                    visualisations_sets: visualisationsSets
                } as MapComponentInputMapLayersConfig
            } as MapComponentInputConfig
        };

        return mapComponent;
    }

    private static getTimelineComponent(timelineValues: any): AnalyticComponentConfig {
        const isDetailed = timelineValues.isDetailedTimeline;
        const timelineComponent: AnalyticComponentConfig = {
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
            } as AnalyticComponentHistogramInputConfig
        };

        if (!isDetailed) {
            timelineComponent.input.topOffsetRemoveInterval = 10;
        }

        return timelineComponent;
    }

    public static getAnalyticsContributor(widgetType: any, widgetData: any, icon: string): ContributorConfig {
        // TODO at the end, find same contributors and keep only one instance
        switch (widgetType) {
            case WIDGET_TYPE.histogram: {
                const contrib = this.getWidgetContributor(widgetData, icon);
                contrib.type = 'histogram';

                const aggregationModel = {
                    type: 'histogram',
                    field: widgetData.dataStep.aggregation.aggregationField
                } as AggregationModelConfig;

                this.addNumberOfBucketsOrInterval(contrib, aggregationModel, widgetData.dataStep.aggregation);

                this.addMetricToAggregationModel(aggregationModel, widgetData.dataStep.metric);

                contrib.jsonpath = widgetData.dataStep.metric.metricValue === DEFAULT_METRIC_VALUE ?
                    JSONPATH_COUNT : JSONPATH_METRIC;

                contrib.aggregationmodels = [aggregationModel];

                return contrib;
            }
            case WIDGET_TYPE.swimlane: {
                const contrib = this.getWidgetContributor(widgetData, icon);
                contrib.type = 'swimlane';
                const swimlane = {
                    id: 1,
                    name: widgetData.dataStep.name,
                    xAxisField: widgetData.dataStep.dateAggregation.aggregationField,
                    termField: widgetData.dataStep.termAggregation.termAggregationField
                } as SwimlaneConfig;

                swimlane.aggregationmodels = [];

                swimlane.aggregationmodels.push({
                    type: 'term',
                    field: widgetData.dataStep.termAggregation.termAggregationField,
                    size: widgetData.dataStep.termAggregation.termAggregationSize
                });

                const dateAggregationModel = {
                    type: 'datehistogram',
                    field: widgetData.dataStep.dateAggregation.aggregationField
                } as AggregationModelConfig;
                this.addNumberOfBucketsOrInterval(contrib, dateAggregationModel, widgetData.dataStep.dateAggregation);

                this.addMetricToAggregationModel(dateAggregationModel, widgetData.dataStep.metric);

                swimlane.aggregationmodels.push(dateAggregationModel);
                contrib.swimlanes = [swimlane];

                contrib.jsonpath = widgetData.dataStep.metric.metricValue === DEFAULT_METRIC_VALUE ?
                    '$.count' : '$.metrics[0].value';

                return contrib;
            }
        }
    }

    private static getWidgetContributor(widgetData: any, icon: string) {
        return {
            identifier: this.toSnakeCase(widgetData.dataStep.name),
            charttype: widgetData.renderStep.chartType,
            name: widgetData.dataStep.name,
            title: widgetData.dataStep.name,
            icon,
            isOneDimension: false
        } as ContributorConfig;
    }

    public static getAnalyticsGroup(tabName: string, group: any, groupIndex: number) {

        const groupAnalytic = {
            groupId: tabName + '-' + groupIndex.toString(),
            title: group.title,
            tab: tabName,
            icon: group.icon,
            components: []
        } as AnalyticConfig;

        group.content.forEach(widget => {
            groupAnalytic.components.push(this.getAnalyticsComponent(widget.widgetType, widget.widgetData));
        });

        return groupAnalytic;
    }

    private static addMetricToAggregationModel(aggregationModel: AggregationModelConfig, metricData: any) {
        if (!!metricData.metricCollectFunction) {
            aggregationModel.metrics = [
                {
                    collect_fct: metricData.metricCollectFunction,
                    collect_field: metricData.metricCollectField
                }
            ];
        }
    }

    private static getAnalyticsComponent(widgetType: any, widgetData: any): AnalyticComponentConfig {

        const component = {
            contributorId: this.toSnakeCase(widgetData.dataStep.name),
            showExportCsv: true,
            input: {
                id: this.toSnakeCase(widgetData.dataStep.name),
                isHistogramSelectable: true,
                multiselectable: !!widgetData.renderStep.multiselectable,
                topOffsetRemoveInterval: 40,
                leftOffsetRemoveInterval: 18,
                brushHandlesHeightWeight: 0.8,
                yAxisStartsFromZero: true,
                chartType: widgetData.renderStep.chartType,
                chartTitle: widgetData.dataStep.name,
                chartWidth: 222, // TODO generated from colspan
                chartHeight: 100, // TODO generated from colspan
                customizedCssClass: 'arlas-histogram-analytics', // TODO generated from colspan
                xAxisPosition: 'bottom',
                descriptionPosition: 'bottom',
                xTicks: 4,
                yTicks: 1,
                xLabels: 4,
                yLabels: 4,
                showXTicks: true,
                showYTicks: true,
                showXLabels: true,
                showYLabels: true,
                showHorizontalLines: widgetData.renderStep.showHorizontalLines,
                barWeight: 0.8,
                dataType: widgetData.dataStep.aggregation.aggregationFieldType === CollectionReferenceDescriptionProperty.TypeEnum.DATE ?
                    'time' : 'numeric'
            } as AnalyticComponentInputConfig
        } as AnalyticComponentConfig;

        switch (widgetType) {
            case WIDGET_TYPE.histogram: {
                component.componentType = 'histogram';
                component.input.ticksDateFormat = widgetData.renderStep.ticksDateFormat;
                (component.input as AnalyticComponentHistogramInputConfig).isSmoothedCurve = false;
                break;
            }
            case WIDGET_TYPE.swimlane: {
                component.componentType = 'swimlane';
                const swimlaneInput = (component.input as AnalyticComponentSwimlaneInputConfig);
                swimlaneInput.swimLaneLabelsWidth = 100;
                swimlaneInput.swimlaneHeight = 20;
                swimlaneInput.swimlaneMode = widgetData.renderStep.swimlaneMode;
                swimlaneInput.swimlaneBorderRadius = 3;
                swimlaneInput.paletteColors = widgetData.renderStep.paletteColors;
                swimlaneInput.swimlaneRepresentation = !!widgetData.renderStep.swimlaneRepresentation ? 'column' : 'global';

                const swimlaneOptions = {} as AnalyticComponentSwimlaneInputOptionsConfig;
                swimlaneOptions.nanColors = widgetData.renderStep.NaNColors;

                if (!!widgetData.renderStep.zerosColors) {
                    swimlaneOptions.zerosColor = widgetData.renderStep.zerosColors;
                }

                swimlaneInput.swimlaneOptions = swimlaneOptions;

                break;
            }

        }
        return component;
    }

    private static addNumberOfBucketsOrInterval(
        contrib: ContributorConfig,
        aggregationModel: AggregationModelConfig,
        aggregationData: any) {

        if (!aggregationData.aggregationBucketOrInterval) {
            contrib.numberOfBuckets = aggregationData.aggregationBucketsNumber;
        } else {
            aggregationModel.interval = {
                value: aggregationData.aggregationIntervalSize
            };
            if (!!aggregationData.aggregationIntervalUnit) {
                aggregationModel.interval.unit = aggregationData.aggregationIntervalUnit;
            }
        }
    }

    public static toSnakeCase(str) {
        return str &&
            str
                .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                .map(x => x.toLowerCase())
                .join('_');
    }

}
