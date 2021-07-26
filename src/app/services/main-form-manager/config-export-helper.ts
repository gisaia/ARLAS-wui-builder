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
import { FormGroup, FormArray, Form } from '@angular/forms';
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
    WebConfigOptions,
    FieldsConfiguration
} from './models-config';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-services/property-selector-form-builder/models';
import { CLUSTER_GEOMETRY_TYPE, FILTER_OPERATION } from '@map-config/services/map-layer-form-builder/models';
import { WIDGET_TYPE } from '@analytics-config/components/edit-group/models';
import { DEFAULT_METRIC_VALUE } from '@analytics-config/services/metric-collect-form-builder/metric-collect-form-builder.service';
import { MapComponentInputConfig, MapComponentInputMapLayersConfig, AnalyticComponentResultListInputConfig } from './models-config';
import { getSourceName, ColorConfig, LayerSourceConfig } from 'arlas-web-contributors';
import { FeatureRenderMode } from 'arlas-web-contributors/models/models';
import { SearchGlobalFormGroup } from '@search-config/services/search-global-form-builder/search-global-form-builder.service';
import { TimelineGlobalFormGroup } from '@timeline-config/services/timeline-global-form-builder/timeline-global-form-builder.service';
import {
    LookAndFeelGlobalFormGroup
} from '@look-and-feel-config/services/look-and-feel-global-form-builder/look-and-feel-global-form-builder.service';
import { BY_BUCKET_OR_INTERVAL } from '@analytics-config/services/buckets-interval-form-builder/buckets-interval-form-builder.service';
import {
    SideModulesGlobalFormGroup
} from '@side-modules-config/services/side-modules-global-form-builder/side-modules-global-form-builder.service';
import { MapGlobalFormGroup } from '@map-config/services/map-global-form-builder/map-global-form-builder.service';
import { StartingConfigFormGroup } from '@services/starting-config-form-builder/starting-config-form-builder.service';
import { VisualisationSetConfig, BasemapStyle } from 'arlas-web-components';
import { titleCase } from '@services/collection-service/tools';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { MapBasemapFormGroup } from '@map-config/services/map-basemap-form-builder/map-basemap-form-builder.service';
import { MapLayerFormGroup } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionReferenceDescription } from 'arlas-api';

export enum EXPORT_TYPE {
    json = 'json',
    persistence = 'persistence'
}

// TODO use customControls in the class instead of untyped values
export class ConfigExportHelper {

