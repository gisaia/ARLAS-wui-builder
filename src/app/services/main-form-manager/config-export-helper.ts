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
    CHIPSEARCH_IDENTIFIER,
    WebConfigOptions
} from './models-config';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-services/property-selector-form-builder/models';
import { CLUSTER_GEOMETRY_TYPE } from '@map-config/services/map-layer-form-builder/models';
import { WIDGET_TYPE } from '@analytics-config/components/edit-group/models';
import { DEFAULT_METRIC_VALUE } from '@analytics-config/services/metric-collect-form-builder/metric-collect-form-builder.service';
import { CollectionReferenceDescriptionProperty } from 'arlas-api';
import { MapComponentInputConfig, MapComponentInputMapLayersConfig, MapComponentInputLayersSetsConfig } from './models-config';
import { LayerSourceConfig, getSourceName, ColorConfig } from 'arlas-web-contributors';
import { SearchGlobalFormGroup } from '@search-config/services/search-global-form-builder/search-global-form-builder.service';
import { TimelineGlobalFormGroup } from '@timeline-config/services/timeline-global-form-builder/timeline-global-form-builder.service';
import {
    LookAndFeelGlobalFormGroup
} from '@look-and-feel-config/services/look-and-feel-global-form-builder/look-and-feel-global-form-builder.service';
import { BY_BUCKET_OR_INTERVAL } from '@analytics-config/services/buckets-interval-form-builder/buckets-interval-form-builder.service';
import {
    SideModulesGlobalFormGroup
} from '@side-modules-config/services/side-modules-global-form-builder/side-modules-global-form-builder.service';



export enum EXPORT_TYPE {
    json = 'json',
    persistence = 'persistence'
}

// TODO use customControls in the class instead of untyped values
export class ConfigExportHelper {

