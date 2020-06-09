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

export const JSONPATH_COUNT = '$.count';
export const JSONPATH_METRIC = '$.metrics[0].value';
export const CHIPSEARCH_TYPE = 'chipssearch';
export const CHIPSEARCH_IDENTIFIER = 'chipssearch';
import { LayerSourceConfig } from 'arlas-web-contributors';

export interface Config {
    arlas: ArlasConfig;
    arlasWui: {
        web: {
            app: {
                components: {
                    chipssearch: ChipSearchConfig;
                }
            },

        }
    };
}

export interface ArlasConfig {
    web: WebConfig;
    server: ServerConfig;
    tagger?: {
        url: string;
        collection: {
            name: string;
        }
    };
}

export interface ChipSearchConfig {
    name: string;
    icon: string;
}

export interface WebConfig {
    contributors: Array<ContributorConfig>;
    components: {
        timeline: AnalyticComponentConfig,
        detailedTimeline?: AnalyticComponentConfig,
        mapgl: MapglComponentConfig,
        share?: {
            geojson: {
                max_for_feature: number;
                max_for_topology: number;
                sort_excluded_type: Array<string>;
            }
        },
        download?: {
            auth_type?: string;
        }
    };
    analytics: Array<AnalyticConfig>;
    colorGenerator: { keysToColors: Array<Array<string>> };
    options?: WebConfigOptions;
}

export interface WebConfigOptions {
    dragItems?: boolean;
    zoomToData?: boolean;
    indicators?: boolean;
    spinner?: SpinnerOptions;
}

export interface SpinnerOptions {
    show: boolean;
    diameter?: string;
    color?: string;
    strokeWidth?: number;
}

export interface ServerConfig {
    url: string;
    collection: {
        name: string;
        id: string;
    };
    maxAgeCache: number;
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
    function?: string;
    metrics?: Array<{ field: string, metric: string }>;
    search_size?: number;
    fieldsConfiguration?: { idFieldName: string };
    columns?: Array<{ columnName: string, fieldName: string, dataType: string, process: string }>;
    details?: Array<{
        name: string,
        order: number,
        fields: Array<{ path: string, label: string, process: string }>
    }>;
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
    customizedCssClass?: string;
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
    beforeValue?: string;
    afterValue?: string;
    shortValue?: boolean;
    displayFilter?: boolean;
    useColorService?: boolean;
    opacity?: number;
    powerbarTitle?: string;
    diameter?: number;
    tableWidth?: number;
    globalActionsList?: Array<any>;
    searchSize?: number;
    nLastLines?: number;
    detailedGridHeight?: number;
    nbGridColumns?: number;
    defautMode?: string;
    displayFilters?: boolean;
    isBodyHidden?: boolean;
    isGeoSortActived?: boolean;
    isAutoGeoSortActived?: boolean;
    selectedItemsEvent?: any;
    consultedItemEvent?: any;
    actionOnItemEvent?: any;
    globalActionEvent?: any;
    cellBackgroundStyle?: string;
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
    nanColor?: string;
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

export interface AggregationModelConfig {
    type: string;
    field: string;
    size?: number;
    interval?: {
        value: number;
        unit?: string;
    };
    metrics?: Array<AggregationModelMetricConfig>;
}

export interface AggregationModelMetricConfig {
    collect_field: string;
    collect_fct: string;
}

export interface NormalizationFieldConfig {
    on: string;
    per: string;
}

export interface ConfigPersistence {
    name: string;
    config: string;
}