    public static process(
        startingConfig: StartingConfigFormGroup,
        mapConfigGlobal: MapGlobalFormGroup,
        mapConfigLayers: FormArray,
        mapConfigVisualisations: FormArray,
        mapConfigBasemaps: MapBasemapFormGroup,
        searchConfigGlobal: SearchGlobalFormGroup,
        timelineConfigGlobal: TimelineGlobalFormGroup,
        sideModulesGlobal: SideModulesGlobalFormGroup,
        lookAndFeelConfigGlobal: LookAndFeelGlobalFormGroup,
        analyticsConfigList: FormArray,
        resultLists: FormArray,
        colorService: ArlasColorGeneratorLoader,
        collectionService: CollectionService
    ): any {
        const chipssearch: ChipSearchConfig = {
            name: searchConfigGlobal.customControls.name.value,
            icon: searchConfigGlobal.customControls.unmanagedFields.icon.value
        };
        const config: Config = {
            arlas: {
                web: {
                    contributors: [],
                    components: {
                        timeline: this.getTimelineComponent(timelineConfigGlobal, false),
                        mapgl: this.getMapComponent(mapConfigGlobal, mapConfigLayers, mapConfigVisualisations, mapConfigBasemaps),
                        resultlists: this.getResultListComponent(resultLists)
                    },
                    analytics: [],
                    colorGenerator: {
                        keysToColors: colorService.keysToColors
                    },
                    options: this.getOptions(lookAndFeelConfigGlobal)
                },
                server: {
                    url: startingConfig.customControls.serverUrl.value,
                    max_age_cache: startingConfig.customControls.unmanagedFields.maxAgeCache.value,
                    collection: {
                        name: startingConfig.customControls.collection.value,
                    }
                }
            },
            'arlas-wui': {
                web: {
                    app: {
                        components: {
                            chipssearch
                        },
                        name: startingConfig.customControls.unmanagedFields.appName.value,
                        unit: lookAndFeelConfigGlobal.customControls.appUnit.value,
                        name_background_color: startingConfig.customControls.unmanagedFields.appNameBackgroundColor.value
                    }
                }
            },
            extraConfigs: [
                {
                    configPath: 'config.map.json',
                    replacedAttribute: 'arlas.web.components.mapgl.input.mapLayers.layers',
                    replacer: 'layers'
                },
                {
                    configPath: 'config.map.json',
                    replacedAttribute: 'arlas.web.components.mapgl.input.mapLayers.externalEventLayers',
                    replacer: 'external-event-layers'
                }
            ]
        };

        config.arlas.web.contributors = config.arlas.web.contributors.concat(this.getMapContributors(mapConfigGlobal, mapConfigLayers,
            startingConfig.customControls.collection.value, collectionService));
        config.arlas.web.contributors.push(this.getChipsearchContributor(searchConfigGlobal,
            startingConfig.customControls.collection.value));
        config.arlas.web.contributors.push(this.getTimelineContributor(timelineConfigGlobal,
            false, collectionService.collectionParamsMap));

        const contributorsMap = new Map<string, any>();
        const resultListContributors = this.getResultListContributors(resultLists);
        resultListContributors.map(c => contributorsMap.set(c.identifier, c));
        config.arlas.web.contributors = config.arlas.web.contributors.concat(resultListContributors);

        if (timelineConfigGlobal.value.useDetailedTimeline) {
            config.arlas.web.components.detailedTimeline = this.getTimelineComponent(timelineConfigGlobal, true);
            config.arlas.web.contributors.push(this.getTimelineContributor(timelineConfigGlobal,
                true, collectionService.collectionParamsMap));
        }

        if (!!analyticsConfigList) {
            (analyticsConfigList.value as Array<any>).forEach(tab => {
                tab.contentFg.groupsFa.forEach(group => {
                    group.content.forEach(widget => {
                        const contributorId = this.getContributorId(widget.widgetData, widget.widgetType);
                        let contributor = contributorsMap.get(contributorId);
                        // check if the contributor already exists to avoid duplication in the final config json object
                        if (!contributor) {
                            contributor = this.getAnalyticsContributor(widget.widgetType, widget.widgetData, group.icon);
                            contributorsMap.set(contributorId, contributor);
                            config.arlas.web.contributors.push(contributor);
                        }
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
        const filters = !!modeValues.visibilityStep.filters ? modeValues.visibilityStep.filters.value : undefined;

        const layerSource: LayerSourceConfig = {
            id: layerValues.arlasId,
            name: layerValues.name,
            source: '',
            minzoom: modeValues.visibilityStep.zoomMin,
            maxzoom: modeValues.visibilityStep.zoomMax,
            include_fields: [],
            colors_from_fields: [],
            provided_fields: [],
            normalization_fields: [],
            metrics: [],
            render_mode: FeatureRenderMode.window
        };

        if (!!filters) {
            filters.forEach((f) => {
                if (!layerSource.filters) {
                    layerSource.filters = [];
                }
                if (f.filterOperation === FILTER_OPERATION.IN || f.filterOperation === FILTER_OPERATION.NOT_IN) {
                    layerSource.filters.push({
                        field: f.filterField.value,
                        op: f.filterOperation,
                        value: f.filterInValues.map(v => v.value)
                    });
                } else if (f.filterOperation === FILTER_OPERATION.EQUAL || f.filterOperation === FILTER_OPERATION.NOT_EQUAL) {
                    layerSource.filters.push({
                        field: f.filterField.value,
                        op: f.filterOperation,
                        value: f.filterEqualValues
                    });
                } else if (f.filterOperation === FILTER_OPERATION.RANGE || f.filterOperation === FILTER_OPERATION.OUT_RANGE) {
                    layerSource.filters.push({
                        field: f.filterField.value, op: f.filterOperation,
                        value: f.filterMinRangeValues + ';' + f.filterMaxRangeValues
                    });
                }
                if (!layerSource.include_fields) {
                    layerSource.include_fields = [];
                }
                const includeFieldsSet = new Set(layerSource.include_fields);
                includeFieldsSet.add(f.filterField.value);
                layerSource.include_fields = Array.from(includeFieldsSet);
            });

        }

        switch (layerValues.mode) {
            case LAYER_MODE.features: {
                layerSource.maxfeatures = modeValues.visibilityStep.featuresMax;
                layerSource.returned_geometry = modeValues.geometryStep.geometry;
                break;
            }
            case LAYER_MODE.featureMetric: {
                layerSource.maxfeatures = modeValues.visibilityStep.featuresMax;
                layerSource.raw_geometry = {
                    geometry: modeValues.geometryStep.geometry,
                    sort: !!modeValues.geometryStep.featureMetricSort ? modeValues.geometryStep.featureMetricSort : ''
                };
                layerSource.geometry_id = modeValues.geometryStep.geometryId;
                layerSource.network_fetching_level = +modeValues.visibilityStep.networkFetchingLevel;
                break;
            }
            case LAYER_MODE.cluster: {
                layerSource.agg_geo_field = modeValues.geometryStep.aggGeometry;
                layerSource.aggType = modeValues.geometryStep.aggType;
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

        if (!!modeValues.styleStep.opacity) {
            this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.opacity, layerValues.mode);
        }

        if (!!modeValues.styleStep.widthFg) {
            this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.widthFg, layerValues.mode);
        }

        if (!!modeValues.styleStep.radiusFg) {
            this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.radiusFg, layerValues.mode);
        }

        if (!!modeValues.styleStep.strokeColorFg) {
            this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.strokeColorFg, layerValues.mode);
        }

        if (!!modeValues.styleStep.strokeWidthFg) {
            this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.strokeWidthFg, layerValues.mode);
        }

        if (!!modeValues.styleStep.strokeOpacityFg) {
            this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.strokeOpacityFg, layerValues.mode);
        }

        if (!!modeValues.styleStep.weightFg) {
            this.addLayerSourceInterpolationData(layerSource, modeValues.styleStep.weightFg, layerValues.mode);
        }
        layerSource.source = getSourceName(layerSource) + '-' + layerFg.value.collection;
        return layerSource;
    }
    public static getMapContributors(
        mapConfigGlobal: MapGlobalFormGroup,
        mapConfigLayers: FormArray,
        mainCollection: string,
        collectionService: CollectionService): ContributorConfig[] {
        const contributorsCollectionsMap = new Map<string, ContributorConfig>();
        mapConfigLayers.controls.forEach((layerFg: MapLayerFormGroup) => {
            const collection = layerFg.customControls.collection.value;
            let mapContributor = contributorsCollectionsMap.get(collection);
            if (!mapContributor) {
                let geoQueryField = mapConfigGlobal.value.requestGeometries[0].requestGeom;
                if (collection !== mainCollection) {
                    geoQueryField = collectionService.collectionParamsMap.get(collection).params.centroid_path;
                }
                mapContributor = {
                    type: 'map',
                    identifier: collection,
                    name: 'Map ' + collection,
                    collection,
                    geo_query_op: titleCase(mapConfigGlobal.value.geographicalOperator),
                    geo_query_field: geoQueryField,
                    icon: mapConfigGlobal.customControls.unmanagedFields.icon.value,
                    layers_sources: []
                };
            }
            mapContributor.layers_sources.push(this.getLayerSourceConfig(layerFg));
            contributorsCollectionsMap.set(collection, mapContributor);
        });
        /** if no layer has been defined, create the default mapcontributor wihtout any layers */
        if (mapConfigLayers.controls.length === 0) {
            const mapContributor: ContributorConfig = {
                type: 'map',
                identifier: mainCollection,
                name: 'Map ' + mainCollection,
                collection: mainCollection,
                geo_query_op: titleCase(mapConfigGlobal.value.geographicalOperator),
                geo_query_field: mapConfigGlobal.value.requestGeometries[0].requestGeom,
                icon: mapConfigGlobal.customControls.unmanagedFields.icon.value,
                layers_sources: []
            };
            contributorsCollectionsMap.set(mainCollection, mapContributor);
        }
        return Array.from(contributorsCollectionsMap.values());
    }

    public static getMapComponent(
        mapConfigGlobal: MapGlobalFormGroup,
        mapConfigLayers: FormArray,
        mapConfigVisualisations: FormArray,
        mapConfigBasemaps: MapBasemapFormGroup,
        arlasId?,
        enableByDefault?: boolean): MapglComponentConfig {

        const customControls = mapConfigGlobal.customControls;

        const layers: Array<string> = new Array<string>();
        const layersHoverId: Array<string> = new Array<string>();
        mapConfigLayers.controls.forEach((layerFg: MapLayerFormGroup) => {
            layers.push(layerFg.value.name);
            if (this.getLayerSourceConfig(layerFg).render_mode === FeatureRenderMode.window) {
                layersHoverId.push(layerFg.value.arlasId);
            }
        });

        const visualisationsSets: Array<VisualisationSetConfig> = [
        ];
        if (!arlasId) {
            mapConfigVisualisations.controls.forEach(visu => visualisationsSets.push({
                name: visu.value.name,
                layers: visu.value.layers,
                enabled: enableByDefault ? true : visu.value.displayed
            }));
        } else {
            // to preview one layer
            mapConfigVisualisations.controls.forEach(visu => {
                const hasLayer = (new Set(visu.value.layers).has(arlasId));
                if (hasLayer) {
                    visualisationsSets.push({
                        name: visu.value.name,
                        layers: [arlasId],
                        // this will activate the visualisation set and display its layers for preview purposes
                        enabled: enableByDefault ? true : visu.value.displayed
                    });
                }
            });
        }
        const basemaps: BasemapStyle[] = [];
        let defaultBasemap: BasemapStyle;
        mapConfigBasemaps.customControls.basemaps.controls.forEach(basemap => {
            basemaps.push({
                name: basemap.value.name,
                styleFile: basemap.value.url
            });
            if (mapConfigBasemaps.customControls.default.value === basemap.value.name) {
                defaultBasemap = {
                    name: basemap.value.name,
                    styleFile: basemap.value.url
                };
            }
        });
        if (!defaultBasemap) {
            defaultBasemap = basemaps[0];
        }

        const mapComponent: MapglComponentConfig = {
            allowMapExtend: customControls.allowMapExtend.value,
            nbVerticesLimit: customControls.unmanagedFields.nbVerticesLimit.value,
            input: {
                defaultBasemapStyle: defaultBasemap,
                basemapStyles: basemaps,
                margePanForLoad: +customControls.margePanForLoad.value,
                margePanForTest: +customControls.margePanForTest.value,
                initZoom: customControls.initZoom.value,
                initCenter: [
                    +customControls.initCenterLon.value,
                    +customControls.initCenterLat.value
                ],
                displayScale: customControls.displayScale.value,
                displayCurrentCoordinates: customControls.displayCurrentCoordinates.value,
                idFeatureField: customControls.requestGeometries.value[0].idPath,
                mapLayers: {
                    layers: [],
                    events: {
                        zoomOnClick: customControls.unmanagedFields.mapLayers.events.zoomOnClick.value,
                        emitOnClick: customControls.unmanagedFields.mapLayers.events.emitOnClick.value,
                        onHover: layersHoverId,
                    },
                    externalEventLayers: new Array<{ id: string, on: string }>()
                } as MapComponentInputMapLayersConfig,
                visualisations_sets: visualisationsSets
            } as MapComponentInputConfig
        };

        return mapComponent;
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
                    if (interpolatedValues.propertyInterpolatedCountOrMetricCtrl === 'count') {
                        layerSource.metrics.push({
                            field: '',
                            metric: 'count',
                            normalize: !!interpolatedValues.propertyInterpolatedCountNormalizeCtrl
                        });
                    } else {
                        layerSource.metrics.push({
                            field: interpolatedValues.propertyInterpolatedFieldCtrl,
                            metric: (interpolatedValues.propertyInterpolatedMetricCtrl).toString().toLowerCase(),
                            normalize: !!interpolatedValues.propertyInterpolatedNormalizeCtrl
                        });
                    }
                }
                break;
            }
        }
    }