    public static process(
        startingConfig: FormGroup,
        mapConfigGlobal: FormGroup,
        mapConfigLayers: FormArray,
        searchConfigGlobal: SearchGlobalFormGroup,
        timelineConfigGlobal: TimelineGlobalFormGroup,
        sideModulesGlobal: SideModulesGlobalFormGroup,
        lookAndFeelConfigGlobal: LookAndFeelGlobalFormGroup,
        analyticsConfigList: FormArray,
        keysToColorList: FormArray,
    ): any {

        const chipssearch: ChipSearchConfig = {
            name: searchConfigGlobal.customControls.name.value,
            icon: 'search'
        };

        const config: Config = {
            arlas: {
                web: {
                    contributors: [],
                    components: {
                        timeline: this.getTimelineComponent(timelineConfigGlobal, false),
                        mapgl: this.getMapComponent(mapConfigGlobal, mapConfigLayers)
                    },
                    analytics: [],
                    colorGenerator: {
                        keysToColors: (keysToColorList.value as Array<{ color: string, keyword: string }>).map(ck => [ck.keyword, ck.color])
                    },
                    options: this.getOptions(lookAndFeelConfigGlobal)
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

        config.arlas.web.contributors.push(this.getTimelineContributor(timelineConfigGlobal, false));

        if (timelineConfigGlobal.value.useDetailedTimeline) {
            config.arlas.web.components.detailedTimeline = this.getTimelineComponent(timelineConfigGlobal, true);
            config.arlas.web.contributors.push(this.getTimelineContributor(timelineConfigGlobal, true));
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

        this.exportSideModulesConfig(config, sideModulesGlobal);

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
            colors_from_fields: [],
            provided_fields: [],
            normalization_fields: [],
            metrics: []
        };

        switch (layerValues.mode) {
            case LAYER_MODE.features: {
                layerSource.maxfeatures = modeValues.visibilityStep.featuresMax;
                layerSource.returned_geometry = modeValues.geometryStep.geometry;
                break;
            }
            case LAYER_MODE.featureMetric: {
                layerSource.maxfeatures = modeValues.visibilityStep.featuresMax;
                layerSource.granularity = modeValues.geometryStep.granularity;
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
            icon: 'check_box_outline_blank',
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
                const colorConfig: ColorConfig = {
                    color: layerValues.propertyProvidedFieldCtrl
                };
                if (!!layerValues.propertyProvidedFieldLabelCtrl) {
                    colorConfig.label = layerValues.propertyProvidedFieldLabelCtrl;
                }
                layerSource.provided_fields.push(colorConfig);
                break;
            }
            case PROPERTY_SELECTOR_SOURCE.generated: {
                layerSource.colors_from_fields.push(layerValues.propertyGeneratedFieldCtrl);
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
                    if (!interpolatedValues.propertyInterpolatedCountOrMetricCtrl) {
                        layerSource.metrics.push({
                            field: 'count',
                            metric: 'count',
                            normalize: !!interpolatedValues.propertyInterpolatedCountNormalizeCtrl
                        });
                    } else {
                        layerSource.metrics.push({
                            field: interpolatedValues.propertyInterpolatedFieldCtrl,
                            metric: interpolatedValues.propertyInterpolatedMetricCtrl,
                            normalize: !!interpolatedValues.propertyInterpolatedNormalizeCtrl
                        });
                    }
                }
                break;
            }
        }
    }

    private static getChipsearchContributor(searchConfigGlobal: SearchGlobalFormGroup): ContributorConfig {
        return {
            type: CHIPSEARCH_TYPE,
            identifier: CHIPSEARCH_IDENTIFIER,
            search_field: searchConfigGlobal.customControls.searchField.value,
            name: searchConfigGlobal.customControls.name.value,
            icon: 'search',
            autocomplete_field: searchConfigGlobal.customControls.autocompleteField.value,
            autocomplete_size: searchConfigGlobal.customControls.autocompleteSize.value,
        };
    }

    // TODO put in common with getAnalyticsContributor ?
    private static getTimelineContributor(timelineConfigGlobal: TimelineGlobalFormGroup, isDetailed: boolean): ContributorConfig {

        const timelineAggregation = timelineConfigGlobal.customControls.tabsContainer.dataStep.timeline.aggregation.customControls;
        const detailedTimelineDataStep = timelineConfigGlobal.customControls.tabsContainer.dataStep.detailedTimeline;

        const contributor: ContributorConfig = {
            type: isDetailed ? 'detailedhistogram' : 'histogram',
            identifier: isDetailed ? 'detailedTimeline' : 'timeline',
            name: 'Timeline',
            icon: 'watch_later',
            isOneDimension: false
        };

        const aggregationModel: AggregationModelConfig = {
            type: 'datehistogram',
            field: timelineAggregation.aggregationField.value
        };

        if (!isDetailed && timelineAggregation.aggregationBucketOrInterval.value === BY_BUCKET_OR_INTERVAL.INTERVAL) {
            aggregationModel.interval = {
                value: timelineAggregation.aggregationIntervalSize.value,
                unit: timelineAggregation.aggregationIntervalUnit.value
            };
        } else if (!isDetailed) {
            contributor.numberOfBuckets = timelineAggregation.aggregationBucketsNumber.value;
        } else {
            contributor.numberOfBuckets = detailedTimelineDataStep.bucketsNumber.value;
        }

        contributor.aggregationmodels = [aggregationModel];

        if (isDetailed) {
            contributor.annexedContributorId = 'timeline';
            contributor.selectionExtentPercentage =
                timelineConfigGlobal.customControls.tabsContainer.renderStep.detailedTimeline.selectionExtentPercent.value / 100;
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

    private static getTimelineComponent(timelineConfigGlobal: TimelineGlobalFormGroup, isDetailed: boolean): AnalyticComponentConfig {

        const renderStep = isDetailed ? timelineConfigGlobal.customControls.tabsContainer.renderStep.detailedTimeline :
            timelineConfigGlobal.customControls.tabsContainer.renderStep.timeline;

        const timelineComponent: AnalyticComponentConfig = {
            contributorId: isDetailed ? 'detailedTimeline' : 'timeline',
            componentType: 'histogram',
            input: {
                id: isDetailed ? 'histogram-detailed-timeline' : 'histogram-timeline',
                xTicks: isDetailed ? 5 : 9,
                yTicks: 2,
                xLabels: isDetailed ? 5 : 9,
                yLabels: 2,
                chartTitle: renderStep.chartTitle.value,
                customizedCssClass: isDetailed ? 'arlas-detailed-timeline' : 'arlas-timeline',
                chartHeight: isDetailed ? 60 : 128,
                multiselectable:
                    isDetailed ? false : timelineConfigGlobal.customControls.tabsContainer.renderStep.timeline.isMultiselectable.value,
                brushHandlesHeightWeight: 0.8,
                dataType: 'time',
                isHistogramSelectable: true,
                ticksDateFormat: renderStep.dateFormat.value,
                chartType: renderStep.chartType.value,
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
        // TODO use customControls from widgets config form groups, like the Search export
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
            case WIDGET_TYPE.metric: {
                const contrib = this.getWidgetContributor(widgetData, icon);
                contrib.type = 'metric';
                contrib.function = !!widgetData.dataStep.function ? widgetData.dataStep.function : 'm[0]';
                contrib.metrics = Array.from(widgetData.dataStep.metrics);

                return contrib;
            }
            case WIDGET_TYPE.powerbars: {
                const contrib = this.getWidgetContributor(widgetData, icon);
                contrib.type = 'tree';
                contrib.aggregationmodels = [
                    {
                        type: 'term',
                        field: widgetData.dataStep.aggregationField,
                        size: widgetData.dataStep.aggregationSize
                    }
                ];
                return contrib;
            }
            case WIDGET_TYPE.donut: {
                const contrib = this.getWidgetContributor(widgetData, icon);
                contrib.type = 'tree';
                contrib.aggregationmodels = Array.from(widgetData.dataStep.aggregationmodels).map((agg: any) => {
                    agg.type = 'term';
                    return agg;
                });
                return contrib;
            }
            case WIDGET_TYPE.resultlist: {
                const contrib = this.getWidgetContributor(widgetData, icon);
                contrib.type = 'resultlist';
                contrib.search_size = widgetData.dataStep.searchSize;
                contrib.fieldsConfiguration = { idFieldName: widgetData.dataStep.idFieldName };
                contrib.columns = [];
                (widgetData.dataStep.columns as Array<any>).forEach(c =>
                    contrib.columns.push({
                        columnName: c.columnName, fieldName: c.fieldName, dataType: c.dataType, process: c.process
                    }));

                contrib.details = [];
                (widgetData.dataStep.details || [] as Array<any>).forEach((d, index) => {
                    const fields = d.fields.map(f => ({
                        path: f.path,
                        label: f.label,
                        process: f.process
                    }));
                    contrib.details.push({
                        name: d.name,
                        order: index + 1,
                        fields
                    });
                });
                return contrib;
            }
        }
    }

    private static getWidgetContributor(widgetData: any, icon: string) {
        return {
            identifier: this.toSnakeCase(widgetData.dataStep.name),
            name: widgetData.dataStep.name,
            title: widgetData.dataStep.name,
            icon,
            ... !!widgetData.renderStep.chartType ?
                {
                    charttype: widgetData.renderStep.chartType,
                    isOneDimension: false
                } : {}
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

        if ([WIDGET_TYPE.histogram, WIDGET_TYPE.swimlane].indexOf(widgetType) >= 0) {
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
                    chartWidth: 445, // TODO generated from colspan
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
                    dataType:
                        widgetData.dataStep.aggregation.aggregationFieldType === CollectionReferenceDescriptionProperty.TypeEnum.DATE ?
                            'time' : 'numeric'
                } as AnalyticComponentInputConfig
            } as AnalyticComponentConfig;

            switch (widgetType) {
                case WIDGET_TYPE.histogram: {
                    component.componentType = WIDGET_TYPE.histogram;
                    component.input.ticksDateFormat = widgetData.renderStep.ticksDateFormat;
                    (component.input as AnalyticComponentHistogramInputConfig).isSmoothedCurve = false;
                    break;
                }
                case WIDGET_TYPE.swimlane: {
                    component.componentType = WIDGET_TYPE.swimlane;
                    const swimlaneInput = (component.input as AnalyticComponentSwimlaneInputConfig);
                    swimlaneInput.swimLaneLabelsWidth = 100;
                    swimlaneInput.swimlaneHeight = 20;
                    swimlaneInput.swimlaneMode = widgetData.renderStep.swimlaneMode;
                    swimlaneInput.swimlaneBorderRadius = 3;
                    swimlaneInput.paletteColors = widgetData.renderStep.paletteColors;
                    swimlaneInput.swimlaneRepresentation = widgetData.renderStep.swimlaneRepresentation;

                    const swimlaneOptions = {} as AnalyticComponentSwimlaneInputOptionsConfig;
                    swimlaneOptions.nanColor = widgetData.renderStep.NaNColor;

                    if (!!widgetData.renderStep.zerosColors) {
                        swimlaneOptions.zerosColor = widgetData.renderStep.zerosColors;
                    }

                    swimlaneInput.swimlaneOptions = swimlaneOptions;

                    break;
                }

            }
            return component;

        } else if (widgetType === WIDGET_TYPE.metric) {
            const component = {
                contributorId: this.toSnakeCase(widgetData.dataStep.name),
                componentType: WIDGET_TYPE.metric,
                input: {
                    customizedCssClass: 'power',
                    shortValue: !!widgetData.renderStep.shortValue
                }
            } as AnalyticComponentConfig;
            if (widgetData.renderStep.beforeValue) {
                component.input.beforeValue = widgetData.renderStep.beforeValue;
            }
            if (widgetData.renderStep.afterValue) {
                component.input.afterValue = widgetData.renderStep.afterValue;
            }

            return component;

        } else if (widgetType === WIDGET_TYPE.powerbars) {
            const component = {
                contributorId: this.toSnakeCase(widgetData.dataStep.name),
                componentType: WIDGET_TYPE.powerbars,
                input: {
                    chartTitle: widgetData.renderStep.powerbarTitle,
                    displayFilter: !!widgetData.renderStep.displayFilter,
                    useColorService: !!widgetData.renderStep.useColorService
                }
            } as AnalyticComponentConfig;

            return component;

        } else if (widgetType === WIDGET_TYPE.donut) {
            const component = {
                contributorId: this.toSnakeCase(widgetData.dataStep.name),
                componentType: WIDGET_TYPE.donut,
                input: {
                    id: this.toSnakeCase(widgetData.dataStep.name),
                    customizedCssClass: 'arlas-donuts-analytics',
                    diameter: 150,
                    multiselectable: !!widgetData.renderStep.multiselectable,
                    opacity: widgetData.renderStep.opacity
                }
            } as AnalyticComponentConfig;

            return component;
        } else if (widgetType === WIDGET_TYPE.resultlist) {
            const component = {
                contributorId: this.toSnakeCase(widgetData.dataStep.name),
                componentType: WIDGET_TYPE.resultlist,
                input: {
                    id: this.toSnakeCase(widgetData.dataStep.name),
                    tableWidth: 455,
                    globalActionsList: [],
                    searchSize: widgetData.dataStep.searchSize,
                    nLastLines: 3,
                    detailedGridHeight: 25,
                    nbGridColumns: 3,
                    defautMode: 'list',
                    displayFilters: widgetData.renderStep.displayFilters,
                    isBodyHidden: false,
                    isGeoSortActived: false,
                    isAutoGeoSortActived: true,
                    selectedItemsEvent: null,
                    consultedItemEvent: null,
                    actionOnItemEvent: null,
                    globalActionEvent: null,
                    useColorService: widgetData.renderStep.useColorService,
                    cellBackgroundStyle: widgetData.renderStep.cellBackgroundStyle
                }
            } as AnalyticComponentConfig;

            return component;
        }

    }

    private static exportSideModulesConfig(config: Config, sideModulesGlobal: SideModulesGlobalFormGroup) {
        const sideModulesControls = sideModulesGlobal.customControls;

        if (sideModulesControls.useShare.value) {
            config.arlas.web.components.share = {
                geojson: {
                    max_for_feature: sideModulesControls.share.maxForFeature.value,
                    max_for_topology: sideModulesControls.share.maxForTopology.value,
                    sort_excluded_type: sideModulesControls.unmanagedFields.sortExcludedTypes.value,
                }
            };
        }

        if (sideModulesControls.useDownload.value) {
            config.arlas.web.components.download = {};
            if (sideModulesControls.download.basicAuthent.value) {
                config.arlas.web.components.download.auth_type = 'basic';
            }
        }

        if (sideModulesControls.useTagger.value) {
            config.arlas.tagger = {
                url: sideModulesControls.tagger.serverUrl.value,
                collection: sideModulesControls.tagger.collection.value,
            };
        }
    }

    public static getOptions(lookAndFeelConfigGlobal: LookAndFeelGlobalFormGroup): WebConfigOptions {
        const showSpinner: boolean = !!lookAndFeelConfigGlobal.customControls.spinner.value;
        const spinnerColor: string = lookAndFeelConfigGlobal.customControls.spinnerColor.value;
        const spinnerDiameter: string = lookAndFeelConfigGlobal.customControls.spinnerDiameter.value;
        const options = {
            dragItems: !!lookAndFeelConfigGlobal.customControls.dragAndDrop.value,
            zoomToData: !!lookAndFeelConfigGlobal.customControls.zoomToData.value,
            indicators: !!lookAndFeelConfigGlobal.customControls.indicators.value,
            spinner: {
                show: showSpinner,
                color: (showSpinner && !!spinnerColor) ? spinnerColor : '',
                diameter: (showSpinner && !!spinnerDiameter) ? spinnerDiameter : ''
            }
        } as WebConfigOptions;
        return options;
    }

    private static addNumberOfBucketsOrInterval(
        contrib: ContributorConfig,
        aggregationModel: AggregationModelConfig,
        aggregationData: any) {

        if (aggregationData.aggregationBucketOrInterval === BY_BUCKET_OR_INTERVAL.BUCKET) {
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
