import { Layer } from './models-map-config';
import { BasemapStyle } from 'arlas-web-components/components/mapgl/model/mapLayers';

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
export interface Config {
    arlas: ArlasConfig;
    arlasWui: {
        web: {
            app: {
                components: {
                    chipssearch: ChipSearchConfig;
                }
            }
        }
    };
}

export interface ArlasConfig {
    web: WebConfig;
}

export interface ChipSearchConfig {
    name: string;
    icon: string;
}

export interface WebConfig {
    contributors: Array<ContributorConfig>;
    components: {
        timeline: AnalyticComponentConfig,
        detailedTimeline: AnalyticComponentConfig,
        mapgl: MapglComponentConfig
    };
    analytics: Array<AnalyticConfig>;
}

export interface ContributorConfig {
    type: string;
    identifier: string;
    geoQueryOp?: string;
    geoQueryField?: string;
    layers_sources?: Array<LayerSourceConfig>;
    name?: string;
    title?: string;
    charttype?: string;
    search_field?: string;
    icon?: string;
    autocomplete_field?: string;
    autocomplete_size?: number;
    numberOfBuckets?: number;
    isOneDimension?: boolean;
    aggregationmodels?: Array<AggregationModelConfig>;
    annexedContributorId?: string;
    selectionExtentPercentage?: number;
    datatype?: string;
    jsonpath?: string;
    swimlanes?: Array<SwimlaneConfig>;
}

export interface SwimlaneConfig {
    id: number;
    name: string;
    xAxisField: string;
    termField: string;
    aggregationmodels?: Array<AggregationModelConfig>;
}

export interface AnalyticConfig {
    groupId: string;
    title: string;
    tab: string;
    icon: string;
    components: Array<AnalyticComponentConfig>;
}

export interface AnalyticComponentConfig {
    contributorId: string;
    componentType: string;
    showExportCsv?: boolean;
    input: AnalyticComponentInputConfig;
}

export interface AnalyticComponentInputConfig {
    id: string;
    dataType: string;
    isHistogramSelectable: boolean;
    ticksDateFormat?: string;
    multiselectable: boolean;
    topOffsetRemoveInterval?: number;
    leftOffsetRemoveInterval?: number;
    brushHandlesHeightWeight: number;
    yAxisStartsFromZero: boolean;
    chartType: string;
    chartTitle: string;
    chartWidth: number;
    chartHeight: number;
    customizedCssClass: string;
    xAxisPosition: string;
    descriptionPosition: string;
    xTicks: number;
    yTicks: number;
    xLabels: number;
    yLabels: number;
    showXTicks: boolean;
    showYTicks: boolean;
    showXLabels: boolean;
    showYLabels: boolean;
    showHorizontalLines: boolean;
    barWeight: number;
}

export interface AnalyticComponentHistogramInputConfig extends AnalyticComponentInputConfig {
    isSmoothedCurve: boolean;
}

export interface AnalyticComponentSwimlaneInputConfig extends AnalyticComponentInputConfig {
    swimLaneLabelsWidth: number;
    swimlaneHeight: number;
    swimlaneMode: string;
    swimlaneBorderRadius: number;
    paletteColors: [number, number];
    swimlaneRepresentation: string;
    swimlaneOptions: AnalyticComponentSwimlaneInputOptionsConfig;
}

export interface AnalyticComponentSwimlaneInputOptionsConfig {
    zerosColor?: string;
    nanColors?: string;
}

export interface MapglComponentConfig {
    allowMapExtend: boolean;
    nbVerticesLimit?: number;
    input: MapComponentInputConfig;
}

export interface MapComponentInputConfig {
    defaultBasemapStyle: BasemapStyle;
    basemapStyles: Array<BasemapStyle>;
    margePanForLoad: number;
    margePanForTest: number;
    initZoom: number;
    initCenter: [number, number];
    displayScale: boolean;
    idFeatureField: string;
    mapLayers: MapComponentInputMapLayersConfig;
}

export interface MapComponentInputMapLayersConfig {
    layers: Array<Layer>;
    events: MapComponentInputMapLayersEventsConfig;
    externalEventLayers: Array<{ id: string, on: string }>;
    visualisations_sets: MapComponentInputLayersSetsConfig;
}

export interface MapComponentInputMapLayersEventsConfig {
    zoomOnClick: Array<string>;
    emitOnClick: Array<string>;
    onHover: Array<string>;
}

export interface MapComponentInputLayersSetsConfig {
    visualisations: any;
    default: Array<string>;
}



export interface LayerSourceConfig {
    id: string;
    source: string;
    minzoom: number;
    maxzoom: number;
    minfeatures?: number;
    maxfeatures?: number;
    geometry_id?: string;
    geometry_support?: string;
    agg_geo_field?: string;
    color_from_field?: string | Array<string>;
    include_fields?: Array<string>;
    normalization_fields?: Array<NormalizationFieldConfig>;
    aggregated_geometry?: string;
    raw_geometry?: RawGeometryConfig;
    granularity?: string;
    metrics?: Array<MetricConfig>;
}

export interface AggregationModelConfig {
    type: string;
    field: string;
    size?: number;
    interval?: {
        value: number;
        unit?: string;
    };
    metrics?: Array<{ collect_field: string, collect_fct: string }>;
}

export interface NormalizationFieldConfig {
    on: string;
    per: string;
    scope: string;
}

export interface RawGeometryConfig {
    geometry: string;
    sort: string;
}

export interface MetricConfig {
    field: string;
    metric: string;
    normalize: string;
}
