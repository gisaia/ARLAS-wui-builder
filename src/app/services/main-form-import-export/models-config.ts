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
    arlas: Arlas;
    arlasWui: {
        web: {
            app: {
                components: {
                    chipssearch: ChipSearch;
                }
            }
        }
    };
}

export interface Arlas {
    web: Web;
}

export interface ChipSearch {
    name: string;
    icon: string;
}

export interface Web {
    contributors: Array<Contributor>;
    components: {
        timeline: TimelineComponent,
        detailedTimeline: TimelineComponent
    };
}

export interface Contributor {
    type: string;
    identifier: string;
    geoQueryOp?: string;
    geoQueryField?: string;
    layers_sources?: Array<LayerSource>;
    name?: string;
    search_field?: string;
    icon?: string;
    autocomplete_field?: string;
    autocomplete_size?: number;
    numberOfBuckets?: number;
    isOneDimension?: boolean;
    aggregationmodels?: Array<AggregationModel>;
    annexedContributorId?: string;
    selectionExtentPercentage?: number;
}

export interface LayerSource {
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
    normalization_fields?: Array<NormalizationField>;
    aggregated_geometry?: string;
    raw_geometry?: RawGeometry;
    granularity?: string;
    metrics?: Array<Metric>;
}

export interface AggregationModel {
    type: string;
    field: string;
    interval?: {
        value: number;
        unit: string;
    };
}

export interface NormalizationField {
    on: string;
    per: string;
    scope: string;
}

export interface RawGeometry {
    geometry: string;
    sort: string;
}

export interface Metric {
    field: string;
    metric: string;
    normalize: string;
}

export interface TimelineComponent {
    contributorId: string;
    componentType: string;
    input: TimelineComponentInput;
}

export interface TimelineComponentInput {
    id: string;
    xTicks: number;
    yTicks: number;
    xLabels: number;
    yLabels: number;
    chartTitle: string;
    customizedCssClass: string;
    chartHeight: number;
    multiselectable: boolean;
    brushHandlesHeightWeight: number;
    dataType: string;
    isHistogramSelectable: boolean;
    ticksDateFormat?: string;
    chartType: string;
    chartWidth: number;
    xAxisPosition: string;
    yAxisStartsFromZero: boolean;
    descriptionPosition: string;
    showXTicks: boolean;
    showYTicks: boolean;
    showXLabels: boolean;
    showYLabels: boolean;
    showHorizontalLines: boolean;
    isSmoothedCurve: boolean;
    barWeight: number;
    topOffsetRemoveInterval?: number;
}