    private static getChipsearchContributor(searchConfigGlobal: SearchGlobalFormGroup, collection: string): ContributorConfig {
        return {
            type: CHIPSEARCH_TYPE,
            identifier: CHIPSEARCH_IDENTIFIER,
            collection,
            search_field: searchConfigGlobal.customControls.searchField.value,
            name: searchConfigGlobal.customControls.name.value,
            icon: searchConfigGlobal.customControls.unmanagedFields.icon.value,
            autocomplete_field: searchConfigGlobal.customControls.autocompleteField.value,
            autocomplete_size: searchConfigGlobal.customControls.autocompleteSize.value,
        };
    }

    // TODO put in common with getAnalyticsContributor ?
    private static getTimelineContributor(
        timelineConfigGlobal: TimelineGlobalFormGroup,
        isDetailed: boolean,
        collectionParamsMap?: Map<string, CollectionReferenceDescription>
    ): ContributorConfig {

        const timelineAggregation = timelineConfigGlobal.customControls.tabsContainer.dataStep.timeline.aggregation.customControls;
        const detailedTimelineDataStep = timelineConfigGlobal.customControls.tabsContainer.dataStep.detailedTimeline;
        const collection = timelineConfigGlobal.customControls.tabsContainer.dataStep.timeline.collection.value;
        const unmanagedDataFields = isDetailed ?
            timelineConfigGlobal.customControls.unmanagedFields.dataStep.detailedTimeline :
            timelineConfigGlobal.customControls.unmanagedFields.dataStep.timeline;
        const contributor: ContributorConfig = {
            type: (isDetailed ? 'detailedhistogram' : 'histogram'),
            identifier: (isDetailed ? 'detailedTimeline' : 'timeline'),
            collection,
            name: unmanagedDataFields.name.value,
            icon: unmanagedDataFields.icon.value,
            isOneDimension: unmanagedDataFields.isOneDimension.value,
            useUtc: timelineConfigGlobal.value.useUtc
        };

        const aggregationModel: AggregationModelConfig = {
            type: 'datehistogram',
            field: timelineAggregation.aggregationField.value
        };

        if (!isDetailed && timelineAggregation.aggregationBucketOrInterval.value === BY_BUCKET_OR_INTERVAL.INTERVAL) {
            aggregationModel.interval = {
                value: parseInt(timelineAggregation.aggregationIntervalSize.value, 10),
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
        if (!!timelineConfigGlobal.value.tabsContainer.dataStep.additionalCollections.collections && !!collectionParamsMap) {
            contributor.additionalCollections = timelineConfigGlobal.value.tabsContainer.dataStep.additionalCollections.collections
                .filter(c => collectionParamsMap.has(c.value))
                .map(
                    c => ({
                        collectionName: c.value,
                        field: collectionParamsMap.get(c.value).params.timestamp_path
                    })
                );
        }


        return contributor;
    }

    private static getTimelineComponent(timelineConfigGlobal: TimelineGlobalFormGroup, isDetailed: boolean): AnalyticComponentConfig {

        const renderStep = isDetailed ? timelineConfigGlobal.customControls.tabsContainer.renderStep.detailedTimeline :
            timelineConfigGlobal.customControls.tabsContainer.renderStep.timeline;

        const collection = timelineConfigGlobal.customControls.tabsContainer.dataStep.timeline.collection.value;

        const unmanagedTimelineFields = timelineConfigGlobal.customControls.unmanagedFields.renderStep.timeline;
        const unmanagedDetailedTimelineFields = timelineConfigGlobal.customControls.unmanagedFields.renderStep.detailedTimeline;
        const unmanagedFields = isDetailed ? unmanagedDetailedTimelineFields : unmanagedTimelineFields;

        const timelineComponent: AnalyticComponentConfig = {
            contributorId: (isDetailed ? 'detailedTimeline' : 'timeline'),
            componentType: 'histogram',
            input: {
                id: isDetailed ? 'histogram-detailed-timeline' : 'histogram-timeline',
                xTicks: unmanagedFields.xTicks.value,
                yTicks: unmanagedFields.yTicks.value,
                xLabels: unmanagedFields.xLabels.value,
                yLabels: unmanagedFields.yLabels.value,
                xUnit: unmanagedFields.xUnit.value,
                yUnit: unmanagedFields.yUnit.value,
                chartXLabel: unmanagedFields.chartXLabel.value,
                shortYLabels: unmanagedFields.shortYLabels.value,
                chartTitle: renderStep.chartTitle.value,
                customizedCssClass: unmanagedFields.customizedCssClass.value,
                multiselectable: isDetailed ?
                    unmanagedDetailedTimelineFields.multiselectable.value :
                    timelineConfigGlobal.customControls.tabsContainer.renderStep.timeline.isMultiselectable.value,
                brushHandlesHeightWeight: unmanagedFields.brushHandlesHeightWeight.value,
                dataType: 'time',
                isHistogramSelectable: unmanagedFields.isHistogramSelectable.value,
                ticksDateFormat: renderStep.dateFormat.value,
                chartType: renderStep.chartType.value,
                chartHeight: unmanagedFields.chartHeight.value,
                chartWidth: unmanagedFields.chartWidth.value,
                xAxisPosition: unmanagedFields.xAxisPosition.value,
                yAxisStartsFromZero: unmanagedFields.yAxisStartsFromZero.value,
                descriptionPosition: unmanagedFields.descriptionPosition.value,
                showXTicks: unmanagedFields.showXTicks.value,
                showYTicks: unmanagedFields.showYTicks.value,
                showXLabels: unmanagedFields.showXLabels.value,
                showYLabels: unmanagedFields.showYLabels.value,
                showHorizontalLines: unmanagedFields.showHorizontalLines.value,
                isSmoothedCurve: unmanagedFields.isSmoothedCurve.value,
                barWeight: unmanagedFields.barWeight.value
            } as AnalyticComponentHistogramInputConfig
        };

        if (!isDetailed) {
            timelineComponent.input.topOffsetRemoveInterval = unmanagedTimelineFields.topOffsetRemoveInterval.value;
        }

        return timelineComponent;
    }

    public static getAnalyticsContributor(widgetType: any, widgetData: any, icon: string): ContributorConfig {
        // TODO use customControls from widgets config form groups, like the Search export
        const contrib = this.getWidgetContributor(widgetData, widgetType, icon);
        switch (widgetType) {
            case WIDGET_TYPE.histogram: {
                contrib.type = 'histogram';
                const aggregationModel = {
                    type: widgetData.dataStep.aggregation.aggregationFieldType === 'time' ? 'datehistogram' : 'histogram',
                    field: widgetData.dataStep.aggregation.aggregationField
                } as AggregationModelConfig;

                this.addNumberOfBucketsOrInterval(contrib, aggregationModel, widgetData.dataStep.aggregation);

                this.addMetricToAggregationModel(aggregationModel, widgetData.dataStep.metric);

                contrib.jsonpath = widgetData.dataStep.metric.metricCollectFunction === DEFAULT_METRIC_VALUE ?
                    JSONPATH_COUNT : JSONPATH_METRIC;
                contrib.useUtc = widgetData.dataStep.useUtc;
                contrib.aggregationmodels = [aggregationModel];

                break;
            }
            case WIDGET_TYPE.swimlane: {
                contrib.type = 'swimlane';
                const swimlane = {
                    id: 1,
                    name: widgetData.title,
                    xAxisField: widgetData.dataStep.aggregation.aggregationField,
                    termField: widgetData.dataStep.termAggregation.termAggregationField
                } as SwimlaneConfig;

                swimlane.aggregationmodels = [];
                swimlane.useUtc = widgetData.dataStep.useUtc;
                swimlane.aggregationmodels.push({
                    type: 'term',
                    field: widgetData.dataStep.termAggregation.termAggregationField,
                    size: widgetData.dataStep.termAggregation.termAggregationSize
                });

                const dateAggregationModel = {
                    type: widgetData.dataStep.aggregation.aggregationFieldType === 'time' ? 'datehistogram' : 'histogram',
                    field: widgetData.dataStep.aggregation.aggregationField
                } as AggregationModelConfig;
                this.addNumberOfBucketsOrInterval(contrib, dateAggregationModel, widgetData.dataStep.aggregation);

                this.addMetricToAggregationModel(dateAggregationModel, widgetData.dataStep.metric);

                swimlane.aggregationmodels.push(dateAggregationModel);
                swimlane.jsonpath = widgetData.dataStep.metric.metricCollectFunction === DEFAULT_METRIC_VALUE ?
                    '$.count' : '$.metrics[0].value';
                contrib.swimlanes = [swimlane];
                break;
            }
            case WIDGET_TYPE.metric: {
                contrib.type = 'metric';
                contrib.function = !!widgetData.dataStep.function ? widgetData.dataStep.function : 'm[0]';
                contrib.metrics = Array.from(widgetData.dataStep.metrics);

                break;
            }
            case WIDGET_TYPE.powerbars: {
                contrib.type = 'tree';
                const aggregationModel: AggregationModelConfig = {
                    type: 'term',
                    field: widgetData.dataStep.aggregationField,
                    size: widgetData.dataStep.aggregationSize
                };
                if (!!widgetData.renderStep.propertyProvidedFieldCtrl) {
                    contrib.colorField = widgetData.renderStep.propertyProvidedFieldCtrl;
                    aggregationModel.fetch_hits = {
                        size: 1,
                        include: [contrib.colorField]
                    };
                }
                this.addMetricToAggregationModel(aggregationModel, widgetData.dataStep.metric);
                contrib.jsonpath = widgetData.dataStep.metric.metricCollectFunction === DEFAULT_METRIC_VALUE ?
                    JSONPATH_COUNT : JSONPATH_METRIC;
                contrib.aggregationmodels = [aggregationModel];

                break;
            }
            case WIDGET_TYPE.donut: {
                contrib.type = 'tree';
                contrib.aggregationmodels = Array.from(widgetData.dataStep.aggregationmodels).map((agg: any) => {
                    agg.type = 'term';
                    return agg;
                });
                break;
            }
            case WIDGET_TYPE.resultlist: {
                contrib.type = 'resultlist';
                contrib.search_size = widgetData.dataStep.searchSize;
                const fieldsConfig: FieldsConfiguration = {
                    idFieldName: widgetData.dataStep.idFieldName,
                    thumbnailFieldName: widgetData.renderStep.gridStep.thumbnailUrl,
                    imageFieldName: widgetData.renderStep.gridStep.imageUrl,
                    titleFieldNames: [{ fieldPath: widgetData.renderStep.gridStep.tileLabelField, process: '' }],
                    tooltipFieldNames: [{ fieldPath: widgetData.renderStep.gridStep.tooltipField, process: '' }],
                    icon: 'fiber_manual_record',
                    iconColorFieldName: widgetData.renderStep.gridStep.colorIdentifier
                };
                if (widgetData.renderStep.gridStep.thumbnailUrl) {
                    fieldsConfig.urlThumbnailTemplate = '{' + widgetData.renderStep.gridStep.thumbnailUrl + '}';
                }
                if (widgetData.renderStep.gridStep.imageUrl) {
                    fieldsConfig.urlImageTemplate = '{' + widgetData.renderStep.gridStep.imageUrl + '}';
                }

                contrib.fieldsConfiguration = fieldsConfig;
                contrib.columns = [];
                (widgetData.dataStep.columns as Array<any>).forEach(c =>
                    contrib.columns.push({
                        columnName: c.columnName,
                        fieldName: c.fieldName,
                        dataType: c.dataType,
                        process: c.process,
                        useColorService: !!c.useColorService
                    }));

                contrib.details = [];
                (widgetData.dataStep.details).forEach((d, index) => {
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
                contrib.includeMetadata = [];
                const metadatas = new Set<string>();
                Object.keys(widgetData.renderStep.gridStep).forEach(v => {
                    if (!!widgetData.renderStep.gridStep[v]) {
                        metadatas.add(widgetData.renderStep.gridStep[v]);
                    }
                });
                contrib.includeMetadata = Array.from(metadatas);
                break;
            }
        }
        return contrib;
    }

    private static getResultListContributors(resultLists: FormArray): ContributorConfig[] {
        const contribs = [];
        resultLists.value.forEach(list => {
            const contrib = this.getWidgetContributor(list, WIDGET_TYPE.resultlist, 'table_chart');
            contrib.type = 'resultlist';
            contrib.search_size = list.dataStep.searchSize;
            const fieldsConfig: FieldsConfiguration = {
                idFieldName: list.dataStep.idFieldName,
                thumbnailFieldName: list.renderStep.gridStep.thumbnailUrl,
                imageFieldName: list.renderStep.gridStep.imageUrl,
                titleFieldNames: [{ fieldPath: list.renderStep.gridStep.tileLabelField, process: '' }],
                tooltipFieldNames: [{ fieldPath: list.renderStep.gridStep.tooltipField, process: '' }],
                icon: 'fiber_manual_record',
                iconColorFieldName: list.renderStep.gridStep.colorIdentifier
            };
            if (list.renderStep.gridStep.thumbnailUrl) {
                fieldsConfig.urlThumbnailTemplate = '{' + list.renderStep.gridStep.thumbnailUrl + '}';
            }
            if (list.renderStep.gridStep.imageUrl) {
                fieldsConfig.urlImageTemplate = '{' + list.renderStep.gridStep.imageUrl + '}';
            }

            contrib.fieldsConfiguration = fieldsConfig;
            contrib.columns = [];
            (list.dataStep.columns as Array<any>).forEach(c =>
                contrib.columns.push({
                    columnName: c.columnName,
                    fieldName: c.fieldName,
                    dataType: c.dataType,
                    process: c.process,
                    useColorService: !!c.useColorService
                }));

            contrib.details = [];
            (list.dataStep.details).forEach((d, index) => {
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
            contrib.includeMetadata = [];
            const metadatas = new Set<string>();
            Object.keys(list.renderStep.gridStep).forEach(v => {
                if (!!list.renderStep.gridStep[v]) {
                    metadatas.add(list.renderStep.gridStep[v]);
                }
            });
            contrib.includeMetadata = Array.from(metadatas);
            contribs.push(contrib);
        });
        return contribs;
    }

    public static getResultListComponent(resultLists: FormArray) {
        const lists = [];
        resultLists.value.forEach(list => {
            lists.push(this.getAnalyticsComponent(WIDGET_TYPE.resultlist, list, null));
        });

        return lists;
    }

    private static getWidgetContributor(widgetData: any, widgetType: any, icon: string) {
        return {
            identifier: this.getContributorId(widgetData, widgetType),
            name: widgetData.title,
            title: widgetData.title,
            collection: widgetData.dataStep.collection,
            icon,
            ... !!widgetData.renderStep.chartType ?
                {
                    charttype: widgetData.renderStep.chartType,
                    isOneDimension: widgetData.unmanagedFields.dataStep.isOneDimension
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
            groupAnalytic.components.push(this.getAnalyticsComponent(widget.widgetType, widget.widgetData, group.itemPerLine));
        });

        return groupAnalytic;
    }

    private static addMetricToAggregationModel(aggregationModel: AggregationModelConfig, metricData: any) {
        if (!!metricData.metricCollectFunction && metricData.metricCollectFunction !== DEFAULT_METRIC_VALUE) {
            aggregationModel.metrics = [
                {
                    collect_fct: metricData.metricCollectFunction.toLowerCase(),
                    collect_field: metricData.metricCollectField
                }
            ];
        }
    }

    /**
     * generates an identifier based on the definition of the contributor:
     * - aggregationmodel
     * - metrics ...
     */
    public static getContributorId(widgetData: any, widgetType: any): string {
        let idString = widgetData.dataStep.collection + '-';
        if (widgetType === WIDGET_TYPE.histogram || widgetType === WIDGET_TYPE.swimlane) {
            const agg = widgetData.dataStep.aggregation;
            idString += agg.aggregationField + '-' + agg.aggregationFieldType + '-' + agg.aggregationBucketOrInterval;
            if (!!widgetData.dataStep.metric) {
                idString += '-' + (widgetData.dataStep.metric.metricCollectFunction !== undefined ?
                    widgetData.dataStep.metric.metricCollectFunction : '') + '-' + (!!widgetData.dataStep.metric.metricCollectField ?
                        widgetData.dataStep.metric.metricCollectField : '');
            }
            if (agg.aggregationBucketOrInterval === 'bucket') {
                idString += '-' + agg.aggregationBucketsNumber;
            } else {
                idString += '-' + agg.aggregationIntervalSize + '-' + (!!agg.aggregationIntervalUnit ? agg.aggregationIntervalUnit : '');
            }
            if (widgetType === WIDGET_TYPE.swimlane) {
                const termAgg = widgetData.dataStep.termAggregation;
                idString += !!termAgg.termAggregationField ? termAgg.termAggregationField : '' + '-' + termAgg.termAggregationSize;
            }
        } else if (widgetType === WIDGET_TYPE.powerbars) {
            idString += widgetData.dataStep.aggregationField + '-' + widgetData.dataStep.aggregationSize;
            if (!!widgetData.dataStep.metric) {
                idString += widgetData.dataStep.metric.metricCollectFunction !== undefined ?
                    ('-' + widgetData.dataStep.metric.metricCollectFunction) : '';
                idString += !!widgetData.dataStep.metric.metricCollectField ? ('-' + widgetData.dataStep.metric.metricCollectField) : '';
            }
        } else if (widgetType === WIDGET_TYPE.metric) {
            idString += widgetData.dataStep.function;
            widgetData.dataStep.metrics.forEach(m => {
                idString += m.field + '-' + m.metric;
            });
        } else if (widgetType === WIDGET_TYPE.donut) {
            widgetData.dataStep.aggregationmodels.forEach(am => {
                idString += am.field + '-' + am.size + '-';
            });
        } else if (widgetType === WIDGET_TYPE.resultlist) {
            idString += widgetData.dataStep.idFieldName + '-' + widgetData.dataStep.searchSize + '-';
            if (!!widgetData.dataStep.columns) {
                widgetData.dataStep.columns.forEach(c => idString += c.columnName + '-');
            }
            if (!!widgetData.dataStep.details) {
                widgetData.dataStep.details.forEach(d => idString += d.name + '-');
            }
        }
        return idString;
    }

    private static getAnalyticsComponent(widgetType: any, widgetData: any, itemPerLine: number): AnalyticComponentConfig {
        const unmanagedRenderFields = widgetData.unmanagedFields.renderStep;
        const analyticsBoardWidth = 445;
        const contributorId = this.getContributorId(widgetData, widgetType);

        if ([WIDGET_TYPE.histogram, WIDGET_TYPE.swimlane].indexOf(widgetType) >= 0) {
            const title = widgetData.title;
            const component = {
                contributorId,
                input: {
                    id: contributorId,
                    isHistogramSelectable: unmanagedRenderFields.isHistogramSelectable,
                    multiselectable: !!widgetData.renderStep.multiselectable,
                    topOffsetRemoveInterval: unmanagedRenderFields.topOffsetRemoveInterval,
                    leftOffsetRemoveInterval: unmanagedRenderFields.leftOffsetRemoveInterval,
                    brushHandlesHeightWeight: unmanagedRenderFields.brushHandlesHeightWeight,
                    yAxisStartsFromZero: unmanagedRenderFields.yAxisStartsFromZero,
                    chartType: widgetData.renderStep.chartType,
                    chartTitle: title,
                    chartHeight: !!unmanagedRenderFields.chartHeight ? unmanagedRenderFields.chartHeight : 100,
                    chartWidth: !!itemPerLine && +itemPerLine !== 1 ?
                        Math.ceil(analyticsBoardWidth / itemPerLine) - 6 : analyticsBoardWidth, // 6 => margin and padding left/right
                    xAxisPosition: unmanagedRenderFields.xAxisPosition,
                    descriptionPosition: unmanagedRenderFields.descriptionPosition,
                    xTicks: unmanagedRenderFields.xTicks,
                    yTicks: unmanagedRenderFields.yTicks,
                    xLabels: unmanagedRenderFields.xLabels,
                    yLabels: unmanagedRenderFields.yLabels,
                    xUnit: unmanagedRenderFields.xUnit,
                    yUnit: unmanagedRenderFields.yUnit,
                    chartXLabel: unmanagedRenderFields.chartXLabel,
                    shortYLabels: unmanagedRenderFields.shortYLabels,
                    showXTicks: unmanagedRenderFields.showXTicks,
                    showYTicks: unmanagedRenderFields.showYTicks,
                    showXLabels: unmanagedRenderFields.showXLabels,
                    showYLabels: unmanagedRenderFields.showYLabels,
                    showHorizontalLines: widgetData.renderStep.showHorizontalLines,
                    barWeight: unmanagedRenderFields.barWeight,
                    dataType: widgetData.dataStep.aggregation.aggregationFieldType,
                    highighlightItems: undefined
                } as AnalyticComponentInputConfig
            } as AnalyticComponentConfig;

            switch (widgetType) {
                case WIDGET_TYPE.histogram: {
                    component.componentType = WIDGET_TYPE.histogram;
                    component.showExportCsv = widgetData.renderStep.showExportCsv;
                    component.input.ticksDateFormat = widgetData.renderStep.ticksDateFormat;
                    component.input.customizedCssClass = widgetData.dataStep.aggregation.aggregationFieldType === 'numeric' ?
                        'arlas-histogram-analytics' : 'arlas-timeline-analytics';
                    (component.input as AnalyticComponentHistogramInputConfig).isSmoothedCurve = unmanagedRenderFields.isSmoothedCurve;
                    break;
                }
                case WIDGET_TYPE.swimlane: {
                    component.componentType = WIDGET_TYPE.swimlane;
                    component.showExportCsv = false;
                    const swimlaneInput = (component.input as AnalyticComponentSwimlaneInputConfig);
                    swimlaneInput.swimLaneLabelsWidth = unmanagedRenderFields.swimLaneLabelsWidth;
                    swimlaneInput.swimlaneHeight = unmanagedRenderFields.swimlaneHeight;
                    swimlaneInput.swimlaneMode = widgetData.renderStep.swimlaneMode;
                    swimlaneInput.swimlaneBorderRadius = unmanagedRenderFields.swimlaneBorderRadius;
                    swimlaneInput.paletteColors = widgetData.renderStep.paletteColors;
                    swimlaneInput.swimlane_representation = widgetData.renderStep.swimlaneRepresentation;
                    swimlaneInput.customizedCssClass = 'arlas-swimlane';
                    const swimlaneOptions = {} as AnalyticComponentSwimlaneInputOptionsConfig;
                    swimlaneOptions.nan_color = widgetData.renderStep.NaNColor;
                    if (!!widgetData.renderStep.zerosColors) {
                        swimlaneOptions.zeros_color = widgetData.renderStep.zerosColors;
                    }
                    swimlaneInput.swimlane_options = swimlaneOptions;
                    break;
                }
            }
            return component;

        } else if (widgetType === WIDGET_TYPE.metric) {
            const component = {
                contributorId,
                componentType: WIDGET_TYPE.metric,
                input: {
                    customizedCssClass: unmanagedRenderFields.customizedCssClass,
                    shortValue: !!widgetData.renderStep.shortValue,
                    valuePrecision: +widgetData.renderStep.valuePrecision,
                    chartWidth: !!itemPerLine && +itemPerLine !== 1 ?
                        Math.ceil(analyticsBoardWidth / itemPerLine) - 6 : analyticsBoardWidth // 6 => margin and padding left/right
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
                contributorId,
                showExportCsv: widgetData.renderStep.showExportCsv,
                componentType: WIDGET_TYPE.powerbars,
                input: {
                    chartTitle: widgetData.title,
                    powerbarTitle: widgetData.title,
                    displayFilter: !!widgetData.renderStep.displayFilter,
                    useColorService: !!widgetData.renderStep.useColorService,
                    useColorFromData: !!widgetData.renderStep.useColorFromData,
                    unit: widgetData.dataStep.unit,
                    chartWidth: !!itemPerLine && +itemPerLine !== 1 ?
                        Math.ceil(analyticsBoardWidth / itemPerLine) - 6 : analyticsBoardWidth // 6 => margin and padding left/right
                }
            } as AnalyticComponentConfig;

            return component;

        } else if (widgetType === WIDGET_TYPE.donut) {
            if (!itemPerLine) {
                itemPerLine = 1;
            }
            const containerWidth = Math.ceil(analyticsBoardWidth / +itemPerLine);
            let donutDiameter = 175;
            if (!!itemPerLine && +itemPerLine === 2) {
                donutDiameter = 170;
            }
            if (!!itemPerLine && +itemPerLine === 3) {
                donutDiameter = 125;
            }
            const component = {
                contributorId,
                componentType: WIDGET_TYPE.donut,
                showExportCsv: widgetData.renderStep.showExportCsv,
                input: {
                    id: contributorId,
                    customizedCssClass: unmanagedRenderFields.customizedCssClass,
                    diameter: donutDiameter,
                    containerWidth,
                    multiselectable: !!widgetData.renderStep.multiselectable,
                    opacity: widgetData.renderStep.opacity
                }
            } as AnalyticComponentConfig;

            return component;
        } else if (widgetType === WIDGET_TYPE.resultlist) {
            const component = {
                contributorId,
                componentType: WIDGET_TYPE.resultlist,
                input: {
                    id: contributorId,
                    tableWidth: !!itemPerLine && +itemPerLine !== 1 ?
                        Math.ceil(analyticsBoardWidth / itemPerLine) - 6 : analyticsBoardWidth, // 6 => margin and padding left/right
                    globalActionsList: unmanagedRenderFields.globalActionsList,
                    searchSize: widgetData.dataStep.searchSize,
                    nLastLines: unmanagedRenderFields.nLastLines,
                    detailedGridHeight: unmanagedRenderFields.detailedGridHeight,
                    nbGridColumns: unmanagedRenderFields.nbGridColumns,
                    defautMode: unmanagedRenderFields.defautMode,
                    displayFilters: !!widgetData.renderStep.displayFilters,
                    isBodyHidden: unmanagedRenderFields.isBodyHidden,
                    isGeoSortActived: !!widgetData.renderStep.isGeoSortActived,
                    isAutoGeoSortActived: unmanagedRenderFields.isAutoGeoSortActived,
                    selectedItemsEvent: unmanagedRenderFields.selectedItemsEvent,
                    consultedItemEvent: unmanagedRenderFields.consultedItemEvent,
                    actionOnItemEvent: unmanagedRenderFields.actionOnItemEvent,
                    globalActionEvent: unmanagedRenderFields.globalActionEvent,
                    useColorService: true,
                    cellBackgroundStyle: widgetData.renderStep.cellBackgroundStyle,
                    options: {
                        showActionsOnhover: 'true',
                        showDetailIconName: 'keyboard_arrow_down',
                        hideDetailIconName: 'keyboard_arrow_up'
                    }
                } as AnalyticComponentResultListInputConfig
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
            drag_items: !!lookAndFeelConfigGlobal.customControls.dragAndDrop.value,
            zoom_to_data: !!lookAndFeelConfigGlobal.customControls.zoomToData.value,
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
                value: parseInt(aggregationData.aggregationIntervalSize, 10)
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
