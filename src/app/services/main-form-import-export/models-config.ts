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
}

export interface Arlas {
    web: Web;
}

export interface Web {
    contributors: Array<Contributor>;
}

export interface Contributor {
    type: string;
    identifier: string;
    geoQueryOp: string;
    geoQueryField: string;
    layers_sources: Array<LayerSource>;
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
    raw_geometry?: RawGeometry;
    granularity?: string;
    metrics?: Array<Metric>;
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
    metrics: string;
    normalize: string;
}
